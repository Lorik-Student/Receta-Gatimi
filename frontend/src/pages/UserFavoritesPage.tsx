import React, { useMemo } from "react";
import { Link, useLoaderData, useParams } from "react-router-dom";
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
  pershkrimi?: string | null;
  imazhi?: string;
  recipes: FavoriteRecipe[];
}

interface PublicFavoritesPayload {
  categories?: FavoriteCategory[];
}

interface ProfilePayload {
  user?: {
    emri?: string;
    mbiemri?: string;
  };
}

export async function userFavoritesLoader({ params }: any) {
  const [profileResult, favoritesResult] = await Promise.all([
    apiFetch(params?.id ? `/users/${params.id}/profile` : "/users/me/profile"),
    apiFetch(params?.id ? `/interactions/favorites/public/user/${params.id}` : "/interactions/favorites/categories"),
  ]);

  if (!profileResult.response.ok) {
    throw new Error((profileResult as any).error?.message || "Dështoi ngarkimi i profilit");
  }

  if (!favoritesResult.response.ok) {
    throw new Error((favoritesResult as any).error?.message || "Dështoi ngarkimi i kategorive të preferuara");
  }

  return {
    ...profileResult,
    favorites: favoritesResult.categories,
  };
}

export function UserFavoritesPage() {
  const data = useLoaderData() as ProfilePayload & { favorites?: FavoriteCategory[] };
  const params = useParams();
  const favorites = data.favorites || [];

  const title = useMemo(() => {
    const user = data.user;
    return user ? `Favourites të ${user.emri} ${user.mbiemri}` : "Favourites";
  }, [data.user]);

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
      <Header brand="Receta Gatimi" activePath="" />
      <main className="flex-1 max-w-[1280px] mx-auto px-margin-desktop py-12 w-full">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-10 border-b border-outline-variant/30 pb-6">
          <div>
            <h1 className="font-display-lg text-on-surface mb-2">{title}</h1>
            <p className="font-body-lg text-on-surface-variant">Të gjitha kategoritë publike të preferuara të këtij përdoruesi.</p>
          </div>
          <Link
            to={params.id ? `/users/${params.id}/profile` : "/profile"}
            className="inline-flex items-center gap-2 rounded-full border border-outline-variant/30 bg-surface px-4 py-2 font-label-md text-on-surface transition-colors hover:bg-surface-variant/20"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Kthehu te profili
          </Link>
        </div>

        {favorites.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-outline-variant/40 bg-surface px-4 py-10 text-center text-on-surface-variant">
            Nuk ka kategori publike të preferuara.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {favorites.map((category) => {
              const thumbnail = resolveImageSrc(category.imazhi || category.recipes?.[0]?.imazhi);

              return (
                <article key={category.id} className="overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface shadow-sm">
                  <div className="aspect-[4/3] bg-surface-variant/15">
                    {thumbnail ? (
                      <img src={thumbnail} alt={category.emertimi} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-on-surface-variant">
                        <span className="material-symbols-outlined text-[42px]">folder</span>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h2 className="font-headline-md text-on-surface mb-2">{category.emertimi}</h2>
                    <p className="text-sm text-on-surface-variant">
                      {Array.isArray(category.recipes) ? `${category.recipes.length} receta` : "0 receta"}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
