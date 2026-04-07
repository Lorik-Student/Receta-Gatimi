import * as Model from "../models/user.model.js";
import * as Types from "../types.js";
import bcrypt from "bcrypt";

async function createUser(userData: Types.SignUpData): Promise<Types.Id> { 
    const existingUser = await Model.findUser(userData.email);
    if (existingUser) {
        throw new Error("User with this email already exists");
    }

    const { password, ...userInfo } = userData;

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const role: Types.Role = "user";

    const userToInsert: Model.UserInsert = {
        ...userInfo,
        roles
        password_hash: passwordHash,
        email_confirmed: false,
        lockout_enabled: false,
        access_failed_count: 0,
        statusi: "active"
    }

    return await Model.insertUser(userToInsert);
}

async function authenticate(userData: Types.LoginData): Promise<Types.Id | null> {
    const foundUser = await Model.findUser(userData.email);
    if (!foundUser) 
        return null; 

    const isMatch = await bcrypt.compare(userData.password, foundUser.password_hash);
    if (!isMatch) 
        return null;

    return foundUser.id;
}
export { createUser, authenticate };