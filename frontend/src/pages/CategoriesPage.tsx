import { useLoaderData, Link } from "react-router-dom";
import { apiFetch } from "../api";

export async function categoriesLoader() {
    const result = await apiFetch("/categories");
    if (!result.ok) {
        const message = "error" in result ? result.error.message : "Failed to load categories";
        throw new Error(message);
    }
    return result;
}

export function CategoriesPage() {
    const data = useLoaderData() as any;
    const categories = Array.isArray(data) ? data : (data.data || Object.values(data).filter(v => typeof v === 'object' && v !== null && 'id' in v));

    return (
        <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h1>Kategoritë (Categories)</h1>
                <Link to="/" style={{ padding: "10px 15px", backgroundColor: "#6c757d", color: "white", textDecoration: "none", borderRadius: "5px" }}>
                    Back Home
                </Link>
            </div>

            {categories.length === 0 ? (
                <p>Nuk ka asnjë kategori. (No categories found.)</p>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "20px" }}>
                    {categories.map((cat: any) => (
                        <div key={cat.id} style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "20px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)", backgroundColor: "#fff" }}>
                            <h2 style={{ marginTop: 0, marginBottom: "10px", color: "#333", fontSize: "1.5rem" }}>
                                {cat.emertimi || cat.name || "Kategori e panjohur"}
                            </h2>
                            <p style={{ color: "#666", fontSize: "14px", lineHeight: "1.5" }}>
                                {cat.pershkrimi || cat.description || "Nuk ka përshkrim për këtë kategori."}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
