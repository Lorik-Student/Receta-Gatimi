import * as Model from "../models/user.model.js";
import * as Types from "../types.js";
import bcrypt from "bcrypt";

async function createUser(userData: Types.SignUpData): Promise<Types.Id> {
    const exists = await Model.existsByEmail(userData.email);
    if (exists) throw new Error("User with this email already exists");

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

async function authenticate(userData: Types.LoginData): Promise<Types.Id | null> {
    const foundUser = await Model.findUserByEmail(userData.email);
    if (!foundUser) 
        return null; 

    const isMatch = await bcrypt.compare(userData.password, foundUser.password_hash);
    if (!isMatch) 
        return null;

    return foundUser.id;
}
export { createUser, authenticate };