import React from "react";
import { ActionFunctionArgs, redirect, Form } from "react-router-dom";
import { apiFetch } from "../api";
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Recipes', to: '/recipes' },
  { label: 'Categories', to: '/categories' },
  { label: 'About Us', to: '/about' },
];

export async function createRecipeLoader() {
    const response = await apiFetch("/categories");
    if (!response.ok) throw new Error("Categories could not be loaded");
    return Array.isArray(response) ? response : (response as any).data;
}

export async function createRecipeAction({ request }: ActionFunctionArgs) {
    const formData = await request.formData();
    
    // Simplistic handling for demo purposes; real app would parse steps/ingredients carefully
    const payload = {
        titulli: formData.get("title"),
        pershkrimi: formData.get("description"),
        koha_pergatitjes: Number(formData.get("prepTime")),
        koha_gatimit: Number(formData.get("cookTime")),
        porcione: Number(formData.get("portions")),
        veshtiresija: formData.get("difficulty"),
        imazhi: formData.get("imageUrl"),
        category_id: Number(formData.get("category")),
        ingredients: [
            { emertimi: formData.get("ingredient1"), sasia: 1, njesia: "cope" }
        ],
        steps: [
            { hapi_nr: 1, pershkrimi: formData.get("step1") }
        ]
    };

    const res = await apiFetch("/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    if (res.ok) return redirect("/recipes");
    return { error: "Failed to create recipe" };
}

export function CreateRecipePage() {
    return (
        <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
            <Header brand="Receta Gatimi" navItems={navItems} />
            <main className="flex-1 max-w-3xl mx-auto px-margin-desktop py-12 w-full">
                <div className="text-center mb-10">
                    <h1 className="font-display-lg text-on-surface">Create New Recipe</h1>
                    <p className="font-body-lg text-on-surface-variant mt-2">Share your culinary masterpiece with the world.</p>
                </div>

                <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant/30 p-8">
                    <Form method="post" className="space-y-6">
                        
                        <div className="space-y-4">
                            <h3 className="font-headline-sm border-b border-outline-variant/30 pb-2">Basic Info</h3>
                            <div>
                                <label className="block font-label-md text-on-surface mb-2">Recipe Title</label>
                                <input type="text" name="title" required className="w-full bg-surface-variant/20 border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="E.g., Special Homemade Pizza"/>
                            </div>
                            <div>
                                <label className="block font-label-md text-on-surface mb-2">Description</label>
                                <textarea name="description" rows={3} required className="w-full bg-surface-variant/20 border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="Short description of the recipe"></textarea>
                            </div>
                            <div>
                                <label className="block font-label-md text-on-surface mb-2">Image URL</label>
                                <input type="url" name="imageUrl" className="w-full bg-surface-variant/20 border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="https://..."/>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4">
                            <h3 className="font-headline-sm border-b border-outline-variant/30 pb-2">Details</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block font-label-sm text-on-surface-variant mb-1">Prep Time (min)</label>
                                    <input type="number" name="prepTime" defaultValue="15" className="w-full bg-surface-variant/20 border border-outline-variant/50 rounded-xl px-3 py-2"/>
                                </div>
                                <div>
                                    <label className="block font-label-sm text-on-surface-variant mb-1">Cook Time (min)</label>
                                    <input type="number" name="cookTime" defaultValue="30" className="w-full bg-surface-variant/20 border border-outline-variant/50 rounded-xl px-3 py-2"/>
                                </div>
                                <div>
                                    <label className="block font-label-sm text-on-surface-variant mb-1">Portions</label>
                                    <input type="number" name="portions" defaultValue="4" className="w-full bg-surface-variant/20 border border-outline-variant/50 rounded-xl px-3 py-2"/>
                                </div>
                                <div>
                                    <label className="block font-label-sm text-on-surface-variant mb-1">Difficulty</label>
                                    <select name="difficulty" className="w-full bg-surface-variant/20 border border-outline-variant/50 rounded-xl px-3 py-2">
                                        <option value="Hellye">Lehte</option>
                                        <option value="Medium">Normal</option>
                                        <option value="Hard">Veshtire</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-outline-variant/30 flex justify-end gap-4">
                            <button type="button" className="px-6 py-2 rounded-full font-label-md border border-outline-variant flex-1 md:flex-none">Cancel</button>
                            <button type="submit" className="bg-primary hover:bg-primary/90 text-white px-8 py-2 rounded-full font-label-md shadow-md flex-1 md:flex-none transition-colors">Publish Recipe</button>
                        </div>
                    </Form>
                </div>
            </main>
            <Footer />
        </div>
    );
}


