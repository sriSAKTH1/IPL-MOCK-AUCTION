
export enum PlayerCategory {
  BATSMAN = 'Batsman',
  BOWLER = 'Bowler',
  ALL_ROUNDER = 'All-Rounder',
  WICKET_KEEPER = 'Wicket Keeper'
}

export enum AuctionSet {
  MARQUEE = 'Marquee Set',
  BATTERS_1 = 'Batters Set 1',
  ALLROUNDERS_1 = 'All-Rounders Set 1',
  WICKETKEEPERS_1 = 'Wicket-Keepers Set 1',
  FAST_BOWLERS_1 = 'Fast Bowlers Set 1',
  SPINNERS_1 = 'Spinners Set 1',
  UNCAPPED = 'Uncapped'
}

export interface Player {
  id: string;
  name: string;
  country: string;
  role: PlayerCategory;
  isOverseas: boolean;
  isUncapped: boolean;
  basePrice: number; // In Rupees
  stats: {
    matches: number;
    runs?: number;
    wickets?: number;
    strikeRate?: number;
    economy?: number;
    average?: number;
  };
  set: AuctionSet;
  status: 'UPCOMING' | 'ON_AUCTION' | 'SOLD' | 'UNSOLD';
  soldPrice?: number;
  soldTo?: string; // Team ID
  imgUrl?: string;
  aiAnalysis?: string; // Fetched from Gemini
  timestamp?: number; // Time of status change (Sold/Unsold)
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  color: string;
  purseRemaining: number;
  players: string[]; // List of Player IDs
  overseasCount: number;
  squadCount: number;
  logoUrl?: string;
}

export interface Bid {
  id: string;
  teamId: string;
  playerId: string;
  amount: number;
  timestamp: number;
}

export interface AuctionRules {
  maxOverseas: number;
  maxSquadSize: number;
  minBidIncrement: number; // Minimum amount to add
}

export interface AuctionState {
  roomCode: string;
  teams: Team[];
  players: Player[];
  currentPlayerId: string | null;
  currentBid: Bid | null;
  timer: number;
  isPaused: boolean;
  history: Bid[]; // Audit trail
  phase: 'LOBBY' | 'AUCTION' | 'SUMMARY';
  userRole: 'ADMIN' | 'TEAM' | 'SPECTATOR';
  userTeamId?: string; // If role is TEAM
  isHost: boolean;
  gameMode: 'SINGLE' | 'MULTI';
  rules: AuctionRules;
}
