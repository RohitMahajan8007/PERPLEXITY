import { createBrowserRouter } from "react-router";
import Login from "../features/Auth/pages/Login";
import Register from "../features/Auth/pages/Register";
import Dashboard from "../features/Chat/Pages/Dashboard";
import Protected from "../features/Auth/components/Protected";
import { Navigate } from "react-router";

export const router = createBrowserRouter([
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/register",
        element: <Register />
    },
    {
        path: "/",
        element: <Protected>
            <Dashboard />
        </Protected>
    },
    {
        path : "/dashboard",
        element :<Navigate to="/" replace/>
    }
])