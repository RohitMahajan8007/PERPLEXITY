import jwt from "jsonwebtoken";




export function authUser(req, res, next) {
    console.log("Cookies received:", req.cookies);
    const token = req.cookies.token;

    if(!token) {
        console.log("Token missing in request");
        return res.status(401).json({
            message: "Unauthorized, token not found",
            success: false,
            err: "Token missing"
        })
    }

    try{
        if (!process.env.JWT_SECRET) console.log("CRITICAL: JWT_SECRET is missing!");
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Token verified for user:", decoded.id);
        req.user = decoded;
        next();
    }
    catch(err) {
        res.status(401).json({
            message: "Unauthorized, invalid token",
            success: false,
            err: "Invalid token"
        })
    }
}