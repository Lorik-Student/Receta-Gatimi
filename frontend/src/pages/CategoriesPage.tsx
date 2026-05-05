import { useLoaderData } from "react-router-dom";
import { ENV } from "../config/env";

export async function categoriesLoader() {
    const response = await fetch(`${ENV.BACKEND_API_URL}/categories`);
    if (!response.ok) throw new Error("Failed to load categories");
    return response.json();
}

export function CategoriesPage() {
    const categories = useLoaderData() as any[];

    return (
        <div>
            <h1>Categories</h1>
            <ul>
                {categories.map((cat: any) => (
                    <li key={cat.id}>
                        <strong>{cat.name}</strong>
                        <p>{cat.description}</p>
                    </li>
                ))}
            </ul>
            <a href="/">Back Home</a>
        </div>
    );
}
