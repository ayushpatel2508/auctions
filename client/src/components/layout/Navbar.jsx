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
        <nav className="shadow-lg backdrop-blur-sm border-b-2" style={{
            background: 'var(--bg-primary)',
            borderBottomColor: 'var(--accent-primary)',
            boxShadow: '0 2px 12px rgba(210, 105, 30, 0.15)',
            color: 'var(--text-primary)'
        }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">

                    {/* Logo/Brand */}
                    <div className="flex items-center space-x-4">
                        <Link to="/" className="flex items-center space-x-3 group">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300" style={{
                                background: 'var(--gradient-primary)',
                                boxShadow: '0 3px 12px rgba(210, 105, 30, 0.4)'
                            }}>
                                <span className="text-2xl">🏛️</span>
                            </div>
                            <span className="text-2xl font-bold text-gradient">AuctionHub</span>
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
                                className="input w-full px-5 py-3 rounded-xl border-2 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 backdrop-blur-sm transition-all duration-300"
                            />
                            <button
                                type="submit"
                                className="absolute right-3 top-3 transition-colors text-lg"
                                style={{ color: 'var(--accent-primary)' }}
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
                                className="relative px-4 py-2 font-medium transition-colors duration-300 hover:text-orange-600 group"
                                style={{ color: 'var(--text-secondary)' }}
                            >
                                Home
                                <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-300 group-hover:w-full group-hover:left-0"></span>
                            </Link>
                            <Link
                                to="/auctions"
                                className="relative px-4 py-2 font-medium transition-colors duration-300 hover:text-orange-600 group"
                                style={{ color: 'var(--text-secondary)' }}
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
                                        className="btn btn-secondary hover:shadow-lg px-6 py-2 rounded-xl transition-all duration-300 font-medium transform hover:scale-105 border"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                /* Login Button */
                                <Link
                                    to="/login"
                                    className="btn btn-primary hover:shadow-lg px-6 py-2 rounded-xl transition-all duration-300 font-medium transform hover:scale-105"
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