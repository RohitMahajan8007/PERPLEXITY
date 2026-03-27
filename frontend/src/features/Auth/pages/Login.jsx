import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../Hook/useAuth'
import { useSelector, useDispatch } from 'react-redux'
import { setError } from '../auth.slice'
import Spinner from '../Components/Spinner'


const Login = () => {
    const [ email, setEmail ] = useState('')
    const [ password, setPassword ] = useState('')
    const [ verificationMessage, setVerificationMessage ] = useState(null)

    const user = useSelector(state => state.auth.user)
    const loading = useSelector(state => state.auth.loading)
    const error = useSelector(state => state.auth.error)

    const { handleLogin } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const dispatch = useDispatch()

    useEffect(() => {
        // Clear any pre-existing global errors on mount
        dispatch(setError(null))

        const params = new URLSearchParams(location.search)
        const emailParam = params.get('email')
        
        if (emailParam) {
            setEmail(emailParam)
            
            // Check if we have a saved password for this email (from recent registration)
            const savedEmail = localStorage.getItem('reg_email')
            const savedPassword = localStorage.getItem('reg_password')
            
            if (savedEmail === emailParam && savedPassword) {
                setPassword(savedPassword)
                // Clear after auto-filling
                localStorage.removeItem('reg_email')
                localStorage.removeItem('reg_password')
            }
        }

        if (params.get('verified') === 'true') {
            setVerificationMessage('Email verified successfully! You can now log in.')
            // Clear the error if any
            dispatch(setError(null))
        }
    }, [location, dispatch])

    const submitForm = async (event) => {
        event.preventDefault()
        setVerificationMessage(null)

        const payload = {
            email,
            password,
        }

        try {
            const success = await handleLogin(payload)
            if (success) {
                navigate("/")
            }
        } catch (err) {
            // Error is handled by store and displayed via useSelector(state => state.auth.error)
        }
    }

    useEffect(() => {
        if (user) {
            navigate('/', { replace: true })
        }
    }, [user, navigate])

    if (user) {
        return null
    }

    return (
        <section className="min-h-screen bg-zinc-950 px-4 py-10 text-zinc-100 sm:px-6 lg:px-8">
            <div className="mx-auto flex min-h-[85vh] w-full max-w-5xl items-center justify-center">
                <div className="w-full max-w-md rounded-2xl border border-[#31b8c6]/40 bg-zinc-900/70 p-8 shadow-2xl shadow-black/50 backdrop-blur text-center animate-in fade-in zoom-in duration-500">
                    <div className="flex justify-center mb-6">
                        <img src="/assets/perplexity.png" alt="Perplexity Logo" className="w-16 h-16 rounded-xl shadow-lg ring-2 ring-[#31b8c6]/20" />
                    </div>
                    <h1 className="text-3xl font-bold text-[#31b8c6]">
                        Welcome Back
                    </h1>
                    <p className="mt-2 text-sm text-zinc-300">
                        Sign in 
                    </p>

                    {verificationMessage && (
                        <div className="mt-4 rounded-lg bg-green-500/20 border border-green-500/50 p-3 text-sm text-green-400">
                            {verificationMessage}
                        </div>
                    )}

                    {error && (
                        <div className="mt-4 rounded-lg bg-red-500/20 border border-red-500/50 p-3 text-sm text-red-400">
                            {error}
                        </div>
                    )}

                    <form onSubmit={submitForm} className="mt-8 space-y-5">
                        <div>
                            <label htmlFor="email" className="mb-2 block text-sm font-medium text-zinc-200">
                                
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                placeholder="you@example.com"
                                required
                                className="w-full rounded-lg border border-zinc-700 bg-zinc-950/80 px-4 py-3 text-zinc-100 outline-none ring-0 transition focus:border-[#31b8c6] focus:shadow-[0_0_0_3px_rgba(49,184,198,0.25)]"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="mb-2 block text-sm font-medium text-zinc-200">
                            
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                placeholder="Enter your password"
                                required
                                className="w-full rounded-lg border border-zinc-700 bg-zinc-950/80 px-4 py-3 text-zinc-100 outline-none ring-0 transition focus:border-[#31b8c6] focus:shadow-[0_0_0_3px_rgba(49,184,198,0.25)]"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full flex items-center justify-center gap-2 rounded-lg bg-[#31b8c6] px-4 py-3 font-semibold text-zinc-950 transition hover:bg-[#45c7d4] focus:outline-none focus:shadow-[0_0_0_3px_rgba(49,184,198,0.35)] ${loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                            {loading ? (
                                <>
                                    <Spinner size={18} color="#09090b" />
                                    <span>Logging in...</span>
                                </>
                            ) : (
                                "Login"
                            )}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-zinc-300">
                        Don&apos;t have an account?{' '}
                        <Link to="/register" className="font-semibold text-[#31b8c6] transition hover:text-[#45c7d4]">
                            Register
                        </Link>
                    </p>
                </div>
            </div>
        </section>
    )
}

export default Login