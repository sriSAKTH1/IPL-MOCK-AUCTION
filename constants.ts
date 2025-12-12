
import { AuctionSet, Player, PlayerCategory, Team } from './types';

// Real IPL Logic Constants
export const MAX_SQUAD_SIZE = 25;
export const MIN_SQUAD_SIZE = 18;
export const MAX_OVERSEAS = 8;
export const TOTAL_PURSE = 900000000; // 90 Crores

// Team Composition Minimums (For AI Logic)
export const MIN_BATTERS = 4;
export const MIN_BOWLERS = 4;
export const MIN_WKS = 2;
export const MIN_ALLROUNDERS = 2;

// 2026 Mini Auction Purses (Specific Override)
export const MINI_AUCTION_2026_PURSES: { [key: string]: number } = {
  't1': 434000000, // CSK 43.4 Cr
  't2': 28000000,  // MI 2.8 Cr
  't3': 164000000, // RCB 16.4 Cr
  't4': 643000000, // KKR 64.3 Cr
  't5': 255000000, // SRH 25.5 Cr
  't6': 161000000, // RR 16.1 Cr
  't7': 218000000, // DC 21.8 Cr
  't8': 129000000, // GT 12.9 Cr
  't9': 229000000, // LSG 22.9 Cr
  't10': 115000000 // PBKS 11.5 Cr
};

export const INITIAL_TEAMS: Team[] = [
  { 
    id: 't1', 
    name: 'Chennai Super Kings', 
    shortName: 'CSK', 
    color: 'text-yellow-500 border-yellow-500', 
    purseRemaining: TOTAL_PURSE, 
    players: [], 
    overseasCount: 0, 
    squadCount: 0,
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/2b/Chennai_Super_Kings_Logo.svg/1200px-Chennai_Super_Kings_Logo.svg.png'
  },
  { 
    id: 't2', 
    name: 'Mumbai Indians', 
    shortName: 'MI', 
    color: 'text-blue-500 border-blue-500', 
    purseRemaining: TOTAL_PURSE, 
    players: [], 
    overseasCount: 0, 
    squadCount: 0,
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/cd/Mumbai_Indians_Logo.svg/1200px-Mumbai_Indians_Logo.svg.png'
  },
  { 
    id: 't3', 
    name: 'Royal Challengers Bangalore', 
    shortName: 'RCB', 
    color: 'text-red-600 border-red-600', 
    purseRemaining: TOTAL_PURSE, 
    players: [], 
    overseasCount: 0, 
    squadCount: 0,
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/2a/Royal_Challengers_Bangalore_2020.svg/1200px-Royal_Challengers_Bangalore_2020.svg.png'
  },
  { 
    id: 't4', 
    name: 'Kolkata Knight Riders', 
    shortName: 'KKR', 
    color: 'text-purple-600 border-purple-600', 
    purseRemaining: TOTAL_PURSE, 
    players: [], 
    overseasCount: 0, 
    squadCount: 0,
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4c/Kolkata_Knight_Riders_Logo.svg/1200px-Kolkata_Knight_Riders_Logo.svg.png'
  },
  { 
    id: 't5', 
    name: 'Sunrisers Hyderabad', 
    shortName: 'SRH', 
    color: 'text-orange-500 border-orange-500', 
    purseRemaining: TOTAL_PURSE, 
    players: [], 
    overseasCount: 0, 
    squadCount: 0,
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/81/Sunrisers_Hyderabad.svg/1200px-Sunrisers_Hyderabad.svg.png'
  },
  { 
    id: 't6', 
    name: 'Rajasthan Royals', 
    shortName: 'RR', 
    color: 'text-pink-600 border-pink-600', 
    purseRemaining: TOTAL_PURSE, 
    players: [], 
    overseasCount: 0, 
    squadCount: 0,
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/60/Rajasthan_Royals_Logo.svg/1200px-Rajasthan_Royals_Logo.svg.png'
  },
  { 
    id: 't7', 
    name: 'Delhi Capitals', 
    shortName: 'DC', 
    color: 'text-blue-400 border-blue-400', 
    purseRemaining: TOTAL_PURSE, 
    players: [], 
    overseasCount: 0, 
    squadCount: 0,
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f8/Delhi_Capitals_Logo.svg/1200px-Delhi_Capitals_Logo.svg.png'
  },
  { 
    id: 't8', 
    name: 'Gujarat Titans', 
    shortName: 'GT', 
    color: 'text-teal-600 border-teal-600', 
    purseRemaining: TOTAL_PURSE, 
    players: [], 
    overseasCount: 0, 
    squadCount: 0,
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/09/Gujarat_Titans_Logo.svg/1200px-Gujarat_Titans_Logo.svg.png'
  },
  { 
    id: 't9', 
    name: 'Lucknow Super Giants', 
    shortName: 'LSG', 
    color: 'text-cyan-500 border-cyan-500', 
    purseRemaining: TOTAL_PURSE, 
    players: [], 
    overseasCount: 0, 
    squadCount: 0,
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a9/Lucknow_Super_Giants_IPL_Logo.svg/1200px-Lucknow_Super_Giants_IPL_Logo.svg.png'
  },
  { 
    id: 't10', 
    name: 'Punjab Kings', 
    shortName: 'PBKS', 
    color: 'text-red-500 border-red-500', 
    purseRemaining: TOTAL_PURSE, 
    players: [], 
    overseasCount: 0, 
    squadCount: 0,
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d4/Punjab_Kings_Logo_2021.svg/1200px-Punjab_Kings_Logo_2021.svg.png'
  },
];

