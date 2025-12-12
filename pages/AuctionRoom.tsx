
import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useAuction } from '../context/AuctionContext';
import PlayerCard from '../components/PlayerCard';
import Timer from '../components/Timer';
import AuctionControl from '../components/AuctionControl';
import { formatCurrency } from '../constants';
import { AuctionSet, Player } from '../types';
import { History, TrendingUp, Crown, Users, LayoutList, Search, User, ArrowRight, List, Wifi, Bot, Layers, X, Gavel, Sparkles, Activity } from 'lucide-react';

const AuctionRoom: React.FC = () => {
  const { 
    teams, 
    players, 
    currentPlayerId, 
    currentBid, 
    timer, 
    history, 
    isPaused,
    nextPlayer,
    isHost,
    gameMode,
    userTeamId,
    userName
  } = useAuction();

  const [sidebarTab, setSidebarTab] = useState<'STANDINGS' | 'PLAYERS' | 'FEED'>('STANDINGS');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOverlay, setShowOverlay] = useState(false);
  const [confetti, setConfetti] = useState<number[]>([]);
  
  // Modals
  const [showOnlineModal, setShowOnlineModal] = useState(false);
  const [showSetsModal, setShowSetsModal] = useState(false);
  
  // Sets Modal State
  const [activeSet, setActiveSet] = useState<AuctionSet>(AuctionSet.MARQUEE);
  // Separate search state for the modal to avoid conflict with sidebar search
  const [modalSearchQuery, setModalSearchQuery] = useState('');

  const currentPlayer = players.find(p => p.id === currentPlayerId);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto scroll log to top when history changes or tab changes
  useEffect(() => {
    if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
    }
  }, [history, sidebarTab]);

  const isSold = currentPlayer?.status === 'SOLD';
  const isUnsold = currentPlayer?.status === 'UNSOLD';
  const winningTeam = isSold ? teams.find(t => t.id === currentPlayer?.soldTo) : null;

  // Generate Confetti
  useEffect(() => {
      if (isSold) {
          setConfetti(Array.from({ length: 50 }, (_, i) => i));
      } else {
          setConfetti([]);
      }
  }, [isSold]);

  // Handle Overlay Visibility - PERSISTENT until next player
  useEffect(() => {
    if (isSold || isUnsold) {
        setShowOverlay(true);
    } else {
        setShowOverlay(false);
    }
  }, [isSold, isUnsold]);

  const filteredPlayers = players.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter players for the Sets Modal - use modalSearchQuery
  const setPlayers = players.filter(p => p.set === activeSet && p.name.toLowerCase().includes(modalSearchQuery.toLowerCase()));
  const uniqueSets = Object.values(AuctionSet);

  // Combined Feed Events
  const feedEvents = useMemo(() => {
    const bids = history.map(b => ({ type: 'BID' as const, data: b, timestamp: b.timestamp, id: b.id }));
    const results = players
      .filter(p => (p.status === 'SOLD' || p.status === 'UNSOLD') && p.timestamp)
      .map(p => ({ type: 'RESULT' as const, data: p, timestamp: p.timestamp!, id: p.id + '_res' }));
    
    return [...bids, ...results].sort((a, b) => b.timestamp - a.timestamp);
  }, [history, players]);

  const getTeamTheme = (colorClass: string) => {
    if(!colorClass) return { from: 'from-slate-900', via: 'via-slate-800', to: 'to-black', border: 'border-slate-500', text: 'text-slate-200' };
    if(colorClass.includes('yellow')) return { from: 'from-yellow-900', via: 'via-yellow-600', to: 'to-yellow-950', border: 'border-yellow-400', text: 'text-yellow-400' };
    if(colorClass.includes('blue-500')) return { from: 'from-blue-900', via: 'via-blue-600', to: 'to-blue-950', border: 'border-blue-400', text: 'text-blue-400' };
    if(colorClass.includes('red')) return { from: 'from-red-900', via: 'via-red-600', to: 'to-red-950', border: 'border-red-500', text: 'text-red-500' };
    if(colorClass.includes('purple')) return { from: 'from-purple-900', via: 'via-purple-600', to: 'to-purple-950', border: 'border-purple-400', text: 'text-purple-400' };
    if(colorClass.includes('orange')) return { from: 'from-orange-900', via: 'via-orange-600', to: 'to-orange-950', border: 'border-orange-400', text: 'text-orange-400' };
    if(colorClass.includes('pink')) return { from: 'from-pink-900', via: 'via-pink-600', to: 'to-pink-950', border: 'border-pink-400', text: 'text-pink-400' };
    if(colorClass.includes('blue-400')) return { from: 'from-sky-900', via: 'via-sky-600', to: 'to-sky-950', border: 'border-sky-400', text: 'text-sky-400' };
    if(colorClass.includes('teal')) return { from: 'from-teal-900', via: 'via-teal-600', to: 'to-teal-950', border: 'border-teal-400', text: 'text-teal-400' };
    if(colorClass.includes('cyan')) return { from: 'from-cyan-900', via: 'via-cyan-600', to: 'to-cyan-950', border: 'border-cyan-400', text: 'text-cyan-400' };
    return { from: 'from-slate-900', via: 'via-slate-800', to: 'to-black', border: 'border-slate-500', text: 'text-slate-200' };
  };

  const theme = winningTeam ? getTeamTheme(winningTeam.color) : getTeamTheme('');

  return (
    <div className="h-screen bg-ipl-dark flex flex-col overflow-hidden relative font-roboto text-slate-200">
      
      {/* Styles for Animations */}
      <style>{`
         @keyframes stamp-bounce {
           0% { opacity: 0; transform: translate(-50%, -50%) scale(3); filter: blur(10px); }
           50% { opacity: 1; transform: translate(-50%, -50%) scale(0.9); }
           70% { transform: translate(-50%, -50%) scale(1.1); }
           100% { transform: translate(-50%, -50%) scale(1) rotate(-12deg); opacity: 1; }
         }
         @keyframes slide-up {
           from { transform: translateY(100px); opacity: 0; }
           to { transform: translateY(0); opacity: 1; }
         }
         @keyframes confetti-fall {
           0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
           100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
         }
         .confetti-piece {
            position: absolute;
            width: 10px;
            height: 10px;
            animation: confetti-fall 3s linear infinite;
         }
       `}</style>

      {/* ONLINE STATUS MODAL */}
      {showOnlineModal && (
        <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh] animate-[scale-in_0.2s_ease-out]">
                {/* Header */}
                <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                    <h2 className="text-xl font-teko font-bold text-white uppercase tracking-wide flex items-center gap-2">
                        <Users size={24} className="text-blue-400" /> Online Status
                    </h2>
                    <button 
                        onClick={() => setShowOnlineModal(false)} 
                        className="text-slate-400 hover:text-white text-sm font-bold uppercase tracking-wider transition-colors"
                    >
                        Close
                    </button>
                </div>
                
                {/* List */}
                <div className="overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {teams.map(team => {
                        const isMe = team.id === userTeamId;
                        const managerName = isMe ? userName : 'AI Managed';
                        return (
                            <div key={team.id} className="flex items-center justify-between bg-slate-800/40 border border-slate-700/50 p-3 rounded-xl hover:bg-slate-800 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center p-2">
                                        {team.logoUrl ? (
                                            <img src={team.logoUrl} alt={team.shortName} className="w-full h-full object-contain" />
                                        ) : (
                                            <div className="text-white font-bold">{team.shortName[0]}</div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-bold text-white text-base">{team.name}</div>
                                        <div className="text-sm text-slate-500">{managerName}</div>
                                    </div>
                                </div>
                                {isMe ? (
                                    <div className="flex items-center gap-2 px-3 py-1 bg-green-900/20 border border-green-500/30 rounded-full">
                                        <Wifi size={14} className="text-green-500" />
                                        <span className="text-xs font-bold text-green-400 uppercase tracking-wider">Online</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 px-3 py-1 bg-purple-900/20 border border-purple-500/30 rounded-full">
                                        <Bot size={14} className="text-purple-400" />
                                        <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">AI</span>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
      )}

      {/* PLAYER SETS MODAL (NEW) */}
      {showSetsModal && (
          <div className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-700 w-full max-w-6xl h-[85vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col animate-[scale-in_0.2s_ease-out]">
                  
                  {/* Header */}
                  <div className="flex-none p-4 md:p-6 border-b border-slate-700 flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-800">
                      <div className="flex items-center gap-4">
                          <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20">
                              <Users size={24} className="text-white" />
                          </div>
                          <div>
                              <h2 className="text-3xl font-teko font-bold text-white uppercase tracking-wide leading-none">Auction Player List</h2>
                              <p className="text-slate-400 text-xs uppercase tracking-widest">View all players across sets</p>
                          </div>
                      </div>

                      <div className="flex items-center gap-4">
                          <div className="relative hidden md:block w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                <input 
                                    type="text" 
                                    placeholder="Search players..." 
                                    value={modalSearchQuery}
                                    onChange={(e) => setModalSearchQuery(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-full pl-10 pr-4 py-2.5 text-sm text-white focus:border-blue-500 outline-none transition-colors"
                                />
                          </div>
                          <button 
                            onClick={() => setShowSetsModal(false)}
                            className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
                          >
                              <X size={24} />
                          </button>
                      </div>
                  </div>

                  {/* Body */}
                  <div className="flex-1 flex overflow-hidden">
                      {/* Sidebar Sets */}
                      <div className="w-64 bg-slate-950/50 border-r border-slate-700 overflow-y-auto custom-scrollbar flex-none hidden md:block">
                          {uniqueSets.map((set, index) => (
                              <button
                                key={set}
                                onClick={() => setActiveSet(set)}
                                className={`w-full text-left p-4 border-b border-slate-800 transition-colors flex items-center gap-4 group ${activeSet === set ? 'bg-blue-600/10 border-r-4 border-r-blue-500' : 'hover:bg-slate-900 border-r-4 border-r-transparent'}`}
                              >
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold font-mono text-lg transition-colors ${activeSet === set ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-slate-800 text-slate-500 group-hover:bg-slate-700 group-hover:text-white'}`}>
                                      {index + 1}
                                  </div>
                                  <div>
                                      <div className={`font-bold uppercase tracking-wider text-sm ${activeSet === set ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>{set.split('Set')[0].trim()}</div>
                                      <div className="text-[10px] text-slate-600 font-bold uppercase">{players.filter(p => p.set === set).length} Players</div>
                                  </div>
                              </button>
                          ))}
                      </div>

                      {/* Main Grid */}
                      <div className="flex-1 overflow-y-auto p-6 bg-slate-900">
                          {/* Mobile Search & Tabs (Visible only on small screens) */}
                          <div className="md:hidden mb-6 space-y-4">
                               <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                    <input 
                                        type="text" 
                                        placeholder="Search players..." 
                                        value={modalSearchQuery}
                                        onChange={(e) => setModalSearchQuery(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-sm text-white focus:border-blue-500 outline-none"
                                    />
                                </div>
                                <select 
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none"
                                    value={activeSet}
                                    onChange={(e) => setActiveSet(e.target.value as AuctionSet)}
                                >
                                    {uniqueSets.map(set => (
                                        <option key={set} value={set}>{set}</option>
                                    ))}
                                </select>
                          </div>

                          <div className="flex items-center justify-between mb-6">
                              <h3 className="text-2xl font-teko font-bold text-white uppercase tracking-wide border-l-4 border-yellow-500 pl-3">
                                  {activeSet}
                              </h3>
                              <span className="text-slate-500 text-sm font-bold uppercase tracking-wider">{setPlayers.length} Players</span>
                          </div>

                          {setPlayers.length === 0 ? (
                              <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                                  <Users size={48} className="mb-4 opacity-50" />
                                  <p className="uppercase tracking-widest text-sm">No players found in this set</p>
                              </div>
                          ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
                                  {setPlayers.map(p => {
                                      const isSold = p.status === 'SOLD';
                                      const isUnsold = p.status === 'UNSOLD';
                                      const isOnAuction = p.status === 'ON_AUCTION';
                                      const team = teams.find(t => t.id === p.soldTo);

                                      return (
                                          <div key={p.id} className="bg-slate-800/40 border border-slate-700 hover:border-slate-500 rounded-xl p-4 flex gap-4 transition-all hover:bg-slate-800 group relative overflow-hidden">
                                              {isOnAuction && <div className="absolute top-0 right-0 bg-yellow-500 text-black text-[10px] font-bold px-2 py-0.5 uppercase tracking-widest z-10 animate-pulse">Live</div>}
                                              
                                              <div className="w-20 h-20 rounded-lg bg-gradient-to-b from-slate-700 to-slate-900 border border-slate-600 flex-none overflow-hidden relative">
                                                  {p.imgUrl ? (
                                                      <img src={p.imgUrl} className="w-full h-full object-cover" />
                                                  ) : (
                                                      <User size={32} className="text-slate-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                                  )}
                                                  {isSold && team && (
                                                      <div className={`absolute bottom-0 left-0 right-0 h-1.5 ${team.color.split(' ')[0].replace('text-', 'bg-')}`}></div>
                                                  )}
                                              </div>

                                              <div className="flex-1 min-w-0">
                                                  <div className="flex justify-between items-start">
                                                      <h4 className="font-bold text-white text-lg leading-tight truncate pr-2 group-hover:text-blue-400 transition-colors">{p.name}</h4>
                                                      {isSold && <Gavel size={14} className="text-green-500 flex-none" />}
                                                  </div>
                                                  
                                                  <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-2">
                                                      <span>{p.role}</span>
                                                      <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                                                      <span>{p.country}</span>
                                                  </div>

                                                  <div className="bg-slate-900/50 rounded p-2 border border-slate-700/50 flex justify-between items-center">
                                                      <span className="text-[10px] text-slate-500 uppercase">Base: {formatCurrency(p.basePrice)}</span>
                                                      {isSold ? (
                                                          <span className="font-mono font-bold text-green-400 text-sm">{formatCurrency(p.soldPrice || 0)}</span>
                                                      ) : isUnsold ? (
                                                          <span className="font-bold text-red-500 text-xs uppercase">Unsold</span>
                                                      ) : (
                                                          <span className="text-slate-600 text-xs">-</span>
                                                      )}
                                                  </div>
                                              </div>
                                          </div>
                                      )
                                  })}
                              </div>
                          )}
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* FULL SCREEN SOLD OVERLAY */}
      {(isSold || isUnsold) && showOverlay && (
         <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden">
             
             {/* 1. Background Layer (Team Gradient) */}
             <div className={`absolute inset-0 bg-gradient-to-br ${isSold ? theme.from : 'from-gray-900'} ${isSold ? theme.via : 'via-gray-800'} ${isSold ? theme.to : 'to-black'} opacity-95 animate-[scale-in_0.5s_ease-out]`}></div>
             
             {/* 2. Confetti Layer */}
             {isSold && confetti.map((c) => (
                <div 
                    key={c} 
                    className="confetti-piece" 
                    style={{
                        left: `${Math.random() * 100}%`,
                        backgroundColor: ['#D1AB3E', '#fff', '#f00', '#00f', '#0f0'][Math.floor(Math.random() * 5)],
                        animationDelay: `${Math.random() * 2}s`,
                        animationDuration: `${2 + Math.random() * 2}s`
                    }}
                ></div>
             ))}

             {/* 3. Main Content Container */}
             <div className="relative z-10 w-full max-w-7xl h-full flex flex-col items-center justify-center p-4">

                {/* Split Layout: Player | Details */}
                <div className="flex flex-col md:flex-row items-center justify-center w-full h-[60%] gap-8 md:gap-20 mt-10">
                    
                    {/* LEFT: Player Image & Stamp */}
                    <div className="relative h-[40vh] md:h-[60vh] w-full md:w-1/2 flex justify-center items-end animate-[slide-up_0.8s_ease-out_0.2s_both]">
                         {/* Glow behind player */}
                         <div className={`absolute bottom-0 w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full blur-[100px] opacity-60 ${isSold ? 'bg-green-500/20' : 'bg-red-900/20'}`}></div>
                         
                         {/* STAMP - Centered on image */}
                         <div className="absolute top-1/2 left-1/2 z-50 pointer-events-none w-full flex justify-center">
                            <h1 
                                className={`text-[6rem] md:text-[9rem] font-black font-teko uppercase leading-none tracking-tighter border-8 md:border-[12px] px-8 md:px-12 transform -rotate-12 shadow-2xl backdrop-blur-sm ${isSold ? 'border-green-500 text-green-500' : 'border-red-600 text-red-600'}`}
                                style={{ 
                                    animation: 'stamp-bounce 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.5s forwards', 
                                    opacity: 0,
                                    textShadow: '0 10px 30px rgba(0,0,0,0.5)'
                                }}
                            >
                                {isSold ? 'SOLD' : 'UNSOLD'}
                            </h1>
                        </div>

                         {currentPlayer?.imgUrl ? (
                             <img 
                                src={currentPlayer.imgUrl} 
                                alt={currentPlayer.name} 
                                className={`h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] ${isUnsold ? 'grayscale contrast-125' : ''}`}
                             />
                         ) : (
                             <User size={300} className="text-white/50" />
                         )}
                    </div>

                    {/* RIGHT: Team & Price Details */}
                    {isSold && winningTeam && (
                        <div className="flex flex-col items-center md:items-start text-center md:text-left animate-[slide-up_0.8s_ease-out_0.5s_both]">
                             <div className="text-white/80 font-bold uppercase tracking-[0.3em] text-lg mb-2">Acquired By</div>
                             
                             <div className="flex items-center gap-6 mb-6">
                                 {/* Team Logo */}
                                 <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-full p-2 shadow-2xl flex items-center justify-center">
                                     {winningTeam.logoUrl ? (
                                         <img src={winningTeam.logoUrl} alt={winningTeam.shortName} className="w-full h-full object-contain" />
                                     ) : (
                                         <div className={`w-full h-full rounded-full ${winningTeam.color.split(' ')[0].replace('text-', 'bg-')}`}></div>
                                     )}
                                 </div>
                                 <h2 className="text-5xl md:text-8xl font-teko font-bold text-white uppercase drop-shadow-md">{winningTeam.name}</h2>
                             </div>

                             <div className="h-1 w-full bg-gradient-to-r from-transparent via-white/50 to-transparent mb-6"></div>

                             <div className="flex flex-col">
                                 <span className="text-white/60 font-bold uppercase tracking-[0.2em] text-sm mb-1">Winning Bid</span>
                                 <span className="text-6xl md:text-8xl font-mono font-bold text-ipl-gold drop-shadow-lg tracking-tight">
                                     {formatCurrency(currentPlayer?.soldPrice || 0)}
                                 </span>
                             </div>
                        </div>
                    )}
                </div>

                {/* BOTTOM: Next Button (Wait for user) */}
                <div className="absolute bottom-12 z-50 animate-[slide-up_1s_ease-out_1s_both]">
                    {(isHost || gameMode === 'SINGLE') ? (
                         <button 
                            onClick={nextPlayer} 
                            className="bg-white text-black px-12 py-5 rounded-full font-bold uppercase tracking-widest text-lg hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.4)] flex items-center gap-3 group ring-4 ring-white/30"
                        >
                            Proceed to Next Player <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                             <span className="text-white/60 uppercase tracking-widest text-sm">Waiting for Host</span>
                             <div className="flex gap-2">
                                <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-75"></div>
                                <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-150"></div>
                             </div>
                        </div>
                    )}
                </div>

             </div>
         </div>
      )}

      {/* Top Ticker Header */}
      <header className="glass-panel z-30 sticky top-0 h-16 flex items-center px-6 justify-between shadow-2xl border-b border-white/5 flex-none">
        <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-gradient-to-br from-ipl-gold to-yellow-600 rounded flex items-center justify-center text-black font-bold font-teko text-xl shadow-lg">
                    IPL
                </div>
                <div>
                    <h1 className="text-xl font-bold font-teko uppercase text-white tracking-wider leading-none">Mini Auction 2026</h1>
                    <span className="text-[10px] text-green-400 font-mono tracking-widest uppercase flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Live
                    </span>
                </div>
            </div>

            {/* Multiplayer & Controls */}
            {gameMode === 'MULTI' && (
                <div className="hidden lg:flex items-center gap-3 border-l border-white/10 pl-6 py-1">
                    <button 
                        onClick={() => setShowSetsModal(true)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 hover:bg-slate-700 border border-slate-600/50 rounded-full transition-colors text-slate-300 text-xs font-bold tracking-wide"
                    >
                        <Layers size={14} /> <span>Sets</span>
                    </button>
                    <button 
                        onClick={() => setSidebarTab('PLAYERS')}
                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 hover:bg-slate-700 border border-slate-600/50 rounded-full transition-colors text-slate-300 text-xs font-bold tracking-wide"
                    >
                        <List size={14} /> <span>Players</span>
                    </button>
                    <div 
                        onClick={() => setShowOnlineModal(true)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 border border-slate-600/50 rounded-full text-slate-300 text-xs font-bold tracking-wide cursor-pointer hover:bg-slate-700 transition-colors"
                    >
                        <div className="relative">
                            <Users size={14} />
                            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full animate-pulse border border-slate-900"></span>
                        </div>
                        <span>1 Online</span>
                    </div>
                </div>
            )}

            {/* Always show Sets button even in Single Player if user wants to see list */}
            {gameMode === 'SINGLE' && (
                <div className="hidden lg:flex items-center gap-3 border-l border-white/10 pl-6 py-1">
                     <button 
                        onClick={() => setShowSetsModal(true)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 hover:bg-slate-700 border border-slate-600/50 rounded-full transition-colors text-slate-300 text-xs font-bold tracking-wide"
                    >
                        <Layers size={14} /> <span>Sets</span>
                    </button>
                </div>
            )}
        </div>
        
        {/* Horizontal Scrollable Teams Purse (Mobile/Tablet only or if Sidebar is hidden) */}
        <div className="flex-1 mx-8 overflow-x-auto no-scrollbar mask-linear-fade lg:hidden">
            <div className="flex gap-3">
                {teams.map(team => (
                    <div key={team.id} className={`flex items-center gap-3 px-3 py-1.5 rounded bg-slate-800/80 border ${team.players.length === currentPlayer?.soldPrice ? 'border-ipl-gold' : 'border-slate-700'} min-w-max`}>
                         {team.logoUrl ? (
                             <img src={team.logoUrl} alt={team.shortName} className="w-8 h-8 object-contain" />
                         ) : (
                             <div className={`w-2 h-8 rounded-full ${team.color.split(' ')[0].replace('text-', 'bg-')}`}></div>
                         )}
                         <div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{team.shortName}</div>
                            <div className="text-xs font-mono text-white font-bold">{formatCurrency(team.purseRemaining)}</div>
                         </div>
                    </div>
                ))}
            </div>
        </div>

      </header>

      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Left: Main Stage */}
        <main className="flex-1 p-4 md:p-8 flex flex-col relative overflow-y-auto pb-36">
             <div className="flex justify-center mb-6 md:mb-10 scale-90 md:scale-100">
                 <Timer seconds={timer} />
             </div>
             
             <PlayerCard 
                player={currentPlayer || null} 
                currentBidAmount={currentBid?.amount || null} 
             />
        </main>

        {/* Right: Sidebar */}
        <aside className="hidden lg:flex w-96 glass-panel border-l border-white/5 flex-col shadow-2xl h-full">
            {/* Header / Tabs */}
            <div className="flex-none flex border-b border-white/5 bg-slate-900/50">
                <button 
                    onClick={() => setSidebarTab('STANDINGS')}
                    className={`flex-1 p-4 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${sidebarTab === 'STANDINGS' ? 'text-ipl-gold bg-white/5 border-b-2 border-ipl-gold' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    <LayoutList size={16} /> Teams
                </button>
                <button 
                    onClick={() => setSidebarTab('PLAYERS')}
                    className={`flex-1 p-4 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${sidebarTab === 'PLAYERS' ? 'text-ipl-gold bg-white/5 border-b-2 border-ipl-gold' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    <Users size={16} /> Players
                </button>
                 <button 
                    onClick={() => setSidebarTab('FEED')}
                    className={`flex-1 p-4 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${sidebarTab === 'FEED' ? 'text-ipl-gold bg-white/5 border-b-2 border-ipl-gold' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    <Activity size={16} /> Feed
                </button>
            </div>

            {/* Tab Content - Fixed Size & Scrollable */}
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto custom-scrollbar bg-slate-950/30 min-h-0">
                
                {/* STANDINGS TAB */}
                {sidebarTab === 'STANDINGS' && (
                    <div className="p-4 space-y-3 pb-8">
                        {teams.map(team => {
                           const isCurrentBidder = currentBid?.teamId === team.id;
                           return (
                              <div 
                                key={team.id} 
                                className={`p-4 rounded-xl border transition-all duration-300 ${isCurrentBidder ? 'border-ipl-gold bg-ipl-gold/10 shadow-[0_0_15px_rgba(209,171,62,0.15)] scale-[1.02]' : 'border-slate-700/50 bg-slate-900/40 hover:bg-slate-800/60 hover:border-slate-600'}`}
                              >
                                 <div className="flex justify-between items-center mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full shadow-lg ${team.color.split(' ')[0].replace('text-', 'bg-')}`}></div>
                                        <span className="font-teko font-bold text-2xl text-white tracking-wide">{team.shortName}</span>
                                    </div>
                                    <span className="font-mono font-bold text-green-400 text-lg tracking-tight">{formatCurrency(team.purseRemaining)}</span>
                                 </div>
                                 <div className="flex justify-between text-[11px] uppercase font-bold text-slate-500 tracking-wider">
                                    <span>Squad: <span className="text-slate-300">{team.squadCount}/25</span></span>
                                    <span>OS: <span className="text-slate-300">{team.overseasCount}/8</span></span>
                                 </div>
                              </div>
                           )
                        })}
                     </div>
                )}

                {/* PLAYERS TAB (Search) */}
                {sidebarTab === 'PLAYERS' && (
                    <div className="min-h-full">
                        {/* Sticky Search Bar */}
                        <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm border-b border-white/5 p-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                                <input 
                                    type="text" 
                                    placeholder="Search name, country, role..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-ipl-gold focus:outline-none focus:ring-1 focus:ring-ipl-gold/50 transition-all"
                                />
                            </div>
                        </div>
                        
                        {/* Scrollable List */}
                        <div className="p-4 space-y-2 pb-8">
                            {filteredPlayers.length === 0 ? (
                                <div className="text-center text-slate-500 text-xs py-8 italic">No players found</div>
                            ) : (
                                filteredPlayers.map(p => {
                                    const isCurrent = p.id === currentPlayerId;
                                    return (
                                        <div key={p.id} className={`p-3 rounded-lg border flex items-center justify-between group transition-all ${isCurrent ? 'bg-ipl-gold/10 border-ipl-gold/50' : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800'}`}>
                                            <div className="flex items-center gap-3">
                                                 <div className={`w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center border border-slate-700 overflow-hidden ${isCurrent ? 'border-ipl-gold' : ''}`}>
                                                     {p.imgUrl ? <img src={p.imgUrl} className="w-full h-full object-cover" /> : <User size={14} className="text-slate-500" />}
                                                 </div>
                                                 <div>
                                                     <div className={`text-sm font-bold ${isCurrent ? 'text-ipl-gold' : 'text-white'}`}>{p.name}</div>
                                                     <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
                                                         <span>{p.role}</span> • <span>{p.country}</span>
                                                     </div>
                                                 </div>
                                            </div>
                                            <div className="text-right">
                                                 {p.status === 'SOLD' && (
                                                     <>
                                                         <div className="text-[10px] font-bold text-green-500 uppercase">Sold</div>
                                                         <div className="text-xs font-mono text-white">{formatCurrency(p.soldPrice || 0)}</div>
                                                     </>
                                                 )}
                                                 {p.status === 'UNSOLD' && (
                                                     <div className="text-[10px] font-bold text-red-500 uppercase bg-red-900/20 px-2 py-1 rounded">Unsold</div>
                                                 )}
                                                 {(p.status === 'UPCOMING' || p.status === 'ON_AUCTION') && (
                                                     <>
                                                         <div className={`text-[10px] font-bold uppercase ${p.status === 'ON_AUCTION' ? 'text-ipl-gold animate-pulse' : 'text-slate-500'}`}>{p.status === 'ON_AUCTION' ? 'Live' : 'Base'}</div>
                                                         <div className="text-xs font-mono text-slate-400">{formatCurrency(p.basePrice)}</div>
                                                     </>
                                                 )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}
                
                 {/* FEED TAB */}
                {sidebarTab === 'FEED' && (
                    <div className="p-4 space-y-3 pb-8">
                        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 sticky top-0 bg-slate-900/95 py-2 z-10">Live Feed</h3>
                        {feedEvents.length === 0 ? (
                            <div className="text-center text-slate-500 text-xs py-8 italic flex flex-col items-center">
                                <Activity size={24} className="mb-2 opacity-50" />
                                Waiting for activity...
                            </div>
                        ) : (
                            feedEvents.map((event) => {
                                if (event.type === 'BID') {
                                    const bid = event.data as any; // Cast to avoid complex TS in render
                                    const team = teams.find(t => t.id === bid.teamId);
                                    const player = players.find(p => p.id === bid.playerId);
                                    
                                    return (
                                        <div key={event.id} className="flex items-center gap-3 p-3 rounded-lg border bg-slate-800/40 border-slate-700/50">
                                            <div className="w-8 h-8 rounded bg-slate-900 flex items-center justify-center border border-slate-700 overflow-hidden flex-none">
                                                {team?.logoUrl ? <img src={team.logoUrl} className="w-full h-full object-contain" /> : <span className="font-bold text-xs">{team?.shortName}</span>}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-baseline justify-between">
                                                    <span className="text-xs font-bold text-white truncate mr-1">{team?.shortName}</span>
                                                    <span className="text-[10px] text-slate-500 font-mono">{new Date(bid.timestamp).toLocaleTimeString([], {minute:'2-digit', second:'2-digit'})}</span>
                                                </div>
                                                <div className="text-[10px] text-slate-400 truncate">
                                                    Bid for <span className="text-slate-300">{player?.name}</span>
                                                </div>
                                            </div>
                                            <div className="text-sm font-mono font-bold text-ipl-gold">
                                                {formatCurrency(bid.amount).replace('₹', '')}
                                            </div>
                                        </div>
                                    );
                                } else {
                                    const player = event.data as Player;
                                    const isSold = player.status === 'SOLD';
                                    const team = teams.find(t => t.id === player.soldTo);

                                    return (
                                        <div key={event.id} className={`flex items-center gap-3 p-3 rounded-lg border ${isSold ? 'bg-green-900/20 border-green-500/30' : 'bg-red-900/20 border-red-500/30'}`}>
                                            <div className={`w-8 h-8 rounded flex items-center justify-center border flex-none ${isSold ? 'bg-green-900/50 border-green-500' : 'bg-red-900/50 border-red-500'}`}>
                                                <Gavel size={14} className="text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-baseline justify-between">
                                                    <span className={`text-xs font-bold truncate mr-1 ${isSold ? 'text-green-400' : 'text-red-400'}`}>
                                                        {isSold ? 'PLAYER SOLD' : 'UNSOLD'}
                                                    </span>
                                                    <span className="text-[10px] text-slate-500 font-mono">{new Date(player.timestamp || 0).toLocaleTimeString([], {minute:'2-digit', second:'2-digit'})}</span>
                                                </div>
                                                <div className="text-[10px] text-slate-300 truncate">
                                                    {player.name}
                                                    {isSold && team && <span className="text-slate-500"> to {team.shortName}</span>}
                                                </div>
                                            </div>
                                            {isSold && (
                                                <div className="text-sm font-mono font-bold text-white">
                                                    {formatCurrency(player.soldPrice || 0).replace('₹', '')}
                                                </div>
                                            )}
                                        </div>
                                    )
                                }
                            })
                        )}
                    </div>
                )}
            </div>

            {/* Current Team Leader (Sticky Bottom of Sidebar) */}
            {currentBid && (
                <div className="flex-none p-5 bg-gradient-to-t from-slate-900 to-slate-800 border-t border-ipl-gold/20">
                    <h4 className="text-[10px] uppercase text-slate-500 mb-3 tracking-widest flex items-center gap-1">
                        <Crown size={12} className="text-ipl-gold" /> Current Leader
                    </h4>
                    <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded bg-white/5 flex items-center justify-center font-bold text-xl border border-slate-600 overflow-hidden p-1">
                             {teams.find(t => t.id === currentBid.teamId)?.logoUrl ? (
                                 <img src={teams.find(t => t.id === currentBid.teamId)?.logoUrl} className="w-full h-full object-contain" />
                             ) : (
                                 teams.find(t => t.id === currentBid.teamId)?.shortName[0]
                             )}
                         </div>
                         <div>
                             <div className="font-bold font-teko text-2xl text-white leading-none">{teams.find(t => t.id === currentBid.teamId)?.name}</div>
                             <div className="text-green-400 font-mono font-bold">{formatCurrency(currentBid.amount)}</div>
                         </div>
                    </div>
                </div>
            )}
        </aside>
      </div>

      <AuctionControl />
    </div>
  );
};

export default AuctionRoom;
