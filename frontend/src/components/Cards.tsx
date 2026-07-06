import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FavoriteRecipeDialog } from "../features/favorites/FavoriteRecipeDialog";
import { getFavoritesState } from "../features/favorites/favoritesApi";
import type { FavoriteCategory } from "../features/favorites/types";

export type RecipeCardData = {
  id: string;
  title: string;
  description: string;
  image: string;
  badge: string;
  time: string;
  difficulty: string;
  rating: string;
  authorId?: number;
  authorName?: string;
};

type CardsProps = {
  items: RecipeCardData[];
};

function parseRecipeId(id: string) {
  const recipeId = Number(id);
  return Number.isInteger(recipeId) && recipeId > 0 ? recipeId : null;
}

export const Cards: React.FC<CardsProps> = ({ items }) => {
  const navigate = useNavigate();
  const isAuthenticated = Boolean(localStorage.getItem("accessToken"));
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [favoriteCategories, setFavoriteCategories] = useState<FavoriteCategory[]>([]);
  const [activeRecipe, setActiveRecipe] = useState<RecipeCardData | null>(null);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [favoriteError, setFavoriteError] = useState("");

  const activeRecipeId = useMemo(
    () => activeRecipe ? parseRecipeId(activeRecipe.id) : null,
    [activeRecipe],
  );

  async function loadFavoriteData() {
    if (!isAuthenticated) {
      setFavoriteIds(new Set());
      setFavoriteCategories([]);
      return;
    }

    setFavoriteLoading(true);
    setFavoriteError("");

    try {
      const state = await getFavoritesState();
      setFavoriteCategories(state.categories);
      setFavoriteIds(state.recipeIds);
    } catch (error) {
      console.error("Failed to load favorites in cards:", error);
      setFavoriteError("Nuk u ngarkuan të preferuarat.");
    } finally {
      setFavoriteLoading(false);
    }
  }

  useEffect(() => {
    void loadFavoriteData();
  }, [isAuthenticated]);

  function openFavoriteDialog(item: RecipeCardData) {
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }

    setFavoriteError("");
    setActiveRecipe(item);
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {items.map((item) => {
          const recipeId = parseRecipeId(item.id);
          const isSaved = recipeId !== null && favoriteIds.has(recipeId);
          const authorPath = item.authorId ? `/users/${item.authorId}/profile` : null;

          return (
            <article
              key={item.id}
              className="group h-full bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-outline-variant/20 hover:shadow-md transition-shadow cursor-pointer"
              role="link"
              tabIndex={0}
              onClick={() => navigate(`/recipes/${item.id}`)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  navigate(`/recipes/${item.id}`);
                }
              }}
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  src={item.image}
                />

                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-primary font-label-sm shadow-sm">
                    {item.badge}
                  </span>
                </div>

                <button
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    if (recipeId) {
                      openFavoriteDialog(item);
                    }
                  }}
                  className={`absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm transition-colors ${isSaved ? "text-primary" : "text-on-surface-variant hover:text-primary"}`}
                  aria-label="Ruaj recetën"
                  disabled={!recipeId}
                >
                  <span className="material-symbols-outlined text-[20px]" style={isSaved ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                    favorite
                  </span>
                </button>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-3 text-on-surface-variant">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px]">schedule</span>
                    <span className="font-label-sm">{item.time}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px]">restaurant_menu</span>
                    <span className="font-label-sm">{item.difficulty}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-primary">
                    <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      star
                    </span>
                    <span className="font-label-sm font-bold">{item.rating}</span>
                  </div>
                </div>

                <h4 className="font-headline-sm text-on-surface mb-2 group-hover:text-primary transition-colors line-clamp-1">
                  {item.title}
                </h4>
                <p className="font-body-md text-on-surface-variant line-clamp-2">{item.description}</p>

                {item.authorName && authorPath && (
                  <Link
                    to={authorPath}
                    onClick={(event) => event.stopPropagation()}
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/15"
                  >
                    <span className="material-symbols-outlined text-[16px]">person</span>
                    {item.authorName}
                  </Link>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {favoriteError && (
        <p className="mt-4 rounded-xl bg-error/10 px-4 py-2.5 text-sm text-error">{favoriteError}</p>
      )}

      {activeRecipe && activeRecipeId && (
        <FavoriteRecipeDialog
          categories={favoriteCategories}
          isFavorited={favoriteIds.has(activeRecipeId)}
          loading={favoriteLoading}
          recipeId={activeRecipeId}
          recipeTitle={activeRecipe.title}
          onClose={() => setActiveRecipe(null)}
          onChanged={loadFavoriteData}
        />
      )}
    </>
  );
};
