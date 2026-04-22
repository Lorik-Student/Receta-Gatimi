import type { RequestHandler, NextFunction, Response, Request } from "express"
import jwt, { type JwtPayload } from "jsonwebtoken"
import { UnauthorizedError, ForbiddenError } from "../http-errors.js";

export type RequestWithClaims = Request & { claims: JwtPayload };

const JWT_SECRET = process.env.JWT_SECRET as string;

export const authMiddleware: RequestHandler = async (req: Request, res: Response, next: NextFunction) => { 
    const authorization = req.header("authorization");
    const JWToken = authorization?.startsWith("Bearer ") ? authorization.slice(7) : undefined;
    if (!JWToken) 
        throw new UnauthorizedError("TOKEN_MISSING", "Tiketa e autentifikimit është e nevojshme.");

    try {
        const decoded = jwt.verify(JWToken, JWT_SECRET) as JwtPayload;
        // Success! Attach user and pass the baton to the Controller
        (req as RequestWithClaims).claims = decoded;
        next(); 

    } catch (error: any) {
        if (error.name === "TokenExpiredError") 
            throw new UnauthorizedError("TOKEN_EXPIRED", "Tiketa e autentifikimit ka skaduar. Ju lutemi, identifikohuni përsëri.");
        
        if (error.name === "JsonWebTokenError") 
            throw new UnauthorizedError("TOKEN_INVALID", "Tiketa e autentifikimit është e pavlefshme. Ju lutemi, identifikohuni përsëri.");

        throw new UnauthorizedError("TOKEN_VERIFICATION_FAILED", "Verifikimi i tiketës së autentifikimit dështoi. Ju lutemi, identifikohuni përsëri.");
    }
};


const adminOnlyMiddleware: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    const claims = (req as RequestWithClaims).claims;
    if (!claims || !claims.roles || !claims.roles.includes("admin")) {
        throw new ForbiddenError("ADMIN_ACCESS_REQUIRED", "Qasja lejohet vetëm për administratorët.");
    }
    next();
};

const userOnlyMiddleware: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    const claims = (req as RequestWithClaims).claims;
    if (!claims || !claims.roles || !claims.roles.includes("user")) {
        throw new ForbiddenError("USER_ACCESS_REQUIRED", "Qasja lejohet vetëm për përdoruesit.");
    }
    next();
};

// Kombinohen middlware-t ne nje
export const adminAuthMiddleware = [authMiddleware, adminOnlyMiddleware];
export const userAuthMiddleware = [authMiddleware, userOnlyMiddleware];