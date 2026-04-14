import type { UserProfile } from "../../common/types/index.js";
import * as Service from "./auth.service.js";
import * as UserService from "../user/user.service.js";
import { type Request, type Response } from "express";

export async function signup(req: Request, res: Response) { 
    const userId = await Service.createUser(req.body);

    return res.status(201).json({ success: true, id: userId, message: "User created successfully" });
    
}

export async function login(req: Request, res: Response) {
    const userId = await Service.authenticate(req.body);
    if (!userId) {
        return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
    const accessToken = await Service.generateAccessToken(userId);
    const refreshToken = await Service.generateRefreshToken(userId);
    
    res.setHeader("Authorization", `Bearer ${accessToken}`);
    res.setHeader("x-refresh-token", refreshToken);

    const user = await UserService.getUserProfile(userId);

    res.status(200).json({
        success: true,
        message: "Login successful",
        user: user,
        accessToken,
        refreshToken
    });
}

export async function logout(req: Request, res: Response) { 
    res.status(200)
        .json({ success: true, message: "Logged out successfully" });
}

export async function refreshToken(req: Request, res: Response) { 
    const token = req.header("x-refresh-token");
    if (!token) { 
        return res.status(401)
                  .json({ success: false, message: "Refresh token is required" });
    }
    
    const newToken = await Service.updateRefreshToken(token);

    res.setHeader("Authorization", `Bearer ${newToken}`);
    res.status(200).json({
        success: true,
        message: "Token refreshed successfully",
        accessToken: newToken
    });
}