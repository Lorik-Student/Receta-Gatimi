import * as Service from "./auth.service.js";
import { type Request, type Response } from "express";
import { UnauthorizedError } from "../../common/http-errors.js";

function getRefreshToken(req: Request): string {
    const token = req.header("x-refresh-token");
    if (!token) {
        throw new UnauthorizedError("TOKEN_REQUIRED", "Refresh token is required");
    }
    return token;
}

export async function signup(req: Request, res: Response) { 
    const user = await Service.signup(req.body);

    return res.status(201)
                .json({ success: true,
                        message: "Përdoruesi u krijua me sukses",
                        user });
    
}

export async function login(req: Request, res: Response) {
    const session = await Service.login(req.body);
    if (!session) {
        return res.status(401)
            .json({ success: false, 
                message: "Identifikimi dështoi. Ju lutemi provoni përsëri." });
    }

    const { accessToken, refreshToken, user } = session;
    
    res.setHeader("Authorization", `Bearer ${accessToken}`);
    res.setHeader("x-refresh-token", refreshToken);

    res.status(200).json({
        success: true,
        message: "Lidhja ne llgari u realizua me sukses",
        user: user,
        accessToken,
        refreshToken
    });
}

export async function logout(req: Request, res: Response) { 
    const token = getRefreshToken(req);
    await Service.logout(token);

    res.status(200)
        .json({ success: true, message: "Logged out successfully" });
}

export async function refreshToken(req: Request, res: Response) { 
    const token = getRefreshToken(req);
    const session = await Service.refreshSession(token);

    res.status(200).json({
        accessToken: session.accessToken,
        refreshToken: session.refreshToken
    });
}
