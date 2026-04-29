import * as Model from "./user.model.js";
import type { UserInsert, UserProfile, User, UserUpdate } from "../../common/types/user.types.js";
import bcrypt from "bcrypt";
import { ConflictError, NotFoundError } from "../../common/http-errors.js";
import { UserRole } from "../../common/types/index.js";

type CreateUserInput = Omit<UserInsert, "roles"> & {
    roles?: UserRole[];
};

async function hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

export async function createUser(userData: CreateUserInput): Promise<User> {
    const exists = await Model.existsByEmail(userData.email);
    if (exists) {
        throw new ConflictError("EMAIL_ALREADY_EXISTS", "User with this email already exists");
    }

    const passwordHash = await hashPassword(userData.password);
    const userRoles = userData.roles?.length ? userData.roles : [UserRole.user];

    const createdUser = await Model.insertUser({
        emri: userData.emri,
        mbiemri: userData.mbiemri,
        email: userData.email,
        phone_number: userData.phone_number ?? null,
        password_hash: passwordHash,
        roles: userRoles,
        email_confirmed: false,
        lockout_enabled: false,
        access_failed_count: 0,
        statusi: "active"
    });

    if (!createdUser) {
        throw new ConflictError("USER_CREATION_FAILED", "Failed to create user");
    }

    return createdUser;
}

export async function getUsers(): Promise<User[]> { 
    return await Model.findAllUsers();
}

export async function getUser(id: number): Promise<User | null> { 
    const foundUser = await Model.findUser(id);
    if (!foundUser) throw new NotFoundError("USER_NOT_FOUND", "User not found");
    return foundUser;
}

export async function updateUser(id: number, userData: UserUpdate): Promise<User> {
    const { password, roles, ...restData } = userData;

    if (restData.email) {
        const existingWithEmail = await Model.findUserByEmail(restData.email);
        if (existingWithEmail && existingWithEmail.id !== id) {
            throw new ConflictError("EMAIL_ALREADY_EXISTS", "User with this email already exists");
        }
    }

    const modelUpdateData: Model.UserUpdateTable = { ...restData };
    if (password !== undefined) {
        modelUpdateData.password_hash = await hashPassword(password);
    }

    const updatedUser = await Model.updateUser(id, modelUpdateData);
    if (!updatedUser) {
        throw new NotFoundError("USER_NOT_FOUND", "User not found");
    }

    if (roles !== undefined) {
        await Model.replaceUserRoles(id, roles);
        const reloadedUser = await Model.findUser(id);
        if (!reloadedUser) {
            throw new NotFoundError("USER_NOT_FOUND", "User not found");
        }
        return reloadedUser;
    }

    return updatedUser;
}

export async function getAllUserProfiles(): Promise<UserProfile[]> {
    return await Model.findAllUserProfiles();
}

export async function getUserProfile(id: number): Promise<UserProfile | null> { 
    const foundUser = await Model.findUserProfile(id);
    if (!foundUser) throw new NotFoundError("USER_NOT_FOUND", "User not found");
    return foundUser;

}

export async function deleteUser(id: number): Promise<void> { 
    const deleted = await Model.deleteUser(id);
    if (!deleted) {
        throw new NotFoundError("USER_NOT_FOUND", "User not found");
    }
}