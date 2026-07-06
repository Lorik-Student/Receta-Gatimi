import React, { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../api";
import { redirect, useLoaderData, Link, useNavigate, useParams } from "react-router-dom";
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import ProfileSidebar from '../components/ProfileSidebar';
import HorizontalCards from '../components/HorizontalCards';
import { resolveImageSrc } from "../utils/image";
import { RecipeCardData } from '../components/Cards';

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
  recipes: FavoriteRecipe[];
}

interface FavoritesPayload {
  favorites?: {
    categories?: FavoriteCategory[];
    uncategorized?: FavoriteRecipe[];
  };
}

interface ProfileRecipe {
  id: number;
  titulli?: string;
  title?: string;
  pershkrimi?: string;
  description?: string;
  imazhi?: string;
  koha_pergatitjes?: number;
  author_id?: number;
  author_emri?: string;
  author_mbiemri?: string;
}

export async function profileLoader({ params }: any) {
  const isOwnProfileRoute = !params?.id;
  const accessToken = localStorage.getItem("accessToken");
  if (isOwnProfileRoute && !accessToken) {
    throw redirect("/login");
  }

  const profileResult = await apiFetch(params?.id ? `/users/${params.id}/profile` : "/users/me/profile");
  if (!profileResult.response.ok) {
    throw new Error((profileResult as any).error?.message || "Dështoi ngarkimi i profilit");
  }

  if (params?.id) {
    const publicFavoritesResult = await apiFetch(`/interactions/favorites/public/user/${params.id}`);
    if (!publicFavoritesResult.response.ok) {
      throw new Error((publicFavoritesResult as any).error?.message || "Dështoi ngarkimi i kategorive të preferuara");
    }

    return {
      ...profileResult,
      publicFavorites: publicFavoritesResult.categories,
    };
  }

  return profileResult;
}

