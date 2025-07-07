// server.js - Our central dispatcher for web requests

const express = require('express');
const path = require('path'); // For resolving file paths
const axios = require('axios'); // For making HTTP requests to Python backend

// Load environment variables from .env file (if you use one for API keys etc.)
// If you don't have a .env file, you can remove this line, but it's good practice.
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080; // Node.js server will run on this port

// NEW: Python Backend URL - IMPORTANT: Ensure this matches your python_server.py port
const PYTHON_BACKEND_URL = "http://127.0.0.1:5000"; // Flask server will run on port 5000

// Middleware to parse JSON bodies. Increase limit for large image data (base64 webcam frames).
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// --- API Endpoints for Frontend to Backend Communication (Proxy to Python) ---

// Endpoint to proxy requests for setting detection mode to Python backend
app.post('/set-detection-mode', async (req, res) => {
    try {
        const pythonResponse = await axios.post(`${PYTHON_BACKEND_URL}/set_detection_mode`, req.body);
        res.json(pythonResponse.data);
    } catch (error) {
        console.error('Error proxying set_detection_mode to Python backend:', error.message);
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Python backend responded with:', error.response.data);
            res.status(error.response.status).json({ error: error.response.data.message || 'Error from Python backend' });
        } else if (error.request) {
            // The request was made but no response was received (e.g., Python server down)
            console.error('No response received from Python backend (set_detection_mode). Is it running?');
            res.status(503).json({ error: 'Python backend is unreachable or not responding.' });
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error setting up request to Python backend (set_detection_mode):', error.message);
            res.status(500).json({ error: 'Internal server error during request setup.' });
        }
    }
});

// Endpoint to proxy requests for general frame detection (used by main page demo)
app.post('/detect-frame', async (req, res) => {
    try {
        const pythonResponse = await axios.post(`${PYTHON_BACKEND_URL}/detect_frame`, req.body);
        res.json(pythonResponse.data);
    } catch (error) {
        console.error('Error proxying detect_frame to Python backend:', error.message);
        if (error.response) {
            console.error('Python backend responded with:', error.response.data);
            res.status(error.response.status).json({ error: error.response.data.message || 'Error from Python backend' });
        } else if (error.request) {
            console.error('No response received from Python backend (detect_frame). Is it running?');
            res.status(503).json({ error: 'Python backend is unreachable or not responding.' });
        } else {
            res.status(500).json({ error: 'Internal server error during request setup.' });
        }
    }
});

// NEW Endpoint for Crowd Detection specifically (used by crowd_detection.html)
// This endpoint will also use /detect_frame on the Python side,
// but the Python backend will know it's in 'crowd' mode because we set it previously via /set_detection_mode.
app.post('/detect-crowd', async (req, res) => {
    try {
        const pythonResponse = await axios.post(`${PYTHON_BACKEND_URL}/detect_frame`, req.body);
        res.json(pythonResponse.data);
    } catch (error) {
        console.error('Error proxying detect-crowd to Python backend:', error.message);
        if (error.response) {
            console.error('Python backend responded with:', error.response.data);
            res.status(error.response.status).json({ error: error.response.data.message || 'Error from Python backend' });
        } else if (error.request) {
            console.error('No response received from Python backend (detect-crowd). Is it running?');
            res.status(503).json({ error: 'Python backend is unreachable or not responding.' });
        } else {
            res.status(500).json({ error: 'Internal server error during request setup.' });
        }
    }
});


// Endpoint for Object Description Generator (proxies to Python backend)
app.post('/generate-object-description', async (req, res) => {
    const { objectName } = req.body;
    if (!objectName) {
        return res.status(400).json({ error: "Object name is required." });
    }
    try {
        const pythonResponse = await axios.post(`${PYTHON_BACKEND_URL}/generate_object_description`, { objectName });
        res.json(pythonResponse.data);
    } catch (error) {
        console.error('Error proxying object description request to Python backend:', error.message);
        if (error.response) {
            console.error('Python backend responded with:', error.response.data);
            res.status(error.response.status).json({ error: error.response.data.message || 'Error from Python backend' });
        } else if (error.request) {
            console.error('No response received from Python backend (object description). Is it running?');
            res.status(503).json({ error: 'Python backend is unreachable or not responding.' });
        } else {
            res.status(500).json({ error: 'Internal server error during request setup.' });
        }
    }
});

// Endpoint for Security Protocol Advisor (proxies to Python backend)
app.post('/generate-security-advice', async (req, res) => {
    const { scenario } = req.body;
    if (!scenario) {
        return res.status(400).json({ error: "Scenario is required." });
    }
    try {
        const pythonResponse = await axios.post(`${PYTHON_BACKEND_URL}/generate_security_advice`, { scenario });
        res.json(pythonResponse.data);
    } catch (error) {
        console.error('Error proxying security advice request to Python backend:', error.message);
        if (error.response) {
            console.error('Python backend responded with:', error.response.data);
            res.status(error.response.status).json({ error: error.response.data.message || 'Error from Python backend' });
        } else if (error.request) {
            console.error('No response received from Python backend (security advice). Is it running?');
            res.status(503).json({ error: 'Python backend is unreachable or not responding.' });
        } else {
            res.status(500).json({ error: 'Internal server error during request setup.' });
        }
    }
});


// Start the Node.js server
app.listen(PORT, () => {
    console.log(`Node.js server running at http://localhost:${PORT}`);
    console.log('Ensure your Python backend is also running on http://127.0.0.1:5000');
});
