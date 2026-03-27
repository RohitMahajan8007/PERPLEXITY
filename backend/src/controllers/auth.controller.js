import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../services/mail.service.js";


export async function register(req, res) {
    try {
        const { username, email, password } = req.body;

        const isUserAlreadyExists = await userModel.findOne({
            $or: [{ email: email.toLowerCase() }, { username }]
        });

        if (isUserAlreadyExists) return res.status(400).json({
            message: "User with this email or username already exists",
            success: false,
            err: "User already exists"
        });

        const user = await userModel.create({
            username,
            email: email.toLowerCase(),
            password
        });

        const emailVerificationToken = jwt.sign({
            email: user.email
        }, process.env.JWT_SECRET, { expiresIn: "1d" });

        const host = req.get('host');
        // Better protocol detection for proxies (like Render)
        const protocol = (req.protocol === 'http' && req.headers['x-forwarded-proto']) 
            ? req.headers['x-forwarded-proto'] 
            : req.protocol;
            
        // Construct the base URL dynamically based on the current request
        // This ensures the link in the email matches the environment (localhost vs Render)
        const currentUrl = (host.includes('localhost') || host.includes('127.0.0.1'))
            ? (process.env.BASE_URL || `${protocol}://${host}`)
            : `${protocol}://${host}`;

        const backendUrl = currentUrl;
        const frontendUrl = currentUrl;

        console.log("🛠️ Preparing to send email to:", user.email);
        console.log("🛠️ Using backendUrl:", backendUrl);

        // Send email in background - non-blocking to prevent registration hang on timeout
        sendEmail({
            to: user.email,
            subject: "Verify your Perplexity account",
            text: `Hello ${username}, Please verify your account by clicking the link: ${backendUrl}/api/auth/verify-email?token=${emailVerificationToken}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #111; border: 1px solid #eee; padding: 30px; border-radius: 12px;">
                    <h2 style="color: #31b8c6; font-size: 24px; text-align: center;">Welcome to Perplexity</h2>
                    <p style="font-size: 16px; margin: 20px 0;">Hello ${username},</p>
                    <p style="font-size: 16px; line-height: 1.5;">To get started, please verify your email address by clicking the button below:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${backendUrl}/api/auth/verify-email?token=${emailVerificationToken}" 
                           style="background-color: #31b8c6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                           Verify Email
                        </a>
                    </div>
                    <p style="color: #888; font-size: 14px; text-align: center; margin-top: 30px;">
                        If you didn't create an account, you can safely ignore this.
                    </p>
                </div>
            `
        })
.catch(emailErr => {
            console.error("Failed to send verification email in background:", emailErr.message);
        });
        
        return res.status(201).json({
            message: "User registered successfully! Please check your email for verification.",
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (err) {
        console.error("REGISTRATION ERROR:", err.message, err.stack);
        return res.status(500).json({
            message: "Something went wrong during registration. Please try again later.",
            success: false,
            err: err.message
        });
    }
}


export async function login(req, res) {
    const { email, password } = req.body;

    const user = await userModel.findOne({
        $or: [ { email: email.toLowerCase() }, { username: email } ]
    });

    if (!user) {
        return res.status(401).json({
            message: "Invalid email or password",
            success: false,
            err: "Invalid credentials"
        })
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
        return res.status(401).json({
            message: "Invalid email or password",
            success: false,
            err: "Invalid credentials"
        })
    }

    if (!user.verified) {
        return res.status(400).json({
            message: "please verify your email before login",
            success: false,
            err: "Email not verified"
        })
    }
        const token = jwt.sign({
            id : user._id.toString(),
            username : user.username,
        }, process.env.JWT_SECRET, { expiresIn: "7d" })

        const isProduction = process.env.NODE_ENV === "production" || req.hostname.endsWith(".onrender.com");
        res.cookie("token", token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        
        res.status(200).json({
            message: "User logged in successfully",
            success: true,
            user:{
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
}


export async function getMe(req, res){
    const userId = req.user.id;

    const user = await userModel.findById(userId).select("-password");

    if (!user) {
        return res.status(401).json({
            message: "Session expired or user not found",
            success: false,
            err: "Stale session"
        })
    }
    res.status(200).json({
        message: "User fetched successfully",
        success: true,
        user
    })
} 


export async function verifyEmail(req, res) {
    const { token } = req.query;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findOne({email : decoded.email });

        if (!user) {
            return res.status(400).json({
                message: "Invalid token",
                success: false,
                err: "User not found"
            });
        }
        user.verified = true;
        await user.save();
        
        const host = req.get('host');
        const protocol = (req.protocol === 'http' && req.headers['x-forwarded-proto']) 
            ? req.headers['x-forwarded-proto'] 
            : req.protocol;
            
        const currentUrl = (host.includes('localhost') || host.includes('127.0.0.1'))
            ? (process.env.BASE_URL || `${protocol}://${host}`)
            : `${protocol}://${host}`;
        
        // Redirect back to login with verification flag
        const redirectUrl = `${currentUrl}/login?verified=true&email=${encodeURIComponent(user.email)}`;
            
        return res.redirect(redirectUrl);
    } catch (err) {
        return res.status(400).json({
            message: "Invalid or expired token",
            success: false,
            err: err.message
        });
    }
}
    
export async function logout(req, res) {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax"
    });
    res.status(200).json({
        message: "User logged out successfully",
        success: true
    });
}
    
export async function testEmail(req, res) {
    try {
        const testTo = req.query.email || process.env.GOOGLE_USER;
        await sendEmail({
            to: testTo,
            subject: "Test Email from Perplexity",
            text: "This is a test email to verify your SMTP configuration.",
            html: "<h1>Test Successful!</h1><p>Your Perplexity mail configuration is working perfectly.</p>"
        });
        res.status(200).json({ success: true, message: `Test email sent to ${testTo}` });
    } catch (err) {
        res.status(500).json({ success: false, message: "Email test failed", error: err.message });
    }
}