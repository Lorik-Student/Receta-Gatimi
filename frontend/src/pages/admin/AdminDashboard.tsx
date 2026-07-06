import { useEffect, useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { apiFetch } from "../../api";
import { readArrayPayload } from "../../lib/apiPayload";

export function AdminLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { label: "Dashboard", path: "/admin", icon: "dashboard" },
    { label: "Users", path: "/admin/users", icon: "group" },
    { label: "Recipes", path: "/admin/recipes", icon: "restaurant" },
    { label: "Categories", path: "/admin/categories", icon: "category" },
    { label: "Reports", path: "/admin/reports", icon: "flag" },
    { label: "Interactions", path: "/admin/interactions", icon: "forum" },
  ];

  const currentLabel = navItems.find((item) =>
    item.path === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(item.path)
  )?.label ?? "Dashboard";

  return (
    <div className="min-h-screen flex font-(family-name:--font-body-md)" style={{ backgroundColor: "var(--color-background)", color: "var(--color-on-background)" }}>
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col p-4 shadow-lg transition-transform duration-300 md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ backgroundColor: "var(--color-surface-container-high)", color: "var(--color-on-surface)", borderRight: "1px solid var(--color-outline-variant)" }}
      >
        <div className="mb-8 flex flex-col gap-4 px-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full shadow-inner" style={{ backgroundColor: "var(--color-primary-container)", color: "var(--color-on-primary-container)" }}>
              <span className="text-xl font-bold">A</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold" style={{ fontFamily: "var(--font-headline-sm)" }}>Admin Console</h2>
              <p className="text-sm font-medium" style={{ color: "var(--color-on-surface-variant)" }}>System Manager</p>
            </div>
          </div>
        </div>

        <nav className="grow space-y-2">
          {navItems.map((item) => {
            const isActive = item.path === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all hover:opacity-80 ${isActive ? "font-semibold shadow-md" : ""}`}
                style={isActive ? { backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)" } : { color: "var(--color-on-surface-variant)" }}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="text-sm tracking-wide">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto px-4 pt-4" style={{ borderTop: "1px solid var(--color-outline-variant)" }}>
          <p className="text-xs" style={{ color: "var(--color-on-surface-variant)" }}>Platform Admin</p>
        </div>
      </aside>

      <div className="flex min-h-screen grow flex-col md:pl-72">
        <header className="fixed top-0 right-0 left-0 z-40 flex h-16 items-center justify-between px-6 shadow-sm md:left-72" style={{ backgroundColor: "var(--color-surface)", borderBottom: "1px solid var(--color-outline-variant)" }}>
          <div className="flex items-center gap-4">
            <button className="flex items-center rounded-full p-2 transition-colors hover:bg-black/5 md:hidden" style={{ color: "var(--color-on-surface)" }} onClick={() => setSidebarOpen((value) => !value)}>
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h1 className="text-xl font-bold" style={{ fontFamily: "var(--font-headline-sm)" }}>{currentLabel}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="mr-4 text-sm font-medium hover:underline" style={{ color: "var(--color-primary)" }}>Return to Website</Link>
            <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: "var(--color-surface-variant)", color: "var(--color-on-surface-variant)" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>person</span>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-360 grow p-6 pt-20 md:p-10 md:pt-24">
          <Outlet />
        </main>
      </div>

      {isSidebarOpen && <button type="button" className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close navigation drawer" />}
    </div>
  );
}

export function AdminDashboardOverview() {
  const [stats, setStats] = useState({ users: 0, recipes: 0, categories: 0, reviews: 0 });

  useEffect(() => {
    async function loadStats() {
      try {
        const [usersRes, recipesRes, categoriesRes, reviewsRes] = await Promise.all([
          apiFetch("/users"),
          apiFetch("/recipes/admin"),
          apiFetch("/categories"),
          apiFetch("/interactions/reviews/admin")
        ]);

        setStats({
          users: readArrayPayload(usersRes, ["users", "data"]).length,
          recipes: readArrayPayload(recipesRes, ["recipes", "data"]).length,
          categories: readArrayPayload(categoriesRes, ["categories", "data"]).length,
          reviews: readArrayPayload(reviewsRes, ["reviews", "data"]).length,
        });
      } catch (error) {
        console.error("Error loading stats:", error);
      }
    }

    loadStats();
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-bold" style={{ fontFamily: "var(--font-headline-md)", color: "var(--color-on-surface)" }}>System Overview</h2>
          <p className="mt-2 text-base" style={{ color: "var(--color-on-surface-variant)" }}>Real-time metrics for the platform administration console.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Users", to: "/admin/users", icon: "group" },
            { label: "Recipes", to: "/admin/recipes", icon: "restaurant" },
            { label: "Categories", to: "/admin/categories", icon: "category" },
            { label: "Reports", to: "/admin/reports", icon: "flag" },
            { label: "Interactions", to: "/admin/interactions", icon: "forum" },
          ].map((action) => (
            <Link key={action.to} to={action.to} className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition-opacity hover:opacity-90" style={{ backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)" }}>
              <span className="material-symbols-outlined text-[18px]">{action.icon}</span>
              {action.label}
            </Link>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total Users", value: stats.users, icon: "group", tone: "var(--color-primary-container)" },
          { label: "Active Recipes", value: stats.recipes, icon: "restaurant", tone: "var(--color-tertiary-container)" },
          { label: "Categories", value: stats.categories, icon: "category", tone: "var(--color-secondary-container)" },
          { label: "Interactions", value: stats.reviews, icon: "forum", tone: "var(--color-primary-fixed)" },
        ].map((item) => (
          <article key={item.label} className="rounded-2xl p-6 shadow-sm transition-shadow hover:shadow-md" style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-outline-variant)" }}>
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center rounded-xl p-3" style={{ backgroundColor: item.tone, color: "var(--color-on-primary-container)" }}>
                <span className="material-symbols-outlined text-2xl">{item.icon}</span>
              </div>
            </div>
            <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--color-on-surface-variant)" }}>{item.label}</h3>
            <p className="mt-2 text-4xl font-bold" style={{ fontFamily: "var(--font-headline-md)", color: "var(--color-on-surface)" }}>{item.value}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
