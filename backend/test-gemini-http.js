import https from 'https';
import 'dotenv/config';
import fs from 'fs';

const key = process.env.GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const parsed = JSON.parse(data);
            const modelNames = parsed.models ? parsed.models.map(m => m.name) : [];
            fs.writeFileSync('models.json', JSON.stringify(modelNames, null, 2));
            console.log("Saved models to models.json");
        } catch (e) {
            console.log("Raw Response:", data);
        }
    });
}).on('error', err => {
    console.error("HTTP Error:", err.message);
});
