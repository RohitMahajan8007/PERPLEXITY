import dotenv from 'dotenv';
dotenv.config();
import { sendEmail } from './src/services/mail.service.js';

async function test() {
    try {
        console.log("Testing email with Brevo...");
        const res = await sendEmail({
            to: process.env.GOOGLE_USER,
            subject: "Verification Test",
            html: "<h1>Testing...</h1>"
        });
        console.log("SUCCESS:", res);
    } catch (err) {
        console.error("FAILURE:", err.message);
    }
}

test();
