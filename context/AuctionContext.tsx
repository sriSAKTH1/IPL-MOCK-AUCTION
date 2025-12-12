import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { AuctionState, Bid, Player, Team, PlayerCategory } from '../types';
import { 
  INITIAL_TEAMS, 
  MOCK_PLAYERS, 
  MAX_OVERSEAS, 
  MAX_SQUAD_SIZE, 
  getNextBidAmount, 
  MIN_BATTERS,
  MIN_BOWLERS,
  MIN_WKS,
  MIN_ALLROUNDERS,
  TOTAL_PURSE,
  MINI_AUCTION_2026_PURSES
} from '../constants';
import { getPlayerAnalysis } from '../services/geminiService';

interface AuctionContextType extends AuctionState {
  startAuction: () => void;
  pauseAuction: () => void;
  resumeAuction: () => void;
  placeBid: (teamId: string) => void;
  nextPlayer: () => void;
  setRole: (role: 'ADMIN' | 'TEAM' | 'SPECTATOR', teamId?: string) => void;
  skipPlayer: () => void;
  setIsHost: (isHost: boolean) => void;
  setRoomCode: (code: string) => void;
  isAutoPilot: boolean;
  toggleAutoPilot: () => void;
  setGameMode: (mode: 'SINGLE' | 'MULTI') => void;
  setAuctionMode: (mode: 'MEGA' | 'MINI') => void;
  userName: string;
  setUserName: (name: string) => void;
}

const AuctionContext = createContext<AuctionContextType | null>(null);

