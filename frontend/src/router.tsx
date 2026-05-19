import { createBrowserRouter, Outlet } from "react-router-dom";
import { NavigationBar } from "./components/NavigationBar";
import { LoginAction, LoginPage } from "./pages/LoginPage.jsx";
import { SignupAction, SignupPage } from "./pages/SignupPage.jsx";
import { ErrorPage } from "./pages/ErrorPage";
import { HomePage } from "./pages/HomePage";
import { RecipesPage, recipesLoader } from "./pages/RecipesPage";
import { RecipePage, recipeLoader } from "./pages/RecipePage";
import { CreateRecipePage, createRecipeLoader } from "./pages/CreateRecipePage.jsx";
import { CategoriesPage, categoriesLoader } from "./pages/CategoriesPage";
import { ProfilePage, profileLoader } from "./pages/ProfilePage.jsx";
import { AboutUsPage } from "./pages/AboutUsPage";

import { AdminLayout, AdminDashboardOverview } from "./pages/admin/AdminDashboard";
import { AdminUsersPage } from "./pages/admin/AdminUsersPage";
import { AdminRecipesPage } from "./pages/admin/AdminRecipesPage";
import { AdminCategoriesPage } from "./pages/admin/AdminCategoriesPage";
import { AdminInteractionsPage } from "./pages/admin/AdminInteractionsPage";


function RootLayout() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {/* <NavigationBar /> */}
            <main style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <Outlet />
            </main>
        </div>
    );
}

export const router = createBrowserRouter([
    {
        element: <RootLayout />,
        errorElement: <ErrorPage />,
        hydrateFallbackElement: (
            <div style={{ padding: "2rem", textAlign: "center" }}>
                Duke u ngarkuar...
            </div>
        ),
        children: [
            {
                path: "/",
                element: <HomePage />,
            },
            {
                path: "/login",
                element: <LoginPage />,
                action: LoginAction
            },
            {
                path: "/signup",
                element: <SignupPage />,
                action: SignupAction
            },
            {
                path: "/recipes",
                element: <RecipesPage />,
                loader: recipesLoader
            },
            {
                path: "/recipes/:id",
                element: <RecipePage />,
                loader: recipeLoader
            },
            {
                path: "/recipes/create",
                element: <CreateRecipePage />,
                loader: createRecipeLoader
            },
            {
                path: "/categories",
                element: <CategoriesPage />,
                loader: categoriesLoader
            },
            {
                path: "/about",
                element: <AboutUsPage />
            },
            {
                path: "/profile",
                element: <ProfilePage />,
                loader: profileLoader
            },
        ]
    },
    {
        path: "/admin",
        element: <AdminLayout />,
        children: [
            { index: true, element: <AdminDashboardOverview /> },
            { path: "users", element: <AdminUsersPage /> },
            { path: "recipes", element: <AdminRecipesPage /> },
            { path: "categories", element: <AdminCategoriesPage /> },
            { path: "interactions", element: <AdminInteractionsPage /> }
        ]
    }
])