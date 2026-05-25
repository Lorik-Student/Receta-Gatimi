import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';
import { resolveImageSrc } from '../utils/image';

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

type FavoriteRecipe = {
  favorite_id: number;
  recipe_id: number;
  imazhi?: string;
};

type FavoriteCategory = {
  id: number;
  emertimi: string;
  is_public: boolean;
  imazhi?: string;
  recipes: FavoriteRecipe[];
};

function getCategoryThumbnail(category: FavoriteCategory) {
  return resolveImageSrc(category.imazhi || category.recipes?.[0]?.imazhi);
}

export const Cards: React.FC<CardsProps> = ({ items }) => {
  const navigate = useNavigate();
  const isAuthenticated = Boolean(localStorage.getItem('accessToken'));
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [favoriteCategories, setFavoriteCategories] = useState<FavoriteCategory[]>([]);
  const [activeRecipe, setActiveRecipe] = useState<RecipeCardData | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [categoryDraftName, setCategoryDraftName] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [favoriteSubmitting, setFavoriteSubmitting] = useState(false);
  const [categoryCreating, setCategoryCreating] = useState(false);
  const [favoriteError, setFavoriteError] = useState('');
  const [favoriteMessage, setFavoriteMessage] = useState('');

  const activeRecipeId = useMemo(() => {
    if (!activeRecipe) return null;
    const parsed = Number(activeRecipe.id);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
  }, [activeRecipe]);

  const activeRecipeIsFavorited = activeRecipeId ? favoriteIds.has(activeRecipeId) : false;

  async function loadFavoriteData() {
    if (!isAuthenticated) {
      setFavoriteIds(new Set());
      setFavoriteCategories([]);
      return;
    }

    setFavoriteLoading(true);
    setFavoriteError('');

    try {
      const response = await apiFetch('/interactions/favorites');
      const favoritesPayload = (response as any)?.favorites;
      const categories = Array.isArray(favoritesPayload?.categories) ? favoritesPayload.categories : [];
      const uncategorized = Array.isArray(favoritesPayload?.uncategorized) ? favoritesPayload.uncategorized : [];

      const ids = new Set<number>();
      categories.forEach((category: FavoriteCategory) => {
        if (!Array.isArray(category.recipes)) return;
        category.recipes.forEach((recipe) => {
          const parsed = Number(recipe.recipe_id);
          if (Number.isInteger(parsed) && parsed > 0) {
            ids.add(parsed);
          }
        });
      });
      uncategorized.forEach((recipe: FavoriteRecipe) => {
        const parsed = Number(recipe.recipe_id);
        if (Number.isInteger(parsed) && parsed > 0) {
          ids.add(parsed);
        }
      });

      setFavoriteCategories(categories);
      setFavoriteIds(ids);
    } catch (error) {
      console.error('Failed to load favorites in cards:', error);
      setFavoriteError('Nuk u ngarkuan të preferuarat.');
    } finally {
      setFavoriteLoading(false);
    }
  }

  useEffect(() => {
    void loadFavoriteData();
  }, [isAuthenticated]);

  function openFavoriteMenu(item: RecipeCardData) {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    setActiveRecipe(item);
    setSelectedCategoryId('');
    setCategoryDraftName('');
    setFavoriteError('');
    setFavoriteMessage('');
    setMenuOpen(true);
  }

  async function loadFavoriteCategories() {
    if (!isAuthenticated) {
      setFavoriteCategories([]);
      return;
    }

    try {
      const response = await apiFetch('/interactions/favorites/categories');
      const categories = Array.isArray((response as any)?.categories) ? (response as any).categories : [];
      setFavoriteCategories(
        categories.map((category: FavoriteCategory) => ({
          ...category,
          recipes: Array.isArray(category.recipes) ? category.recipes : []
        }))
      );
    } catch (error) {
      console.error('Failed to load favorite categories in cards:', error);
    }
  }

  useEffect(() => {
    void loadFavoriteCategories();
  }, [isAuthenticated]);

  async function createFavoriteCategory() {
    const name = categoryDraftName.trim();
    if (name.length < 2) {
      setFavoriteError('Emri i kategorisë duhet të ketë të paktën 2 karaktere.');
      return;
    }

    setCategoryCreating(true);
    setFavoriteError('');
    setFavoriteMessage('');

    try {
      const response = await apiFetch('/interactions/favorites/categories', {
        method: 'POST',
        body: JSON.stringify({ emertimi: name, is_public: false })
      });

      if (!response.ok) {
        throw new Error('Failed to create category');
      }

      setCategoryDraftName('');
      setFavoriteMessage('Kategoria u krijua.');
      await loadFavoriteCategories();
    } catch (error) {
      console.error('Failed to create category in cards:', error);
      setFavoriteError('Krijimi i kategorisë dështoi.');
    } finally {
      setCategoryCreating(false);
    }
  }

  async function saveFavoriteToCategory() {
    if (!activeRecipeId) {
      setFavoriteError('Receta nuk është e vlefshme.');
      return;
    }

    setFavoriteSubmitting(true);
    setFavoriteError('');
    setFavoriteMessage('');

    try {
      const parsedCategoryId = selectedCategoryId ? Number(selectedCategoryId) : undefined;
      const response = await apiFetch('/interactions/favorites', {
        method: 'POST',
        body: JSON.stringify({
          recipeId: activeRecipeId,
          categoryId: Number.isInteger(parsedCategoryId) && (parsedCategoryId as number) > 0 ? parsedCategoryId : undefined
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save favorite');
      }

      setFavoriteIds((current) => {
        const next = new Set(current);
        next.add(activeRecipeId);
        return next;
      });
      setFavoriteMessage('Receta u ruajt te të preferuarat.');
      await loadFavoriteData();
    } catch (error) {
      console.error('Failed to save favorite in cards:', error);
      setFavoriteError('Ruajtja dështoi. Provoni përsëri.');
    } finally {
      setFavoriteSubmitting(false);
    }
  }

  async function removeFavoriteFromRecipe() {
    if (!activeRecipeId) {
      setFavoriteError('Receta nuk është e vlefshme.');
      return;
    }

    setFavoriteSubmitting(true);
    setFavoriteError('');
    setFavoriteMessage('');

    try {
      const response = await apiFetch(`/interactions/favorites/recipe/${activeRecipeId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to remove favorite');
      }

      setFavoriteIds((current) => {
        const next = new Set(current);
        next.delete(activeRecipeId);
        return next;
      });
      setFavoriteMessage('Receta u hoq nga të preferuarat.');
      await loadFavoriteData();
    } catch (error) {
      console.error('Failed to remove favorite in cards:', error);
      setFavoriteError('Heqja dështoi. Provoni përsëri.');
    } finally {
      setFavoriteSubmitting(false);
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {items.map((item) => {
          const parsedId = Number(item.id);
          const canFavorite = Number.isInteger(parsedId) && parsedId > 0;
          const saved = canFavorite && favoriteIds.has(parsedId);
          const authorPath = item.authorId ? `/users/${item.authorId}/profile` : null;

          return (
            <article
              key={item.id}
              className="group h-full bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-outline-variant/20 hover:shadow-md transition-shadow cursor-pointer"
              role="link"
              tabIndex={0}
              onClick={() => navigate(`/recipes/${item.id}`)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
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
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!canFavorite) {
                      return;
                    }
                    openFavoriteMenu(item);
                  }}
                  className={`absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm transition-colors ${saved ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}
                  aria-label="Ruaj recetën"
                  disabled={!canFavorite}
                >
                  <span className="material-symbols-outlined text-[20px]" style={saved ? { fontVariationSettings: "'FILL' 1" } : undefined}>
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

      {menuOpen && activeRecipe && (
        <div className="fixed inset-0 z-[100] bg-black/35 backdrop-blur-[1px] flex items-center justify-center p-4" onClick={() => setMenuOpen(false)}>
          <div className="w-full max-w-[26rem] rounded-2xl border border-outline-variant/30 bg-surface p-5 shadow-xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <h3 className="font-headline-sm text-on-surface">Ruaj në koleksion</h3>
                <p className="text-sm text-on-surface-variant mt-1 line-clamp-2">{activeRecipe.title}</p>
              </div>
              <span className={`material-symbols-outlined text-[22px] ${activeRecipeIsFavorited ? 'text-primary' : 'text-on-surface-variant'}`} style={activeRecipeIsFavorited ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                favorite
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3">
              <label className="flex-1 text-sm font-medium text-on-surface">
                Kategoria e re
                <input
                  value={categoryDraftName}
                  onChange={(event) => setCategoryDraftName(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-outline-variant/40 bg-surface-variant/10 px-4 py-2.5 outline-none focus:border-primary"
                  placeholder="P.sh. Darka"
                />
              </label>
              <button
                type="button"
                onClick={() => void createFavoriteCategory()}
                disabled={categoryCreating}
                className="mt-7 whitespace-nowrap rounded-full bg-primary px-4 py-2.5 text-white font-label-md hover:bg-primary/90 disabled:opacity-60"
              >
                Krijo kategori
              </button>
            </div>

            <div className="mt-4 border-t border-outline-variant/20 pt-4">
                <div className="max-h-[18rem] overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:rgba(180,120,70,0.45)_transparent]">
                  <div className="grid grid-cols-3 gap-3">
                    {favoriteCategories.length < 3 && Array.from({ length: 3 - favoriteCategories.length }).map((_, index) => (
                      <div key={`empty-top-${index}`} className="aspect-square rounded-2xl border border-dashed border-outline-variant/30 bg-surface-variant/10" />
                    ))}
                    {favoriteCategories.map((category) => {
                      const isSelected = Number(selectedCategoryId) === category.id;
                      const thumbnail = getCategoryThumbnail(category);

                      return (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => setSelectedCategoryId(String(category.id))}
                          className={`aspect-square rounded-2xl border p-3 text-left transition-colors ${isSelected ? 'border-primary bg-primary/10' : 'border-outline-variant/30 bg-surface-variant/10 hover:bg-surface-variant/20'}`}
                        >
                          <div className="flex h-full flex-col justify-between">
                            <div>
                              <div className="mb-2 overflow-hidden rounded-xl bg-surface-variant/20 aspect-square flex items-center justify-center">
                                {thumbnail ? (
                                  <img src={thumbnail} alt={category.emertimi} className="h-full w-full object-cover" />
                                ) : (
                                  <span className={`material-symbols-outlined text-[20px] ${isSelected ? 'text-primary' : 'text-on-surface-variant'}`}>
                                    folder
                                  </span>
                                )}
                              </div>
                              <p className="mt-2 line-clamp-2 text-sm font-semibold text-on-surface">{category.emertimi}</p>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
                              <span>{category.is_public ? 'Publike' : 'Private'}</span>
                              {isSelected && <span className="text-primary">Zgjedhur</span>}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
            </div>

            {favoriteMessage && (
              <p className="mt-4 rounded-xl bg-primary/10 px-4 py-2.5 text-sm text-primary">{favoriteMessage}</p>
            )}
            {favoriteError && (
              <p className="mt-4 rounded-xl bg-error/10 px-4 py-2.5 text-sm text-error">{favoriteError}</p>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => void saveFavoriteToCategory()}
                disabled={favoriteLoading || favoriteSubmitting || !activeRecipeId}
                className="rounded-full bg-primary px-5 py-2.5 text-white font-label-md hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {favoriteSubmitting ? 'Duke ruajtur...' : 'Ruaj'}
              </button>
              {activeRecipeIsFavorited && (
                <button
                  type="button"
                  onClick={() => void removeFavoriteFromRecipe()}
                  disabled={favoriteSubmitting || !activeRecipeId}
                  className="inline-flex items-center gap-2 rounded-full border border-outline-variant/40 px-5 py-2.5 text-on-surface font-label-md hover:bg-surface-variant/20 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                  Unfavorite
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
