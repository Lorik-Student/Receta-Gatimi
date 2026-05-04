import { createBrowserRouter } from "react-router-dom";
import { LoginAction, LoginPage } from "./pages/LoginPage";
import { SignupAction, SignupPage } from "./pages/SignupPage";
import { ErrorPage } from "./pages/ErrorPage";

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
    }
])