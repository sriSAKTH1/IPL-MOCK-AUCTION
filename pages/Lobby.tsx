import React, { useState, useEffect } from 'react';
import { useAuction } from '../context/AuctionContext';
import { formatCurrency } from '../constants';
import { Trophy, Users, MonitorPlay, Zap, ArrowRight, Calendar, Settings, Gavel, Crown, Cpu, Globe, CheckCircle2, Lock, Unlock, RefreshCw, LogIn, Plus, Copy, Play } from 'lucide-react';

// Helper component for Team Logos with Fallback
const TeamLogo = ({ team, className }: { team: any, className?: string }) => {
  const [error, setError] = useState(false);
  
  // Extract a hex color approximation based on team ID for the placeholder
  const getTeamColorHex = (id: string) => {
    switch(id) {
      case 't1': return 'FACC15'; // CSK Yellow
      case 't2': return '3B82F6'; // MI Blue
      case 't3': return 'DC2626'; // RCB Red
      case 't4': return '9333EA'; // KKR Purple
      case 't5': return 'F97316'; // SRH Orange
      case 't6': return 'DB2777'; // RR Pink
      case 't7': return '60A5FA'; // DC Blue
      case 't8': return '0D9488'; // GT Teal
      case 't9': return '06B6D4'; // LSG Cyan
      case 't10': return 'EF4444'; // PBKS Red
      default: return '64748B';
    }
  };

  if (error || !team.logoUrl) {
    // Use UI Avatars as the "Image Generation Tool" for placeholders
    const placeholderUrl = `https://ui-avatars.com/api/?name=${team.shortName}&background=${getTeamColorHex(team.id)}&color=fff&size=256&font-size=0.33&bold=true&length=3`;
    return <img src={placeholderUrl} alt={team.shortName} className={`${className} rounded-full`} />;
  }

  return (
    <img 
      src={team.logoUrl} 
      alt={team.shortName} 
      className={className} 
      onError={() => setError(true)} 
    />
  );
};