export const MOCK_PLAYERS: Player[] = [
  // MARQUEE
  {
    id: 'p1',
    name: 'Virat Kohli',
    country: 'India',
    role: PlayerCategory.BATSMAN,
    isOverseas: false,
    isUncapped: false,
    basePrice: 20000000,
    set: AuctionSet.MARQUEE,
    status: 'UPCOMING',
    stats: { matches: 237, runs: 7263, average: 37.25, strikeRate: 130.02 },
    imgUrl: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/2.png'
  },
  {
    id: 'p2',
    name: 'Pat Cummins',
    country: 'Australia',
    role: PlayerCategory.BOWLER,
    isOverseas: true,
    isUncapped: false,
    basePrice: 20000000,
    set: AuctionSet.MARQUEE,
    status: 'UPCOMING',
    stats: { matches: 42, wickets: 45, economy: 8.54 },
    imgUrl: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/33.png'
  },
  {
    id: 'p4',
    name: 'Jasprit Bumrah',
    country: 'India',
    role: PlayerCategory.BOWLER,
    isOverseas: false,
    isUncapped: false,
    basePrice: 20000000,
    set: AuctionSet.MARQUEE,
    status: 'UPCOMING',
    stats: { matches: 120, wickets: 145, economy: 7.4 },
    imgUrl: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/9.png'
  },
  
  // BATTERS SET 1
  {
    id: 'p3',
    name: 'Travis Head',
    country: 'Australia',
    role: PlayerCategory.BATSMAN,
    isOverseas: true,
    isUncapped: false,
    basePrice: 20000000,
    set: AuctionSet.BATTERS_1,
    status: 'UPCOMING',
    stats: { matches: 30, runs: 850, strikeRate: 145.5 },
    imgUrl: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/1020.png'
  },
  {
    id: 'p11',
    name: 'David Miller',
    country: 'South Africa',
    role: PlayerCategory.BATSMAN,
    isOverseas: true,
    isUncapped: false,
    basePrice: 20000000,
    set: AuctionSet.BATTERS_1,
    status: 'UPCOMING',
    stats: { matches: 120, runs: 2700, strikeRate: 138.5 },
    imgUrl: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/187.png'
  },
  {
    id: 'p12',
    name: 'Prithvi Shaw',
    country: 'India',
    role: PlayerCategory.BATSMAN,
    isOverseas: false,
    isUncapped: false,
    basePrice: 7500000,
    set: AuctionSet.BATTERS_1,
    status: 'UPCOMING',
    stats: { matches: 70, runs: 1600, strikeRate: 147.5 },
    imgUrl: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/3764.png'
  },
  {
    id: 'p17',
    name: 'Jake Fraser-McGurk',
    country: 'Australia',
    role: PlayerCategory.BATSMAN,
    isOverseas: true,
    isUncapped: false,
    basePrice: 20000000,
    set: AuctionSet.BATTERS_1,
    status: 'UPCOMING',
    stats: { matches: 9, runs: 330, strikeRate: 234.0 },
    imgUrl: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/15642.png'
  },

  // ALL ROUNDERS SET 1
  {
    id: 'p5',
    name: 'Rachin Ravindra',
    country: 'New Zealand',
    role: PlayerCategory.ALL_ROUNDER,
    isOverseas: true,
    isUncapped: false,
    basePrice: 5000000,
    set: AuctionSet.ALLROUNDERS_1,
    status: 'UPCOMING',
    stats: { matches: 10, runs: 250, wickets: 5 },
    imgUrl: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/1077.png'
  },
  {
    id: 'p13',
    name: 'Ravindra Jadeja',
    country: 'India',
    role: PlayerCategory.ALL_ROUNDER,
    isOverseas: false,
    isUncapped: false,
    basePrice: 20000000,
    set: AuctionSet.ALLROUNDERS_1,
    status: 'UPCOMING',
    stats: { matches: 210, runs: 2600, wickets: 150 },
    imgUrl: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/9.png'
  },
  {
    id: 'p18',
    name: 'Glenn Maxwell',
    country: 'Australia',
    role: PlayerCategory.ALL_ROUNDER,
    isOverseas: true,
    isUncapped: false,
    basePrice: 20000000,
    set: AuctionSet.ALLROUNDERS_1,
    status: 'UPCOMING',
    stats: { matches: 126, runs: 2719, wickets: 31 },
    imgUrl: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/282.png'
  },

  // WICKET KEEPERS
  {
    id: 'p14',
    name: 'Rishabh Pant',
    country: 'India',
    role: PlayerCategory.WICKET_KEEPER,
    isOverseas: false,
    isUncapped: false,
    basePrice: 20000000,
    set: AuctionSet.WICKETKEEPERS_1,
    status: 'UPCOMING',
    stats: { matches: 98, runs: 2838, strikeRate: 147.9 },
    imgUrl: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/2972.png'
  },
  {
    id: 'p19',
    name: 'Quinton de Kock',
    country: 'South Africa',
    role: PlayerCategory.WICKET_KEEPER,
    isOverseas: true,
    isUncapped: false,
    basePrice: 20000000,
    set: AuctionSet.WICKETKEEPERS_1,
    status: 'UPCOMING',
    stats: { matches: 96, runs: 2907, strikeRate: 134.2 },
    imgUrl: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/170.png'
  },

  // FAST BOWLERS
  {
    id: 'p20',
    name: 'Kagiso Rabada',
    country: 'South Africa',
    role: PlayerCategory.BOWLER,
    isOverseas: true,
    isUncapped: false,
    basePrice: 20000000,
    set: AuctionSet.FAST_BOWLERS_1,
    status: 'UPCOMING',
    stats: { matches: 69, wickets: 106, economy: 8.42 },
    imgUrl: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/1664.png'
  },

  // SPINNERS
  {
    id: 'p21',
    name: 'Yuzvendra Chahal',
    country: 'India',
    role: PlayerCategory.BOWLER,
    isOverseas: false,
    isUncapped: false,
    basePrice: 20000000,
    set: AuctionSet.SPINNERS_1,
    status: 'UPCOMING',
    stats: { matches: 145, wickets: 187, economy: 7.67 },
    imgUrl: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/10.png'
  },

  // UNCAPPED
  {
    id: 'p6',
    name: 'Sameer Rizvi',
    country: 'India',
    role: PlayerCategory.BATSMAN,
    isOverseas: false,
    isUncapped: true,
    basePrice: 2000000,
    set: AuctionSet.UNCAPPED,
    status: 'UPCOMING',
    stats: { matches: 5, runs: 120, strikeRate: 155.0 },
    imgUrl: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/1210.png'
  },
  {
    id: 'p15',
    name: 'Ashutosh Sharma',
    country: 'India',
    role: PlayerCategory.BATSMAN,
    isOverseas: false,
    isUncapped: true,
    basePrice: 2000000,
    set: AuctionSet.UNCAPPED,
    status: 'UPCOMING',
    stats: { matches: 9, runs: 180, strikeRate: 175.0 },
    imgUrl: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/15643.png'
  },
  {
    id: 'p22',
    name: 'Abhimanyu Easwaran',
    country: 'India',
    role: PlayerCategory.BATSMAN,
    isOverseas: false,
    isUncapped: true,
    basePrice: 2000000,
    set: AuctionSet.UNCAPPED,
    status: 'UPCOMING',
    stats: { matches: 28, runs: 900, strikeRate: 130.0 },
    imgUrl: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/1025.png'
  }
];

export const formatCurrency = (value: number) => {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)} Cr`;
  } else if (value >= 100000) {
    return `₹${(value / 100000).toFixed(2)} L`;
  }
  return `₹${value}`;
};

/**
 * Returns the official IPL Auction bid increment based on the current price slab.
 */
export const getNextBidAmount = (currentAmount: number): number => {
  if (currentAmount < 10000000) { // < 1 Cr
    return currentAmount + 500000; // + 5L
  } else if (currentAmount < 20000000) { // 1Cr - 2Cr
    return currentAmount + 1000000; // + 10L
  } else if (currentAmount < 50000000) { // 2Cr - 5Cr
    return currentAmount + 2000000; // + 20L
  } else { // > 5 Cr
    return currentAmount + 2500000; // + 25L
  }
};

export const getOptimalBidIncrement = (currentAmount: number, playerValuation: number): number => {
    if (playerValuation > currentAmount * 1.5) {
        const nextCrore = Math.ceil((currentAmount + 1) / 10000000) * 10000000;
        if (nextCrore > currentAmount) return nextCrore;
    }
    return getNextBidAmount(currentAmount);
}
