import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auctionAPI } from '../utils/api';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const Auctions = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [username, setUserName] = useState(null)
  const navigate = useNavigate();

  // Fetch auctions from backend
  useEffect(() => {
    fetchAuctions();
  }, []);

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      const response = await auctionAPI.getAllAuctions();

      if (response.data.success) {
        setUserName(response.data.username)
        setAuctions(response.data.auctions);
      } else {
        setError('Failed to fetch auctions');
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Error fetching auctions');
    } finally {
      setLoading(false);
    }
  };

  // Format time remaining
  const formatTimeRemaining = (timeRemaining) => {
    if (timeRemaining <= 0) return 'Ended';

    const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  // Filter auctions based on search term
  const filteredAuctions = auctions.filter(auction =>
    auction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    auction.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Toggle auction details
  const toggleAuctionDetails = (auction) => {
    if (selectedAuction?.roomId === auction.roomId) {
      setSelectedAuction(null); // Close if same auction clicked
    } else {
      setSelectedAuction(auction); // Open new auction details
    }
  };

  // Navigate to auction room
  const joinAuction = (roomId) => {

    navigate(`/auction/${roomId}`);
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center" style={{
        background: 'var(--bg-primary)'
      }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{
            borderColor: 'rgba(210, 105, 30, 0.3)',
            borderBottomColor: 'var(--accent-primary)'
          }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading auctions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center" style={{
        background: 'var(--bg-primary)'
      }}>
        <Alert className="card max-w-md">
          <AlertDescription className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Error Loading Auctions</h2>
            <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>{error}</p>
            <Button onClick={fetchAuctions} variant="outline" className="btn btn-secondary">
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{
      background: 'var(--bg-primary)',
      minHeight: '100vh',
      padding: '2rem',
      color: 'var(--text-primary)'
    }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Live Auctions</h1>
          <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
            {auctions.length} active auction{auctions.length !== 1 ? 's' : ''} available
          </p>
        </div>

        <Button
          onClick={fetchAuctions}
          variant="outline"
          className="btn btn-secondary flex items-center space-x-2 rounded-lg"
        >
          <span>🔄</span>
          <span>Refresh</span>
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Input
          type="text"
          placeholder="Search auctions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input pl-10 rounded-lg"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span style={{ color: 'var(--accent-primary)' }}>🔍</span>
        </div>
      </div>

      {/* Auctions Grid */}
      {filteredAuctions.length === 0 ? (
        <div className="text-center py-12">
          {/* <div className="text-gray-400 text-6xl mb-4">🏠</div> */}
          <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
            {searchTerm ? 'No auctions found' : 'No active auctions'}
          </h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            {searchTerm
              ? 'Try adjusting your search terms'
              : 'Check back later for new auctions'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAuctions.map((auction) => (
            <AuctionCard
              key={auction.roomId}
              auction={auction}
              formatTimeRemaining={formatTimeRemaining}
              isSelected={selectedAuction?.roomId === auction.roomId}
              onToggleDetails={() => toggleAuctionDetails(auction)}
              onJoinAuction={() => joinAuction(auction.roomId, username)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Auction Card Component
const AuctionCard = ({ auction, formatTimeRemaining, isSelected, onToggleDetails, onJoinAuction }) => {
  const [timeRemaining, setTimeRemaining] = useState(auction.timeRemaining);

  // Update countdown every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => Math.max(0, prev - 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const isEnding = timeRemaining < 300000; // Less than 5 minutes
  const hasEnded = timeRemaining <= 0;

  return (
    <Card
      className="card rounded-lg transition-shadow duration-300"
      style={{
        boxShadow: 'var(--shadow-md)'
      }}
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl line-clamp-2" style={{ color: 'var(--text-primary)' }}>{auction.title}</CardTitle>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${hasEnded
            ? 'status-ended'
            : isEnding
              ? 'status-warning'
              : 'status-active'
            }`}>
            {hasEnded ? 'Ended' : 'Live'}
          </div>
        </div>
        {auction.description && (
          <CardDescription className="line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
            {auction.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Starting Price</p>
            <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              ${auction.startingPrice.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Current Bid</p>
            <p className="text-lg font-semibold" style={{ color: 'var(--accent-primary)' }}>
              ${auction.currentBid.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Time Remaining */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Time Remaining:</span>
            <span className={`font-mono font-semibold ${hasEnded
              ? 'text-red-600'
              : isEnding
                ? 'text-yellow-600'
                : 'text-green-600'
              }`}>
              {formatTimeRemaining(timeRemaining)}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full rounded-full h-2" style={{ background: 'var(--surface-hover)' }}>
            <div
              className={`h-2 rounded-full transition-all duration-1000 ${hasEnded
                ? 'bg-red-500'
                : isEnding
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
                }`}
              style={{
                width: hasEnded ? '100%' : `${Math.max(10, (timeRemaining / auction.duration / 60000) * 100)}%`
              }}
            ></div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <span>By: <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{auction.createdBy}</span></span>
          <span>👥 {auction.onlineUsers?.length || 0}</span>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        {/* Details Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="btn btn-secondary flex-1 rounded-lg">
              View Details
            </Button>
          </DialogTrigger>
          <DialogContent className="card max-w-md rounded-lg">
            <DialogHeader>
              <DialogTitle style={{ color: 'var(--text-primary)' }}>{auction.title}</DialogTitle>
              <DialogDescription style={{ color: 'var(--text-secondary)' }}>
                Auction Details and Information
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Starting Price</p>
                  <p className="text-lg" style={{ color: 'var(--text-primary)' }}>${auction.startingPrice.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Current Bid</p>
                  <p className="text-lg" style={{ color: 'var(--accent-primary)' }}>${auction.currentBid.toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Created by:</span>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{auction.createdBy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Online Users:</span>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>👥 {auction.onlineUsers?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Duration:</span>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{auction.duration} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Room ID:</span>
                  <span className="font-mono text-xs" style={{ color: 'var(--text-primary)' }}>{auction.roomId}</span>
                </div>
                {auction.highestBidder && (
                  <div className="flex justify-between">
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Highest Bidder:</span>
                    <span className="font-medium" style={{ color: 'var(--accent-primary)' }}>{auction.highestBidder}</span>
                  </div>
                )}
              </div>

              <div className="pt-4">
                <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Time Remaining:</p>
                <p className={`font-mono font-semibold text-lg ${hasEnded
                  ? 'text-red-600'
                  : isEnding
                    ? 'text-yellow-600'
                    : 'text-green-600'
                  }`}>
                  {formatTimeRemaining(timeRemaining)}
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Join Button */}
        {hasEnded ? (
          <Button disabled className="flex-1 rounded-lg" style={{
            background: 'var(--surface-hover)',
            borderColor: 'var(--border-secondary)',
            color: 'var(--text-disabled)'
          }}>
            Auction Ended
          </Button>
        ) : (
          <Button onClick={onJoinAuction} className="btn btn-primary flex-1 rounded-lg">
            Join Auction
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default Auctions;