import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "../features/Auth/pages/Login";
import Register from "../features/Auth/pages/Register";
import Dashboard from "../features/Chat/Pages/Dashboard";

export const router = createBrowserRouter([
    {
        path: "/login",
        element: <Login />,
        errorElement: <div>Error in Login Page</div>
    },
    {
        path: "/register",
        element: <Register />,
        errorElement: <div>Error in Register Page</div>
    },
    {
        path: "/",
        element: <Dashboard />,
        errorElement: <div>Error in Dashboard Page</div>
    },
    {
        path : "/dashboard",
        element :<Navigate to="/" replace/>
    }
])