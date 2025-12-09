import express from 'express';
import cors from 'cors';
import { LoadTestController } from './loadtest.js';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Prevent crash on unhandled errors
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const loadTest = new LoadTestController();

app.post('/api/test/start', (req, res) => {
    const config = req.body;
    if (!config.targetUrl) {
        return res.status(400).json({ error: 'Target URL is required' });
    }

    try {
        loadTest.start(config);
        res.json({ message: 'Load test started', config });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/test/stop', (req, res) => {
    loadTest.stop();
    res.json({ message: 'Load test stopped' });
});

app.get('/api/test/status', (req, res) => {
    res.json(loadTest.getStatus());
});

// A lightweight target for self-testing
app.get('/api/target', (req, res) => {
    res.json({ message: 'Target Hit', timestamp: Date.now() });
});

app.listen(port, () => {
    console.log(`Backend server running at http://localhost:${port}`);

    // Heartbeat to keep process alive and debug exits
    setInterval(() => {
        // console.log('Heartbeat...'); 
    }, 10000);
});
