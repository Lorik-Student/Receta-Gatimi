import * as Model from "./user.model.js";
import * as Types from "../../common/types/index.js";

export async function getAllUserProfiles(): Promise<Types.UserProfile[]> {
    return await Model.findAllUserProfiles();
}

export async function getUserProfile(id: Types.Id): Promise<Types.UserProfile | null> { 
    return await Model.findUserProfile(id);
}
