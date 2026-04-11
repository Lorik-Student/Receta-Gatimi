import * as Model from "../models/user.model.js";
import * as Types from "../types.js";

export async function getAllUserProfiles(): Promise<Types.UserProfile[]> {
    return await Model.findAllUserProfiles();
}

export async function getUserProfile(id: Types.Id): Promise<Types.UserProfile | null> { 
    return await Model.findUserProfile(id);
}
