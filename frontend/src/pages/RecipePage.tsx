import { useLoaderData } from "react-router-dom";
import { ENV } from "../config/env";

export async function recipeLoader({ params }: any) {
    const response = await fetch(`${ENV.BACKEND_API_URL}/recipes/${params.id}`);
    if (!response.ok) throw new Error("Recipe not found");
    return response.json();
}

export function RecipePage() {
    const recipe = useLoaderData() as any;

    return (
        <div>
            <h1>{recipe.title}</h1>
            <p>{recipe.description}</p>
            <h2>Ingredients</h2>
            <ul>
                {recipe.ingredients?.map((ing: any, i: number) => (
                    <li key={i}>{ing}</li>
                ))}
            </ul>
            <h2>Instructions</h2>
            <p>{recipe.instructions}</p>
            <a href="/recipes">Back to Recipes</a>
        </div>
    );
}
