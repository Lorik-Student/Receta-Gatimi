import { useLoaderData } from "react-router-dom";
import { apiFetch } from "../api";

export async function categoriesLoader() {
    const result = await apiFetch("/categories");
    if (!result.response.ok) throw new Error("Failed to load categories");
    return result;
}

export function CategoriesPage() {
    const data = useLoaderData() as any;
    const categories = Array.isArray(data) ? data : (data.data || Object.values(data).filter(v => typeof v === 'object' && v !== null && 'id' in v));

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
