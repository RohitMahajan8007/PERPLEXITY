import jwt from "jsonwebtoken";




export function autUser(req, res, next) {
    const token = req.cookies.token;

    if(!token) {
        res.status(401).json({
            message: "Unauthorized, token not found",
            success: false,
            err: "Token missing"
        })
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

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