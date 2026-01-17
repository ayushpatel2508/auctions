import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { auctionAPI } from '../utils/api';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogTrigger,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';

const CreateAuction = ({ children, onAuctionCreated }) => {
    const { user, isAuthenticated } = useAuth();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [toasts, setToasts] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startingPrice: '',
        duration: '60' // Default 60 minutes
    });

    // Toast notification function
    const showToast = (message, type = 'info', duration = 5000) => {
        const id = Date.now() + Math.random()
        const newToast = {
            id,
            message,
            type, // 'info', 'success', 'warning', 'error'
            timestamp: new Date().toLocaleTimeString()
        }

        setToasts(prev => [...prev, newToast])

        // Auto remove toast after duration
        setTimeout(() => {
            setToasts(prev => prev.filter(toast => toast.id !== id))
        }, duration)
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log("🔥 CREATE AUCTION - Form submitted")
        console.log("🔥 Form data:", formData)
        console.log("🔥 Is authenticated:", isAuthenticated)
        console.log("🔥 User:", user)

        if (!isAuthenticated) {
            console.log("❌ User not authenticated")
            showToast('Please login to create auctions', 'warning')
            return;
        }

        try {
            setLoading(true);
            console.log("🔥 Starting auction creation...")

            const auctionData = {
                ...formData,
                startingPrice: parseFloat(formData.startingPrice),
                duration: parseInt(formData.duration)
            };

            console.log("🔥 Auction data to send:", auctionData)

            const response = await auctionAPI.createAuction(auctionData);
            console.log("🔥 API Response:", response)

            if (response.data.success) {
                console.log("✅ Auction created successfully!")
                showToast('Auction created successfully!', 'success')
                setDialogOpen(false);

                // Reset form
                setFormData({
                    title: '',
                    description: '',
                    startingPrice: '',
                    duration: '60'
                });

                // Callback to refresh parent component
                if (onAuctionCreated) {
                    onAuctionCreated();
                }
            }
        } catch (error) {
            console.error('🔥 Error creating auction:', error);
            console.error('🔥 Error response:', error.response?.data)
            const errorMsg = error.response?.data?.msg || 'Failed to create auction';
            showToast(`Error: ${errorMsg}`, 'error')
        } finally {
            setLoading(false);
        }
    };

    return (

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-900 via-purple-900/50 to-indigo-900/50 border border-purple-500/20 backdrop-blur-xl">
                <DialogHeader className="text-center pb-2">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/25">
                        <span className="text-3xl">🏛️</span>
                    </div>
                    <DialogTitle className="text-2xl font-bold text-white">Create New Auction</DialogTitle>
                    <DialogDescription className="text-gray-300">
                        Fill in the details to start your auction and reach bidders worldwide
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-white mb-3 flex items-center gap-2">
                            <span className="text-purple-400">📝</span>
                            Auction Title *
                        </label>
                        <Input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Enter auction title"
                            className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-purple-400 focus:ring-purple-400/50 rounded-xl h-12"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white mb-3 flex items-center gap-2">
                            <span className="text-purple-400">📄</span>
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none"
                            placeholder="Describe your auction item in detail..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-white mb-3 flex items-center gap-2">
                                <span className="text-purple-400">💰</span>
                                Starting Price ($) *
                            </label>
                            <Input
                                type="number"
                                name="startingPrice"
                                value={formData.startingPrice}
                                onChange={handleChange}
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-purple-400 focus:ring-purple-400/50 rounded-xl h-12"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white mb-3 flex items-center gap-2">
                                <span className="text-purple-400">⏰</span>
                                Duration *
                            </label>
                            <select
                                name="duration"
                                value={formData.duration}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent h-12"
                                required
                            >
                                <option value="15" className="bg-gray-800">15 minutes</option>
                                <option value="30" className="bg-gray-800">30 minutes</option>
                                <option value="60" className="bg-gray-800">1 hour</option>
                                <option value="120" className="bg-gray-800">2 hours</option>
                                <option value="360" className="bg-gray-800">6 hours</option>
                                <option value="720" className="bg-gray-800">12 hours</option>
                                <option value="1440" className="bg-gray-800">24 hours</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 p-6 rounded-2xl">
                        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                            <span className="text-purple-400">👁️</span>
                            Auction Preview
                        </h3>
                        <div className="text-sm text-gray-300 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-400">Title:</span>
                                <span className="text-white font-medium">{formData.title || 'Not set'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-400">Starting Price:</span>
                                <span className="text-green-400 font-medium">${formData.startingPrice || '0.00'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-400">Duration:</span>
                                <span className="text-purple-400 font-medium">{formData.duration} minutes</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-400">Created by:</span>
                                <span className="text-indigo-400 font-medium">{user}</span>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="flex gap-4 pt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setDialogOpen(false)}
                            className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl px-6"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || !formData.title || !formData.startingPrice}
                            className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold rounded-xl px-8 shadow-lg shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Creating...
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <span>🚀</span>
                                    Create Auction
                                </div>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>

            {/* Toast Notifications Container */}
            <div className="fixed bottom-6 right-6 z-50 space-y-3">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`
                        max-w-sm p-4 rounded-2xl shadow-2xl transform transition-all duration-300 ease-in-out backdrop-blur-xl border
                            ${toast.type === 'success' ? 'bg-green-500/90 text-white border-green-400/50' :
                                toast.type === 'error' ? 'bg-red-500/90 text-white border-red-400/50' :
                                    toast.type === 'warning' ? 'bg-yellow-500/90 text-white border-yellow-400/50' :
                                        'bg-blue-500/90 text-white border-blue-400/50'
                            }
                            `}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 mt-0.5">
                                    {toast.type === 'success' && <span className="text-lg">✅</span>}
                                    {toast.type === 'error' && <span className="text-lg">❌</span>}
                                    {toast.type === 'warning' && <span className="text-lg">⚠️</span>}
                                    {toast.type === 'info' && <span className="text-lg">ℹ️</span>}
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm font-medium whitespace-pre-line">
                                        {toast.message}
                                    </div>
                                    <div className="text-xs opacity-75 mt-1">
                                        {toast.timestamp}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                                className="ml-3 text-white hover:text-gray-200 transition-colors text-lg"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </Dialog>
    );
};

export default CreateAuction;