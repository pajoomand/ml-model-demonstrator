ML Model Demonstrator
A React-based web application enabling users to upload CSV datasets, select features/target, choose ML algorithms (Regression, Classification, Clustering), train models, and visualize performance. This tool simplifies experimenting with fundamental ML concepts and provides immediate visual feedback on model results.

Features
CSV Data Upload: Easily load your own datasets for analysis.

Dynamic Column Selection: Select features and target variables directly from your uploaded data.

Multiple ML Algorithms:

Regression: Linear Regression, Decision Tree Regressor

Classification: Decision Tree Classifier

Clustering: K-Means

Performance Metrics: View key metrics relevant to the chosen algorithm (e.g., MSE, R2, Accuracy, Precision, Recall, F1-Score, Clusters).

Interactive Visualizations:

Scatter plots for True vs. Predicted values (Regression).

Confusion Matrix (Classification).

Cluster plots (Clustering, with PCA for high-dimensional data).

Python Backend Integration: Leverages Python's powerful scikit-learn library for model training and predictions.

Getting Started
Follow these instructions to set up and run the project on your local machine.

Prerequisites
You will need the following installed on your system:

Node.js & npm (or Yarn): For the React frontend. Download from nodejs.org.

Python 3.8+ & pip: For the Flask backend. Download from python.org.

Installation
Clone the repository:

git clone https://github.com/pajoomand/ml-model-demonstrator.git
cd ml-model-demonstrator

Frontend Setup (Next.js):

Navigate into the frontend project directory:

cd ml-model-demonstrator # (You should already be here if you just cloned)

Install Node.js dependencies:

npm install
# or if you use yarn
# yarn install

Important: The App.js component (which is likely src/app/page.js in a Next.js App Router setup) needs to be updated to point to the local Flask backend. Ensure the fetch call in trainModel targets http://127.0.0.1:5000/train_model. This should already be done in the latest version I provided, but double-check.

Backend Setup (Flask):

Create a new folder for your backend at the root of your project:

mkdir backend
cd backend

Create a file named app.py inside the backend folder.

Paste the Flask backend code (provided in previous responses) into backend/app.py.

Install Python dependencies:

pip install Flask scikit-learn pandas numpy flask_cors

Navigate back to the project root:

cd ..

Running the Application
You will need to run both the frontend and backend servers concurrently.

Start the Flask Backend Server:

Open a new terminal/command prompt window.

Navigate to the backend directory:

cd ml-model-demonstrator/backend

Run the Flask application:

python app.py

You should see output indicating the Flask server is running, typically on http://127.0.0.1:5000/. Keep this terminal open.

Start the Next.js Frontend Development Server:

Open another new terminal/command prompt window.

Navigate to the root of your project:

cd ml-model-demonstrator

Run the Next.js development server:

npm run dev
# or
# yarn dev

The frontend server will start, usually on http://localhost:3000. Open this URL in your web browser. Keep this terminal open.

Now, your ML Model Demonstrator should be fully operational in your browser!

Project Structure
ml-model-demonstrator/
├── .next/                       # Next.js build output
├── node_modules/                # Node.js dependencies
├── public/                      # Static assets
├── src/
│   └── app/
│       └── page.js              # Main React App component
├── backend/                     # Python Flask backend
│   └── app.py                   # Flask server for ML computations
├── .gitignore                   # Specifies intentionally untracked files to ignore
├── package.json                 # Node.js project metadata and dependencies
├── next.config.js               # Next.js configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── postcss.config.js            # PostCSS configuration
├── README.md                    # This file
└── ... (other Next.js config files)

About the Developer
Tom Pazoum (H. Pazhoumanddar)

Experienced app developer and data scientist with a demonstrated record of innovative research in machine learning and data analysis. Skilled in Python and JavaScript, focusing on analytical model building from big data.

Email: tom.pazoum@uwa.edu.au

LinkedIn Profile (https://www.linkedin.com/in/tom-pazoum-59b62070/)

GitHub Profile (https://github.com/pajoomand/)

License
This project is open-source and available under the MIT License.