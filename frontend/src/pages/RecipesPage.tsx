import { useLoaderData } from "react-router-dom";
import { ENV } from "../config/env";

export async function recipesLoader() {
    const response = await fetch(`${ENV.BACKEND_API_URL}/recipes`);
    if (!response.ok) throw new Error("Failed to load recipes");
    return response.json();
}

export function RecipesPage() {
    const recipes = useLoaderData() as any[];

    return (
        <div>
            <h1>Recipes</h1>
            <a href="/recipes/create">Create New Recipe</a>
            <ul>
                {recipes.map((recipe: any) => (
                    <li key={recipe.id}>
                        <a href={`/recipes/${recipe.id}`}>{recipe.title}</a>
                        <p>{recipe.description}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}
