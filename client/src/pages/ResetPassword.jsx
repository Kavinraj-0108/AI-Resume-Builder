import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import api from '../configs/api.js';
import toast from 'react-hot-toast';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            return toast.error("Passwords do not match");
        }
        try {
            const { data } = await api.put(`/api/users/reset-password/${token}`, { password: formData.password });
            toast.success(data.message);
            navigate('/login');
        } catch (error) {
            toast.error(error?.response?.data?.message || error.message);
        }
    };

    return (
        <div className='flex items-center justify-center min-h-screen bg-gray-50'>
            <form onSubmit={handleSubmit} className="sm:w-[350px] w-full text-center border border-gray-300/60 rounded-2xl px-8 bg-white py-10">
                <h1 className="text-gray-900 text-3xl font-medium">Reset Password</h1>
                <p className="text-gray-500 text-sm mt-2">Enter your new password below</p>

                <div className="flex items-center mt-6 w-full bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2">
                    <Lock size={16} color='#6B7280' />
                    <input
                        type="password"
                        name="password"
                        placeholder="New Password"
                        className="border-none outline-none ring-0 w-full"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="flex items-center mt-4 w-full bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2">
                    <Lock size={16} color='#6B7280' />
                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        className="border-none outline-none ring-0 w-full"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                    />
                </div>

                <button type="submit" className="mt-6 w-full h-11 rounded-full text-white bg-green-500 hover:opacity-90 transition-opacity">
                    Update Password
                </button>
            </form>
        </div>
    );
};

export default ResetPassword;
