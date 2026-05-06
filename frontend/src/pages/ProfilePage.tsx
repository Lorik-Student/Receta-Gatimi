import { apiFetch } from "../api";
import { useLoaderData, Link } from "react-router-dom";

export interface UserProfile {
    id: number;
    emri: string;
    mbiemri: string;
    email: string;
    roles: string[];
    phone_number?: string | null;
}

export async function profileLoader() { 
    const result = await apiFetch("/users/me/profile");
    if (!result.response.ok) { 
        throw new Error(result.error?.message || "Failed to load profile");
    }
    return result;
}

export function ProfilePage() {
    const data = useLoaderData() as any;
    const user = data.user;

    if (!user) {
        return <div>Llogaria nuk u gjet. Ju lutem <Link to="/login">Kycuni</Link> perseri.</div>;
    }

    return (
        <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
            <h1>Profili Im</h1>
            <div className="card" style={{ border: "1px solid #ccc", padding: "20px", borderRadius: "8px" }}>
                <p><strong>Emri:</strong> {user.emri}</p>
                <p><strong>Mbiemri:</strong> {user.mbiemri}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Roli(et):</strong> {user.roles?.join(", ") || "User"}</p>
                {user.phone_number && <p><strong>Telefoni:</strong> {user.phone_number}</p>}
                
            </div>
            
            <div style={{ marginTop: "20px" }}>
                <button 
                    onClick={() => {
                        localStorage.removeItem("accessToken");
                        localStorage.removeItem("refreshToken");
                        window.location.href = "/login";
                    }}
                    style={{ padding: "10px 15px", backgroundColor: "red", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
                >
                    Dil (Logout)
                </button>
            </div>
        </div>
    );
}