const Lobby: React.FC = () => {
  const { setRole, startAuction, setIsHost, setRoomCode: setContextRoomCode, roomCode: contextRoomCode, isHost, userTeamId, setGameMode, setAuctionMode, teams, setUserName: setContextUserName } = useAuction();
  const [yearSuffix, setYearSuffix] = useState(20);
  const [lobbyStep, setLobbyStep] = useState<'MODES' | 'PLAY_MODE' | 'MULTIPLAYER_SETUP' | 'MULTIPLAYER_WAITING_ROOM' | 'ROLES'>('MODES');
  const [selectedMode, setSelectedMode] = useState<{title: string, subtitle: string} | null>(null);

  // Multiplayer Form State
  const [userName, setUserName] = useState(''); // Used for Waiting Room display
  const [createName, setCreateName] = useState(''); // Input for Create Room
  const [joinName, setJoinName] = useState(''); // Input for Join Room
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Animation for the main landing title (20 -> 26)
  useEffect(() => {
    const interval = setInterval(() => {
      setYearSuffix((prev) => {
        if (prev >= 26) {
          clearInterval(interval);
          return 26;
        }
        return prev + 1;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleModeSelect = (mode: 'MEGA' | 'MINI' | 'CUSTOM') => {
      if (mode === 'MEGA') {
          setSelectedMode({ title: 'IPL 2025', subtitle: 'MEGA AUCTION' });
          setAuctionMode('MEGA');
      }
      if (mode === 'MINI') {
          setSelectedMode({ title: 'IPL 2026', subtitle: 'MINI AUCTION' });
          setAuctionMode('MINI');
      }
      if (mode === 'CUSTOM') {
          setSelectedMode({ title: 'CUSTOM ROOM', subtitle: 'PRIVATE LOBBY' });
          setAuctionMode('MEGA'); // Default to Mega purse for custom, or handle custom logic
      }
      setLobbyStep('PLAY_MODE');
  };

  const handlePlayModeSelect = (mode: 'SINGLE' | 'MULTI') => {
      if (mode === 'MULTI') {
        setGameMode('MULTI');
        setLobbyStep('MULTIPLAYER_SETUP');
      } else {
        setGameMode('SINGLE');
        setLobbyStep('ROLES');
      }
  };

  const handleBack = () => {
      if (lobbyStep === 'MULTIPLAYER_WAITING_ROOM') {
          setLobbyStep('MULTIPLAYER_SETUP');
      } else if (lobbyStep === 'ROLES') {
          setLobbyStep('PLAY_MODE'); 
      } else if (lobbyStep === 'MULTIPLAYER_SETUP') {
          setLobbyStep('PLAY_MODE');
      } else if (lobbyStep === 'PLAY_MODE') {
          setLobbyStep('MODES');
          setSelectedMode(null);
      }
  };

  const handleRefresh = () => {
      setIsRefreshing(true);
      setTimeout(() => setIsRefreshing(false), 1500);
  };

  const handleCreateRoom = () => {
      if (!createName.trim()) {
          alert("Please enter your name");
          return;
      }
      setUserName(createName);
      setContextUserName(createName); // Sync to context
      // Generate random 6-char code
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      setContextRoomCode(code);
      setIsHost(true);
      setLobbyStep('MULTIPLAYER_WAITING_ROOM');
  };

  const handleJoinRoom = () => {
      if (!joinName.trim()) {
          alert("Please enter your name");
          return;
      }
      if (roomCodeInput.length < 4) {
          alert("Invalid Room Code");
          return;
      }
      setUserName(joinName);
      setContextUserName(joinName); // Sync to context
      setContextRoomCode(roomCodeInput.toUpperCase());
      setIsHost(false); // Guest
      setLobbyStep('MULTIPLAYER_WAITING_ROOM');
  };

  const handleCopyCode = async () => {
    if (contextRoomCode) {
      try {
          // Try standard clipboard API first
          await navigator.clipboard.writeText(contextRoomCode);
          setCopied(true);
      } catch (err) {
          // Fallback for non-secure contexts or older browsers
          const textArea = document.createElement("textarea");
          textArea.value = contextRoomCode;
          textArea.style.position = "fixed"; // Avoid scrolling to bottom
          textArea.style.opacity = "0";
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          try {
              document.execCommand('copy');
              setCopied(true);
          } catch (e) {
              console.error('Copy failed', e);
          }
          document.body.removeChild(textArea);
      }
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSelectTeam = (teamId: string) => {
      setRole('TEAM', teamId);
  };

  const handleStartAuction = () => {
      if (!userTeamId) {
          alert("Please select a team first!");
          return;
      }
      startAuction();
  };

  const getTeamStyles = (teamId: string) => {
      switch(teamId) {
          case 't1': return { bg: 'bg-yellow-500', border: 'hover:border-yellow-500', text: 'text-yellow-500', shadow: 'hover:shadow-yellow-500/20', ring: 'group-hover:ring-yellow-500/30' }; // CSK
          case 't2': return { bg: 'bg-blue-500', border: 'hover:border-blue-500', text: 'text-blue-500', shadow: 'hover:shadow-blue-500/20', ring: 'group-hover:ring-blue-500/30' }; // MI
          case 't3': return { bg: 'bg-red-600', border: 'hover:border-red-600', text: 'text-red-600', shadow: 'hover:shadow-red-600/20', ring: 'group-hover:ring-red-600/30' }; // RCB
          case 't4': return { bg: 'bg-purple-600', border: 'hover:border-purple-600', text: 'text-purple-600', shadow: 'hover:shadow-purple-600/20', ring: 'group-hover:ring-purple-600/30' }; // KKR
          case 't5': return { bg: 'bg-orange-500', border: 'hover:border-orange-500', text: 'text-orange-500', shadow: 'hover:shadow-orange-500/20', ring: 'group-hover:ring-orange-500/30' }; // SRH
          
          case 't6': return { bg: 'bg-pink-600', border: 'hover:border-pink-600', text: 'text-pink-600', shadow: 'hover:shadow-pink-600/20', ring: 'group-hover:ring-pink-600/30' }; // RR
          case 't7': return { bg: 'bg-blue-400', border: 'hover:border-blue-400', text: 'text-blue-400', shadow: 'hover:shadow-blue-400/20', ring: 'group-hover:ring-blue-400/30' }; // DC
          case 't8': return { bg: 'bg-teal-600', border: 'hover:border-teal-600', text: 'text-teal-600', shadow: 'hover:shadow-teal-600/20', ring: 'group-hover:ring-teal-600/30' }; // GT
          case 't9': return { bg: 'bg-cyan-500', border: 'hover:border-cyan-500', text: 'text-cyan-500', shadow: 'hover:shadow-cyan-500/20', ring: 'group-hover:ring-cyan-500/30' }; // LSG
          case 't10': return { bg: 'bg-red-500', border: 'hover:border-red-500', text: 'text-red-500', shadow: 'hover:shadow-red-500/20', ring: 'group-hover:ring-red-500/30' }; // PBKS

          default: return { bg: 'bg-slate-500', border: 'hover:border-slate-500', text: 'text-slate-500', shadow: 'hover:shadow-slate-500/20', ring: 'group-hover:ring-slate-500/30' };
      }
  };

  return (
    <div className="min-h-screen bg-ipl-dark flex flex-col items-center justify-center p-4 relative overflow-hidden font-roboto">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#0a0f1e] to-black z-0"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 z-0"></div>
      
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-ipl-gold/10 rounded-full blur-[120px]"></div>

      <div className="z-10 text-center max-w-7xl w-full">
        
        {/* Dynamic Header */}
        {lobbyStep !== 'ROLES' && lobbyStep !== 'MULTIPLAYER_SETUP' && lobbyStep !== 'MULTIPLAYER_WAITING_ROOM' && (
             <div className="mb-12 animate-fade-in-down">
                <h1 className="text-7xl md:text-9xl font-bold font-teko text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 drop-shadow-2xl tracking-tight leading-none">
                    {selectedMode ? selectedMode.title : `IPL 20${yearSuffix}`}
                </h1>
                <div className="flex items-center justify-center gap-3 mt-4">
                    <div className="h-[1px] w-12 bg-ipl-gold"></div>
                    <p className="text-xl md:text-3xl text-ipl-gold tracking-[0.3em] font-light uppercase">
                        {selectedMode 
                            ? (lobbyStep === 'PLAY_MODE' ? 'SELECT GAME TYPE' : selectedMode.subtitle) 
                            : 'Mega Auction Simulator'}
                    </p>
                    <div className="h-[1px] w-12 bg-ipl-gold"></div>
                </div>
            </div>
        )}

        {/* STEP 1: MODE SELECTION */}
        {lobbyStep === 'MODES' && (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full px-4 animate-scale-in">
                
                {/* BOX 1: 2025 MEGA */}
                <div 
                    onClick={() => handleModeSelect('MEGA')}
                    className="group relative cursor-pointer h-96 rounded-3xl overflow-hidden border border-ipl-gold/30 hover:border-ipl-gold transition-all duration-500 hover:shadow-[0_0_50px_rgba(209,171,62,0.3)] hover:-translate-y-2 bg-slate-900"
                >
                    {/* Image / Gradient Background */}
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1631194758628-71ec7c35137e?q=80&w=2532&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover:scale-110 transition-transform duration-700"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                    
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 z-10">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-700 flex items-center justify-center mb-6 shadow-lg group-hover:rotate-12 transition-transform">
                            <Crown size={40} className="text-white" />
                        </div>
                        <h2 className="text-5xl font-teko font-bold text-white mb-2 group-hover:text-ipl-gold transition-colors">2025 - MEGA</h2>
                        <p className="text-slate-300 text-sm max-w-[80%] leading-relaxed">The Grand Reset. All teams rebuild from scratch. Massive purse, Marquee players, and high stakes.</p>
                        <div className="mt-8 px-6 py-2 border border-ipl-gold/50 rounded-full text-ipl-gold uppercase tracking-widest text-xs font-bold group-hover:bg-ipl-gold group-hover:text-black transition-all">
                            Enter Mega Auction
                        </div>
                    </div>
                </div>

                {/* BOX 2: 2026 MINI */}
                <div 
                    onClick={() => handleModeSelect('MINI')}
                    className="group relative cursor-pointer h-96 rounded-3xl overflow-hidden border border-blue-500/30 hover:border-blue-400 transition-all duration-500 hover:shadow-[0_0_50px_rgba(59,130,246,0.3)] hover:-translate-y-2 bg-slate-900"
                >
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=2612&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover:scale-110 transition-transform duration-700"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                    
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 z-10">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center mb-6 shadow-lg group-hover:rotate-12 transition-transform">
                            <Gavel size={40} className="text-white" />
                        </div>
                        <h2 className="text-5xl font-teko font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">2026 - MINI</h2>
                        <p className="text-slate-300 text-sm max-w-[80%] leading-relaxed">Strategic reinforcements. Fill the gaps in your squad with a limited purse and targeted buys.</p>
                        <div className="mt-8 px-6 py-2 border border-blue-500/50 rounded-full text-blue-400 uppercase tracking-widest text-xs font-bold group-hover:bg-blue-500 group-hover:text-white transition-all">
                            Enter Mini Auction
                        </div>
                    </div>
                </div>

                {/* BOX 3: CUSTOM BIT */}
                <div 
                    onClick={() => handleModeSelect('CUSTOM')}
                    className="group relative cursor-pointer h-96 rounded-3xl overflow-hidden border border-purple-500/30 hover:border-purple-400 transition-all duration-500 hover:shadow-[0_0_50px_rgba(168,85,247,0.3)] hover:-translate-y-2 bg-slate-900"
                >
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover:scale-110 transition-transform duration-700"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                    
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 z-10">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-700 flex items-center justify-center mb-6 shadow-lg group-hover:rotate-12 transition-transform">
                            <Settings size={40} className="text-white" />
                        </div>
                        <h2 className="text-5xl font-teko font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">CUSTOM BIT</h2>
                        <p className="text-slate-300 text-sm max-w-[80%] leading-relaxed">Create your own rules. Set custom purses, player sets, and invite friends for a private league.</p>
                        <div className="mt-8 px-6 py-2 border border-purple-500/50 rounded-full text-purple-400 uppercase tracking-widest text-xs font-bold group-hover:bg-purple-500 group-hover:text-white transition-all">
                            Create Custom Room
                        </div>
                    </div>
                </div>

             </div>
        )}

        {/* STEP 2: PLAY MODE SELECTION (SINGLE / MULTI) */}
        {lobbyStep === 'PLAY_MODE' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl px-4 animate-fade-in-up">
                
                {/* SINGLE PLAYER */}
                <div 
                    onClick={() => handlePlayModeSelect('SINGLE')}
                    className="group relative cursor-pointer h-80 rounded-3xl overflow-hidden border border-emerald-500/30 hover:border-emerald-400 transition-all duration-500 hover:shadow-[0_0_50px_rgba(16,185,129,0.3)] hover:-translate-y-2 bg-slate-900"
                >
                     <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 to-black z-0"></div>
                     <div className="absolute inset-0 flex flex-col items-center justify-between p-8 z-10 text-center">
                        <div className="flex flex-col items-center">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                                <Cpu size={40} className="text-white" />
                            </div>
                            <h2 className="text-5xl font-teko font-bold text-white group-hover:text-emerald-400 transition-colors leading-none">Single Player</h2>
                        </div>
                        <p className="text-slate-300 text-sm max-w-[90%] leading-relaxed">Solo Offline Mode. Compete against smart AI bots that bid based on real player stats and logic.</p>
                        <div className="px-8 py-2 border border-emerald-500/50 rounded-full text-emerald-400 uppercase tracking-widest text-xs font-bold group-hover:bg-emerald-500 group-hover:text-white transition-all">
                            Play vs AI
                        </div>
                     </div>
                </div>

                {/* MULTIPLAYER */}
                <div 
                    onClick={() => handlePlayModeSelect('MULTI')}
                    className="group relative cursor-pointer h-80 rounded-3xl overflow-hidden border border-indigo-500/30 hover:border-indigo-400 transition-all duration-500 hover:shadow-[0_0_50px_rgba(99,102,241,0.3)] hover:-translate-y-2 bg-slate-900"
                >
                     <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 to-black z-0"></div>
                     <div className="absolute inset-0 flex flex-col items-center justify-between p-8 z-10 text-center">
                        <div className="flex flex-col items-center">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-700 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                                <Globe size={40} className="text-white" />
                            </div>
                            <h2 className="text-5xl font-teko font-bold text-white group-hover:text-indigo-400 transition-colors leading-none">Multiplayer</h2>
                        </div>
                        <p className="text-slate-300 text-sm max-w-[90%] leading-relaxed">Online PvP. Create a room, invite friends, and bid in real-time synchronisation.</p>
                        <div className="px-8 py-2 border border-indigo-500/50 rounded-full text-indigo-400 uppercase tracking-widest text-xs font-bold group-hover:bg-indigo-500 group-hover:text-white transition-all">
                            Connect Online
                        </div>
                     </div>
                </div>

            </div>
        )}

        {/* STEP 2.5: MULTIPLAYER SETUP SCREEN */}
        {lobbyStep === 'MULTIPLAYER_SETUP' && (
            <div className="w-full max-w-6xl px-4 animate-scale-in flex flex-col items-center">
                <h2 className="text-6xl font-teko font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-8 drop-shadow-lg uppercase">
                    Multiplayer Auction
                </h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
                    
                    {/* LEFT COL: CREATE & JOIN Forms */}
                    <div className="lg:col-span-2 glass-panel rounded-2xl p-8 border border-slate-700/50 flex flex-col gap-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px]"></div>

                        {/* CREATE ROOM SECTION */}
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                                <Plus className="text-blue-400" size={24} />
                                <h3 className="text-3xl font-teko font-bold text-white uppercase tracking-wide">Create a Room</h3>
                            </div>
                            
                            <div className="flex flex-col gap-4">
                                <input 
                                    type="text" 
                                    placeholder="Enter your name" 
                                    className="w-full bg-slate-950/80 border border-slate-700 rounded-lg p-4 text-white placeholder-slate-500 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                                    value={createName}
                                    onChange={(e) => setCreateName(e.target.value)}
                                />
                                
                                <label className="flex items-center gap-3 cursor-pointer group w-fit">
                                    <div 
                                        className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${isPublic ? 'bg-blue-500 border-blue-500' : 'bg-transparent border-slate-600'}`}
                                        onClick={() => setIsPublic(!isPublic)}
                                    >
                                        {isPublic && <CheckCircle2 size={16} className="text-white" />}
                                    </div>
                                    <span className="text-slate-400 group-hover:text-slate-200 text-sm uppercase tracking-wider select-none">Make this room Public</span>
                                </label>

                                <button 
                                    onClick={handleCreateRoom}
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-lg uppercase tracking-widest shadow-lg hover:shadow-blue-500/20 transition-all transform active:scale-[0.99] flex items-center justify-center gap-2"
                                >
                                    Create Room
                                </button>
                            </div>
                        </div>

                        {/* OR DIVIDER */}
                        <div className="relative flex items-center py-2">
                            <div className="flex-grow border-t border-slate-700"></div>
                            <span className="flex-shrink-0 mx-4 text-slate-500 font-teko text-xl">OR</span>
                            <div className="flex-grow border-t border-slate-700"></div>
                        </div>

                        {/* JOIN ROOM SECTION */}
                        <div className="relative z-10">
                             <div className="flex items-center gap-2 mb-4">
                                <LogIn className="text-purple-400" size={24} />
                                <h3 className="text-3xl font-teko font-bold text-white uppercase tracking-wide">Join a Room</h3>
                            </div>

                            <div className="flex flex-col gap-4">
                                <input 
                                    type="text" 
                                    placeholder="Enter your name (Required)" 
                                    className="w-full bg-slate-950/80 border border-slate-700 rounded-lg p-4 text-white placeholder-slate-500 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                                    value={joinName}
                                    onChange={(e) => setJoinName(e.target.value)}
                                />
                                <div className="flex gap-4">
                                    <input 
                                        type="text" 
                                        placeholder="ROOM CODE" 
                                        className="flex-1 bg-slate-950/80 border border-slate-700 rounded-lg p-4 text-white placeholder-slate-500 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none font-mono uppercase tracking-widest"
                                        value={roomCodeInput}
                                        onChange={(e) => setRoomCodeInput(e.target.value)}
                                    />
                                    <button 
                                        onClick={handleJoinRoom}
                                        className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-8 rounded-lg uppercase tracking-widest shadow-lg hover:shadow-purple-500/20 transition-all"
                                    >
                                        Join
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COL: PUBLIC LIST */}
                    <div className="glass-panel rounded-2xl border border-slate-700/50 flex flex-col h-full shadow-2xl relative overflow-hidden min-h-[400px]">
                        <div className="p-6 border-b border-slate-700/50 bg-slate-900/50 flex justify-between items-center">
                            <h3 className="text-2xl font-teko font-bold text-green-400 uppercase tracking-wide flex items-center gap-2">
                                <Users size={20} /> Public Auctions
                            </h3>
                            <button 
                                onClick={handleRefresh}
                                className={`text-slate-400 hover:text-white transition-colors bg-slate-800 p-2 rounded ${isRefreshing ? 'animate-spin' : ''}`}
                            >
                                <RefreshCw size={16} />
                            </button>
                        </div>

                        <div className="flex-1 p-6 flex flex-col items-center justify-center text-slate-500 relative">
                             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-5"></div>
                             
                             <div className="bg-slate-800/50 p-6 rounded-full mb-4 border border-slate-700">
                                <Globe size={48} className="opacity-50" />
                             </div>
                             <p className="text-lg mb-2">No public rooms available.</p>
                             <p className="text-sm text-slate-600">Why not create one?</p>
                        </div>
                    </div>

                </div>
            </div>
        )}

        {/* STEP 2.75: MULTIPLAYER WAITING ROOM (New Requested View) */}
        {lobbyStep === 'MULTIPLAYER_WAITING_ROOM' && (
             <div className="w-full max-w-7xl px-4 animate-fade-in-up flex flex-col lg:flex-row gap-8 items-start h-[80vh]">
                 
                 {/* LEFT: Room Details & Player List */}
                 <div className="w-full lg:w-1/4 flex flex-col gap-4 h-full">
                     {/* Room Code Card */}
                     <div className="glass-panel rounded-2xl p-6 border border-slate-700/50 relative overflow-hidden">
                         <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-transparent"></div>
                         <h3 className="text-slate-400 uppercase tracking-widest text-xs font-bold mb-2">Room Code</h3>
                         <div className="flex items-center justify-between bg-slate-900/80 p-3 rounded-lg border border-slate-700">
                             <span className="text-3xl font-mono font-bold text-blue-400 tracking-widest">{contextRoomCode || 'WAITING'}</span>
                             <button 
                                onClick={handleCopyCode}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 text-xs font-bold uppercase tracking-widest ${
                                    copied 
                                    ? 'bg-green-500/10 border-green-500/50 text-green-400' 
                                    : 'bg-slate-800 border-slate-600 text-slate-400 hover:text-white hover:border-slate-500 hover:bg-slate-700'
                                }`}
                                title="Copy Code"
                            >
                                 {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                                 <span>{copied ? 'Copied' : 'Copy'}</span>
                             </button>
                         </div>
                         <p className="text-slate-500 text-[10px] mt-2">Share this code with your friends to join.</p>
                     </div>

                     {/* Player List */}
                     <div className="glass-panel rounded-2xl p-6 border border-slate-700/50 flex-1 flex flex-col">
                         <h3 className="text-slate-300 uppercase tracking-widest text-sm font-bold mb-4 flex items-center gap-2">
                             <Users size={16} /> Players (1)
                         </h3>
                         
                         <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                             {/* Self (Mocked) */}
                             <div className="flex items-center gap-3 bg-slate-800/40 p-3 rounded-lg border border-slate-700/50">
                                 <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-lg">
                                     {userName.charAt(0).toUpperCase()}
                                 </div>
                                 <div className="flex-1">
                                     <div className="text-white font-bold text-sm uppercase">{userName.toUpperCase()}</div>
                                     <div className="text-[10px] text-yellow-500 font-bold uppercase tracking-wider">{isHost ? 'Host' : 'Guest'}</div>
                                 </div>
                             </div>
                             {/* Mock other players would go here */}
                         </div>

                         <div className="mt-4 pt-4 border-t border-slate-700">
                             <select className="w-full bg-slate-900 border border-slate-700 text-slate-400 text-sm p-3 rounded-lg outline-none focus:border-blue-500 mb-4">
                                 <option>Assign Team...</option>
                                 {/* Only Host sees this typically */}
                             </select>
                             
                             {isHost ? (
                                 <button 
                                    onClick={handleStartAuction}
                                    className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                                 >
                                     <Play size={20} fill="currentColor" /> Start Auction
                                 </button>
                             ) : (
                                 <div className="text-center text-slate-500 text-xs uppercase tracking-widest animate-pulse">
                                     Waiting for Host to start...
                                 </div>
                             )}
                         </div>
                     </div>
                 </div>

                 {/* RIGHT: Team Selection Grid */}
                 <div className="w-full lg:w-3/4 h-full flex flex-col">
                     <h2 className="text-4xl font-teko font-bold text-white mb-6">Select Your Team</h2>
                     
                     <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-12">
                         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {teams.map(team => {
                                const isSelected = userTeamId === team.id;
                                const styles = getTeamStyles(team.id);
                                return (
                                    <div 
                                        key={team.id}
                                        onClick={() => handleSelectTeam(team.id)}
                                        className={`cursor-pointer rounded-xl border p-4 flex items-center gap-4 transition-all duration-200 ${isSelected ? `bg-slate-800 border-${styles.text.split('-')[1]}-500 shadow-lg shadow-${styles.text.split('-')[1]}-500/20` : 'bg-slate-900/50 border-slate-700 hover:border-slate-500 hover:bg-slate-800'}`}
                                    >
                                        <div className="w-16 h-16 rounded-full bg-slate-950 flex items-center justify-center p-2 border border-slate-700 shrink-0">
                                            <TeamLogo team={team} className="w-full h-full object-contain" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-1">
                                                <h3 className="text-xl font-teko font-bold text-white tracking-wide truncate pr-2">{team.shortName}</h3>
                                                {isSelected && <CheckCircle2 size={20} className="text-green-500 shrink-0" />}
                                            </div>
                                            <div className="text-xs text-slate-400 mb-1">Purse: <span className="text-white font-mono">{formatCurrency(team.purseRemaining)}</span></div>
                                            <div className="text-[10px] text-slate-500 uppercase tracking-widest">Click to Select</div>
                                        </div>
                                    </div>
                                );
                            })}
                         </div>
                     </div>
                 </div>

             </div>
        )}

        {/* STEP 3: OLD TEAM SELECTION (Only for Single Player now) */}
        {lobbyStep === 'ROLES' && (
            <div className="w-full max-w-7xl px-4 animate-fade-in-up flex flex-col items-center">
                
                <div className="text-center mb-10">
                    <h2 className="text-5xl md:text-6xl font-teko font-bold text-white uppercase tracking-wide mb-2 text-glow">
                        Select Your Team
                    </h2>
                    <p className="text-slate-400 text-lg tracking-widest uppercase">
                        Choose a franchise to manage in the {selectedMode?.subtitle || 'Auction'}
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-16 w-full">
                    {teams.map(team => {
                         const styles = getTeamStyles(team.id);
                         
                         return (
                            <button 
                                key={team.id}
                                onClick={() => {
                                    setRole('TEAM', team.id);
                                    startAuction();
                                }}
                                className={`group relative bg-slate-900/80 backdrop-blur-md border border-slate-700 ${styles.border} ${styles.shadow} ${styles.ring} hover:ring-1 rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] flex flex-col h-[340px] w-full text-left shadow-2xl`}
                            >
                                {/* Selection Indicator (Hover) */}
                                <div className={`absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity ${styles.text}`}>
                                    <CheckCircle2 size={24} />
                                </div>

                                {/* Top Section: Logo & Name */}
                                <div className="flex-1 p-6 flex flex-col items-center justify-center relative">
                                     {/* Background Glow */}
                                     <div className={`absolute inset-0 bg-gradient-to-b from-slate-800 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                                     <div className={`absolute top-0 left-0 w-full h-32 opacity-10 bg-gradient-to-b ${styles.bg === 'bg-white' ? 'from-slate-500' : 'from-' + styles.text.split('-')[1] + '-500'} to-transparent blur-xl`}></div>

                                     {/* Logo Container */}
                                     <div className={`w-28 h-28 rounded-full bg-white/5 border-2 border-white/10 group-hover:border-current ${styles.text} flex items-center justify-center mb-6 shadow-2xl group-hover:scale-110 transition-transform duration-300 relative z-10 overflow-hidden p-2`}>
                                         <TeamLogo team={team} className="w-full h-full object-contain drop-shadow-lg" />
                                     </div>

                                     <h3 className="text-5xl font-teko font-bold text-white leading-none mb-2 relative z-10 tracking-wide">{team.shortName}</h3>
                                     <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold text-center relative z-10 leading-relaxed min-h-[30px] flex items-center">
                                         {team.name}
                                     </p>
                                </div>

                                {/* Bottom Section: Purse */}
                                <div className="bg-slate-950/80 border-t border-white/5 p-5 flex justify-between items-center w-full group-hover:bg-slate-950 transition-colors relative z-20">
                                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Purse</span>
                                    <span className={`text-2xl font-mono font-bold text-white group-hover:${styles.text.split(' ')[0]} transition-colors`}>
                                        {formatCurrency(team.purseRemaining)}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        )}

        {/* Back Button */}
        {lobbyStep !== 'MODES' && (
            <button 
                onClick={handleBack}
                className="mt-12 text-slate-500 hover:text-white uppercase tracking-widest text-xs font-bold transition-colors fixed top-4 left-4 z-50 flex items-center gap-2 bg-black/20 backdrop-blur px-4 py-2 rounded-full border border-white/5 hover:border-white/20"
            >
                <ArrowRight className="rotate-180" size={14} /> Back
            </button>
        )}

      </div>
    </div>
  );
};

export default Lobby;