export function ProfilePage() {
  const data = useLoaderData() as any;
  const user = data.user;
  const navigate = useNavigate();
  const params = useParams();
  const isOwnProfile = !params.id;
  const publicFavorites = Array.isArray(data.publicFavorites) ? data.publicFavorites : [];

  function handleHorizontalWheel(event: React.WheelEvent<HTMLDivElement>) {
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
      return;
    }

    event.currentTarget.scrollLeft += event.deltaY;
    event.preventDefault();
  }

  const recipeCards: RecipeCardData[] = useMemo(() => {
    const recipes = Array.isArray(user?.recipes) ? user.recipes : [];

    return recipes.map((recipe: ProfileRecipe) => ({
      id: String(recipe.id),
      title: recipe.titulli || recipe.title || "Recetë pa titull",
      description: recipe.pershkrimi || recipe.description || "Nuk ka përshkrim.",
      image: resolveImageSrc(recipe.imazhi) || "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=80",
      badge: "Recetë",
      time: `${recipe.koha_pergatitjes || 0} Min`,
      difficulty: "Mesatare",
      rating: "4.8",
      authorId: Number(recipe.author_id || 0) || undefined,
      authorName: [recipe.author_emri, recipe.author_mbiemri].filter(Boolean).join(" ") || undefined,
    }));
  }, [user]);

  function handleLogout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/login", { replace: true });
  }

  function handleReportBug() {
    const subject = "Bug report - Receta Gatimi";
    const message = `Pershkrimi i problemit:\n\nFaqja: ${window.location.pathname}\nPërdoruesi: ${user.emri} ${user.mbiemri}\n\nHapat për të riprodhuar:\n1. \n2. \n3. \n`;

    void apiFetch("/interactions/reports/bugs", {
      method: "POST",
      body: JSON.stringify({ subject, message }),
    }).then((response) => {
      if (!response.ok) {
        throw new Error("Failed to submit bug report");
      }
      window.alert("Raporti u dërgua te dashboard-i i administratorëve.");
    }).catch((error) => {
      console.error("Failed to submit bug report:", error);
      window.alert("Dërgimi i raportit dështoi.");
    });
  }

  if (!user) {
    return (
      <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
        <Header brand="Receta Gatimi" />
        <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <span className="material-symbols-outlined text-6xl text-error mb-4">error</span>
          <h1 className="font-display-sm mb-4">Nuk jeni i/e kyçur!</h1>
          <p className="mb-6 text-on-surface-variant">Ju lutem hyni për të parë profilin tuaj.</p>
          <Link to="/login" className="bg-primary text-white px-6 py-2 rounded-full font-label-md hover:bg-primary/90 transition-colors">
            Hyr tani
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
      <Header brand="Receta Gatimi" activePath={isOwnProfile ? "/profile" : ""} />
      <main className="flex-1 max-w-[1280px] mx-auto px-margin-desktop py-12 w-full">
        <h1 className="font-display-lg text-center mb-10 text-on-surface">
          {isOwnProfile ? "Profili juaj" : `Profili i ${user.emri} ${user.mbiemri}`}
        </h1>
        {isOwnProfile ? (
          <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant/30 p-8">
            <div className="flex flex-col items-center mb-8 border-b border-outline-variant/30 pb-8">
              <div className="w-24 h-24 rounded-full bg-primary/20 text-primary flex items-center justify-center font-display-md mb-4 uppercase">
                {user.emri?.[0]}{user.mbiemri?.[0]}
              </div>
              <h2 className="font-headline-lg">{user.emri} {user.mbiemri}</h2>
              <span className="bg-secondary/20 text-secondary px-3 py-1 rounded-full font-label-sm mt-2">
                {user.roles?.join(", ") || "Përdorues"}
              </span>
              <p className="mt-4 text-sm text-on-surface-variant">
                Ky është profili juaj.
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center py-3 border-b border-outline-variant/10">
                <span className="font-label-md text-on-surface-variant">Adresa e emailit</span>
                <span className="font-body-md text-on-surface">{user.email}</span>
              </div>
              {user.phone_number && (
                <div className="flex justify-between items-center py-3 border-b border-outline-variant/10">
                  <span className="font-label-md text-on-surface-variant">Numri i telefonit</span>
                  <span className="font-body-md text-on-surface">{user.phone_number}</span>
                </div>
              )}
            </div>

            <div className="mb-8 rounded-3xl border border-outline-variant/30 bg-surface-variant/10 p-5 md:p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Link
                  to="/recipes/me"
                  className="group flex min-h-[180px] flex-col justify-between rounded-3xl border border-primary/20 bg-surface px-5 py-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-primary/40"
                >
                  <div>
                    <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <span className="material-symbols-outlined text-[24px]">restaurant_menu</span>
                    </div>
                    <h3 className="font-headline-md text-on-surface mb-2">Recetat e tua</h3>
                    <p className="text-sm text-on-surface-variant max-w-sm leading-relaxed">
                      Hape faqen me të gjitha recetat që ke publikuar dhe menaxho krijimet e tua.
                    </p>
                  </div>
                  <div className="mt-6 inline-flex items-center gap-2 font-label-md text-primary">
                    Shko te recetat
                    <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">arrow_forward</span>
                  </div>
                </Link>

                <Link
                  to="/profile/favorites"
                  className="group flex min-h-[180px] flex-col justify-between rounded-3xl border border-primary/20 bg-surface px-5 py-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-primary/40"
                >
                  <div>
                    <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
                      <span className="material-symbols-outlined text-[24px]">favorite</span>
                    </div>
                    <h3 className="font-headline-md text-on-surface mb-2">Të preferuarat e tua</h3>
                    <p className="text-sm text-on-surface-variant max-w-sm leading-relaxed">
                      Hape koleksionet e tua të preferuara, krijo kategori dhe organizo recetat.
                    </p>
                  </div>
                  <div className="mt-6 inline-flex items-center gap-2 font-label-md text-primary">
                    Shko te të preferuarat
                    <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">arrow_forward</span>
                  </div>
                </Link>

                <Link
                  to="/profile/shopping-list"
                  className="group flex min-h-[180px] flex-col justify-between rounded-3xl border border-primary/20 bg-surface px-5 py-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-primary/40"
                >
                  <div>
                    <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
                      <span className="material-symbols-outlined text-[24px]">shopping_cart</span>
                    </div>
                    <h3 className="font-headline-md text-on-surface mb-2">Lista e blerjeve</h3>
                    <p className="text-sm text-on-surface-variant max-w-sm leading-relaxed">
                      Dërgo përbërës nga recetat dhe shëno çfarë ke blerë tashmë.
                    </p>
                  </div>
                  <div className="mt-6 inline-flex items-center gap-2 font-label-md text-primary">
                    Hape listën
                    <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">arrow_forward</span>
                  </div>
                </Link>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="bg-error/10 text-error hover:bg-error/20 px-8 py-3 rounded-full font-label-md transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">logout</span>
                  Logout
                </button>
                <button
                  type="button"
                  onClick={handleReportBug}
                  className="bg-primary/10 text-primary hover:bg-primary/20 px-8 py-3 rounded-full font-label-md transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">bug_report</span>
                  Report bug
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[18rem_minmax(0,1fr)] gap-8 items-start">
            <ProfileSidebar name={`${user.emri} ${user.mbiemri}`} bio={user.bio || user.pershkrimi} avatar={user.imazhi} />

            <div className="space-y-6 min-w-0">
              <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant/30 p-6 min-w-0">
                <Link
                  to={isOwnProfile ? "/recipes/me" : `/users/${params.id}/recipes`}
                  className="inline-flex items-center gap-2 font-headline-md mb-4 text-primary transition-colors hover:text-primary/80"
                >
                  Recipes
                  <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                </Link>
                <HorizontalCards items={recipeCards} />
              </div>

              <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant/30 p-6 min-w-0">
                <Link
                  to={isOwnProfile ? "/profile/favorites" : `/users/${params.id}/favorites`}
                  className="inline-flex items-center gap-2 font-headline-md mb-4 text-error transition-colors hover:text-error/80"
                >
                  Favourites
                  <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                </Link>
                {publicFavorites.length > 0 ? (
                  <div className="overflow-x-auto pb-2" onWheel={handleHorizontalWheel}>
                    <div className="flex gap-6 min-w-max pr-4">
                      {publicFavorites.map((category: any) => {
                        const thumbnail = resolveImageSrc(category.imazhi || category.recipes?.[0]?.imazhi);
                        const recipeCount = Array.isArray(category.recipes) ? category.recipes.length : 0;

                        return (
                          <div
                            key={category.id}
                            className="w-[240px] shrink-0 rounded-2xl border border-error/20 bg-error/5 p-4 shadow-sm"
                          >
                            <div className="aspect-square rounded-2xl overflow-hidden bg-surface-variant/15 mb-4 flex items-center justify-center">
                              {thumbnail ? (
                                <img src={thumbnail} alt={category.emertimi} className="w-full h-full object-cover" />
                              ) : (
                                <span className="material-symbols-outlined text-[28px] text-error">folder</span>
                              )}
                            </div>
                            <div className="font-headline-sm text-on-surface mb-1 line-clamp-1">{category.emertimi}</div>
                            <div className="text-sm text-on-surface-variant">{recipeCount} receta</div>
                            <div className="mt-2 text-xs text-on-surface-variant">{category.is_public ? 'Publike' : 'Private'}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="text-on-surface-variant">Nuk ka kategori publike të preferuara.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
