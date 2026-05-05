import { ActionFunctionArgs, redirect, useActionData } from "react-router-dom";
import { ENV } from "../config/env";
import { FormCard, FormField } from "../components/FormCard";

export async function createRecipeAction({ request }: ActionFunctionArgs) {
    if (request.method !== "POST") return null;

    const formData = await request.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const instructions = formData.get("instructions") as string;

    const response = await fetch(`${ENV.BACKEND_API_URL}/recipes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, instructions }),
    });

    if (!response.ok) {
        const data = await response.json();
        return data;
    }

    return redirect("/recipes");
}

export function CreateRecipePage() {
    const actionData = useActionData() as any;

    return (
        <div>
            <FormCard 
                title="Create Recipe" 
                submitionError={actionData?.error?.message}
            >
                <FormField type="text" name="title" placeholder="Recipe Title" required />
                <textarea name="description" placeholder="Description" required style={{ width: '100%', marginBottom: '10px' }}></textarea>
                <textarea name="instructions" placeholder="Instructions" required style={{ width: '100%', marginBottom: '10px' }}></textarea>
            </FormCard>
            <a href="/recipes">Back to Recipes</a>
        </div>
    );
}
