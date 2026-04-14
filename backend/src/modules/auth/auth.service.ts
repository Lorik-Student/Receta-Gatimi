import * as Model from "../user/user.model.js";
import * as TokenModel from "./token.model.js";
import bcrypt from "bcrypt";
import { HttpError } from "../../common/errors/http-error.js";
import type { Id, LoginData, SignUpData } from "../../common/types/index.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";

export async function createUser(userData: SignUpData): Promise<Id> {
    const exists = await Model.existsByEmail(userData.email);
    if (exists) {
        throw new HttpError(409, "User with this email already exists", {
            code: "EMAIL_ALREADY_EXISTS"
        });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(userData.password, salt);

    return Model.insertUser({
        emri: userData.emri,
        mbiemri: userData.mbiemri,
        email: userData.email,
        phone_number: userData.phone_number as string | null,
        password_hash: passwordHash,
        roles: [Model.UserRole.user], 
        email_confirmed: false,
        lockout_enabled: false,
        access_failed_count: 0,
        statusi: "active"
    });
}

export async function authenticate(userData: LoginData): Promise<Id | null> {
    const foundUser = await Model.findUserByEmail(userData.email);
    if (!foundUser) 
        return null; 

    const isMatch = await bcrypt.compare(userData.password, foundUser.password_hash);
    if (!isMatch) 
        return null;

    return foundUser.id;
}

export async function generateAccessToken(userId: Id): Promise<string> { 
    const payload = {
        sub: userId,
        roles: await Model.getUserRoles(userId),
        exp: Math.floor(Date.now() / 1000) + (15 * 60) // 15 minute expiration
    };
    return jwt.sign(payload, process.env.JWT_SECRET as string);
}

// generate and store a refresh token in the database
export async function generateRefreshToken(userId: Id): Promise<string> { 
    const token = crypto.randomBytes(40).toString("hex");
    await TokenModel.saveRefreshToken(userId, token);
    return token;
}

export async function updateRefreshToken(token: string): Promise<string> { 
    const userId = await TokenModel.markRefreshTokenAsUsed(token);
    if (!userId) { 
        throw new HttpError(401, "Invalid refresh token", { code: "INVALID_REFRESH_TOKEN" });
    }
    return generateAccessToken(userId);

}

// export async function refreshAccessToken(refreshToken: string): Promise<string> { 
//     const tokenRecord = await Model.findRefreshToken(refreshToken);
// }
