import { ActionFunctionArgs, redirect, useActionData, Link, useLoaderData, useSubmit } from "react-router-dom";
import { useState } from "react";
import { apiFetch } from "../api";
import { FormCard, FormField } from "../components/FormCard";

export async function createRecipeLoader() {
    const categoriesResult = await apiFetch("/categories");
    // Return empty array if fails so the page still loads
    const categories = categoriesResult.ok ? (categoriesResult as any).data || categoriesResult : [];
    
    return {
        categories: Array.isArray(categories) ? categories : Object.values(categories).filter(c => typeof c === 'object' && c !== null)
    };
}

export async function createRecipeAction({ request }: ActionFunctionArgs) {
    if (request.method !== "POST") return null;

    const formData = await request.formData();
    const payloadString = formData.get("payload") as string;
    
    if (!payloadString) return { error: { message: "Invalid payload" } };

    const payload = JSON.parse(payloadString);

    const result = await apiFetch("/recipes", {
        method: "POST",
        body: JSON.stringify(payload),
    });

    if (!result.ok) {
        return result;
    }

    return redirect(`/recipes`);
}

export function CreateRecipePage() {
    const actionData = useActionData() as any;
    const loaderData = useLoaderData() as any;
    const submit = useSubmit();

    const [formState, setFormState] = useState({
        titulli: "",
        pershkrimi: "",
        koha_pergatitjes: 15,
        koha_gatimit: 30,
        porcione: 4,
        veshtiresija: "Mesatare",
        imazhi: "",
        category_id: loaderData?.categories?.[0]?.id || 1,
        // We set user_id to 1 automatically as needed
        user_id: 1
    });

    const [steps, setSteps] = useState([{ hapi_nr: 1, pershkrimi: "" }]);
    const [ingredients, setIngredients] = useState([{ emertimi: "", sasia: 1, njesia: "copë" }]);

    const handleAddStep = () => {
        setSteps([...steps, { hapi_nr: steps.length + 1, pershkrimi: "" }]);
    };

    const handleStepChange = (index: number, value: string) => {
        const newSteps = [...steps];
        newSteps[index].pershkrimi = value;
        setSteps(newSteps);
    };

    const handleRemoveStep = (index: number) => {
        const newSteps = steps.filter((_, i) => i !== index).map((s, i) => ({ ...s, hapi_nr: i + 1 }));
        setSteps(newSteps);
    };

    const handleAddIngredient = () => {
        setIngredients([...ingredients, { emertimi: "", sasia: 1, njesia: "copë" }]);
    };

    const handleIngredientChange = (index: number, field: string, value: any) => {
        const newIngs = [...ingredients] as any;
        newIngs[index][field] = field === "sasia" ? Number(value) : value;
        setIngredients(newIngs);
    };

    const handleRemoveIngredient = (index: number) => {
        const newIngs = ingredients.filter((_, i) => i !== index);
        setIngredients(newIngs);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Remove empty steps/ingredients to pass backend validation properly
        const finalSteps = steps.filter(s => s.pershkrimi.trim().length > 0);
        const finalIngredients = ingredients.filter(i => i.sasia > 0 && i.emertimi.trim().length > 0);

        if (finalSteps.length === 0) {
            alert("Shtoni të paktën një hap për recetën!");
            return;
        }

        if (finalIngredients.length === 0) {
            alert("Shtoni të paktën një përbërës për recetën!");
            return;
        }

        const payload = {
            ...formState,
            imazhi: formState.imazhi || undefined, // Drop if empty string
            steps: finalSteps,
            ingredients: finalIngredients,
            tags: []
        };

        const formData = new FormData();
        formData.append("payload", JSON.stringify(payload));
        
        submit(formData, { method: "POST" });
    };

    return (
        <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto", paddingBottom: "100px" }}>
            <Link to="/recipes" style={{ display: "inline-block", marginBottom: "20px", textDecoration: "none", color: "#007BFF" }}>
                &larr; Back to Recipes
            </Link>
            
            <div style={{ backgroundColor: "#fff", padding: "30px", borderRadius: "8px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
                <h1 style={{ marginTop: 0 }}>Krijo Recetë (Create Recipe)</h1>
                
                {actionData?.error && (
                    <div style={{ padding: "10px", backgroundColor: "#ffebee", color: "red", borderRadius: "5px", marginBottom: "20px" }}>
                        Error: {actionData.error.message || actionData.error.code}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                    <div>
                        <label>Titulli (Title):</label>
                        <input type="text" value={formState.titulli} onChange={e => setFormState({...formState, titulli: e.target.value})} required style={{ width: '100%', padding: '10px', marginTop: '5px' }} />
                    </div>

                    <div>
                        <label>Përshkrimi (Description):</label>
                        <textarea value={formState.pershkrimi} onChange={e => setFormState({...formState, pershkrimi: e.target.value})} required rows={3} style={{ width: '100%', padding: '10px', marginTop: '5px' }}></textarea>
                    </div>

                    <div>
                        <label>Linku i Imazhit (Image URL - Opsionale):</label>
                        <input type="url" value={formState.imazhi} onChange={e => setFormState({...formState, imazhi: e.target.value})} placeholder="https://..." style={{ width: '100%', padding: '10px', marginTop: '5px' }} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div>
                            <label>Koha e Përgatitjes (Prep Time - min):</label>
                            <input type="number" min="0" value={formState.koha_pergatitjes} onChange={e => setFormState({...formState, koha_pergatitjes: Number(e.target.value)})} required style={{ width: '100%', padding: '10px', marginTop: '5px' }} />
                        </div>
                        <div>
                            <label>Koha e Gatimit (Cook Time - min):</label>
                            <input type="number" min="0" value={formState.koha_gatimit} onChange={e => setFormState({...formState, koha_gatimit: Number(e.target.value)})} required style={{ width: '100%', padding: '10px', marginTop: '5px' }} />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                        <div>
                            <label>Porcione (Portions):</label>
                            <input type="number" min="1" value={formState.porcione} onChange={e => setFormState({...formState, porcione: Number(e.target.value)})} required style={{ width: '100%', padding: '10px', marginTop: '5px' }} />
                        </div>
                        <div>
                            <label>Vështirësia (Difficulty):</label>
                            <select value={formState.veshtiresija} onChange={e => setFormState({...formState, veshtiresija: e.target.value})} style={{ width: '100%', padding: '10px', marginTop: '5px' }}>
                                <option value="Lehte">Lehtë</option>
                                <option value="Mesatare">Mesatare</option>
                                <option value="Veshtire">Vështirë</option>
                            </select>
                        </div>
                        <div>
                            <label>Kategoria (Category):</label>
                            <select value={formState.category_id} onChange={e => setFormState({...formState, category_id: Number(e.target.value)})} required style={{ width: '100%', padding: '10px', marginTop: '5px' }}>
                                {loaderData?.categories?.map((cat: any) => (
                                    <option key={cat.id} value={cat.id}>{cat.emertimi}</option>
                                )) || <option value="1">Kategori 1</option>}
                            </select>
                        </div>
                    </div>

                    <hr style={{ margin: "20px 0" }} />

                    {/* INGREDIENTS SECTION */}
                    <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <h3>Përbërësit (Ingredients)</h3>
                            <button type="button" onClick={handleAddIngredient} style={{ padding: "5px 10px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>+ Shto Përbërës</button>
                        </div>
                        
                        {ingredients.map((ing, index) => (
                            <div key={index} style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "10px", padding: "10px", backgroundColor: "#f9f9f9", borderRadius: "5px" }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: "12px" }}>Emri i Përbërësit (Ingredient Name):</label>
                                    <input type="text" value={ing.emertimi} onChange={e => handleIngredientChange(index, "emertimi", e.target.value)} placeholder="psh. gjoks pule, kripë" required style={{ width: '100%', padding: '8px' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: "12px" }}>Sasia (Amount):</label>
                                    <input type="number" min="0.1" step="0.1" value={ing.sasia} onChange={e => handleIngredientChange(index, "sasia", e.target.value)} required style={{ width: '100%', padding: '8px' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: "12px" }}>Njësia (Unit):</label>
                                    <input type="text" value={ing.njesia} onChange={e => handleIngredientChange(index, "njesia", e.target.value)} placeholder="psh. lugë, copë, kg" required style={{ width: '100%', padding: '8px' }} />
                                </div>
                                {ingredients.length > 1 && (
                                    <button type="button" onClick={() => handleRemoveIngredient(index)} style={{ padding: "8px 12px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", marginTop: "18px" }}>X</button>
                                )}
                            </div>
                        ))}
                    </div>

                    <hr style={{ margin: "20px 0" }} />

                    {/* STEPS SECTION */}
                    <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <h3>Udhëzimet (Steps)</h3>
                            <button type="button" onClick={handleAddStep} style={{ padding: "5px 10px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>+ Shto Hap</button>
                        </div>
                        
                        {steps.map((step, index) => (
                            <div key={index} style={{ display: "flex", gap: "10px", alignItems: "flex-start", marginBottom: "10px" }}>
                                <span style={{ padding: "10px", backgroundColor: "#007BFF", color: "white", borderRadius: "50%", minWidth: "30px", textAlign: "center" }}>{step.hapi_nr}</span>
                                <textarea value={step.pershkrimi} onChange={e => handleStepChange(index, e.target.value)} placeholder={`Përshkruani hapin ${step.hapi_nr}...`} required rows={2} style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}></textarea>
                                {steps.length > 1 && (
                                    <button type="button" onClick={() => handleRemoveStep(index)} style={{ padding: "10px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>X</button>
                                )}
                            </div>
                        ))}
                    </div>

                    <button type="submit" style={{ padding: "15px", backgroundColor: "#007BFF", color: "white", border: "none", borderRadius: "5px", fontSize: "16px", fontWeight: "bold", cursor: "pointer", marginTop: "20px" }}>
                        Krijo Recetën
                    </button>
                </form>
            </div>
        </div>
    );
}
