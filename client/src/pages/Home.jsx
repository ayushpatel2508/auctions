import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { auctionAPI, userAPI } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import CreateAuction from '../components/CreateAuction';

const Home = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [joinedAuctions, setJoinedAuctions] = useState([]);
    const [createdAuctions, setCreatedAuctions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAllJoined, setShowAllJoined] = useState(false);
    const [showAllCreated, setShowAllCreated] = useState(false);

    useEffect(() => {
        // console.log("🔍 Home useEffect triggered");
        // console.log("🔍 isAuthenticated:", isAuthenticated);
        // console.log("🔍 user:", user);

        if (isAuthenticated) {
            // console.log("✅ User is authenticated, fetching auctions...");
            fetchUserAuctions();
        } else {
            // console.log("❌ User not authenticated, skipping fetch");
            setLoading(false);
        }
    }, [isAuthenticated]); // Remove fetchUserAuctions from dependencies

    const fetchUserAuctions = async () => {
        try {
            setLoading(true);
            // console.log("🔍 Starting fetchUserAuctions...");
            // console.log("🔍 User authenticated:", isAuthenticated);
            // console.log("🔍 Current user:", user);
            // console.log("🔍 Making API calls...");

            const [joinedRes, createdRes] = await Promise.all([
                userAPI.getJoinedAuctions(),
                userAPI.getMyAuctions()
            ]);

            // console.log("✅ Joined auctions response:", joinedRes);
            // console.log("✅ Created auctions response:", createdRes);

            // Sort by newest first (createdAt descending)
            const sortedJoined = (joinedRes.data.auctions || []).sort((a, b) =>
                new Date(b.createdAt) - new Date(a.createdAt)
            );
            const sortedCreated = (createdRes.data.auctions || []).sort((a, b) =>
                new Date(b.createdAt) - new Date(a.createdAt)
            );

            setJoinedAuctions(sortedJoined);
            setCreatedAuctions(sortedCreated);

        } catch (error) {
            console.error("❌ Error fetching user auctions:", error);
            console.error("❌ Error data:", error.response?.data);
        } finally {
            setLoading(false);
        }
    };

    const handleQuit = async (roomId) => {
        try {
            const ypos = window.scrollY
            // console.log("Quitting auction:", roomId)

            const res = await auctionAPI.quitAuction(roomId)
            // console.log("Quit successful:", res)

            // Remove from local state instead of refetching (better UX)
            setJoinedAuctions(prev => prev.filter(auction => auction.roomId !== roomId))

            window.scrollTo(0, ypos)
        }
        catch (err) {
            // console.log(err, "Error quitting auction")
            alert("Failed to quit auction")
        }
    }

    const handleDelete = async (roomId) => {
        try {
            const ypos = window.scrollY
            // console.log("Deleting auction:", roomId)

            const res = await auctionAPI.endAuction(roomId)
            // console.log("Delete successful:", res)

            // Remove from local state
            setCreatedAuctions(prev => prev.filter(auction => auction.roomId !== roomId))

            window.scrollTo(0, ypos)
        }
        catch (err) {
            // console.log(err, "Error deleting auction")
            alert("Failed to delete auction")
        }
    }

    const formatTimeLeft = (endTime) => {
        const now = new Date();
        const end = new Date(endTime);
        const timeDiff = Math.max(0, Math.floor((end - now) / 1000));

        if (timeDiff <= 0) return "Ended";

        const hours = Math.floor(timeDiff / 3600);
        const minutes = Math.floor((timeDiff % 3600) / 60);

        if (hours > 0) {
            return `${hours}h ${minutes}m left`;
        } else if (minutes > 0) {
            return `${minutes}m left`;
        } else {
            return `${timeDiff}s left`;
        }
    };

    const AuctionCard = ({ auction, cardType = "joined" }) => (
        <div className="card p-6 hover:transform hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{auction.title}</h3>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${auction.status === 'active'
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                    {auction.status === 'active' ? '🟢 Active' : '🔴 Ended'}
                </div>
            </div>

            <p className="text-gray-400 mb-6 line-clamp-2 text-sm leading-relaxed">
                {auction.description || 'No description provided'}
            </p>

            <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-lg p-3">
                        <p className="text-xs text-gray-400 mb-1">
                            {auction.status === 'active' ? 'Current Bid' : 'Final Bid'}
                        </p>
                        <p className="text-lg font-bold text-green-400">${auction.currentBid}</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-lg p-3">
                        <p className="text-xs text-gray-400 mb-1">Status</p>
                        <p className={`text-sm font-medium ${auction.status === 'active' ? 'text-green-400' : 'text-red-400'
                            }`}>
                            {auction.status === 'active' ? formatTimeLeft(auction.endTime) : 'Ended'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {auction.createdBy.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-gray-400">Created by</span>
                    <span className="text-sm text-white font-medium">{auction.createdBy}</span>
                </div>

                {/* Action Buttons */}
                <div className="pt-2">
                    {cardType === "created" ? (
                        // For created auctions
                        auction.status === 'active' ? (
                            <button
                                onClick={() => handleDelete(auction.roomId)}
                                className="btn btn-error w-full text-sm"
                            >
                                <span>🗑️</span>
                                Delete Auction
                            </button>
                        ) : (
                            <div className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 border border-purple-500/30 rounded-lg p-3 text-center">
                                <span className="text-purple-400 font-medium text-sm">
                                    {auction.winner ? `🏆 Won by: ${auction.winner}` : '❌ No winner'}
                                </span>
                            </div>
                        )
                    ) : (
                        // For joined auctions
                        auction.status === 'active' ? (
                            <button
                                onClick={() => handleQuit(auction.roomId)}
                                className="btn btn-warning w-full text-sm"
                            >
                                <span>🚪</span>
                                Quit Auction
                            </button>
                        ) : (
                            <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/30 rounded-lg p-3 text-center">
                                <span className={`font-medium text-sm ${auction.winner === user ? 'text-green-400' : 'text-blue-400'
                                    }`}>
                                    {auction.winner === user ? '🏆 You Won!' :
                                        auction.winner ? `🏆 Won by: ${auction.winner}` :
                                            '❌ Ended - No Winner'}
                                </span>
                            </div>
                        )
                    )}
                </div>
            </div>

            <button
                onClick={() => navigate(`/auction/${auction.roomId}`)}
                className={`btn w-full ${auction.status === 'active' ? 'btn-primary' : 'btn-secondary'}`}
            >
                <span>{auction.status === 'active' ? '🎯' : '📊'}</span>
                {auction.status === 'active' ? 'View Auction' : 'View Results'}
            </button>
        </div>
    );

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
                <div className="card p-12 text-center max-w-lg mx-auto">
                    <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-8">
                        <span className="text-4xl">🏛️</span>
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-6">
                        Welcome to MyAuction
                    </h1>
                    <p className="text-xl text-gray-400 mb-10 leading-relaxed">
                        Join the excitement of live bidding! Please log in to view your auctions and participate in real-time bidding.
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        className="btn btn-primary text-lg px-8 py-4"
                    >
                        <span>🚀</span>
                        Login to Continue
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-6"></div>
                    <p className="text-gray-400 text-lg">Loading your auctions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <div className="container mx-auto px-6 py-12">
                {/* Welcome Section */}
                <div className="text-center mb-16">
                    <div className="flex items-center justify-center gap-4 mb-6">

                        <div className="text-left">
                            <h1 className="text-4xl font-bold text-white">
                                Welcome back, <span className="text-gradient">{user}</span>!
                            </h1>
                            <p className="text-xl text-gray-400 mt-2">
                                Manage your auctions and continue bidding
                            </p>
                        </div>
                    </div>
                </div>

                {/* Joined Auctions Section */}
                <div className="mb-16">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-2">
                                Joined Auctions ({joinedAuctions.length})
                            </h2>
                            <p className="text-gray-400">Active auctions + past month results</p>
                        </div>
                        <button
                            onClick={() => navigate('/auctions')}
                            className="btn btn-secondary"
                        >
                            <span>🔍</span>
                            Browse All Auctions
                        </button>
                    </div>

                    {joinedAuctions.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {joinedAuctions.slice(0, showAllJoined ? joinedAuctions.length : 5).map((auction) => (
                                    <AuctionCard key={auction._id} auction={auction} cardType="joined" />
                                ))}
                            </div>

                            {joinedAuctions.length > 5 && (
                                <div className="text-center mt-8">
                                    <button
                                        onClick={() => setShowAllJoined(!showAllJoined)}
                                        className="btn btn-ghost"
                                    >
                                        <span>{showAllJoined ? '📤' : '📥'}</span>
                                        {showAllJoined ? 'Show Less' : `Show More (${joinedAuctions.length - 5} more)`}
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="card p-12 text-center">
                            <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-3xl text-gray-500">🎯</span>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-4">No Joined Auctions</h3>
                            <p className="text-gray-400 mb-8">You haven't joined any auctions yet. Start bidding to see them here!</p>
                            <button
                                onClick={() => navigate('/auctions')}
                                className="btn btn-primary"
                            >
                                <span>🔍</span>
                                Browse Auctions
                            </button>
                        </div>
                    )}
                </div>

                {/* Created Auctions Section */}
                <div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-2">
                                Your Auctions ({createdAuctions.length})
                            </h2>
                            <p className="text-gray-400">Auctions you've created</p>
                        </div>
                        <CreateAuction onAuctionCreated={fetchUserAuctions}>
                            <button className="btn btn-success">
                                <span>✨</span>
                                Create New Auction
                            </button>
                        </CreateAuction>
                    </div>

                    {createdAuctions.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {createdAuctions.slice(0, showAllCreated ? createdAuctions.length : 5).map((auction) => (
                                    <AuctionCard key={auction._id} auction={auction} cardType="created" />
                                ))}
                            </div>

                            {createdAuctions.length > 5 && (
                                <div className="text-center mt-8">
                                    <button
                                        onClick={() => setShowAllCreated(!showAllCreated)}
                                        className="btn btn-ghost"
                                    >
                                        <span>{showAllCreated ? '📤' : '📥'}</span>
                                        {showAllCreated ? 'Show Less' : `Show More (${createdAuctions.length - 5} more)`}
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="card p-12 text-center">
                            <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-3xl text-gray-500">🏛️</span>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-4">No Created Auctions</h3>
                            <p className="text-gray-400 mb-8">You haven't created any auctions yet. Start your first auction today!</p>
                            <CreateAuction onAuctionCreated={fetchUserAuctions}>
                                <button className="btn btn-success">
                                    <span>✨</span>
                                    Create Your First Auction
                                </button>
                            </CreateAuction>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Home;