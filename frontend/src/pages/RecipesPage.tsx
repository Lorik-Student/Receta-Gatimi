import { useLoaderData, Link } from "react-router-dom";
import { apiFetch } from "../api";

export async function recipesLoader() {
    const result = await apiFetch("/recipes");
    if (!result.ok) {
        const message = "error" in result ? result.error.message : "Failed to load recipes";
        throw new Error(message);
    }
    return result;
}

export function RecipesPage() {
    const data = useLoaderData() as any;
    const recipes = Array.isArray(data) ? data : (data.data || Object.values(data).filter(v => typeof v === 'object' && v !== null && 'id' in v));

    return (
        <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h1>Recetat (Recipes)</h1>
                <Link to="/recipes/create" style={{ padding: "10px 15px", backgroundColor: "#007BFF", color: "white", textDecoration: "none", borderRadius: "5px" }}>
                    Create New Recipe
                </Link>
            </div>
            
            {recipes.length === 0 ? (
                <p>Nuk ka asnjë recetë të krijuar akoma. (No recipes created yet.)</p>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
                    {recipes.map((recipe: any) => (
                        <div key={recipe.id} style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "15px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
                            <h2 style={{ marginTop: 0, marginBottom: "10px" }}>
                                <Link to={`/recipes/${recipe.id}`} style={{ textDecoration: "none", color: "#333" }}>
                                    {recipe.titulli || recipe.title || "Untitled Recipe"}
                                </Link>
                            </h2>
                            <p style={{ color: "#666", fontSize: "14px", marginBottom: "15px" }}>
                                {recipe.pershkrimi || recipe.description || "Nuk ka përshkrim..."}
                            </p>
                            <Link to={`/recipes/${recipe.id}`} style={{ color: "#007BFF", fontWeight: "bold", textDecoration: "none" }}>
                                View Details &rarr;
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
