import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const upload = multer({ dest: 'uploads/' });

const transcriptsDir = path.join(__dirname, 'public', 'transcripts');
if (!fs.existsSync(transcriptsDir)) {
    fs.mkdirSync(transcriptsDir, { recursive: true });
}

app.post('/api/upload-transcript', upload.single('file'), (req, res) => {
    const uploadToken = process.env.UPLOAD_TOKEN;
    
    if (req.body.token !== uploadToken) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const originalName = req.file.originalname;
    const finalPath = path.join(transcriptsDir, originalName);
    
    fs.renameSync(req.file.path, finalPath);
    
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    
    res.json({ 
        success: true, 
        filename: originalName,
        url: `${baseUrl}/transcripts/${originalName}`
    });
    console.log(`Uploaded transcript: ${originalName}`);
});

app.use('/transcripts', express.static(transcriptsDir));

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});