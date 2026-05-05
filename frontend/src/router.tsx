import { createBrowserRouter, Outlet } from "react-router-dom";
import { NavigationBar } from "./components/NavigationBar";
import { LoginAction, LoginPage } from "./pages/LoginPage";
import { SignupAction, SignupPage } from "./pages/SignupPage";
import { ErrorPage } from "./pages/ErrorPage";
import { RecipesPage, recipesLoader } from "./pages/RecipesPage";
import { RecipePage, recipeLoader } from "./pages/RecipePage";
import { CreateRecipePage, createRecipeAction } from "./pages/CreateRecipePage";
import { CategoriesPage, categoriesLoader } from "./pages/CategoriesPage";
import { ProfilePage, profileLoader } from "./pages/ProfilePage";

function RootLayout() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <NavigationBar />
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
        children: [
            {
                path: "/",
                element: <h1>Home Page</h1>,
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
                action: createRecipeAction
            },
            {
                path: "/categories",
                element: <CategoriesPage />,
                loader: categoriesLoader
            },
            {
                path: "/profile",
                element: <ProfilePage />,
                loader: profileLoader
            }
        ]
    }
])