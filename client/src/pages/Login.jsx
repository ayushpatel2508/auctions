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
                        Welcome Back!
                    </h2>
                    <p className="text-lg" style={{ color: '#8b7d6b' }}>
                        Sign in to your account to continue bidding
                    </p>
                </div>

                {/* Login Form Card */}
                <Card className="shadow-2xl border-0 rounded-2xl" style={{
                    background: 'rgba(248, 246, 240, 0.9)',
                    backdropFilter: 'blur(20px)',
                    border: '2px solid rgba(139, 125, 107, 0.3)',
                    boxShadow: '0 8px 32px rgba(210, 105, 30, 0.2)'
                }}>
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-2xl font-bold" style={{ color: '#3a3530' }}>Sign In</CardTitle>
                        <CardDescription style={{ color: '#8b7d6b' }}>
                            Enter your credentials to access your account
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Email Field */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="font-medium" style={{ color: '#3a3530' }}>Email Address</Label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-lg" style={{ color: '#d2691e' }}>📧</span>
                                    </div>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={`pl-12 rounded-xl h-12 ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : ''
                                            }`}
                                        style={{
                                            background: 'rgba(248, 246, 240, 0.8)',
                                            border: '2px solid #8b7d6b',
                                            color: '#3a3530'
                                        }}
                                        placeholder="Enter your email"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1 animate-pulse">
                                        <span>⚠️</span>
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <Label htmlFor="password" className="font-medium" style={{ color: '#3a3530' }}>Password</Label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-lg" style={{ color: '#d2691e' }}>🔒</span>
                                    </div>
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={`pl-12 pr-12 rounded-xl h-12 ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : ''
                                            }`}
                                        style={{
                                            background: 'rgba(248, 246, 240, 0.8)',
                                            border: '2px solid #8b7d6b',
                                            color: '#3a3530'
                                        }}
                                        placeholder="Enter your password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center transition-colors"
                                        style={{ color: '#d2691e' }}
                                    >
                                        <span className="text-lg">{showPassword ? '🙈' : '👁️'}</span>
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1 animate-pulse">
                                        <span>⚠️</span>
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full font-semibold py-3 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                style={{
                                    background: 'linear-gradient(135deg, #d2691e 0%, #b8541a 100%)',
                                    boxShadow: '0 4px 20px rgba(210, 105, 30, 0.4)',
                                    color: '#f8f6f0'
                                }}
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
                    <p style={{ color: '#8b7d6b' }}>
                        Don't have an account?{' '}
                        <Link
                            to="/register"
                            className="font-semibold transition-colors"
                            style={{ color: '#d2691e' }}
                        >
                            Create one now
                        </Link>
                    </p>
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

export default Login;
