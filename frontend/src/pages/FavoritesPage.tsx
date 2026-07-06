import React, { useEffect, useState } from "react";
import { Link, redirect, useLoaderData, useNavigate } from "react-router-dom";
import { apiFetch } from "../api";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { resolveImageSrc } from "../utils/image";

interface FavoriteRecipe {
  favorite_id: number;
  recipe_id: number;
  titulli: string;
  imazhi?: string;
}

interface FavoriteCategory {
  id: number;
  emertimi: string;
  is_public: boolean;
  imazhi?: string;
  recipes: FavoriteRecipe[];
}

interface FavoritesPayload {
  favorites?: {
    categories?: FavoriteCategory[];
    uncategorized?: FavoriteRecipe[];
  };
}

export function favoritesLoader() {
  if (!localStorage.getItem("accessToken")) {
    throw redirect("/login");
  }

  return apiFetch("/users/me/profile");
}

export function FavoritesPage() {
  const data = useLoaderData() as any;
  const user = data.user;
  const navigate = useNavigate();
  const [categories, setCategories] = useState<FavoriteCategory[]>([]);
  const [uncategorized, setUncategorized] = useState<FavoriteRecipe[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryPublic, setNewCategoryPublic] = useState(false);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [favoritesError, setFavoritesError] = useState("");
  const [favoritesMessage, setFavoritesMessage] = useState("");

  function getCategoryThumbnail(category: FavoriteCategory) {
    return resolveImageSrc(category.imazhi || category.recipes?.[0]?.imazhi);
  }

  function openCategory(categoryId: number) {
    navigate(`/profile/favorites/${categoryId}`);
  }

  useEffect(() => {
    async function loadFavorites() {
      setFavoritesLoading(true);
      setFavoritesError("");

      try {
        const response = await apiFetch("/interactions/favorites");
        const payload = response as FavoritesPayload;
        const categoriesData = Array.isArray(payload?.favorites?.categories) ? payload.favorites?.categories : [];
        const uncategorizedData = Array.isArray(payload?.favorites?.uncategorized) ? payload.favorites?.uncategorized : [];

        setCategories(categoriesData as FavoriteCategory[]);
        setUncategorized(uncategorizedData as FavoriteRecipe[]);
      } catch (error) {
        console.error("Failed to load favorites:", error);
        setFavoritesError("Nuk u ngarkuan të preferuarat.");
      } finally {
        setFavoritesLoading(false);
      }
    }

    void loadFavorites();
  }, []);

  async function createCategory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = newCategoryName.trim();

    if (name.length < 2) {
      setFavoritesError("Emri i kategorisë duhet të ketë të paktën 2 karaktere.");
      return;
    }

    setFavoritesError("");
    setFavoritesMessage("");

    try {
      const response = await apiFetch("/interactions/favorites/categories", {
        method: "POST",
        body: JSON.stringify({ emertimi: name, is_public: newCategoryPublic })
      });

      if (!response.ok) {
        throw new Error("Failed to create category");
      }

      setNewCategoryName("");
      setNewCategoryPublic(false);
      setFavoritesMessage("Kategoria u krijua me sukses.");

      const refresh = await apiFetch("/interactions/favorites");
      const payload = refresh as FavoritesPayload;
      setCategories(Array.isArray(payload?.favorites?.categories) ? payload.favorites?.categories : []);
      setUncategorized(Array.isArray(payload?.favorites?.uncategorized) ? payload.favorites?.uncategorized : []);
    } catch (error) {
      console.error("Failed to create category:", error);
      setFavoritesError("Krijimi i kategorisë dështoi.");
    }
  }

  async function toggleCategoryVisibility(category: FavoriteCategory) {
    setFavoritesError("");
    setFavoritesMessage("");

    try {
      const response = await apiFetch(`/interactions/favorites/categories/${category.id}`, {
        method: "PATCH",
        body: JSON.stringify({ is_public: !category.is_public })
      });

      if (!response.ok) {
        throw new Error("Failed to update category");
      }

      setFavoritesMessage(`Kategoria "${category.emertimi}" tani është ${!category.is_public ? "publike" : "private"}.`);
      const refresh = await apiFetch("/interactions/favorites");
      const payload = refresh as FavoritesPayload;
      setCategories(Array.isArray(payload?.favorites?.categories) ? payload.favorites?.categories : []);
      setUncategorized(Array.isArray(payload?.favorites?.uncategorized) ? payload.favorites?.uncategorized : []);
    } catch (error) {
      console.error("Failed to toggle visibility:", error);
      setFavoritesError("Përditësimi i privatësisë dështoi.");
    }
  }

  async function removeCategory(category: FavoriteCategory) {
    if (!window.confirm(`Ta fshijmë kategorinë "${category.emertimi}"?`)) {
      return;
    }

    setFavoritesError("");
    setFavoritesMessage("");

    try {
      const response = await apiFetch(`/interactions/favorites/categories/${category.id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("Failed to delete category");
      }

      setFavoritesMessage("Kategoria u fshi.");
      const refresh = await apiFetch("/interactions/favorites");
      const payload = refresh as FavoritesPayload;
      setCategories(Array.isArray(payload?.favorites?.categories) ? payload.favorites?.categories : []);
      setUncategorized(Array.isArray(payload?.favorites?.uncategorized) ? payload.favorites?.uncategorized : []);
    } catch (error) {
      console.error("Failed to delete category:", error);
      setFavoritesError("Fshirja e kategorisë dështoi.");
    }
  }

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
      <Header brand="Receta Gatimi" activePath="/profile" />
      <main className="flex-1 max-w-6xl mx-auto px-margin-desktop py-16 w-full">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-10 border-b border-outline-variant/30 pb-6">
          <div>
            <h1 className="font-display-lg text-on-surface mb-2">Të preferuarat e tua</h1>
            <p className="font-body-lg text-on-surface-variant">Organizo recetat e ruajtura në kategori publike ose private.</p>
          </div>
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 rounded-full border border-outline-variant/30 bg-surface px-4 py-2 font-label-md text-on-surface transition-colors hover:bg-surface-variant/20"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Kthehu te profili
          </Link>
        </div>

        <div className="bg-surface rounded-3xl shadow-sm border border-outline-variant/30 p-6 md:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h2 className="font-headline-md text-on-surface">{user?.emri} {user?.mbiemri}</h2>
              <p className="text-sm text-on-surface-variant">Këtu i menaxhon të gjitha koleksionet e tua të preferuara.</p>
            </div>
            <Link
              to="/recipes/me"
              className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 font-label-md text-primary transition-colors hover:bg-primary/20"
            >
              <span className="material-symbols-outlined text-[18px]">restaurant_menu</span>
              Recetat e mia
            </Link>
          </div>

          <form onSubmit={createCategory} className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-end mb-5">
            <label className="flex flex-col gap-2 text-sm font-medium text-on-surface">
              Emri i kategorisë
              <input
                value={newCategoryName}
                onChange={(event) => setNewCategoryName(event.target.value)}
                className="rounded-xl border border-outline-variant/40 bg-surface px-4 py-2.5 outline-none focus:border-primary"
                placeholder="P.sh. Dreka të shpejta"
              />
            </label>

            <label className="inline-flex items-center gap-2 rounded-xl border border-outline-variant/40 bg-surface px-3 py-2.5 text-sm text-on-surface">
              <input
                type="checkbox"
                checked={newCategoryPublic}
                onChange={(event) => setNewCategoryPublic(event.target.checked)}
              />
              Publike
            </label>

            <button
              type="submit"
              className="rounded-full bg-primary px-5 py-2.5 text-white font-label-md hover:bg-primary/90 transition-colors"
            >
              Krijo kategori
            </button>
          </form>

          {favoritesMessage && (
            <p className="mb-3 rounded-xl bg-primary/10 px-4 py-2.5 text-sm text-primary">{favoritesMessage}</p>
          )}
          {favoritesError && (
            <p className="mb-3 rounded-xl bg-error/10 px-4 py-2.5 text-sm text-error">{favoritesError}</p>
          )}

          {favoritesLoading ? (
            <p className="text-sm text-on-surface-variant">Duke ngarkuar të preferuarat...</p>
          ) : (
            <div className="space-y-6">
              {categories.length === 0 && uncategorized.length === 0 && (
                <div className="rounded-xl border border-dashed border-outline-variant/40 bg-surface px-4 py-5 text-sm text-on-surface-variant">
                  Ende nuk keni receta te të preferuarat.
                </div>
              )}

              {categories.length > 0 && (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-2">
                  {categories.map((category) => (
                    <article
                      key={category.id}
                      role="link"
                      tabIndex={0}
                      onClick={() => openCategory(category.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          openCategory(category.id);
                        }
                      }}
                      className="flex h-full min-h-[16rem] flex-col rounded-2xl border border-outline-variant/30 bg-surface p-5 shadow-sm transition-shadow hover:shadow-md cursor-pointer"
                    >
                      <div className="mb-4 aspect-[4/3] overflow-hidden rounded-2xl bg-surface-variant/20">
                        {getCategoryThumbnail(category) ? (
                          <img
                            src={getCategoryThumbnail(category)}
                            alt={category.emertimi}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-on-surface-variant">
                            <span className="material-symbols-outlined text-[30px]">folder</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-1 flex-col justify-between gap-4">
                        <div>
                          <h4 className="text-base font-semibold text-on-surface">{category.emertimi}</h4>
                          <p className="mt-1 text-sm text-on-surface-variant">
                            {category.is_public ? "Publike" : "Private"} · {category.recipes.length} receta
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              toggleCategoryVisibility(category);
                            }}
                            className="rounded-full border border-outline-variant/40 px-3.5 py-1.5 text-xs text-on-surface hover:bg-surface-variant/20"
                          >
                            Kalo në {category.is_public ? "Private" : "Publike"}
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              removeCategory(category);
                            }}
                            className="rounded-full border border-error/40 px-3.5 py-1.5 text-xs text-error hover:bg-error/10"
                          >
                            Fshi
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {uncategorized.length > 0 && (
                <article className="rounded-xl border border-outline-variant/30 bg-surface px-4 py-4">
                  <h4 className="font-label-lg text-on-surface">Pa kategori</h4>
                  <p className="text-xs text-on-surface-variant mt-1">Receta të ruajtura pa dosje</p>
                  <ul className="mt-3 space-y-2">
                    {uncategorized.map((recipe) => (
                      <li key={`unc-${recipe.favorite_id}`} className="text-sm text-on-surface-variant flex items-center justify-between gap-3">
                        <span className="truncate">{recipe.titulli}</span>
                        <Link to={`/recipes/${recipe.recipe_id}`} className="text-primary text-xs hover:underline">Shiko</Link>
                      </li>
                    ))}
                  </ul>
                </article>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}