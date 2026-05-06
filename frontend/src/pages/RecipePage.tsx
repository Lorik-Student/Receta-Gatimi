import { useLoaderData, Link } from "react-router-dom";
import { apiFetch } from "../api";

export async function recipeLoader({ params }: any) {
    const result = await apiFetch(`/recipes/${params.id}`);
    if (!result.ok) throw new Error("Recipe not found");
    return result;
}

export function RecipePage() {
    const rawData = useLoaderData() as any;
    const recipe = rawData.data || rawData; // Support both flat return and wrapped response

    return (
        <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto", backgroundColor: "#fff", borderRadius: "8px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", marginTop: "20px" }}>
            <Link to="/recipes" style={{ color: "#007BFF", textDecoration: "none", marginBottom: "20px", display: "inline-block" }}>
                &larr; Back to Recipes
            </Link>
            
            <h1 style={{ marginTop: 0 }}>{recipe.titulli || recipe.title || "Untitled Recipe"}</h1>
            <p style={{ fontSize: "16px", color: "#555", lineHeight: "1.6" }}>
                {recipe.pershkrimi || recipe.description}
            </p>
            
            <div style={{ display: "flex", gap: "20px", marginTop: "20px", marginBottom: "20px", backgroundColor: "#f8f9fa", padding: "15px", borderRadius: "6px" }}>
                <div><strong>Koha e përgatitjes:</strong> {recipe.koha_pergatitjes || 0} min</div>
                <div><strong>Koha e gatimit:</strong> {recipe.koha_gatimit || 0} min</div>
                <div><strong>Porcione:</strong> {recipe.porcione || 0}</div>
                <div><strong>Vështirësia:</strong> {recipe.veshtiresija || "N/A"}</div>
            </div>

            <h2>Ingredients (Përbërësit)</h2>
            <ul style={{ lineHeight: "1.8" }}>
                {recipe.ingredients && recipe.ingredients.length > 0 ? (
                    recipe.ingredients.map((ing: any, i: number) => (
                        <li key={ing.id || i}>
                            {ing.sasia} {ing.njesia} (ID përbërësi: {ing.ingredient_id})
                        </li>
                    ))
                ) : (
                    <li>Nuk ka përbërës të listuar.</li>
                )}
            </ul>

            <h2>Instructions (Udhëzimet)</h2>
            <ol style={{ lineHeight: "1.8" }}>
                {recipe.steps && recipe.steps.length > 0 ? (
                    recipe.steps.sort((a:any, b:any) => a.hapi_nr - b.hapi_nr).map((step: any, i: number) => (
                        <li key={step.id || i}>{step.pershkrimi}</li>
                    ))
                ) : (
                    <li>{recipe.instructions || "Nuk ka udhëzime të listuara."}</li>
                )}
            </ol>
        </div>
    );
}
