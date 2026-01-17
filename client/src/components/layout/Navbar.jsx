import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    // Check if user is logged in and get user info
    const isLoggedIn = !!user;
    const isAdmin = user?.role === 'admin';

    const handleLogout = async () => {
        try {
            navigate('/login');
            await logout();
        } catch (error) {
            console.error('Logout error:', error);
            navigate('/login');
        }
    };

    return (
        <nav className="bg-gradient-to-r from-gray-900 via-purple-900 to-indigo-900 text-white shadow-2xl border-b border-purple-500/20 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">

                    {/* Logo/Brand */}
                    <div className="flex items-center space-x-4">
                        <Link to="/" className="flex items-center space-x-3 group">
                            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:shadow-purple-500/40 transition-all duration-300 group-hover:scale-110">
                                <span className="text-2xl">🏛️</span>
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">AuctionHub</span>
                        </Link>
                    </div>

                    {/* Search Bar */}
                    <div className="hidden md:flex flex-1 max-w-md mx-8">
                        <div className="relative w-full">
                            <input
                                type="text"
                                placeholder="Search auctions..."
                                className="w-full px-5 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                            />
                            <button className="absolute right-3 top-3 text-purple-400 hover:text-purple-300 transition-colors text-lg">
                                🔍
                            </button>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex items-center space-x-6">

                        {/* Main Navigation */}
                        <div className="hidden md:flex space-x-6">
                            <Link
                                to="/"
                                className="relative px-4 py-2 font-medium text-white transition-colors duration-300 hover:text-purple-300 group"
                            >
                                Home
                                <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-indigo-400 transition-all duration-300 group-hover:w-full group-hover:left-0"></span>
                            </Link>
                            <Link
                                to="/auctions"
                                className="relative px-4 py-2 font-medium text-white transition-colors duration-300 hover:text-purple-300 group"
                            >
                                Auctions
                                <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-indigo-400 transition-all duration-300 group-hover:w-full group-hover:left-0"></span>
                            </Link>

                            
                        </div>

                        {/* User Section */}
                        <div className="flex items-center space-x-4">
                            {isLoggedIn ? (
                                <>
                                    {/* User Greeting
                                    <div className="hidden sm:flex items-center space-x-3 bg-white/10 px-4 py-2 rounded-xl border border-white/20">
                                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                                            <span className="text-sm">👤</span>
                                        </div>
                                        <span className="text-sm font-medium">
                                            Welcome, <span className="text-purple-300">{user}</span>
                                        </span>
                                    </div> */}

                                    {/* Logout Button */}
                                    <button
                                        onClick={handleLogout}
                                        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 px-6 py-2 rounded-xl transition-all duration-300 font-medium shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transform hover:scale-105"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                /* Login Button */
                                <Link
                                    to="/login"
                                    className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 px-6 py-2 rounded-xl transition-all duration-300 font-medium shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transform hover:scale-105"
                                >
                                    Login
                                </Link>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden">
                            <button className="text-white hover:text-purple-300 p-2 rounded-lg hover:bg-white/10 transition-all duration-300">
                                <span className="text-xl">☰</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Search (hidden by default) */}
                <div className="md:hidden pb-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search auctions..."
                            className="w-full px-5 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                        />
                        <button className="absolute right-3 top-3 text-purple-400 hover:text-purple-300 transition-colors text-lg">
                            🔍
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;