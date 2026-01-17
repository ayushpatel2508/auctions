import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gradient-to-r from-gray-900 via-purple-900 to-indigo-900 text-white mt-auto border-t border-purple-500/20 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">

                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Brand Section */}
                    <div className="space-y-6">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                                <span className="text-2xl">🏛️</span>
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">AuctionHub</span>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            Your trusted platform for online auctions.
                            Buy and sell with confidence in our secure marketplace.
                        </p>
                        <div className="flex items-center space-x-2 text-sm">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                            <span className="text-green-400 font-medium">Live & Secure</span>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-white">Quick Links</h3>
                        <div className="space-y-3">
                            <Link
                                to="/about"
                                className="block text-gray-300 hover:text-purple-400 transition-all duration-300 text-sm font-medium hover:translate-x-1"
                            >
                                📖 About Us
                            </Link>
                            <Link
                                to="/contact"
                                className="block text-gray-300 hover:text-purple-400 transition-all duration-300 text-sm font-medium hover:translate-x-1"
                            >
                                📞 Contact
                            </Link>
                            <Link
                                to="/terms"
                                className="block text-gray-300 hover:text-purple-400 transition-all duration-300 text-sm font-medium hover:translate-x-1"
                            >
                                📋 Terms of Service
                            </Link>
                            <Link
                                to="/privacy"
                                className="block text-gray-300 hover:text-purple-400 transition-all duration-300 text-sm font-medium hover:translate-x-1"
                            >
                                🔒 Privacy Policy
                            </Link>
                        </div>
                    </div>

                    {/* System Status */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-white">System Status</h3>
                        <div className="space-y-4 text-sm">
                            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                <div className="flex items-center space-x-3 mb-2">
                                    <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
                                    <span className="text-green-400 font-medium">All systems operational</span>
                                </div>
                                <div className="text-gray-300 space-y-1">
                                    <div>Version: <span className="text-purple-400 font-medium">2.0.0</span></div>
                                    <div>Last updated: <span className="text-purple-400 font-medium">Jan 2025</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/10 mt-12 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">

                        {/* Copyright */}
                        <div className="text-gray-300 text-sm">
                            © {currentYear} AuctionHub. All rights reserved. Made with ❤️
                        </div>

                        {/* Social Links */}
                        <div className="flex items-center space-x-6">
                            <span className="text-gray-400 text-sm">Follow us:</span>
                            <div className="flex items-center space-x-4">
                                <a
                                    href="#"
                                    className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-gray-300 hover:text-white hover:bg-purple-500/20 transition-all duration-300 hover:scale-110"
                                    aria-label="Twitter"
                                >
                                    🐦
                                </a>
                                <a
                                    href="#"
                                    className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-gray-300 hover:text-white hover:bg-purple-500/20 transition-all duration-300 hover:scale-110"
                                    aria-label="Facebook"
                                >
                                    📘
                                </a>
                                <a
                                    href="#"
                                    className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-gray-300 hover:text-white hover:bg-purple-500/20 transition-all duration-300 hover:scale-110"
                                    aria-label="LinkedIn"
                                >
                                    💼
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;