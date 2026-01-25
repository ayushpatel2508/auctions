import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [mobileSearchTerm, setMobileSearchTerm] = useState('');

    // Check if user is logged in and get user info
    const isLoggedIn = !!user;

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
            navigate('/login');
        }
    };

    const handleSearch = (term) => {
        if (term.trim()) {
            navigate(`/auctions?search=${encodeURIComponent(term.trim())}`);
        } else {
            navigate('/auctions');
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        handleSearch(searchTerm);
    };

    const handleMobileSearchSubmit = (e) => {
        e.preventDefault();
        handleSearch(mobileSearchTerm);
    };

    return (
        <nav style={{
            background: 'linear-gradient(135deg, #f8f6f0 0%, #f0ede5 50%, #e8e3d8 100%)', // Porcelain gradient
            borderBottom: '2px solid #d2691e', // Spice border
            boxShadow: '0 2px 12px rgba(210, 105, 30, 0.15)', // Warm spice shadow
            color: '#3a3530' // Warm charcoal text
        }} className="shadow-lg backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">

                    {/* Logo/Brand */}
                    <div className="flex items-center space-x-4">
                        <Link to="/" className="flex items-center space-x-3 group">
                            <div style={{
                                background: 'linear-gradient(135deg, #d2691e 0%, #b8541a 100%)', // Spice gradient
                                boxShadow: '0 3px 12px rgba(210, 105, 30, 0.4)'
                            }} className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                                <span className="text-2xl">🏛️</span>
                            </div>
                            <span style={{
                                background: 'linear-gradient(135deg, #d2691e 0%, #8b7d6b 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                            }} className="text-2xl font-bold">AuctionHub</span>
                        </Link>
                    </div>

                    {/* Search Bar */}
                    <div className="hidden md:flex flex-1 max-w-md mx-8">
                        <form onSubmit={handleSearchSubmit} className="relative w-full">
                            <input
                                type="text"
                                placeholder="Search auctions..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    background: 'rgba(248, 246, 240, 0.9)', // Porcelain with transparency
                                    borderColor: '#8b7d6b', // Mushroom border
                                    color: '#3a3530' // Warm charcoal text
                                }}
                                className="w-full px-5 py-3 rounded-xl border-2 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 backdrop-blur-sm transition-all duration-300"
                            />
                            <button
                                type="submit"
                                className="absolute right-3 top-3 text-orange-600 hover:text-orange-500 transition-colors text-lg"
                            >
                                🔍
                            </button>
                        </form>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex items-center space-x-6">

                        {/* Main Navigation */}
                        <div className="hidden md:flex space-x-6">
                            <Link
                                to="/"
                                className="relative px-4 py-2 font-medium text-gray-700 transition-colors duration-300 hover:text-orange-600 group"
                            >
                                Home
                                <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-300 group-hover:w-full group-hover:left-0"></span>
                            </Link>
                            <Link
                                to="/auctions"
                                className="relative px-4 py-2 font-medium text-gray-700 transition-colors duration-300 hover:text-orange-600 group"
                            >
                                Auctions
                                <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-300 group-hover:w-full group-hover:left-0"></span>
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
                                        style={{
                                            background: 'linear-gradient(135deg, #8b7d6b 0%, #6d6354 100%)', // Mushroom gradient
                                            boxShadow: '0 3px 12px rgba(139, 125, 107, 0.3)',
                                            color: '#f8f6f0' // Porcelain text
                                        }}
                                        className="hover:shadow-lg px-6 py-2 rounded-xl transition-all duration-300 font-medium transform hover:scale-105 border border-gray-400"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                /* Login Button */
                                <Link
                                    to="/login"
                                    style={{
                                        background: 'linear-gradient(135deg, #d2691e 0%, #b8541a 100%)', // Spice gradient
                                        boxShadow: '0 3px 12px rgba(210, 105, 30, 0.4)',
                                        color: '#f8f6f0' // Porcelain text
                                    }}
                                    className="hover:shadow-lg px-6 py-2 rounded-xl transition-all duration-300 font-medium transform hover:scale-105"
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