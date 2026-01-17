import React, { useEffect, useRef, useState } from 'react';
import { auctionAPI } from '../utils/api';
import { useParams } from 'react-router-dom';
import { io } from "socket.io-client";
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';

const SingleAuctions = () => {
    const { roomId } = useParams();
    const { user } = useAuth();

    // 🔥 Use useRef for socket to prevent multiple connections
    const socketRef = useRef(null);
    const [auctionData, setAuctionData] = useState(null);
    const [hasJoined, setHasJoined] = useState(false);
    const [bid, setBid] = useState(null);
    const [bidHistory, setBidHistory] = useState([]); // Separate state for bid history
    const [timeLeft, setTimeLeft] = useState(null); // Time remaining in seconds
    const [auctionEnded, setAuctionEnded] = useState(false); // Track if auction ended
    const [onlineUsers, setOnlineUsers] = useState([]); // Track online users in auction
    const [toasts, setToasts] = useState([]); // Toast notifications
    // Early returns BEFORE hooks
    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
                <div className="card p-8 text-center max-w-md mx-auto">
                    <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <span className="text-3xl">🔐</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-4">Authentication Required</h2>
                    <p className="text-gray-400 mb-8">Please log in to access auction rooms and participate in bidding.</p>
                    <a
                        href="/login"
                        className="btn btn-primary w-full"
                    >
                        <span>🚀</span>
                        Go to Login
                    </a>
                </div>
            </div>
        );
    }

    if (!roomId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
                <div className="card p-8 text-center max-w-md mx-auto">
                    <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <span className="text-3xl text-red-400">❌</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-4">Room Not Found</h2>
                    <p className="text-gray-400 mb-8">The auction room ID is missing or invalid.</p>
                    <a
                        href="/auctions"
                        className="btn btn-secondary w-full"
                    >
                        <span>🏠</span>
                        Browse Auctions
                    </a>
                </div>
            </div>
        );
    }
    // Toast notification function
    const showToast = (message, type = 'info', duration = 5000) => {
        const id = Date.now() + Math.random();
        const newToast = {
            id,
            message,
            type, // 'info', 'success', 'warning', 'error'
            timestamp: new Date().toLocaleTimeString()
        };
        setToasts(prev => [...prev, newToast]);

        // Auto remove toast after duration
        setTimeout(() => {
            setToasts(prev => prev.filter(toast => toast.id !== id));
        }, duration);
    };

    const fetchAuctionSingle = async () => {
        try {
            const res = await auctionAPI.getAuction(roomId);
            setAuctionData(res.data);

            // Set online users from auction data
            if (res.data.auction?.onlineUsers) {
                setOnlineUsers(res.data.auction.onlineUsers);
            }

            // Calculate initial time left
            if (res.data.auction?.endTime) {
                const endTime = new Date(res.data.auction.endTime);
                const now = new Date();
                const timeDiff = Math.max(0, Math.floor((endTime - now) / 1000));
                setTimeLeft(timeDiff);

                // Check if auction already ended
                if (timeDiff <= 0 || res.data.auction.status === 'ended') {
                    setAuctionEnded(true);
                }
            }
        } catch (error) {
            console.error("Error fetching auction:", error);
        }
    };

    const fetchBidHistory = async () => {
        try {
            // We need to create an API endpoint to get bid history
            const res = await auctionAPI.getBidHistory(roomId);
            setBidHistory(res.data);
        } catch (error) {
            console.error("Error fetching bid history:", error);
        }
    };
    // Format time left into readable string
    const formatTimeLeft = (seconds) => {
        if (seconds <= 0) return "Auction Ended";

        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    };

    // Handle auction end
    const handleAuctionEnd = async () => {
        try {
            setAuctionEnded(true);
            setHasJoined(false);
            showToast("Auction has ended! You have been removed from the auction room.", 'warning');

            // Optionally redirect to auctions list after a delay
            setTimeout(() => {
                window.location.href = '/auctions';
            }, 3000);
        } catch (error) {
            console.error("Error handling auction end:", error);
        }
    };
    // Main useEffect - runs once when component mounts
    useEffect(() => {
        // Create socket only once
        if (!socketRef.current) {
            socketRef.current = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
                autoConnect: true,
                transports: ['websocket', 'polling']
            });
        }

        const socket = socketRef.current;

        // Fetch auction data and bid history
        fetchAuctionSingle();
        fetchBidHistory();

        // Set up socket event listeners
        const handleAuctionJoined = (message) => {
            setHasJoined(true);
            console.log("Auction joined:", message);
            // Don't show alert for own join, just log it
            // fetchAuctionSingle(); // Remove this to prevent unnecessary API calls
        };

        const handleConnect = () => {
            // Add a small delay to ensure connection is stable
            setTimeout(() => {
                if (user && roomId) {
                    socket.emit("join-auction", { roomId, username: user });
                }
            }, 100);
        };

        const handleDisconnect = () => {
            setHasJoined(false);
        };

        const handleConnectError = (error) => {
            console.error("Socket connection error:", error);
        };

        // Handle socket errors (like user not found)
        const handleSocketError = (errorMessage) => {
            console.error("Socket error:", errorMessage);
            showToast(`Error: ${errorMessage}`, 'error');

            if (errorMessage.includes("User not found")) {
                if (confirm("User not found. Would you like to register?")) {
                    window.location.href = '/register';
                }
            }
        };

        // Handle consecutive bid error
        const handleConsecutiveBidError = (data) => {
            console.log("Consecutive bid error:", data);
            showToast(`⚠️ ${data.message}`, 'warning', 4000);
        };
        // Handle bid updates
        const handleBidUpdate = (data) => {
            // Update auction data with new bid
            if (auctionData) {
                setAuctionData(prev => ({
                    ...prev,
                    auction: {
                        ...prev.auction,
                        currentBid: data.highestBid,
                        highestBidder: data.highestBidder
                    }
                }));
            }

            // Refresh bid history when new bid is placed
            fetchBidHistory();
        };

        // Handle auction ended from server
        const handleAuctionEnded = (data) => {
            setAuctionEnded(true);
            setHasJoined(false);

            // Show detailed final stats
            const statsMessage = `🏆 AUCTION ENDED! 🏆

📋 Final Results:
• Title: ${data.finalStats?.title || 'Unknown'}
• ${data.showWinner && data.winner ? `Winner: ${data.winner}` : 'No Winner'}
• ${data.showWinner ? `Final Price: $${data.finalPrice || 0}` : `Highest Bid: $${data.finalStats?.highestBid || 0}`}
• Total Bids: ${data.finalStats?.totalBids || 0}
• Starting Price: $${data.finalStats?.startingPrice || 0}

${data.message}

You will be redirected to the auctions page in a few seconds...`.trim();

            showToast("🏆 Auction has ended! Click 'View Auction' to see final results.", 'warning', 8000);

            // Redirect after showing stats
            setTimeout(() => {
                window.location.href = '/auctions';
            }, 8000);
        };

        // Handle auction deleted by creator
        const handleAuctionDeleted = (data) => {
            setAuctionEnded(true);
            setHasJoined(false);

            // Show deletion notice with final stats (no winner)
            const statsMessage = `🗑️ AUCTION DELETED! 🗑️

The creator has deleted this auction.

📋 Final Stats:
• Title: ${data.finalStats?.title || 'Unknown'}
• Highest Bid: $${data.finalStats?.highestBid || 0}
• Highest Bidder: ${data.finalStats?.highestBidder || 'None'}
• Total Bids: ${data.finalStats?.totalBids || 0}
• Starting Price: $${data.finalStats?.startingPrice || 0}

⚠️ No winner declared as auction was deleted.

You will be redirected to the auctions page...`.trim();

            showToast("🗑️ Auction has been deleted by creator! Click 'View Auction' to see final stats.", 'warning', 6000);

            // Immediate redirect for deletion
            setTimeout(() => {
                window.location.href = '/auctions';
            }, 3000);
        };
        // Handle user quit notification
        const handleUserQuit = (data) => {
            console.log("User quit auction - received data:", data);

            // Show toast for manual quits and disconnections
            if (data.showAlert && data.message) {
                showToast(data.message, 'warning');
            }

            // Update online users list with the updated list from server
            console.log("Updating online users to:", data.onlineUsers);
            setOnlineUsers(data.onlineUsers || []);
        };

        // Handle online users update (when someone joins)
        const handleOnlineUsersUpdate = (data) => {
            console.log("Online users updated:", data);
            setOnlineUsers(data.onlineUsers || []);
        };

        // Handle user joined notification (only received by OTHER users, not the joiner)
        const handleUserJoinedNotification = (data) => {
            console.log("User joined notification:", data);
            showToast(`${data.username} joined the auction`, 'info');
        };

        // Add event listeners
        socket.on("auction-joined", handleAuctionJoined);
        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);
        socket.on("connect_error", handleConnectError);
        socket.on("error", handleSocketError);
        socket.on("consecutive-bid-error", handleConsecutiveBidError); // Listen for consecutive bid errors
        socket.on("bid-update", handleBidUpdate);
        socket.on("auction-ended", handleAuctionEnded); // Listen for auction end
        socket.on("auction-deleted", handleAuctionDeleted); // Listen for auction deletion
        socket.on("online-users-updated", handleOnlineUsersUpdate); // Listen for online users updates
        socket.on("user-joined-notification", handleUserJoinedNotification); // Listen for user join notifications
        socket.on("user-quit-auction", handleUserQuit); // Listen for user quit

        // If already connected, emit join-auction immediately
        if (socket.connected) {
            socket.emit("join-auction", { roomId, username: user });
        }

        // Cleanup function - only remove listeners, don't close socket
        return () => {
            socket.off("auction-joined", handleAuctionJoined);
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);
            socket.off("connect_error", handleConnectError);
            socket.off("error", handleSocketError);
            socket.off("consecutive-bid-error", handleConsecutiveBidError); // Remove consecutive bid error listener
            socket.off("bid-update", handleBidUpdate);
            socket.off("auction-ended", handleAuctionEnded); // Remove auction end listener
            socket.off("auction-deleted", handleAuctionDeleted); // Remove auction deleted listener
            socket.off("user-quit-auction", handleUserQuit); // Remove user quit listener
            socket.off("online-users-updated", handleOnlineUsersUpdate); // Remove online users update listener
            socket.off("user-joined-notification", handleUserJoinedNotification); // Remove user joined notification listener
        };
    }, [roomId, user]); // Only depend on roomId and user, not hasJoined
    // Countdown timer effect
    useEffect(() => {
        if (timeLeft === null || auctionEnded) return;

        const timer = setInterval(() => {
            setTimeLeft(prevTime => {
                if (prevTime <= 1) {
                    // Auction ended
                    handleAuctionEnd();
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, auctionEnded]);

    // Cleanup socket on component unmount only
    useEffect(() => {
        return () => {
            // Only close socket connection, don't emit leave-auction for route changes
            if (socketRef.current) {
                socketRef.current.close();
                socketRef.current = null;
            }
        };
    }, []);

    const placeBid = async () => {
        if (!bid || !hasJoined || !socketRef.current || auctionEnded) {
            if (auctionEnded) {
                showToast("Auction has ended. No more bids allowed.", 'warning');
            }
            return;
        }

        // Client-side check for consecutive bidding
        if (auctionData?.auction?.highestBidder === user) {
            showToast("⚠️ You cannot place consecutive bids. Wait for another user to bid first.", 'warning', 4000);
            return;
        }

        const socket = socketRef.current;
        const bidData = {
            roomId: roomId,
            username: user,
            bidAmount: parseFloat(bid)
        };

        socket.emit("place-bid", bidData);
        setBid('');
    };
    const handleQuitAuction = async () => {
        if (!hasJoined || !socketRef.current) return;

        console.log("🔥 QUIT AUCTION - Starting process...");
        console.log("🔥 Current user:", user);
        console.log("🔥 Auction creator:", auctionData?.auction?.createdBy);
        console.log("🔥 Is creator:", auctionData?.auction?.createdBy === user);

        const confirmQuit = confirm("Are you sure you want to leave this auction? You can rejoin later if it's still active.");

        if (confirmQuit) {
            try {
                console.log("🔥 User confirmed quit, calling API...");

                // Call API to quit auction (this will handle server-side cleanup)
                const response = await auctionAPI.quitAuction(roomId);
                console.log("🔥 API Response:", response);

                // Emit leave-auction to socket with manual quit reason
                console.log("🔥 Emitting leave-auction socket event...");
                socketRef.current.emit("leave-auction", {
                    roomId,
                    username: user,
                    reason: "manual_quit"
                });

                // Update local state
                setHasJoined(false);
                showToast("You have successfully left the auction.", 'success');

                // Optionally redirect to auctions list
                setTimeout(() => {
                    window.location.href = '/auctions';
                }, 1000);

            } catch (error) {
                console.error("🔥 Error quitting auction:", error);
                console.error("🔥 Error details:", error.response?.data || error.message);
                showToast(`Failed to leave auction: ${error.response?.data?.msg || error.message}`, 'error');
            }
        }
    };
    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
                <div className="container mx-auto px-6 py-8">

                    {/* Header Section */}
                    <div className="mb-8">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                                <span className="text-2xl">🏛️</span>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white">Auction Room</h1>
                                <p className="text-gray-400">Room ID: <span className="text-indigo-400 font-mono">{roomId}</span></p>
                            </div>
                        </div>
                    </div>

                    {/* Status Card */}
                    <div className="card mb-8 p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                                    <span className="text-indigo-400">👤</span>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Current User</p>
                                    <p className="font-semibold text-white">{user}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${hasJoined ? 'bg-green-500/20' : 'bg-yellow-500/20'
                                    }`}>
                                    <span className={hasJoined ? 'text-green-400' : 'text-yellow-400'}>
                                        {hasJoined ? '✅' : '⏳'}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Connection</p>
                                    <p className={`font-semibold ${hasJoined ? 'text-green-400' : 'text-yellow-400'}`}>
                                        {hasJoined ? 'Connected' : 'Connecting...'}
                                    </p>
                                </div>
                            </div>
                            {/* Timer - Only show if auction is active */}
                            {!auctionEnded && (
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${timeLeft <= 60 ? 'bg-red-500/20' :
                                        timeLeft <= 300 ? 'bg-yellow-500/20' : 'bg-green-500/20'
                                        }`}>
                                        <span className={
                                            timeLeft <= 60 ? 'text-red-400' :
                                                timeLeft <= 300 ? 'text-yellow-400' : 'text-green-400'
                                        }>⏰</span>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400">Time Left</p>
                                        <p className={`font-semibold font-mono ${timeLeft <= 60 ? 'text-red-400 animate-pulse' :
                                            timeLeft <= 300 ? 'text-yellow-400' : 'text-green-400'
                                            }`}>
                                            {timeLeft !== null ? formatTimeLeft(timeLeft) : 'Loading...'}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {auctionEnded && (
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                                        <span className="text-red-400">🔴</span>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400">Status</p>
                                        <p className="font-semibold text-red-400">Auction Ended</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Main Auction Content */}
                    {auctionData && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                            {/* Left Column - Auction Details */}
                            <div className="lg:col-span-2 space-y-6">

                                {/* Auction Info Card */}
                                <div className="card p-8">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex-1">
                                            <h2 className="text-3xl font-bold text-white mb-3">{auctionData.auction?.title}</h2>
                                            <p className="text-gray-400 text-lg">{auctionData.auction?.description || 'No description provided'}</p>
                                        </div>
                                        <div className={`px-4 py-2 rounded-full text-sm font-semibold ${auctionData.auction?.status === 'active'
                                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                            }`}>
                                            {auctionData.auction?.status === 'active' ? '🟢 Active' : '🔴 Ended'}
                                        </div>
                                    </div>

                                    {/* Auction Stats Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                        <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl p-6">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                                                    <span className="text-green-400 text-xl">💰</span>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-400">
                                                        {auctionData.auction?.status === 'active' ? 'Current Bid' : 'Final Bid'}
                                                    </p>
                                                    <p className="text-2xl font-bold text-green-400">
                                                        ${auctionData.auction?.currentBid || auctionData.auction?.startingPrice || 0}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-6">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                                    <span className="text-blue-400 text-xl">👤</span>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-400">Created By</p>
                                                    <p className="text-lg font-semibold text-white">{auctionData.auction?.createdBy}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {auctionData.auction?.status === 'ended' && (
                                            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-6">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                                        <span className="text-purple-400 text-xl">🏆</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-400">Winner</p>
                                                        <p className="text-lg font-semibold text-purple-400">
                                                            {auctionData.auction?.winner || auctionData.auction?.highestBidder || 'No winner'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Bid History Section - Only show for active auctions */}
                                    {auctionData.auction?.status === 'active' && (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                                                    <span>📊</span>
                                                    Recent Bids
                                                </h3>
                                                <div className="text-sm text-gray-400">
                                                    {bidHistory?.length || 0} total bids
                                                </div>
                                            </div>

                                            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/30 border border-gray-700/50 rounded-xl p-6">
                                                {bidHistory?.length > 0 ? (
                                                    <div className="space-y-3 max-h-80 overflow-y-auto">
                                                        {bidHistory.map((bid, index) => (
                                                            <div key={index} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-700/30 hover:border-gray-600/50 transition-colors">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                                                        {bid.username.charAt(0).toUpperCase()}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-medium text-white">{bid.username}</p>
                                                                        <p className="text-xs text-gray-400">
                                                                            {new Date(bid.placedAt).toLocaleDateString()} at {new Date(bid.placedAt).toLocaleTimeString()}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-xl font-bold text-green-400">${bid.amount}</p>
                                                                    {index === 0 && (
                                                                        <span className="text-xs text-green-400 font-medium">Highest Bid</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-12">
                                                        <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                            <span className="text-3xl text-gray-500">📝</span>
                                                        </div>
                                                        <p className="text-gray-400 text-lg">No bids yet</p>
                                                        <p className="text-gray-500 text-sm mt-1">Be the first to place a bid!</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {/* Bidding Section - Only for active auctions */}
                                {auctionData.auction?.status === 'active' && !auctionEnded && (
                                    <div className="card p-8">
                                        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                            <span className="text-3xl">🎯</span>
                                            Place Your Bid
                                        </h3>

                                        <div className="space-y-6">
                                            {/* Current Highest Bidder Alert */}
                                            {auctionData.auction?.highestBidder === user && (
                                                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                                                    <p className="text-green-400 text-sm flex items-center gap-2">
                                                        <span>🏆</span>
                                                        You are currently the highest bidder! Wait for others to bid before placing another bid.
                                                    </p>
                                                </div>
                                            )}

                                            <div className="flex gap-4">
                                                <div className="flex-1">
                                                    <input
                                                        type="number"
                                                        value={bid || ''}
                                                        onChange={(e) => setBid(e.target.value)}
                                                        placeholder="Enter bid amount"
                                                        className="input text-lg"
                                                        disabled={auctionEnded || !hasJoined || auctionData.auction?.highestBidder === user}
                                                        min={auctionData.auction?.currentBid ? auctionData.auction.currentBid + 1 : auctionData.auction?.startingPrice}
                                                    />
                                                    <p className="text-sm text-gray-400 mt-2">
                                                        Minimum bid: ${(auctionData.auction?.currentBid || auctionData.auction?.startingPrice || 0) + 1}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={placeBid}
                                                    disabled={!bid || !hasJoined || auctionEnded || auctionData.auction?.highestBidder === user}
                                                    className="btn btn-primary px-8 py-4 text-lg"
                                                >
                                                    <span>🚀</span>
                                                    {auctionData.auction?.highestBidder === user ? 'You\'re Winning!' : 'Place Bid'}
                                                </button>
                                            </div>

                                            {/* {!hasJoined && !auctionEnded && (
                                                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                                                    <p className="text-yellow-400 text-sm flex items-center gap-2">
                                                        <span>⏳</span>
                                                        Connecting to auction room... Please wait.
                                                    </p>
                                                </div>
                                            )} */}

                                            {auctionEnded && (
                                                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                                                    <p className="text-red-400 text-sm flex items-center gap-2">
                                                        <span>🔒</span>
                                                        Auction has ended - bidding is closed
                                                    </p>
                                                </div>
                                            )}
                                            {/* Quit Auction Button - Only for non-creators */}
                                            {hasJoined && !auctionEnded && auctionData.auction?.createdBy !== user && (
                                                <div className="pt-6 border-t border-gray-700">
                                                    <button
                                                        onClick={handleQuitAuction}
                                                        className="btn btn-ghost text-red-400 hover:bg-red-500/10 hover:border-red-500/30"
                                                    >
                                                        <span>🚪</span>
                                                        Leave Auction
                                                    </button>
                                                    <p className="text-xs text-gray-500 mt-2">
                                                        You can rejoin this auction later if it's still active
                                                    </p>
                                                </div>
                                            )}

                                            {/* Creator Info */}
                                            {hasJoined && !auctionEnded && auctionData.auction?.createdBy === user && (
                                                <div className="pt-6 border-t border-gray-700">
                                                    <div className="bg-gradient-to-r from-indigo-500/10 to-purple-600/10 border border-indigo-500/30 rounded-lg p-4 mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-2xl">👑</span>
                                                            <div>
                                                                <p className="text-indigo-400 font-medium">You are the auction creator</p>
                                                                <p className="text-gray-400 text-sm">As the creator, you can leave the auction and let it continue without you.</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={handleQuitAuction}
                                                        className="btn btn-ghost text-red-400 hover:bg-red-500/10 hover:border-red-500/30"
                                                    >
                                                        <span>🚪</span>
                                                        Leave Auction
                                                    </button>
                                                    <p className="text-xs text-gray-500 mt-2">
                                                        The auction will continue running even after you leave
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Auction Ended Message */}
                                {auctionEnded && (
                                    <div className="card p-8 text-center">
                                        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <span className="text-4xl text-red-400">🏁</span>
                                        </div>
                                        <h3 className="text-2xl font-bold text-red-400 mb-4">Auction Ended!</h3>
                                        <div className="space-y-2 text-gray-300">
                                            {auctionData?.auction?.highestBidder ? (
                                                <>
                                                    <p className="text-lg">
                                                        <span className="text-purple-400 font-semibold">Winner:</span> {auctionData.auction.highestBidder}
                                                    </p>
                                                    <p className="text-lg">
                                                        <span className="text-green-400 font-semibold">Final Bid:</span> ${auctionData.auction.currentBid}
                                                    </p>
                                                </>
                                            ) : (
                                                <p className="text-lg text-gray-400">No bids were placed</p>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500 mt-6">Redirecting to auctions list in a few seconds...</p>
                                    </div>
                                )}
                            </div>
                            {/* Right Column - Online Users & Status (Only for active auctions) */}
                            {auctionData.auction?.status === 'active' && (
                                <div className="space-y-6">

                                    {/* Online Users Card */}
                                    <div className="card p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                                                <span>👥</span>
                                                Online Users
                                            </h3>
                                            <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-semibold border border-green-500/30">
                                                {onlineUsers.length} active
                                            </div>
                                        </div>

                                        <div className="space-y-3 max-h-80 overflow-y-auto">
                                            {onlineUsers.length > 0 ? (
                                                onlineUsers.map((username, index) => (
                                                    <div
                                                        key={index}
                                                        className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${username === user
                                                            ? 'bg-gradient-to-r from-indigo-500/20 to-purple-600/20 border border-indigo-500/30'
                                                            : 'bg-gray-800/30 border border-gray-700/30 hover:border-gray-600/50'
                                                            }`}
                                                    >
                                                        <div className="relative">
                                                            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                                                {username.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900 animate-pulse"></div>
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className={`font-medium ${username === user ? 'text-indigo-400' : 'text-white'}`}>
                                                                {username === user ? `${username} (You)` : username}
                                                            </p>
                                                            {auctionData.auction?.createdBy === username && (
                                                                <span className="inline-block bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded-full border border-yellow-500/30 mt-1">
                                                                    👑 Creator
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-8">
                                                    <div className="w-12 h-12 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-3">
                                                        <span className="text-2xl text-gray-500">👤</span>
                                                    </div>
                                                    <p className="text-gray-400">No users online</p>
                                                    <p className="text-gray-500 text-sm mt-1">Be the first to join!</p>
                                                </div>
                                            )}
                                        </div>
                                        {/* Live Status Indicator */}
                                        <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-between text-xs">
                                            <span className="flex items-center gap-2 text-green-400">
                                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                                Live updates enabled
                                            </span>
                                            <span className="text-gray-500">{new Date().toLocaleTimeString()}</span>
                                        </div>
                                    </div>

                                    {/* Connection Status Card */}
                                    <div className="card p-6">
                                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                            <span>🔗</span>
                                            Connection Status
                                        </h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-400">Socket Status</span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${hasJoined
                                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                    : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                                    }`}>
                                                    {hasJoined ? '✅ Connected' : '⏳ Connecting'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-400">Room ID</span>
                                                <span className="text-indigo-400 font-mono text-sm">{roomId}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-400">Your Username</span>
                                                <span className="text-white font-medium">{user}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    {/* Toast Notifications Container */}
                    <div className="fixed bottom-6 right-6 z-50 space-y-3">
                        {toasts.map((toast) => (
                            <div
                                key={toast.id}
                                className={`toast animate-fade-in max-w-sm p-4 ${toast.type === 'success' ? 'toast-success' :
                                    toast.type === 'error' ? 'toast-error' :
                                        toast.type === 'warning' ? 'toast-warning' :
                                            'toast-info'
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 mt-0.5">
                                            {toast.type === 'success' && <span className="text-green-400">✅</span>}
                                            {toast.type === 'error' && <span className="text-red-400">❌</span>}
                                            {toast.type === 'warning' && <span className="text-yellow-400">⚠️</span>}
                                            {toast.type === 'info' && <span className="text-blue-400">ℹ️</span>}
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm font-medium text-white whitespace-pre-line">{toast.message}</div>
                                            <div className="text-xs text-gray-400 mt-1">{toast.timestamp}</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                                        className="ml-3 text-gray-400 hover:text-white transition-colors"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </Layout>
    );
};

export default SingleAuctions;