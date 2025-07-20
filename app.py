from flask import Flask, request, jsonify
from io import StringIO
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor, DecisionTreeClassifier
from sklearn.cluster import KMeans
from sklearn.metrics import mean_squared_error, r2_score, accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
# from flask_cors import CORS # Import CORS

app = Flask(__name__)
# CORS(app) # Enable CORS for all routes

# Function to safely convert to numeric, handling errors
def to_numeric(series):
    return pd.to_numeric(series, errors='coerce')

@app.route('/train_model', methods=['POST'])
def train_model():
    data = request.json
    csv_data = data['csv_data']
    features = data['features']
    target = data['target']
    algorithm = data['algorithm']

    results = {
        "metrics": {},
        "plot_data": [],
        "plot_type": ""
    }

    try:
        df = pd.read_csv(StringIO(csv_data))

        df_processed = df.copy()
        for col in features:
            df_processed[col] = to_numeric(df_processed[col])
        if target:
            df_processed[target] = to_numeric(df_processed[target])

        cols_to_check = features
        if target:
            cols_to_check.append(target)
        df_processed.dropna(subset=cols_to_check, inplace=True)

        X = df_processed[features]

        if algorithm == 'LinearRegression' or algorithm == 'DecisionTreeRegressor':
            if not target:
                raise ValueError("Target column is required for regression algorithms.")
            y = df_processed[target]
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

            if algorithm == 'LinearRegression':
                model = LinearRegression()
            else: # DecisionTreeRegressor
                model = DecisionTreeRegressor(random_state=42)

            model.fit(X_train, y_train)
            y_pred = model.predict(X_test)

            results["metrics"]["MSE"] = float(mean_squared_error(y_test, y_pred))
            results["metrics"]["R2"] = float(r2_score(y_test, y_pred))
            results["plot_type"] = "scatter"
            results["plot_data"] = [
                {"true": float(y_test.iloc[i]), "predicted": float(y_pred[i])}
                for i in range(len(y_test))
            ]

        elif algorithm == 'DecisionTreeClassifier':
            if not target:
                raise ValueError("Target column is required for classification algorithms.")
            y = df_processed[target]
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

            model = DecisionTreeClassifier(random_state=42)
            model.fit(X_train, y_train)
            y_pred = model.predict(X_test)

            cm = confusion_matrix(y_test, y_pred)
            results["metrics"]["Accuracy"] = float(accuracy_score(y_test, y_pred))
            results["metrics"]["Precision"] = float(precision_score(y_test, y_pred, average='weighted', zero_division=0))
            results["metrics"]["Recall"] = float(recall_score(y_test, y_pred, average='weighted', zero_division=0))
            results["metrics"]["F1_Score"] = float(f1_score(y_test, y_pred, average='weighted', zero_division=0))
            results["plot_type"] = "confusion_matrix"
            if cm.shape == (2, 2):
                results["plot_data"] = {
                    "tn": int(cm[0, 0]), "fp": int(cm[0, 1]),
                    "fn": int(cm[1, 0]), "tp": int(cm[1, 1])
                }
            else:
                results["plot_data"] = cm.tolist()

        elif algorithm == 'KMeans':
            scaler = StandardScaler()
            X_scaled = scaler.fit_transform(X)

            n_clusters = min(3, len(df_processed) // 10 if len(df_processed) > 10 else 1)
            if n_clusters < 1: n_clusters = 1

            model = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
            clusters = model.fit_predict(X_scaled)

            results["metrics"]["Clusters"] = int(n_clusters)
            results["plot_type"] = "cluster"

            if X.shape[1] > 2:
                pca = PCA(n_components=2)
                X_2d = pca.fit_transform(X_scaled)
                for i, cluster_id in enumerate(clusters):
                    results["plot_data"].append({
                        "x": float(X_2d[i, 0]),
                        "y": float(X_2d[i, 1]),
                        "cluster": int(cluster_id)
                    })
                results["plot_labels"] = ["PCA Component 1", "PCA Component 2"]
            elif X.shape[1] == 2:
                for i, cluster_id in enumerate(clusters):
                    results["plot_data"].append({
                        "x": float(X.iloc[i, 0]),
                        "y": float(X.iloc[i, 1]),
                        "cluster": int(cluster_id)
                    })
                results["plot_labels"] = [features[0], features[1]]
            elif X.shape[1] == 1:
                for i, cluster_id in enumerate(clusters):
                    results["plot_data"].append({
                        "x": float(X.iloc[i, 0]),
                        "y": float(i),
                        "cluster": int(cluster_id)
                    })
                results["plot_labels"] = [features[0], "Index"]
            else:
                results["plot_data"] = []
                results["plot_labels"] = []

        else:
            raise ValueError("Unsupported algorithm selected.")

    except Exception as e:
        results["error"] = str(e)

    return jsonify(results)

if __name__ == '__main__':
    app.run(debug=True, port=5000) # Run on port 5000