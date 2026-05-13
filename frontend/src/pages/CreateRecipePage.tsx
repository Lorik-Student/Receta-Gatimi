import React, { useState, FormEvent, useEffect } from "react";
import { redirect, useLoaderData, useNavigate } from "react-router-dom";
import { apiFetch } from "../api";
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export async function createRecipeLoader() {
    const response = await apiFetch("/categories");
    if (!response.ok) throw new Error("Kategoritë nuk mund të ngarkoheshin");

    if (Array.isArray(response)) {
        return response;
    }

    const data = (response as any).data;
    if (Array.isArray(data)) {
        return data;
    }

    return Object.values(response as any).filter(
        (value) => typeof value === "object" && value !== null && "id" in (value as Record<string, unknown>)
    );
}

interface Ingredient {
    id: string;
    emertimi: string;
    sasia: string;
    njesia: string;
}

interface Step {
    id: string;
    hapi_nr: number;
    pershkrimi: string;
}

export function CreateRecipePage() {
    const categories = useLoaderData() as any[];
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [prepTime, setPrepTime] = useState("15");
    const [cookTime, setCookTime] = useState("30");
    const [portions, setPortions] = useState("4");
    const [difficulty, setDifficulty] = useState("Mesatare");
    const [categoryId, setCategoryId] = useState<string>("");

    useEffect(() => {
        if (categories && categories.length > 0 && categories[0].id != null) {
            setCategoryId(String(categories[0].id));
        }
    }, [categories]);

    const [ingredients, setIngredients] = useState<Ingredient[]>([
        { id: "1", emertimi: "", sasia: "", njesia: "gr" }
    ]);

    const [steps, setSteps] = useState<Step[]>([
        { id: "1", hapi_nr: 1, pershkrimi: "" }
    ]);

    const [tagInput, setTagInput] = useState("");
    const [tags, setTags] = useState<string[]>([]);

    const addIngredient = () => {
        const newId = String(Math.max(...ingredients.map(i => parseInt(i.id)), 0) + 1);
        setIngredients([...ingredients, { id: newId, emertimi: "", sasia: "", njesia: "gr" }]);
    };

    const removeIngredient = (id: string) => {
        if (ingredients.length > 1) {
            setIngredients(ingredients.filter(i => i.id !== id));
        }
    };

    const updateIngredient = (id: string, field: keyof Ingredient, value: string) => {
        setIngredients(ingredients.map(i => i.id === id ? { ...i, [field]: value } : i));
    };

    const addStep = () => {
        const newId = String(Math.max(...steps.map(s => parseInt(s.id)), 0) + 1);
        const newHapiNr = Math.max(...steps.map(s => s.hapi_nr), 0) + 1;
        setSteps([...steps, { id: newId, hapi_nr: newHapiNr, pershkrimi: "" }]);
    };

    const removeStep = (id: string) => {
        if (steps.length > 1) {
            setSteps(steps.filter(s => s.id !== id));
        }
    };

    const updateStep = (id: string, pershkrimi: string) => {
        setSteps(steps.map(s => s.id === id ? { ...s, pershkrimi } : s));
    };

    const addTag = () => {
        const trimmedTag = tagInput.trim().toLowerCase();
        if (trimmedTag && !tags.includes(trimmedTag)) {
            setTags([...tags, trimmedTag]);
            setTagInput("");
        }
    };

    const removeTag = (tag: string) => {
        setTags(tags.filter(t => t !== tag));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        // Validate required fields
        if (!title.trim() || !description.trim() || ingredients.some(i => !i.emertimi.trim()) || steps.some(s => !s.pershkrimi.trim())) {
            alert("Ploteso të gjitha fushat e kërkuara");
            return;
        }

        const payload = {
            titulli: title,
            pershkrimi: description,
            koha_pergatitjes: Number(prepTime),
            koha_gatimit: Number(cookTime),
            porcione: Number(portions),
            veshtiresija: difficulty,
            imazhi: imageUrl || "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=80",
            category_id: categoryId ? Number(categoryId) : null,
            ingredients: ingredients.map(i => ({
                emertimi: i.emertimi,
                sasia: Number(i.sasia) || 1,
                njesia: i.njesia
            })),
            steps: steps.map((s, idx) => ({
                hapi_nr: idx + 1,
                pershkrimi: s.pershkrimi
            })),
            tags: tags
        };

        const res = await apiFetch("/recipes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            navigate("/recipes");
        } else {
            alert("Dështoi krijimi i recetës: " + (res as any).error?.message);
        }
    };

    return (
        <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
            <Header brand="Receta Gatimi" activePath="/recipes/create" />
            <main className="flex-1 max-w-3xl mx-auto px-margin-desktop py-12 w-full">
                <div className="text-center mb-10">
                    <h1 className="font-display-lg text-on-surface">Krijo recetë të re</h1>
                    <p className="font-body-lg text-on-surface-variant mt-2">Ndaje kryeveprën tënde të gatimit me të tjerët.</p>
                </div>

                <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant/30 p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* Basic Information */}
                        <div className="space-y-4">
                            <h3 className="font-headline-sm border-b border-outline-variant/30 pb-2">Informacion bazë</h3>
                            <div>
                                <label className="block font-label-md text-on-surface mb-2">Titulli i recetës *</label>
                                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full bg-surface-variant/20 border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="P.sh., Picë shtëpie speciale"/>
                            </div>
                            <div>
                                <label className="block font-label-md text-on-surface mb-2">Përshkrimi *</label>
                                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} required className="w-full bg-surface-variant/20 border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="Përshkrim i shkurtër i recetës"></textarea>
                            </div>
                            <div>
                                <label className="block font-label-md text-on-surface mb-2">URL e imazhit</label>
                                <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="w-full bg-surface-variant/20 border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="https://..."/>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-4 pt-4">
                            <h3 className="font-headline-sm border-b border-outline-variant/30 pb-2">Detaje</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block font-label-sm text-on-surface-variant mb-1">Koha e përgatitjes (min)</label>
                                    <input type="number" value={prepTime} onChange={(e) => setPrepTime(e.target.value)} className="w-full bg-surface-variant/20 border border-outline-variant/50 rounded-xl px-3 py-2"/>
                                </div>
                                <div>
                                    <label className="block font-label-sm text-on-surface-variant mb-1">Koha e gatimit (min)</label>
                                    <input type="number" value={cookTime} onChange={(e) => setCookTime(e.target.value)} className="w-full bg-surface-variant/20 border border-outline-variant/50 rounded-xl px-3 py-2"/>
                                </div>
                                <div>
                                    <label className="block font-label-sm text-on-surface-variant mb-1">Porcione</label>
                                    <input type="number" value={portions} onChange={(e) => setPortions(e.target.value)} className="w-full bg-surface-variant/20 border border-outline-variant/50 rounded-xl px-3 py-2"/>
                                </div>
                                <div>
                                    <label className="block font-label-sm text-on-surface-variant mb-1">Vështirësia</label>
                                    <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full bg-surface-variant/20 border border-outline-variant/50 rounded-xl px-3 py-2">
                                        <option value="Lehte">Lehtë</option>
                                        <option value="Mesatare">Mesatare</option>
                                        <option value="Veshtire">Vështirë</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Category */}
                        <div className="space-y-4 pt-4">
                            <h3 className="font-headline-sm border-b border-outline-variant/30 pb-2">Kategori</h3>
                            <div>
                                <label className="block font-label-md text-on-surface mb-2">Zgjidh kategorinë *</label>
                                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required className="w-full bg-surface-variant/20 border border-outline-variant/50 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary">
                                    <option value="">-- Zgjidh kategorinë --</option>
                                    {categories && categories.map((cat: any) => (
                                        <option key={cat.id} value={cat.id}>{cat.emertimi || cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Ingredients */}
                        <div className="space-y-4 pt-4">
                            <div className="flex justify-between items-center border-b border-outline-variant/30 pb-2">
                                <h3 className="font-headline-sm">Përbërësit *</h3>
                                <button type="button" onClick={addIngredient} className="text-primary hover:text-primary/80 font-label-sm flex items-center gap-1 transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">add</span>
                                    Shto përbërës
                                </button>
                            </div>
                            <div className="space-y-3">
                                {ingredients.map((ing) => (
                                    <div key={ing.id} className="flex gap-3 items-end">
                                        <div className="flex-1">
                                            <input type="text" value={ing.emertimi} onChange={(e) => updateIngredient(ing.id, "emertimi", e.target.value)} placeholder="Emri i përbërësit" className="w-full bg-surface-variant/20 border border-outline-variant/50 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary"/>
                                        </div>
                                        <div className="w-24">
                                            <input type="text" value={ing.sasia} onChange={(e) => updateIngredient(ing.id, "sasia", e.target.value)} placeholder="Sasia" className="w-full bg-surface-variant/20 border border-outline-variant/50 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary"/>
                                        </div>
                                        <div className="w-24">
                                            <select value={ing.njesia} onChange={(e) => updateIngredient(ing.id, "njesia", e.target.value)} className="w-full bg-surface-variant/20 border border-outline-variant/50 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary">
                                                <option value="gr">gr</option>
                                                <option value="ml">ml</option>
                                                <option value="cope">cope</option>
                                                <option value="lugë">lugë</option>
                                                <option value="filxhan">filxhan</option>
                                            </select>
                                        </div>
                                        <button type="button" onClick={() => removeIngredient(ing.id)} className="text-error hover:text-error/80 transition-colors p-2">
                                            <span className="material-symbols-outlined">delete</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Steps */}
                        <div className="space-y-4 pt-4">
                            <div className="flex justify-between items-center border-b border-outline-variant/30 pb-2">
                                <h3 className="font-headline-sm">Udhëzimet *</h3>
                                <button type="button" onClick={addStep} className="text-primary hover:text-primary/80 font-label-sm flex items-center gap-1 transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">add</span>
                                    Shto hap
                                </button>
                            </div>
                            <div className="space-y-4">
                                {steps.map((step, idx) => (
                                    <div key={step.id} className="flex gap-3">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-label-md font-bold">
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1 flex gap-2 items-end">
                                            <textarea value={step.pershkrimi} onChange={(e) => updateStep(step.id, e.target.value)} placeholder="Përshkrim i hapit..." rows={2} className="w-full bg-surface-variant/20 border border-outline-variant/50 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none"></textarea>
                                            <button type="button" onClick={() => removeStep(step.id)} className="text-error hover:text-error/80 transition-colors p-2">
                                                <span className="material-symbols-outlined">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="space-y-4 pt-4">
                            <div className="border-b border-outline-variant/30 pb-2">
                                <h3 className="font-headline-sm">Etiketat (Tags)</h3>
                                <p className="text-on-surface-variant font-body-sm mt-1">Shto etiketat për të ndihmuar përdoruesit e tjerë të gjejnë recetën</p>
                            </div>
                            <div className="flex gap-2">
                                <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} placeholder="Shto etiketë dhe shtyp Enter..." className="flex-1 bg-surface-variant/20 border border-outline-variant/50 rounded-xl px-4 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"/>
                                <button type="button" onClick={addTag} className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl font-label-md transition-colors">
                                    <span className="material-symbols-outlined">add</span>
                                </button>
                            </div>
                            {tags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {tags.map((tag) => (
                                        <div key={tag} className="bg-primary/20 text-primary px-3 py-1 rounded-full font-label-sm flex items-center gap-2">
                                            {tag}
                                            <button type="button" onClick={() => removeTag(tag)} className="hover:text-primary/80 transition-colors">
                                                <span className="material-symbols-outlined text-[16px]">close</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="pt-6 border-t border-outline-variant/30 flex justify-end gap-4">
                            <button type="button" onClick={() => navigate("/recipes")} className="px-6 py-2 rounded-full font-label-md border border-outline-variant flex-1 md:flex-none hover:bg-surface-variant/20 transition-colors">Anulo</button>
                            <button type="submit" className="bg-primary hover:bg-primary/90 text-white px-8 py-2 rounded-full font-label-md shadow-md flex-1 md:flex-none transition-colors">Publiko recetën</button>
                        </div>
                    </form>
                </div>
            </main>
            <Footer />
        </div>
    );
}


