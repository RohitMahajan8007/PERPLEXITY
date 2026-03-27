import { BrevoClient } from '@getbrevo/brevo';

let client;

function getBrevoClient() {
    if (!client) {
        if (!process.env.BREVO_API_KEY) {
            console.error("❌ BREVO_API_KEY is missing from environment variables!");
        }
        client = new BrevoClient({
            apiKey: process.env.BREVO_API_KEY
        });
    }
    return client;
}

export async function sendEmail({ to, subject, html, text }) {
    try {
        console.log("📤 Sending email via Brevo SDK to:", to);

        const brevoClient = getBrevoClient();
        const data = await brevoClient.transactionalEmails.sendTransacEmail({
            subject: subject,
            htmlContent: html,
            sender: { "name": "Perplexity", "email": process.env.GOOGLE_USER },
            to: [{ "email": to }],
            textContent: text
        });

        console.log("✅ Email sent successfully via Brevo SDK. Message ID:", data.messageId);
        return data; 
    } catch (error) {
        console.error("❌ MAIL ERROR:", error.message);
        if (error.response?.data) {
            console.error("❌ BREVO RESPONSE ERROR:", JSON.stringify(error.response.data));
        }
        throw error;
    }
}