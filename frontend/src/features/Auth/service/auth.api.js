import axios from 'axios'


const api = axios.create({
    baseURL: (window.location.protocol === "http:" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") && window.location.port !== "3000")
        ? "http://127.0.0.1:3000" 
        : "",
    withCredentials: true,
})

export async function register({ email, username, password }) {
    const response = await api.post("/api/auth/register", { email, username, password })
    return response.data
}

export async function login({ email, password }) {
    const response = await api.post("/api/auth/login", { email, password })
    return response.data
}

export async function getMe() {
    const response = await api.get("/api/auth/get-me")
    return response.data
}

export async function logout() {
    const response = await api.post("/api/auth/logout")
    return response.data
}