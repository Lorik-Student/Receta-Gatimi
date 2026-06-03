import React, { useEffect, useMemo, useState } from "react";
import { Link, useLoaderData } from "react-router-dom";
import { apiFetch } from "../api";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

interface ShoppingListItem {
  id: number;
  shopping_list_id: number;
  ingredient_id: number;
  sasia: string;
  eshte_blere: boolean;
  ingredient_emertimi: string;
  ingredient_njesia_matese?: string | null;
}

interface ShoppingListData {
  id: number;
  user_id: number;
  emertimi: string;
  data_krijimit: string;
  items: ShoppingListItem[];
}

interface LoaderData {
  shoppingList?: ShoppingListData;
}

export async function shoppingListLoader() {
  return apiFetch("/shopping-lists/current");
}

export function ShoppingListPage() {
  const data = useLoaderData() as LoaderData;
  const initialList = data?.shoppingList;
  const [shoppingList, setShoppingList] = useState<ShoppingListData | undefined>(initialList);
  const [loading, setLoading] = useState(false);
  const [pageMessage, setPageMessage] = useState("");
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    setShoppingList(initialList);
  }, [initialList?.id]);

  const items = useMemo(() => shoppingList?.items || [], [shoppingList]);

  async function toggleBought(item: ShoppingListItem, nextValue: boolean) {
    if (!shoppingList) {
      return;
    }

    setLoading(true);
    setPageMessage("");
    setPageError("");

    try {
      const response = await apiFetch(`/shopping-lists/${shoppingList.id}/items/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({ amount: item.sasia, isBought: nextValue })
      });

      if (!response.ok) {
        throw new Error("Failed to update shopping list item");
      }

      setShoppingList((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          items: current.items.map((entry) => (entry.id === item.id ? { ...entry, eshte_blere: nextValue } : entry))
        };
      });
    } catch (error) {
      console.error("Failed to update shopping item:", error);
      setPageError("Përditësimi i artikullit dështoi.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteItem(item: ShoppingListItem) {
    if (!shoppingList) {
      return;
    }

    const confirmed = window.confirm(`Ta fshijmë "${item.ingredient_emertimi}" nga lista e blerjeve?`);
    if (!confirmed) {
      return;
    }

    setLoading(true);
    setPageMessage("");
    setPageError("");

    try {
      const response = await apiFetch(`/shopping-lists/${shoppingList.id}/items/${item.id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("Failed to delete shopping list item");
      }

      setShoppingList((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          items: current.items.filter((entry) => entry.id !== item.id)
        };
      });
    } catch (error) {
      console.error("Failed to delete shopping item:", error);
      setPageError("Fshirja e artikullit dështoi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
      <Header brand="Receta Gatimi" activePath="/profile" />
      <main className="flex-1 max-w-6xl mx-auto px-margin-desktop py-12 w-full">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between border-b border-outline-variant/30 pb-6">
          <div>
            <h1 className="font-display-lg text-on-surface mb-2">Lista e blerjeve</h1>
            <p className="font-body-lg text-on-surface-variant">Përbërësit e dërguar nga recetat mblidhen këtu dhe mund t'i shënosh si të blerë.</p>
          </div>
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 rounded-full border border-outline-variant/30 bg-surface px-4 py-2 font-label-md text-on-surface transition-colors hover:bg-surface-variant/20"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Kthehu te profili
          </Link>
        </div>

        {pageMessage && <p className="mb-4 rounded-2xl bg-primary/10 px-4 py-3 text-sm text-primary">{pageMessage}</p>}
        {pageError && <p className="mb-4 rounded-2xl bg-error/10 px-4 py-3 text-sm text-error">{pageError}</p>}

        <section className="rounded-3xl border border-outline-variant/30 bg-surface p-6 shadow-sm">
          <div className="flex flex-col gap-2 border-b border-outline-variant/20 pb-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="font-headline-md text-on-surface">{shoppingList?.emertimi || "Lista e blerjeve"}</h2>
              <p className="text-sm text-on-surface-variant">{items.length} artikuj</p>
            </div>
            <p className="text-sm text-on-surface-variant">{loading ? "Duke përditësuar..." : "Kliko kutinë për ta shënuar si të blerë."}</p>
          </div>

          {items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-outline-variant/40 bg-surface-variant/10 px-5 py-8 text-sm text-on-surface-variant mt-6">
              Lista është ende bosh. Nga faqja e recetës mund të dërgosh përbërësit këtu.
            </div>
          ) : (
            <ul className="mt-6 space-y-3">
              {items.map((item) => (
                <li
                  key={item.id}
                  className={`flex items-center gap-4 rounded-2xl border px-4 py-4 transition-colors ${item.eshte_blere ? "border-outline-variant/20 bg-surface-variant/10 opacity-65" : "border-outline-variant/30 bg-background"}`}
                >
                  <label className="flex min-w-0 items-center gap-3">
                    <input
                      type="checkbox"
                      checked={item.eshte_blere}
                      onChange={(event) => void toggleBought(item, event.target.checked)}
                      className="h-5 w-5 shrink-0 rounded-md border-outline-variant text-primary accent-primary cursor-pointer shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                    />
                    <span className={`min-w-0 ${item.eshte_blere ? "line-through text-on-surface-variant" : "text-on-surface"}`}>
                      <span className="block font-medium">{item.ingredient_emertimi}</span>
                      <span className="block text-sm text-on-surface-variant">{item.sasia}</span>
                    </span>
                  </label>
                  {item.ingredient_njesia_matese && (
                    <span className="rounded-full bg-surface-variant/20 px-3 py-1 text-xs text-on-surface-variant">
                      {item.ingredient_njesia_matese}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => void deleteItem(item)}
                    disabled={loading}
                    className="ml-auto inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-error/20 bg-error/5 text-error transition-colors hover:bg-error/10 disabled:cursor-not-allowed disabled:opacity-60"
                    aria-label={`Fshi ${item.ingredient_emertimi}`}
                    title="Fshi artikullin"
                  >
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}