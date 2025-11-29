import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = '/app/data/uploads';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

const transcriptsDir = '/app/data/transcripts';
if (!fs.existsSync(transcriptsDir)) {
    fs.mkdirSync(transcriptsDir, { recursive: true });
}

app.post('/api/upload-transcript', upload.single('file'), (req, res) => {
    const uploadToken = process.env.UPLOAD_TOKEN;
    
    if (!uploadToken) {
        return res.status(500).json({ error: 'Server configuration error' });
    }
    
    if (req.body.token !== uploadToken) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const originalName = req.file.originalname;
    const finalPath = path.join(transcriptsDir, originalName);
    
    fs.renameSync(req.file.path, finalPath);
    
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
    
    res.json({ 
        success: true, 
        filename: originalName,
        url: `${baseUrl}/transcripts/${originalName}`
    });
    console.log(`Uploaded transcript: ${originalName}`);
});

app.get('/transcripts/:filename', (req, res) => {
    const filename = req.params.filename;
    
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        return res.status(400).json({ error: 'Invalid filename' });
    }
    
    const filePath = path.join(transcriptsDir, filename);
    
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found' });
    }
    
    res.sendFile(filePath);
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
    res.json({ message: 'Hytale Modding Archive API', status: 'running' });
});

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
    console.log(`Transcripts directory: ${transcriptsDir}`);
    console.log(`Upload token configured: ${!!process.env.UPLOAD_TOKEN}`);
});