const fs = require('fs');
const path = require('path');
const { checkAndCreateFolder } = require('../utils/versionUtils');

const pathToSave = "/uploads/";

exports.uploadSingle = (req, res) => {
    if (!req.headers['content-type'] || !req.headers['content-type'].startsWith('multipart/form-data')) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    const filePath = path.join('/uploads', req.headers['x-file-name']);
    const writeStream = fs.createWriteStream(filePath);
    req.pipe(writeStream);
    writeStream.on('error', (err) => {
        console.error('Error writing file:', err);
        res.status(500).json({ error: 'Failed to upload file' });
    });
    writeStream.on('finish', () => {
        res.json({ message: 'File uploaded successfully' });
    });
};

exports.upload = (req, res) => {
    const { piva, license } = req.query;
    checkAndCreateFolder(piva, license);

    const timestamp = new Date().toLocaleString().replace(/[/:, ]/g, '-');
    const folderPath = path.join(pathToSave, `${piva}_${license}`, "");
    const fileName = req.headers['x-file-name'];
    const filePath = path.join(folderPath, fileName);

    const writeStream = fs.createWriteStream(filePath);
    req.pipe(writeStream);

    writeStream.on('error', (err) => {
        console.error('Error writing file:', err);
        res.status(500).json({ error: 'Failed to upload file' });
    });

    writeStream.on('finish', () => {
        res.json({ message: 'File uploaded successfully' });
    });
};
