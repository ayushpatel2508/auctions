import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// Configure axios to send cookies with requests
axios.defaults.withCredentials = true;

// Helper function to get headers for authenticated requests (using cookies)
const getAuthHeaders = () => {
  return {
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true // This ensures cookies are sent with the request
  };
};

// ==========================
// 1. AUTHENTICATION ROUTES
// ==========================
export const authAPI = {
  login: (credentials) => axios.post(`${BASE_URL}/auth/login`, credentials, { withCredentials: true }),

  register: (userData) => axios.post(`${BASE_URL}/auth/register`, userData, { withCredentials: true }),

  logout: () => axios.post(`${BASE_URL}/auth/logout`, {}, { ...getAuthHeaders(), withCredentials: true }),
};

// ==========================
// 2. AUCTION ROUTES
// ==========================
export const auctionAPI = {
  // Public: View all auctions
  getAllAuctions: () => axios.get(`${BASE_URL}/auctions`),

  // Public: View specific auction
  getAuction: (roomId) => axios.get(`${BASE_URL}/auction/${roomId}`),

  // Private: Create auction
  createAuction: (auctionData) =>
    axios.post(`${BASE_URL}/auction/create`, auctionData, getAuthHeaders()),

  // Private: Manual end auction
  endAuction: (roomId) =>
    axios.post(`${BASE_URL}/auction/${roomId}/end`, {}, getAuthHeaders()),

  // Private: Delete auction
  deleteAuction: (roomId) =>
    axios.delete(`${BASE_URL}/auction/${roomId}`, getAuthHeaders()),

  // Private: Place a bid (if you have a separate bid route)
  placeBid: (roomId, bidData) =>
    axios.post(`${BASE_URL}/auction/${roomId}/bid`, bidData, getAuthHeaders()),

  // Private: Quit auction (user leaves auction permanently)
  quitAuction: (roomId) =>
    axios.post(`${BASE_URL}/auction/${roomId}/quit`, {}, getAuthHeaders()),

  // Get bid history for an auction
  getBidHistory: (roomId) => axios.get(`${BASE_URL}/auction/${roomId}/bids`),
};

// ==========================
// 3. USER & DASHBOARD ROUTES
// ==========================
export const userAPI = {
  // Get profile data
  getProfile: () => axios.get(`${BASE_URL}/users/profile`, getAuthHeaders()),

  // Auctions created by the logged-in user
  getMyAuctions: () =>
    axios.get(`${BASE_URL}/users/my-auctions`, getAuthHeaders()),

  // Auctions the user has joined/participated in
  getJoinedAuctions: () =>
    axios.get(`${BASE_URL}/users/joined-auctions`, getAuthHeaders()),

  // Auctions the user has participated in
  getMyBids: () => axios.get(`${BASE_URL}/users/my-bids`, getAuthHeaders()),

  // Auctions the user won
  getWonAuctions: () =>
    axios.get(`${BASE_URL}/users/won-auctions`, getAuthHeaders()),

  // Get auctions the user has joined (Real-time tracking)
  getJoinedRooms: () =>
    axios.get(`${BASE_URL}/users/joined-rooms`, getAuthHeaders()),
};
