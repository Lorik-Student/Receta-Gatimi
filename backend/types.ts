interface SignUpData {                  
    emri: string;                 
    mbiemri: string;                 
    email: string;
    password: string;             
    phone_number?: string | null;   
}

interface LoginData { 
    email: string;
    password: string;
}


type Id = number & { __brand: "Id"};

interface UserProfile { 
    id: Id;                 
    emri: string;                 
    mbiemri: string;                 
    email: string;                 
    phone_number?: string | null;   
}



export type { SignUpData, UserProfile, Id, LoginData, Role };