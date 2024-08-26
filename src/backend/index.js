import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

app.post('/api/save-json', (req, res) => {
    const newJsonData = req.body;
    const filePath = path.join(__dirname, 'data.json');

    // Mevcut JSON dosyasını oku
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err && err.code !== 'ENOENT') {
            return res.status(500).json({ error: 'Failed to read JSON file' });
        }

        let existingData = [];
        if (!err) {
            existingData = JSON.parse(data);
        }
        
        const updatedData = [...existingData, ...newJsonData];
        fs.writeFile(filePath, JSON.stringify(updatedData, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to save JSON file' });
            }
            res.status(200).json({ message: 'JSON file updated successfully' });
        });
    });
});
app.post('/api/save-tckn', (req, res) => {
    const newJsonData = req.body;
    const filePath = path.join(__dirname, 'tckn.json');

    const tcknList = newJsonData.map(tckn => ({ tckn }));

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err && err.code !== 'ENOENT') {
            return res.status(500).json({ error: 'Failed to read TCKN file' });
        }

        let existingData = [];
        if (!err) {
            existingData = JSON.parse(data);
        }
        
        const updatedData = [...existingData, ...tcknList];
        fs.writeFile(filePath, JSON.stringify(updatedData, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to save TCKN file' });
            }
            res.status(200).json({ message: 'TCKN file updated successfully' });
        });
    });
});


app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
