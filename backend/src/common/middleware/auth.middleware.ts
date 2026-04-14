import type { RequestHandler, NextFunction, Response, Request } from "express"
import jwt from "jsonwebtoken"
import {} from "express-session"

const JWT_SECRET = process.env.JWT_SECRET;

export const authMiddleware: RequestHandler = async (req: Request, res: Response, next: NextFunction) => { 
    const authorization = req.header("authorization");
    const JWToken = authorization?.startsWith("Bearer ") ? authorization.slice(7) : undefined;
    if (!JWToken) {
        return res.status(401).json({ 
            code: "TOKEN_MISSING", 
            message: "Authentication token is required." 
        });
    }

    try {
        const decoded = jwt.verify(JWToken, JWT_SECRET as string);
        // Success! Attach user and pass the baton to the Controller
        (req as any).user = decoded;
        next(); 

    } catch (error: any) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ 
                code: "TOKEN_EXPIRED", 
                message: "Your access token has expired." 
            });
        } 
        
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ 
                code: "TOKEN_INVALID", 
                message: "Your access token is invalid." 
            });
        }
    }
};