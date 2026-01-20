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
      console.error('Error fetching auctions:', err);
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
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading auctions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertDescription className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Auctions</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchAuctions} variant="outline">
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Live Auctions</h1>
          <p className="text-gray-600 mt-1">
            {auctions.length} active auction{auctions.length !== 1 ? 's' : ''} available
          </p>
        </div>

        <Button
          onClick={fetchAuctions}
          variant="outline"
          className="flex items-center space-x-2 rounded-lg"
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
          className="pl-10 rounded-lg"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-gray-400">🔍</span>
        </div>
      </div>

      {/* Auctions Grid */}
      {filteredAuctions.length === 0 ? (
        <div className="text-center py-12">
          {/* <div className="text-gray-400 text-6xl mb-4">🏠</div> */}
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            {searchTerm ? 'No auctions found' : 'No active auctions'}
          </h3>
          <p className="text-gray-600">
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
    <Card className="hover:shadow-xl transition-all duration-300 rounded-lg">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl line-clamp-2">{auction.title}</CardTitle>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${hasEnded
            ? 'bg-red-100 text-red-800'
            : isEnding
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-green-100 text-green-800'
            }`}>
            {hasEnded ? 'Ended' : 'Live'}
          </div>
        </div>
        {auction.description && (
          <CardDescription className="line-clamp-2">
            {auction.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Starting Price</p>
            <p className="text-lg font-semibold">
              ${auction.startingPrice.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Current Bid</p>
            <p className="text-lg font-semibold text-blue-600">
              ${auction.currentBid.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Time Remaining */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Time Remaining:</span>
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
          <div className="w-full bg-gray-200 rounded-full h-2">
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

        <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
          <span>By: <span className="font-medium">{auction.createdBy}</span></span>
          <span>👥 {auction.onlineUsers?.length || 0}</span>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        {/* Details Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex-1 rounded-lg">
              View Details
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md rounded-lg">
            <DialogHeader>
              <DialogTitle>{auction.title}</DialogTitle>
              <DialogDescription>
                Auction Details and Information
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Starting Price</p>
                  <p className="text-lg">${auction.startingPrice.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Current Bid</p>
                  <p className="text-lg text-blue-600">${auction.currentBid.toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Created by:</span>
                  <span className="font-medium">{auction.createdBy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Online Users:</span>
                  <span className="font-medium">👥 {auction.onlineUsers?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Duration:</span>
                  <span className="font-medium">{auction.duration} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Room ID:</span>
                  <span className="font-mono text-xs">{auction.roomId}</span>
                </div>
                {auction.highestBidder && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Highest Bidder:</span>
                    <span className="font-medium text-blue-600">{auction.highestBidder}</span>
                  </div>
                )}
              </div>

              <div className="pt-4">
                <p className="text-sm text-muted-foreground mb-2">Time Remaining:</p>
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
          <Button disabled className="flex-1 rounded-lg border border-gray-300">
            Auction Ended
          </Button>
        ) : (
          <Button onClick={onJoinAuction} className="flex-1 rounded-lg border border-white-500">
            Join Auction
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default Auctions;