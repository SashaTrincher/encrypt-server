const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const app = express();

app.use(cors());
app.use(express.json());

const algorithm = 'aes-256-cbc';
const secretKey = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

// Function to encrypt text
function encrypt(text, userKey) {
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(userKey, 'hex'), iv);
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
    return { iv: iv.toString('hex'), content: encrypted.toString('hex') };
}

// Endpoint to encrypt data
app.post('/encrypt', (req, res) => {
    try {
        const { text, key } = req.body;
        const encryptedData = encrypt(text, key);
        res.json({ iv: encryptedData.iv, content: encryptedData.content });
    } catch (error) {
        console.error('Encryption error:', error);
        res.status(500).send('Error during encryption');
    }
});

// Function to decrypt text
function decrypt(hash, userKey) {
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(userKey, 'hex'), Buffer.from(hash.iv, 'hex'));
    const decrypted = Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()]);
    return decrypted.toString();
}

// Endpoint to decrypt data
app.post('/decrypt', (req, res) => {
    try {
        console.log("Decrypt request:", req.body);
        const { hash, key } = req.body;
        const decryptedData = decrypt(hash, key);
        res.json({ decryptedText: decryptedData });
    } catch (error) {
        console.error('Decrypt error:', error);
        res.status(500).send('Error during decryption');
    }
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
