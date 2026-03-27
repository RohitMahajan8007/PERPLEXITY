import { useDispatch } from "react-redux";
import { register, login, getMe } from "../service/auth.api";
import { setUser, setLoading, setError } from "../auth.slice";


export function useAuth() {


    const dispatch = useDispatch()

    async function handleRegister({ email, username, password }) {
        try {
            dispatch(setLoading(true))
            const response = await register({ email, username, password })
            return response
        } catch (error) {
            dispatch(setError(error.response?.data?.message || "Registration failed"))
            throw error
        } finally {
            dispatch(setLoading(false))
        }
    }

    async function handleLogin({ email, password }) {
        try {
            dispatch(setLoading(true))
            const data = await login({ email, password })
            localStorage.removeItem('perplexity_logged_out')
            dispatch(setUser(data.user))
            return true
        } catch (err) {
            dispatch(setError(err.response?.data?.message || "Login failed"))
            throw err
        } finally {
            dispatch(setLoading(false))
        }
    }

    async function handleGetMe() {
        if (localStorage.getItem('perplexity_logged_out') === 'true') {
            dispatch(setUser(null))
            return;
        }
        try {
            dispatch(setLoading(true))
            const data = await getMe()
            dispatch(setUser(data.user))
        } catch (err) {
            // Silently fail during initial auth check - this is normal when not logged in
            dispatch(setUser(null))
        } finally {
            dispatch(setLoading(false))
        }
    }

    return {
        handleRegister,
        handleLogin,
        handleGetMe,
    }

}