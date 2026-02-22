import { Mail, User2Icon, Lock } from 'lucide-react'
import React from 'react'
import api from '../configs/api.js'
import { useDispatch } from 'react-redux'
import { login } from '../App/features/authSlice.js'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'


const Login = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const query = new URLSearchParams(window.location.search)
    const urlState = query.get("state")

    const [state, setState] = React.useState(urlState || "login")

    const [formData, setFormData] = React.useState({
        name: '',
        email: '',
        password: ''
    })

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if (state === "forgot") {
                const { data } = await api.post('/api/users/forgot-password', { email: formData.email });
                toast.success(data.message);

                if (data.resetToken) {
                    // Auto-navigate in dev mode
                    navigate(`/reset-password/${data.resetToken}`);
                } else {
                    setState("login");
                }
                return;
            }
            const { data } = await api.post(`/api/users/${state}`, formData)
            dispatch(login(data))
            localStorage.setItem("token", data.token)
            toast.success(data.message)
            navigate('/app')
        } catch (error) {
            toast.error(error?.response?.data?.message || error.message)
        }

    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }
    return (
        <div className='flex items-center justify-center min-h-screen bg-gray-50'>
            <form onSubmit={handleSubmit} className="sm:w-[350px] w-full text-center border border-gray-300/60 rounded-2xl px-8 bg-white">
                <h1 className="text-gray-900 text-3xl mt-10 font-medium">
                    {state === "login" ? "Login" : state === "register" ? "Sign up" : "Forgot Password"}
                </h1>
                <p className="text-gray-500 text-sm mt-2">
                    {state === "forgot" ? "Enter your email to reset password" : `Please ${state} to continue`}
                </p>
                {state === "register" && (
                    <div className="flex items-center mt-6 w-full bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2">
                        <User2Icon size={16} color='#6B7280' />
                        <input type="text" name="name" placeholder="Name" className="border-none outline-none ring-0" value={formData.name} onChange={handleChange} required />
                    </div>
                )}
                <div className="flex items-center w-full mt-4 bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2">
                    <Mail size={13} color='#6B7280' />
                    <input type="email" name="email" placeholder="Email id" className="border-none outline-none ring-0" value={formData.email} onChange={handleChange} required />
                </div>
                {state !== "forgot" && (
                    <div className="flex items-center mt-4 w-full bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2">
                        <Lock size={13} color='#6B7280' />
                        <input type="password" name="password" placeholder="Password" className="border-none outline-none ring-0" value={formData.password} onChange={handleChange} required />
                    </div>
                )}

                {state === "login" && (
                    <div className="mt-4 text-left text-green-500">
                        <button className="text-sm" type="button" onClick={() => setState("forgot")}>Forget password?</button>
                    </div>
                )}

                <button type="submit" className="mt-4 w-full h-11 rounded-full text-white bg-green-500 hover:opacity-90 transition-opacity">
                    {state === "login" ? "Login" : state === "register" ? "Sign up" : "Send Reset Link"}
                </button>

                {state === "forgot" ? (
                    <p onClick={() => setState("login")} className="text-gray-500 text-sm mt-3 mb-11">
                        Back to <a href="#" className="text-green-500 hover:underline">Login</a>
                    </p>
                ) : (
                    <p onClick={() => setState(prev => prev === "login" ? "register" : "login")} className="text-gray-500 text-sm mt-3 mb-11">
                        {state === "login" ? "Don't have an account?" : "Already have an account?"} <a href="#" className="text-green-500 hover:underline">click here</a>
                    </p>
                )}
            </form>
        </div>
    )
}

export default Login