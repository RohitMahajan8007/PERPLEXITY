import dotenv from 'dotenv';
dotenv.config();
import { sendEmail } from './src/services/mail.service.js';

async function test() {
    const username = "TestUser";
    const backendUrl = "http://localhost:3000";
    const emailVerificationToken = "test-token";
    
    try {
        console.log("Testing with full template...");
        const res = await sendEmail({
            to: process.env.GOOGLE_USER,
            subject: "Verify your Perplexity account",
            html: `
                <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #07090f; color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #3b3d41;">
                    <div style="padding: 40px 20px; text-align: center; background: linear-gradient(to bottom, #1a1c1e, #07090f);">
                        <img src="${backendUrl}/assets/perplexity.png" alt="Perplexity" style="width: 80px; height: 80px; border-radius: 20px; box-shadow: 0 10px 20px rgba(0,0,0,0.5); margin-bottom: 24px; border: 2px solid rgba(49, 184, 198, 0.3);">
                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; letter-spacing: -0.5px;">Welcome to Perplexity</h1>
                    </div>
                    <div style="padding: 0 40px 40px;">
                        <p style="font-size: 16px; line-height: 1.6; color: #9ca3af; margin-bottom: 30px; text-align: center;">
                            Hello ${username},<br>
                            We're excited to have you on board! To get started exploring the future of search, please verify your email address.
                        </p>
                        <div style="text-align: center; margin: 40px 0;">
                            <a href="${backendUrl}/api/auth/verify-email?token=${emailVerificationToken}" 
                               style="display: inline-block; background-color: #31b8c6; color: #000000; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px; transition: all 0.2s ease; box-shadow: 0 4px 12px rgba(49, 184, 198, 0.3);">
                               Verify Email Address
                            </a>
                        </div>
                        <p style="font-size: 14px; color: #6b7280; text-align: center; margin-top: 40px;">
                            If you didn't create an account, you can safely ignore this email.
                        </p>
                    </div>
                    <div style="padding: 24px; text-align: center; border-top: 1px solid #1a1c1e; background-color: #0a0c12;">
                        <p style="margin: 0; color: #4b5563; font-size: 12px;">
                            © ${new Date().getFullYear()} Perplexity AI Clone. Built for the future.
                        </p>
                    </div>
                </div>
            `
        });
        console.log("SUCCESS:", res);
    } catch (err) {
        console.error("FAILURE:", err.message);
    }
}

test();
