import React from "react";
import { apiFetch } from "../api";
import { useLoaderData, Link } from "react-router-dom";
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export async function profileLoader() {
  const result = await apiFetch("/users/me/profile");
  if (!result.response.ok) {
    throw new Error((result as any).error?.message || "Dështoi ngarkimi i profilit");
  }
  return result;
}

export function ProfilePage() {
  const data = useLoaderData() as any;
  const user = data.user;

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
      <Header brand="Receta Gatimi" activePath="/profile" />
      <main className="flex-1 max-w-2xl mx-auto px-margin-desktop py-16 w-full">
        <h1 className="font-display-lg text-center mb-10 text-on-surface">Profili juaj</h1>

        <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant/30 p-8">
          <div className="flex flex-col items-center mb-8 border-b border-outline-variant/30 pb-8">
            <div className="w-24 h-24 rounded-full bg-primary/20 text-primary flex items-center justify-center font-display-md mb-4 uppercase">
              {user.emri?.[0]}{user.mbiemri?.[0]}
            </div>
            <h2 className="font-headline-lg">{user.emri} {user.mbiemri}</h2>
            <span className="bg-secondary/20 text-secondary px-3 py-1 rounded-full font-label-sm mt-2">
              {user.roles?.join(", ") || "Përdorues"}
            </span>
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

          <div className="flex justify-center">
            <button
              onClick={() => {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                window.location.href = "/login";
              }}
              className="bg-error/10 text-error hover:bg-error/20 px-8 py-3 rounded-full font-label-md transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              Dil
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
