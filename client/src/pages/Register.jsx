import { useAuth } from '@/contexts/AuthContext';
import { authAPI } from '@/utils/api';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import validator from 'validator';

const Register = () => {
    const { login } = useAuth()
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
                alert('Registration successful! Redirecting to auctions...');

                // Clear form
                setFormData({
                    username: '',
                    email: '',
                    password: '',
                    confirmPassword: ''
                });
                setErrors({});

                // Login user (this handles localStorage automatically)
                login(res.data.user.username);

                // Redirect to auctions page
                navigate('/auctions');
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
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{
            background: 'linear-gradient(135deg, #f8f6f0 0%, #f0ede5 30%, #e8e3d8 70%, #ddd6c7 100%)'
        }}>
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl animate-pulse" style={{
                    background: 'rgba(210, 105, 30, 0.15)'
                }}></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl animate-pulse delay-1000" style={{
                    background: 'rgba(139, 125, 107, 0.15)'
                }}></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl animate-pulse delay-500" style={{
                    background: 'rgba(205, 133, 63, 0.1)'
                }}></div>
            </div>

            <div className="max-w-md w-full space-y-8 relative z-10">
                {/* Header */}
                <div className="text-center">
                    <div className="mx-auto h-20 w-20 rounded-2xl flex items-center justify-center mb-6 shadow-2xl animate-bounce" style={{
                        background: 'linear-gradient(135deg, #d2691e 0%, #b8541a 100%)',
                        boxShadow: '0 8px 32px rgba(210, 105, 30, 0.4)'
                    }}>
                        <span className="text-3xl">🏛️</span>
                    </div>
                    <h2 className="text-4xl font-bold mb-2" style={{
                        background: 'linear-gradient(135deg, #d2691e 0%, #8b7d6b 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}>
                        Create Account
                    </h2>
                    <p className="text-lg" style={{ color: '#8b7d6b' }}>
                        Join AuctionHub to start bidding
                    </p>
                </div>

                {/* Register Form Card */}
                <div className="shadow-2xl border-0 rounded-2xl p-8" style={{
                    background: 'rgba(248, 246, 240, 0.9)',
                    backdropFilter: 'blur(20px)',
                    border: '2px solid rgba(139, 125, 107, 0.3)',
                    boxShadow: '0 8px 32px rgba(210, 105, 30, 0.2)'
                }}>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-3 flex items-center gap-2" style={{ color: '#3a3530' }}>
                                <span className="text-lg" style={{ color: '#d2691e' }}>👤</span>
                                Username
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 rounded-xl h-12 focus:outline-none focus:ring-2 ${errors.username ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : ''
                                    }`}
                                style={{
                                    background: 'rgba(248, 246, 240, 0.8)',
                                    border: '2px solid #8b7d6b',
                                    color: '#3a3530'
                                }}
                                placeholder="Choose a username"
                            />
                            {errors.username && (
                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1 animate-pulse">
                                    <span>⚠️</span>
                                    {errors.username}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-3 flex items-center gap-2" style={{ color: '#3a3530' }}>
                                <span className="text-lg" style={{ color: '#d2691e' }}>📧</span>
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 rounded-xl h-12 focus:outline-none focus:ring-2 ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : ''
                                    }`}
                                style={{
                                    background: 'rgba(248, 246, 240, 0.8)',
                                    border: '2px solid #8b7d6b',
                                    color: '#3a3530'
                                }}
                                placeholder="Enter your email"
                            />
                            {errors.email && (
                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1 animate-pulse">
                                    <span>⚠️</span>
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-3 flex items-center gap-2" style={{ color: '#3a3530' }}>
                                <span className="text-lg" style={{ color: '#d2691e' }}>🔒</span>
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 rounded-xl h-12 focus:outline-none focus:ring-2 ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : ''
                                    }`}
                                style={{
                                    background: 'rgba(248, 246, 240, 0.8)',
                                    border: '2px solid #8b7d6b',
                                    color: '#3a3530'
                                }}
                                placeholder="Create a password"
                            />
                            {errors.password && (
                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1 animate-pulse">
                                    <span>⚠️</span>
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-3 flex items-center gap-2" style={{ color: '#3a3530' }}>
                                <span className="text-lg" style={{ color: '#d2691e' }}>🔐</span>
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 rounded-xl h-12 focus:outline-none focus:ring-2 ${errors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : ''
                                    }`}
                                style={{
                                    background: 'rgba(248, 246, 240, 0.8)',
                                    border: '2px solid #8b7d6b',
                                    color: '#3a3530'
                                }}
                                placeholder="Confirm your password"
                            />
                            {errors.confirmPassword && (
                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1 animate-pulse">
                                    <span>⚠️</span>
                                    {errors.confirmPassword}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full font-semibold py-3 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            style={{
                                background: 'linear-gradient(135deg, #d2691e 0%, #b8541a 100%)',
                                boxShadow: '0 4px 20px rgba(210, 105, 30, 0.4)',
                                color: '#f8f6f0'
                            }}
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
                        <p style={{ color: '#8b7d6b' }}>
                            Already have an account?{' '}
                            <Link to="/login" className="font-semibold transition-colors" style={{ color: '#d2691e' }}>
                                Sign in here
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Trust Indicators */}
                <div className="text-center">
                    <div className="flex justify-center items-center space-x-6 text-sm" style={{ color: '#8b7d6b' }}>
                        <div className="flex items-center">
                            <span className="mr-2 text-lg" style={{ color: '#228b22' }}>🔒</span>
                            SSL Secured
                        </div>
                        <div className="flex items-center">
                            <span className="mr-2 text-lg" style={{ color: '#4682b4' }}>🛡️</span>
                            Privacy Protected
                        </div>
                        <div className="flex items-center">
                            <span className="mr-2 text-lg" style={{ color: '#d2691e' }}>⚡</span>
                            Fast & Reliable
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
