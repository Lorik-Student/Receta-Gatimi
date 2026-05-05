import { createBrowserRouter } from "react-router-dom";
import { LoginAction, LoginPage } from "./pages/LoginPage";
import { SignupAction, SignupPage } from "./pages/SignupPage";
import { ErrorPage } from "./pages/ErrorPage";
import { RecipesPage, recipesLoader } from "./pages/RecipesPage";
import { RecipePage, recipeLoader } from "./pages/RecipePage";
import { CreateRecipePage, createRecipeAction } from "./pages/CreateRecipePage";
import { CategoriesPage, categoriesLoader } from "./pages/CategoriesPage";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <h1>Home Page</h1>,
        errorElement: <ErrorPage />
    },
    {
        path: "/login",
        element: <LoginPage />,
        errorElement: <ErrorPage />,
        action: LoginAction
    },
    {
        path: "/signup",
        element: <SignupPage />,
        errorElement: <ErrorPage />,
        action: SignupAction
    },
    {
        path: "/recipes",
        element: <RecipesPage />,
        errorElement: <ErrorPage />,
        loader: recipesLoader
    },
    {
        path: "/recipes/:id",
        element: <RecipePage />,
        errorElement: <ErrorPage />,
        loader: recipeLoader
    },
    {
        path: "/recipes/create",
        element: <CreateRecipePage />,
        errorElement: <ErrorPage />,
        action: createRecipeAction
    },
    {
        path: "/categories",
        element: <CategoriesPage />,
        errorElement: <ErrorPage />,
        loader: categoriesLoader
    }
])