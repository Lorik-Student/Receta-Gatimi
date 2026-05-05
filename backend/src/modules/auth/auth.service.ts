import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../../common/http-errors.js";
import type {  LoginData, User, UserProfile, SignUpData } from "../../common/types/index.js";
import * as UserModel from "../user/user.model.js";
import * as UserService from "../user/user.service.js";
import * as TokenModel from "./token.model.js";

type LoginResult = {
    user: UserProfile | null;
    accessToken: string;
    refreshToken: string;
};

export async function signup(userData: SignUpData): Promise<User> {
    const user = await UserService.createUser({
        emri: userData.emri,
        mbiemri: userData.mbiemri,
        email: userData.email,
        password: userData.password,
        ...(userData.phone_number !== undefined ? { phone_number: userData.phone_number } : {}),
    });

    if (!user) 
        throw new UnauthorizedError("USER_CREATION_FAILED", "Failed to create user");
    return user;
}

export async function login(userData: LoginData): Promise<LoginResult> {
    const authenticatedUser = await authenticate(userData);
    if (!authenticatedUser) {
        throw new UnauthorizedError("INVALID_CREDENTIALS", "Emaili ose fjalëkalimi i dhënë është i pasaktë.");
    }

    const userId = authenticatedUser.id;
    const [accessToken, refreshToken, user] = await Promise.all([
        generateAccessToken(userId),
        createRefreshToken(userId),
        UserService.getUserProfile(userId),
    ]);

    return {
        user,
        accessToken,
        refreshToken,
    };
}

export async function logout(refreshToken: string): Promise<void> {
    const revokedUserId = await markRefreshTokenAsUsed(refreshToken);
    if (!revokedUserId) {
        throw new UnauthorizedError("INVALID_REFRESH_TOKEN", "The provided refresh token is invalid or has already been used.");
    }
}

export async function refreshSession(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const userId = await validateRefreshToken(refreshToken);
    const revokedUserId = await markRefreshTokenAsUsed(refreshToken);

    if (!revokedUserId || revokedUserId !== userId) {
        throw new UnauthorizedError("INVALID_REFRESH_TOKEN", "The provided refresh token is invalid or has already been used.");
    }

    const [accessToken, newRefreshToken] = await Promise.all([
        generateAccessToken(userId),
        createRefreshToken(userId),
    ]);

    return {
        accessToken,
        refreshToken: newRefreshToken,
    };
}

async function authenticate(userData: LoginData): Promise<User | null> {
    const foundUser = await UserModel.findUserByEmail(userData.email);
    if (!foundUser) {
        return null;
    }

    const isMatch = await bcrypt.compare(userData.password, foundUser.password_hash);
    if (!isMatch) {
        return null;
    }

    return foundUser;
}

async function generateAccessToken(userId: number): Promise<string> {
    const payload = {
        sub: userId,
        roles: await UserModel.getUserRoles(userId),
        exp: Math.floor(Date.now() / 1000) + (15 * 60),
    };
    return jwt.sign(payload, process.env.JWT_SECRET as string);
}

function generateRefreshToken(): string {
    return crypto.randomBytes(40).toString("hex");
}

async function createRefreshToken(userId: number): Promise<string> {
    const token = generateRefreshToken();
    await TokenModel.saveRefreshToken(userId, token);
    return token;
}

async function markRefreshTokenAsUsed(token: string): Promise<number | null> {
    return TokenModel.markRefreshTokenAsUsed(token);
}

async function validateRefreshToken(token: string): Promise<number> {
    const foundToken = await TokenModel.findRefreshToken(token);
    if (!foundToken) {
        throw new UnauthorizedError("INVALID_REFRESH_TOKEN", "The provided refresh token is invalid.");
    }
    if (foundToken.revoked) {
        throw new UnauthorizedError("USED_REFRESH_TOKEN", "The provided refresh token has already been used.");
    }
    if (new Date(foundToken.expires) < new Date()) {
        throw new UnauthorizedError("EXPIRED_REFRESH_TOKEN", "The provided refresh token has expired.");
    }

    return foundToken.user_id;
}

