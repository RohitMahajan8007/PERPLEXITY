import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useAuth } from '../Hook/useAuth'
import { setError } from '../auth.slice'
import Spinner from '../Components/Spinner'

const Register = () => {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)

  const user = useSelector(state => state.auth.user)
  const loading = useSelector(state => state.auth.loading)
  const { handleRegister } = useAuth()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  useEffect(() => {
     // Clear any existing global errors on mount
     dispatch(setError(null))
     
    if (user) {
      navigate('/', { replace: true })
    }
  }, [user, navigate, dispatch])
  

  if (user) {
    return null
  }

  const submitForm = async (event) => {
    event.preventDefault()
    setErrorMessage(null)
    setMessage(null)

    if (username.length < 3) {
      setErrorMessage('Username must be at least 3 characters long')
      return
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long')
      return
    }

    try {
      const payload = {
        username,
        email,
        password,
      }

      const response = await handleRegister(payload)
      if (response && response.success) {
        // Store info for autofill after verification
        localStorage.setItem('reg_email', email);
        localStorage.setItem('reg_password', password);
        
        setMessage('Registration successful! Please check your email to verify your account.')
        setUsername('')
        setEmail('')
        setPassword('')
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Registration failed. Please try again.')
    }
  }

  return (
    <section className="min-h-screen bg-zinc-950 px-4 py-10 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[85vh] w-full max-w-5xl items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-[#31b8c6]/40 bg-zinc-900/70 p-8 shadow-2xl shadow-black/50 backdrop-blur text-center animate-in fade-in zoom-in duration-500">
          <div className="flex justify-center mb-6">
            <img src="/assets/perplexity.png" alt="Perplexity Logo" className="w-16 h-16 rounded-xl shadow-lg ring-2 ring-[#31b8c6]/20" />
          </div>
          <h1 className="text-3xl font-bold text-[#31b8c6]">
            Create Account
          </h1>
          <p className="mt-2 text-sm text-zinc-300">
            
          </p>

          {message && (
            <div className="mt-4 rounded-lg bg-green-500/20 border border-green-500/50 p-3 text-sm text-green-400">
              {message}
            </div>
          )}

          {errorMessage && (
            <div className="mt-4 rounded-lg bg-red-500/20 border border-red-500/50 p-3 text-sm text-red-400">
              {errorMessage}
            </div>
          )}

          <form onSubmit={submitForm} className="mt-8 space-y-5">
            <div>
              <label htmlFor="username" className="mb-2 block text-sm font-medium text-zinc-200">
                
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Choose a username"
                required
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950/80 px-4 py-3 text-zinc-100 outline-none ring-0 transition focus:border-[#31b8c6] focus:shadow-[0_0_0_3px_rgba(49,184,198,0.25)]"
              />
            </div>

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
                placeholder="Create a password"
                required
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950/80 px-4 py-3 text-zinc-100 outline-none ring-0 transition focus:border-[#31b8c6] focus:shadow-[0_0_0_3px_rgba(49,184,198,0.25)]"
              />
            </div>

            <button
              disabled={loading}
              type="submit"
              className={`w-full flex items-center justify-center gap-2 rounded-lg bg-[#31b8c6] px-4 py-3 font-semibold text-zinc-950 transition hover:bg-[#45c7d4] focus:outline-none focus:shadow-[0_0_0_3px_rgba(49,184,198,0.35)] ${loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {loading ? (
                <>
                  <Spinner size={18} color="#09090b" />
                  <span>Creating account...</span>
                </>
              ) : (
                'Register'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-300">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#31b8c6] transition hover:text-[#45c7d4]">
              Login
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}

export default Register
