"use client"
import React, { useState, useEffect } from 'react';
import { Upload, SlidersHorizontal, Target, Table, LineChart, ScatterChart, BarChart, HardHat, GitPullRequestArrow, CircleDotDashed, Info } from 'lucide-react';
import {
     Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// Main App Component
const App = () => {
    // State variables to manage UI and data
    const [csvData, setCsvData] = useState(null); // Raw CSV string content
    const [headers, setHeaders] = useState([]); // Array of column headers
    const [dataRows, setDataRows] = useState([]); // Array of data rows (objects)
    const [selectedFeatures, setSelectedFeatures] = useState([]); // Array of selected feature columns
    const [selectedTarget, setSelectedTarget] = useState(''); // Selected target column
    const [selectedAlgorithm, setSelectedAlgorithm] = useState(''); // Chosen ML algorithm
    const [modelResults, setModelResults] = useState(null); // Results from the ML model (metrics, plot data)
    const [loading, setLoading] = useState(false); // Loading state for model training
    const [errorMessage, setErrorMessage] = useState(''); // Error messages for the user

    // Handler for file upload
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) {
            setErrorMessage('No file selected.');
            return;
        }

        if (file.type !== 'text/csv') {
            setErrorMessage('Please upload a CSV file.');
            return;
        }

        setErrorMessage(''); // Clear previous errors
        const reader = new FileReader();

        reader.onload = (e) => {
            const content = e.target.result;
            setCsvData(content); // Store raw CSV data

            // Simple CSV parsing (assumes comma-separated, no complex escaping)
            const lines = content.split('\n').filter(line => line.trim() !== '');
            if (lines.length === 0) {
                setErrorMessage('CSV file is empty.');
                return;
            }

            const parsedHeaders = lines[0].split(',').map(h => h.trim());
            setHeaders(parsedHeaders);

            const parsedRows = lines.slice(1).map(line => {
                const values = line.split(',').map(v => v.trim());
                const rowObject = {};
                parsedHeaders.forEach((header, index) => {
                    rowObject[header] = values[index];
                });
                return rowObject;
            });
            setDataRows(parsedRows);

            // Reset selections and results when a new file is uploaded
            setSelectedFeatures([]);
            setSelectedTarget('');
            setSelectedAlgorithm('');
            setModelResults(null);
        };

        reader.onerror = () => {
            setErrorMessage('Failed to read file.');
        };

        reader.readAsText(file);
    };

    // Handler for selecting/deselecting feature columns
    const handleFeatureSelect = (header) => {
        setSelectedFeatures(prev =>
            prev.includes(header)
                ? prev.filter(f => f !== header)
                : [...prev, header]
        );
    };

    // Handler for selecting the target column
    const handleTargetSelect = (header) => {
        setSelectedTarget(header);
    };

    // Handler for selecting the ML algorithm
    const handleAlgorithmSelect = (algo) => {
        setSelectedAlgorithm(algo);
        setModelResults(null); // Clear results if algorithm changes
    };

    // Function to train the model by calling the Python interpreter
    const trainModel = async () => {
        setLoading(true);
        setErrorMessage('');
        setModelResults(null); // Clear previous results

        // Input validation
        if (!csvData) {
            setErrorMessage('Please upload a CSV dataset first.');
            setLoading(false);
            return;
        }
        if (selectedFeatures.length === 0) {
            setErrorMessage('Please select at least one feature column.');
            setLoading(false);
            return;
        }
        if (!selectedTarget && selectedAlgorithm !== 'KMeans') {
            setErrorMessage('Please select a target column for regression/classification.');
            setLoading(false);
            return;
        }
        if (!selectedAlgorithm) {
            setErrorMessage('Please select a machine learning algorithm.');
            setLoading(false);
            return;
        }

        // Prepare data for Python script
        const pythonPayload = {
            csv_data: csvData,
            features: selectedFeatures,
            target: selectedTarget,
            algorithm: selectedAlgorithm,
            // For K-Means, we might need original headers if PCA is applied for plotting
            original_headers: headers
        };

        // Python script to be executed by the interpreter

        try {
           // Make the fetch call to your local Flask backend
            const response = await fetch('http://127.0.0.1:5000/train_model', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(pythonPayload), // Send the payload directly
});

if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Backend error: ${errorText}`);
}

const result = await response.json(); // Parse JSON response from Flask

            if (result.error) {
                setErrorMessage(`Model training failed: ${result.error}`);
            } else {
                setModelResults(result);
            }
        } catch (error) {
            setErrorMessage(`Failed to communicate with the model backend: ${error.message}`);
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    // Render the UI
    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 font-sans antialiased text-gray-800">
            {/* Header */}
            <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-blue-700 mb-8 flex items-center justify-center">
                <HardHat className="mr-3 text-blue-600" size={36} />
                ML Model Demonstrator
            </h1>

            {/* File Upload Section */}
            <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-blue-100">
                <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                    <Upload className="mr-2 text-purple-600" size={24} /> Upload CSV Dataset
                </h2>
                <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100 cursor-pointer"
                />
                {errorMessage && <p className="text-red-500 text-sm mt-2 flex items-center"><Info size={16} className="mr-1"/>{errorMessage}</p>}
            </div>

            {/* Data Preview and Column Selection */}
            {csvData && (
                <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-green-100">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                        <Table className="mr-2 text-green-600" size={24} /> Data Preview & Column Selection
                    </h2>
                    {/* Headers for selection */}
                    <div className="mb-4">
                        <p className="font-medium text-gray-700 mb-2">Select Features:</p>
                        <div className="flex flex-wrap gap-2">
                            {headers.map(header => (
                                <button
                                    key={header}
                                    onClick={() => handleFeatureSelect(header)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ease-in-out
                                        ${selectedFeatures.includes(header) ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-blue-100 hover:text-blue-800'}`}
                                >
                                    {header}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="mb-4">
                        <p className="font-medium text-gray-700 mb-2">Select Target (Optional for K-Means):</p>
                        <select
                            value={selectedTarget}
                            onChange={(e) => handleTargetSelect(e.target.value)}
                            className="block w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-900 cursor-pointer"
                        >
                            <option value="">-- Select Target Column --</option>
                            {headers.map(header => (
                                <option key={header} value={header}>{header}</option>
                            ))}
                        </select>
                    </div>

                    {/* Algorithm Selection */}
                    <div className="mb-6">
                        <p className="font-medium text-gray-700 mb-2">Select Algorithm:</p>
                        <select
                            value={selectedAlgorithm}
                            onChange={(e) => handleAlgorithmSelect(e.target.value)}
                            className="block w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-900 cursor-pointer"
                        >
                            <option value="">-- Select ML Algorithm --</option>
                            <option value="LinearRegression">Linear Regression</option>
                            <option value="DecisionTreeRegressor">Decision Tree Regressor</option>
                            <option value="DecisionTreeClassifier">Decision Tree Classifier</option>
                            <option value="KMeans">K-Means Clustering</option>
                        </select>
                    </div>

                    {/* Train Button */}
                    <button
                        onClick={trainModel}
                        disabled={loading || selectedFeatures.length === 0 || (!selectedTarget && selectedAlgorithm !== 'KMeans') || !selectedAlgorithm}
                        className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors duration-300 ease-in-out
                            ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'}`}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <CircleDotDashed className="animate-spin mr-2" size={20} /> Training Model...
                            </span>
                        ) : (
                            'Train Model'
                        )}
                    </button>

                    {/* Display CSV Data (first 5 rows) */}
                    <div className="overflow-x-auto mt-6 max-h-60 border border-gray-200 rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100 sticky top-0">
                                <tr>
                                    {headers.map(header => (
                                        <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {dataRows.slice(0, 5).map((row, rowIndex) => (
                                    <tr key={rowIndex}>
                                        {headers.map(header => (
                                            <td key={`${rowIndex}-${header}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {row[header]}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {dataRows.length > 5 && <p className="text-center text-gray-500 text-sm mt-2">... showing first 5 rows of {dataRows.length}</p>}
                    </div>
                </div>
            )}

            {/* Model Results Display */}
            {modelResults && (
                <div className="bg-white p-6 rounded-xl shadow-lg border border-orange-100">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                        <GitPullRequestArrow className="mr-2 text-orange-600" size={24} /> Model Results
                    </h2>
                    {modelResults.metrics && Object.keys(modelResults.metrics).length > 0 && (
                        <div className="mb-4">
                            <h3 className="text-lg font-medium text-gray-700 mb-2">Metrics:</h3>
                            <ul className="list-disc list-inside text-gray-800 space-y-1">
                                {Object.entries(modelResults.metrics).map(([key, value]) => (
                                    <li key={key} className="flex items-center">
                                        <span className="font-semibold mr-1">{key}:</span>
                                        <span className="font-mono text-blue-700">{typeof value === 'number' ? value.toFixed(4) : value}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Plotting Area */}
                    {modelResults.plot_data && (
                        <div className="mt-4">
                            <h3 className="text-lg font-medium text-gray-700 mb-2">Visualizations:</h3>
                            {modelResults.plot_type === 'scatter' && (
                                <ResponsiveContainer width="100%" height={300}>
                                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" dataKey="true" name="True Value" stroke="#666" />
                                        <YAxis type="number" dataKey="predicted" name="Predicted Value" stroke="#666" />
                                        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                        <Legend />
                                        <Scatter name="True vs. Predicted" data={modelResults.plot_data} fill="#8884d8" />
                                    </ScatterChart>
                                </ResponsiveContainer>
                            )}
                            {modelResults.plot_type === 'confusion_matrix' && modelResults.plot_data && (
                                <div className="w-full overflow-x-auto">
                                    <h4 className="text-md font-medium text-gray-700 mb-2">Confusion Matrix:</h4>
                                    <table className="min-w-full divide-y divide-gray-200 border border-gray-300 rounded-lg shadow-sm">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase"></th>
                                                <th colSpan="2" className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase border-b border-gray-300">Predicted</th>
                                            </tr>
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Actual</th>
                                                <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase border-r border-gray-300">Positive</th>
                                                <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase">Negative</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            <tr>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-300">Positive</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-center">{modelResults.plot_data.tp}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-center">{modelResults.plot_data.fn}</td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-300">Negative</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-center">{modelResults.plot_data.fp}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-center">{modelResults.plot_data.tn}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <p className="text-xs text-gray-500 mt-2">TP: True Positives, FN: False Negatives, FP: False Positives, TN: True Negatives</p>
                                </div>
                            )}
                            {modelResults.plot_type === 'cluster' && (
                                <ResponsiveContainer width="100%" height={300}>
                                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" dataKey="x" name={modelResults.plot_labels ? modelResults.plot_labels[0] : 'Feature 1'} stroke="#666" />
                                        <YAxis type="number" dataKey="y" name={modelResults.plot_labels ? modelResults.plot_labels[1] : 'Feature 2'} stroke="#666" />
                                        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                        <Legend />
                                        {Array.from(new Set(modelResults.plot_data.map(d => d.cluster))).sort().map(clusterId => (
                                            <Scatter
                                                key={`cluster-${clusterId}`}
                                                name={`Cluster ${clusterId}`}
                                                data={modelResults.plot_data.filter(d => d.cluster === clusterId)}
                                                fill={
                                                    clusterId === 0 ? '#8884d8' :
                                                    clusterId === 1 ? '#82ca9d' :
                                                    clusterId === 2 ? '#ffc658' :
                                                    clusterId === 3 ? '#ff7300' :
                                                    clusterId === 4 ? '#0088FE' :
                                                    '#AAAAAA' // Default for more clusters
                                                }
                                            />
                                        ))}
                                    </ScatterChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default App;
