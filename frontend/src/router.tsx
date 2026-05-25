import { createBrowserRouter, Outlet } from "react-router-dom";
import { NavigationBar } from "./components/NavigationBar";
import { LoginAction, LoginPage } from "./pages/LoginPage.jsx";
import { SignupAction, SignupPage } from "./pages/SignupPage.jsx";
import { ErrorPage } from "./pages/ErrorPage";
import { HomePage } from "./pages/HomePage";
import { RecipesPage, recipesLoader } from "./pages/RecipesPage";
import { MyRecipesPage, myRecipesLoader } from "./pages/MyRecipesPage";
import { RecipePage, recipeLoader } from "./pages/RecipePage";
import { CreateRecipePage, createRecipeLoader } from "./pages/CreateRecipePage.jsx";
import { CategoriesPage, categoriesLoader } from "./pages/CategoriesPage";
import { ProfilePage, profileLoader } from "./pages/ProfilePage.jsx";
import { FavoritesPage, favoritesLoader } from "./pages/FavoritesPage.jsx";
import { FavoriteCategoryPage, favoriteCategoryLoader } from "./pages/FavoriteCategoryPage";
import { UserRecipesPage, userRecipesLoader } from "./pages/UserRecipesPage";
import { UserFavoritesPage, userFavoritesLoader } from "./pages/UserFavoritesPage";
import { AboutUsPage } from "./pages/AboutUsPage";

import { AdminLayout, AdminDashboardOverview } from "./pages/admin/AdminDashboard";
import { AdminUsersPage } from "./pages/admin/AdminUsersPage";
import { AdminRecipesPage } from "./pages/admin/AdminRecipesPage";
import { AdminCategoriesPage } from "./pages/admin/AdminCategoriesPage";
import { AdminInteractionsPage } from "./pages/admin/AdminInteractionsPage";
import { AdminReportsPage } from "./pages/admin/AdminReportsPage";


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
                path: "/recipes/me",
                element: <MyRecipesPage />,
                loader: myRecipesLoader
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
                path: "/users/:id/profile",
                element: <ProfilePage />,
                loader: profileLoader
            },
            {
                path: "/users/:id/recipes",
                element: <UserRecipesPage />,
                loader: userRecipesLoader
            },
            {
                path: "/users/:id/favorites",
                element: <UserFavoritesPage />,
                loader: userFavoritesLoader
            },
            {
                path: "/profile",
                element: <ProfilePage />,
                loader: profileLoader
            },
            {
                path: "/profile/favorites",
                element: <FavoritesPage />,
                loader: favoritesLoader
            },
            {
                path: "/profile/favorites/:id",
                element: <FavoriteCategoryPage />,
                loader: favoriteCategoryLoader
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
            { path: "reports", element: <AdminReportsPage /> },
            { path: "interactions", element: <AdminInteractionsPage /> }
        ]
    }
])