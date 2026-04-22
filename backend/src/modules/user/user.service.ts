import * as Model from "./user.model.js";
import type { Id } from "../../common/types/index.js";
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

export async function createUser(userData: CreateUserInput): Promise<Id> {
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

    return createdUser.id;
}

export async function getUsers(): Promise<User[]> { 
    return await Model.findAllUsers();
}

export async function getUser(id: Id): Promise<User | null> { 
    return await Model.findUser(id);
}

export async function updateUser(id: Id, userData: UserUpdate): Promise<User> {
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

export async function getUserProfile(id: Id): Promise<UserProfile | null> { 
    return await Model.findUserProfile(id);
}

export async function deleteUser(id: Id): Promise<void> { 
    const deleted = await Model.deleteUser(id);
    if (!deleted) {
        throw new NotFoundError("USER_NOT_FOUND", "User not found");
    }
}