export const AuctionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State
  const [phase, setPhase] = useState<'LOBBY' | 'AUCTION' | 'SUMMARY'>('LOBBY');
  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS);
  const [players, setPlayers] = useState<Player[]>(MOCK_PLAYERS);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [currentBid, setCurrentBid] = useState<Bid | null>(null);
  const [timer, setTimer] = useState<number>(20);
  const [isPaused, setIsPaused] = useState<boolean>(true);
  const [history, setHistory] = useState<Bid[]>([]);
  const [userRole, setUserRole] = useState<'ADMIN' | 'TEAM' | 'SPECTATOR'>('SPECTATOR');
  const [userTeamId, setUserTeamId] = useState<string | undefined>(undefined);
  const [isHost, setIsHost] = useState<boolean>(false);
  const [roomCode, setRoomCode] = useState<string>('');
  const [gameMode, setGameMode] = useState<'SINGLE' | 'MULTI'>('SINGLE');
  const [userName, setUserName] = useState<string>('Player');
  
  // AI Bot State
  const [isAutoPilot, setIsAutoPilot] = useState<boolean>(false); // For user team automation
  const botTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoNextTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const timerInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Helper: Get Current Player Object
  const currentPlayer = players.find(p => p.id === currentPlayerId);

  // Gemini Insight Effect
  useEffect(() => {
    if (currentPlayer && currentPlayer.status === 'ON_AUCTION' && !currentPlayer.aiAnalysis) {
      // We pass the full player object now so the service can use stats for the offline generator
      getPlayerAnalysis(currentPlayer).then(analysis => {
        setPlayers(prev => prev.map(p => p.id === currentPlayer.id ? { ...p, aiAnalysis: analysis } : p));
      });
    }
  }, [currentPlayerId]);

  // Timer Logic
  useEffect(() => {
    if (phase === 'AUCTION' && !isPaused && currentPlayerId) {
      timerInterval.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            handleTimerExpiry();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerInterval.current) clearInterval(timerInterval.current);
    }

    return () => {
      if (timerInterval.current) clearInterval(timerInterval.current);
    };
  }, [phase, isPaused, currentPlayerId, currentBid]);

  // --------------------------------------------------------------------------
  // AI BOT STRATEGY ENGINE
  // --------------------------------------------------------------------------
  
  // Evaluates whether a team SHOULD bid for the current player based on needs and budget
  const evaluateBid = (team: Team, player: Player, currentAmount: number): boolean => {
      // 1. Basic Rules Check
      if (team.squadCount >= MAX_SQUAD_SIZE) return false;
      if (player.isOverseas && team.overseasCount >= MAX_OVERSEAS) return false;
      
      const nextBid = getNextBidAmount(currentAmount);
      
      // 2. Hard Cap for Bots (User Request: 5.5 Cr limit)
      if (nextBid > 55000000) return false;

      if (team.purseRemaining < nextBid) return false;

      // 3. Budget Reservation Logic
      // Reserve approx 20L per remaining slot to ensure squad completion
      const slotsRemaining = MAX_SQUAD_SIZE - team.squadCount;
      const minPurseRequired = slotsRemaining * 2000000; 
      if ((team.purseRemaining - nextBid) < minPurseRequired) return false;

      // 4. Dynamic Valuation Logic
      let valuation = player.basePrice;

      // A. Stats Multiplier
      const matchesFactor = Math.min(player.stats.matches || 0, 100) / 50; // Cap matches bonus
      valuation += player.basePrice * matchesFactor * 0.5;

      // B. Role Needs Multiplier (Weighted heavily)
      // Count current roles in squad
      const squadPlayers = players.filter(p => team.players.includes(p.id));
      const batterCount = squadPlayers.filter(p => p.role === PlayerCategory.BATSMAN).length;
      const bowlerCount = squadPlayers.filter(p => p.role === PlayerCategory.BOWLER).length;
      const wkCount = squadPlayers.filter(p => p.role === PlayerCategory.WICKET_KEEPER).length;
      const allRounderCount = squadPlayers.filter(p => p.role === PlayerCategory.ALL_ROUNDER).length;

      let needFactor = 1.0;
      if (player.role === PlayerCategory.BATSMAN && batterCount < MIN_BATTERS) needFactor += 0.5;
      if (player.role === PlayerCategory.BOWLER && bowlerCount < MIN_BOWLERS) needFactor += 0.5;
      if (player.role === PlayerCategory.WICKET_KEEPER && wkCount < MIN_WKS) needFactor += 1.0; // High value for rare WKs
      if (player.role === PlayerCategory.ALL_ROUNDER && allRounderCount < MIN_ALLROUNDERS) needFactor += 0.8;

      // C. Purse Power
      // Rich teams can bully poor teams
      const purseFactor = team.purseRemaining / 200000000; // Boost if > 20Cr

      const maxWillingToPay = valuation * needFactor * (1 + (purseFactor * 0.1));
      
      // Random "Sentiment" fluctuation (AI isn't perfectly logical, simulates human indecision)
      const sentiment = 0.9 + Math.random() * 0.2; // 0.9 to 1.1

      return nextBid < (maxWillingToPay * sentiment);
  };

  // Bot Loop Effect
  useEffect(() => {
    // Clear previous timeout on re-render to avoid overlapping decisions
    if (botTimeoutRef.current) clearTimeout(botTimeoutRef.current);

    if (phase !== 'AUCTION' || isPaused || !currentPlayerId || !currentPlayer) return;

    const runBotCycle = () => {
        const currentAmount = currentBid ? currentBid.amount : currentPlayer.basePrice;
        
        // 1. Identify Valid Bidders (Teams that are NOT the current leader)
        const candidates = teams.filter(t => t.id !== currentBid?.teamId);

        // 2. Filter who actually wants to bid
        const bidders = candidates.filter(t => {
            // If it's the User's team, only bid if AutoPilot is ON
            if (t.id === userTeamId) {
                return isAutoPilot && evaluateBid(t, currentPlayer, currentAmount);
            }
            // Logic for AI Teams
            return evaluateBid(t, currentPlayer, currentAmount);
        });

        if (bidders.length > 0) {
            // Pick one random bidder from interested parties
            const winner = bidders[Math.floor(Math.random() * bidders.length)];
            placeBid(winner.id);
        }
    };

    // Reaction Time Simulation: 1s to 3s delay
    // If timer is critical (<5s), AI reacts faster (0.5s - 1.5s)
    const delay = timer < 5 
        ? 500 + Math.random() * 1000 
        : 1000 + Math.random() * 2000;

    botTimeoutRef.current = setTimeout(runBotCycle, delay);

    return () => {
        if (botTimeoutRef.current) clearTimeout(botTimeoutRef.current);
    }
  }, [currentBid, currentPlayerId, isPaused, phase, timer, isAutoPilot]);

  // --------------------------------------------------------------------------

  const handleTimerExpiry = () => {
    if (timerInterval.current) clearInterval(timerInterval.current);
    
    // Determine SOLD or UNSOLD
    if (currentBid) {
      const soldPrice = currentBid.amount;
      const winnerId = currentBid.teamId;
      
      setPlayers(prev => prev.map(p => 
        p.id === currentPlayerId 
          ? { ...p, status: 'SOLD', soldPrice, soldTo: winnerId } 
          : p
      ));

      setTeams(prev => prev.map(t => {
        if (t.id === winnerId) {
          const isOverseas = currentPlayer?.isOverseas;
          return {
            ...t,
            purseRemaining: t.purseRemaining - soldPrice,
            players: [...t.players, currentPlayerId!],
            squadCount: t.squadCount + 1,
            overseasCount: isOverseas ? t.overseasCount + 1 : t.overseasCount
          };
        }
        return t;
      }));

    } else {
      setPlayers(prev => prev.map(p => 
        p.id === currentPlayerId ? { ...p, status: 'UNSOLD' } : p
      ));
    }

    setIsPaused(true);

    // Auto-proceed logic REMOVED to allow "Stop Page" behavior as requested.
    // The overlay will now persist until the user (Host or Single Player) clicks Next.
    if (autoNextTimeoutRef.current) clearTimeout(autoNextTimeoutRef.current);
  };

  const startAuction = () => {
    setPhase('AUCTION');
    const firstPlayer = players.find(p => p.status === 'UPCOMING');
    if (firstPlayer) {
      setCurrentPlayerId(firstPlayer.id);
      setPlayers(prev => prev.map(p => p.id === firstPlayer.id ? {...p, status: 'ON_AUCTION'} : p));
      setTimer(20);
      setIsPaused(false);
    }
  };

  const nextPlayer = () => {
    if (autoNextTimeoutRef.current) clearTimeout(autoNextTimeoutRef.current); // Clear any pending auto-next
    
    const nextP = players.find(p => p.status === 'UPCOMING');
    if (nextP) {
      setCurrentPlayerId(nextP.id);
      setCurrentBid(null);
      setPlayers(prev => prev.map(p => p.id === nextP.id ? {...p, status: 'ON_AUCTION'} : p));
      setTimer(20);
      setIsPaused(false);
    } else {
      setPhase('SUMMARY');
    }
  };

  const skipPlayer = () => {
     if (!currentPlayerId) return;
     setPlayers(prev => prev.map(p => p.id === currentPlayerId ? { ...p, status: 'UNSOLD' } : p));
     setIsPaused(true);
     setCurrentBid(null);
  };

  const pauseAuction = () => setIsPaused(true);
  const resumeAuction = () => setIsPaused(false);

  const placeBid = (teamId: string) => {
    if (!currentPlayerId || isPaused) return;

    const team = teams.find(t => t.id === teamId);
    const player = players.find(p => p.id === currentPlayerId);

    if (!team || !player) return;

    if (team.squadCount >= MAX_SQUAD_SIZE) return; // Silent fail for bots
    if (player.isOverseas && team.overseasCount >= MAX_OVERSEAS) return;

    let bidAmount = player.basePrice;
    if (currentBid) {
      bidAmount = getNextBidAmount(currentBid.amount);
    }

    if (team.purseRemaining < bidAmount) return;

    const newBid: Bid = {
      id: Date.now().toString() + Math.random(),
      teamId,
      playerId: currentPlayerId,
      amount: bidAmount,
      timestamp: Date.now()
    };

    setCurrentBid(newBid);
    setHistory(prev => [newBid, ...prev]);
    setTimer(10); 
  };

  const setRole = (role: 'ADMIN' | 'TEAM' | 'SPECTATOR', teamId?: string) => {
    setUserRole(role);
    setUserTeamId(teamId);
  };

  const toggleAutoPilot = () => {
      setIsAutoPilot(prev => !prev);
  };

  const setAuctionMode = (mode: 'MEGA' | 'MINI') => {
      setTeams(prevTeams => prevTeams.map(team => {
          let newPurse = TOTAL_PURSE;
          if (mode === 'MINI') {
              // Override purse for Mini Auction based on team ID
              newPurse = MINI_AUCTION_2026_PURSES[team.id] || TOTAL_PURSE;
          }
          return {
              ...team,
              purseRemaining: newPurse
          };
      }));
  };

  return (
    <AuctionContext.Provider value={{
      roomCode,
      teams,
      players,
      currentPlayerId,
      currentBid,
      timer,
      isPaused,
      history,
      phase,
      userRole,
      userTeamId,
      isHost,
      startAuction,
      pauseAuction,
      resumeAuction,
      placeBid,
      nextPlayer,
      setRole,
      skipPlayer,
      setIsHost,
      setRoomCode,
      isAutoPilot,
      toggleAutoPilot,
      gameMode,
      setGameMode,
      setAuctionMode,
      userName,
      setUserName
    }}>
      {children}
    </AuctionContext.Provider>
  );
};

export const useAuction = () => {
  const context = useContext(AuctionContext);
  if (!context) throw new Error("useAuction must be used within AuctionProvider");
  return context;
};