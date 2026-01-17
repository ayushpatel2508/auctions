import { authAPI } from '@/utils/api';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import validator from 'validator';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Username validation
        if (!formData.username) {
            newErrors.username = 'Username is required';
        } else if (formData.username.length < 3) {
            newErrors.username = 'Username must be at least 3 characters';
        } else if (!validator.isAlphanumeric(formData.username.replace(/[_-]/g, ''))) {
            newErrors.username = 'Username can only contain letters, numbers, hyphens and underscores';
        }

        // Email validation
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!validator.isEmail(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        } else {
            // Check if password has at least one letter (uppercase or lowercase) and one number
            const hasLetter = /[a-zA-Z]/.test(formData.password);
            const hasNumber = /[0-9]/.test(formData.password);

            if (!hasLetter || !hasNumber) {
                newErrors.password = 'Password must contain at least one letter and one number';
            }
        }

        // Confirm password validation
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            console.log('🚀 Register attempt with data:', formData);
            console.log('🌐 Making API call to register...');

            const res = await authAPI.register(formData);

            console.log('✅ Register SUCCESS response received:', res);
            console.log('✅ Response data:', res.data);
            console.log('✅ Response status:', res.status);

            if (res.data.success) {
                alert('Registration successful! Redirecting to login...');
                // Clear form only after successful registration
                setFormData({
                    username: '',
                    email: '',
                    password: '',
                    confirmPassword: ''
                });
                setErrors({});

                // Redirect to login page after 1 second
                setTimeout(() => {
                    navigate('/login');
                }, 1000);
            }

        } catch (error) {
            console.log('❌ Register ERROR caught:', error);
            console.log('❌ Error response object:', error.response);
            console.log('❌ Error data:', error.response?.data);
            console.log('❌ Error status:', error.response?.status);
            console.log('❌ Error message from server:', error.response?.data?.msg);

            const errorMsg = error.response?.data?.msg || 'Registration failed';
            console.log('❌ Final error message for alert:', errorMsg);

            alert(`Registration failed: ${errorMsg}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>

            <div className="max-w-md w-full space-y-8 relative z-10">
                {/* Header */}
                <div className="text-center">
                    <div className="mx-auto h-20 w-20 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-purple-500/25 animate-bounce">
                        <span className="text-3xl">🏛️</span>
                    </div>
                    <h2 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                        Create Account
                    </h2>
                    <p className="text-gray-300 text-lg">
                        Join AuctionHub to start bidding
                    </p>
                </div>

                {/* Register Form Card */}
                <div className="shadow-2xl border-0 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-white mb-3 flex items-center gap-2">
                                <span className="text-purple-400 text-lg">👤</span>
                                Username
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:border-purple-400 focus:ring-purple-400/50 rounded-xl h-12 focus:outline-none focus:ring-2 ${errors.username ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : ''
                                    }`}
                                placeholder="Choose a username"
                            />
                            {errors.username && (
                                <p className="text-red-400 text-sm mt-1 flex items-center gap-1 animate-pulse">
                                    <span>⚠️</span>
                                    {errors.username}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white mb-3 flex items-center gap-2">
                                <span className="text-purple-400 text-lg">📧</span>
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:border-purple-400 focus:ring-purple-400/50 rounded-xl h-12 focus:outline-none focus:ring-2 ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : ''
                                    }`}
                                placeholder="Enter your email"
                            />
                            {errors.email && (
                                <p className="text-red-400 text-sm mt-1 flex items-center gap-1 animate-pulse">
                                    <span>⚠️</span>
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white mb-3 flex items-center gap-2">
                                <span className="text-purple-400 text-lg">🔒</span>
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:border-purple-400 focus:ring-purple-400/50 rounded-xl h-12 focus:outline-none focus:ring-2 ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : ''
                                    }`}
                                placeholder="Create a password"
                            />
                            {errors.password && (
                                <p className="text-red-400 text-sm mt-1 flex items-center gap-1 animate-pulse">
                                    <span>⚠️</span>
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white mb-3 flex items-center gap-2">
                                <span className="text-purple-400 text-lg">🔐</span>
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:border-purple-400 focus:ring-purple-400/50 rounded-xl h-12 focus:outline-none focus:ring-2 ${errors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : ''
                                    }`}
                                placeholder="Confirm your password"
                            />
                            {errors.confirmPassword && (
                                <p className="text-red-400 text-sm mt-1 flex items-center gap-1 animate-pulse">
                                    <span>⚠️</span>
                                    {errors.confirmPassword}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold py-3 rounded-xl shadow-lg shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Creating Account...
                                </div>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-300">
                            Already have an account?{' '}
                            <Link to="/login" className="font-semibold text-purple-400 hover:text-purple-300 transition-colors">
                                Sign in here
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Trust Indicators */}
                <div className="text-center">
                    <div className="flex justify-center items-center space-x-6 text-sm text-gray-400">
                        <div className="flex items-center">
                            <span className="text-green-400 mr-2 text-lg">🔒</span>
                            SSL Secured
                        </div>
                        <div className="flex items-center">
                            <span className="text-blue-400 mr-2 text-lg">🛡️</span>
                            Privacy Protected
                        </div>
                        <div className="flex items-center">
                            <span className="text-purple-400 mr-2 text-lg">⚡</span>
                            Fast & Reliable
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
