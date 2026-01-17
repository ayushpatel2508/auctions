import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authAPI } from '@/utils/api';
import { useAuth } from '../contexts/AuthContext';
import validator from 'validator';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
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
            console.log('🚀 Attempting login with:', formData);
            const res = await authAPI.login(formData);
            console.log("✅ Login successful:", res);

            if (res.data.success) {
                const username = res.data.username;
                login(username);

                console.log('✅ User logged in as:', username);
                alert(`Welcome back, ${username}!`);

                setFormData({ email: '', password: '' });
                navigate('/auctions');
            }

        } catch (err) {
            console.error("❌ Login error:", err);
            const errorMsg = err.response?.data?.msg || 'Login failed';
            alert(`Login failed: ${errorMsg}`);
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
                        Welcome Back!
                    </h2>
                    <p className="text-gray-300 text-lg">
                        Sign in to your account to continue bidding
                    </p>
                </div>

                {/* Login Form Card */}
                <Card className="shadow-2xl border-0 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl">
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-2xl text-white font-bold">Sign In</CardTitle>
                        <CardDescription className="text-gray-300">
                            Enter your credentials to access your account
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Email Field */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-white font-medium">Email Address</Label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-purple-400 text-lg">📧</span>
                                    </div>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={`pl-12 bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-purple-400 focus:ring-purple-400/50 rounded-xl h-12 ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : ''
                                            }`}
                                        placeholder="Enter your email"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1 animate-pulse">
                                        <span>⚠️</span>
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-white font-medium">Password</Label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-purple-400 text-lg">🔒</span>
                                    </div>
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={`pl-12 pr-12 bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-purple-400 focus:ring-purple-400/50 rounded-xl h-12 ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : ''
                                            }`}
                                        placeholder="Enter your password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-purple-400 hover:text-purple-300 transition-colors"
                                    >
                                        <span className="text-lg">{showPassword ? '🙈' : '👁️'}</span>
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1 animate-pulse">
                                        <span>⚠️</span>
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold py-3 rounded-xl shadow-lg shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                size="lg"
                            >
                                {isLoading ? (
                                    <div className="flex items-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Signing in...
                                    </div>
                                ) : (
                                    <span>Sign in</span>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Sign Up Link */}
                <div className="text-center">
                    <p className="text-gray-300">
                        Don't have an account?{' '}
                        <Link
                            to="/register"
                            className="font-semibold text-purple-400 hover:text-purple-300 transition-colors"
                        >
                            Create one now
                        </Link>
                    </p>
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

export default Login;
