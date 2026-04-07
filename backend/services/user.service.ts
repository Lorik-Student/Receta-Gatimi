async function getAllUserProfiles(): Promise<Models.UserProfile[]> {
    return await Models.findAllUserProfiles();
}

async function getUserProfileById(id: Models.Id): Promise<Models.User | null> { 
    return await Models.findUserById(id);
}
