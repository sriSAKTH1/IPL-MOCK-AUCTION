import React from 'react';
import { useAuction } from '../context/AuctionContext';
import { formatCurrency, getNextBidAmount } from '../constants';
import { Gavel, Play, Pause, FastForward, SkipForward, AlertCircle, Bot, ArrowRight } from 'lucide-react';

const AuctionControl: React.FC = () => {
  const { 
    userRole, 
    userTeamId, 
    isPaused, 
    placeBid, 
    currentBid, 
    currentPlayerId, 
    players, 
    resumeAuction, 
    pauseAuction, 
    nextPlayer, 
    skipPlayer,
    isHost,
    isAutoPilot,
    toggleAutoPilot
  } = useAuction();

  const currentPlayer = players.find(p => p.id === currentPlayerId);
  
  if (!currentPlayer) return null;

  const isRoundComplete = currentPlayer.status === 'SOLD' || currentPlayer.status === 'UNSOLD';

  // Calculate next valid bid
  const currentAmt = currentBid ? currentBid.amount : currentPlayer.basePrice;
  const nextBid = currentBid ? getNextBidAmount(currentAmt) : currentAmt;

  // Render TEAM View
  if (userRole === 'TEAM' && userTeamId) {
    const myTeam = useAuction().teams.find(t => t.id === userTeamId);
    if (!myTeam) return null;

    const canAfford = myTeam.purseRemaining >= nextBid;
    const isMyBid = currentBid?.teamId === userTeamId;

    return (
      <div className="fixed bottom-0 left-0 right-0 p-4 z-[100] flex justify-center pointer-events-none">
        <style>{`
          @keyframes subtle-pulse {
            0% { box-shadow: 0 0 0 0 rgba(209, 171, 62, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(209, 171, 62, 0); }
            100% { box-shadow: 0 0 0 0 rgba(209, 171, 62, 0); }
          }
        `}</style>
        <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-xl border border-slate-600 rounded-2xl shadow-2xl p-4 flex flex-col md:flex-row items-center gap-6 md:gap-12 min-w-[320px] md:min-w-[600px] max-w-4xl w-full relative">
            
            {/* ADMIN CONTROLS FOR HOST (Inside Team View) */}
            {isHost && (
                <div className="absolute -top-16 right-0 bg-slate-900/90 border border-slate-600 p-2 rounded-xl flex gap-2">
                     <button onClick={isPaused ? resumeAuction : pauseAuction} className={`p-2 rounded-lg flex items-center justify-center gap-2 font-bold text-xs transition-colors ${isPaused ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-yellow-600 hover:bg-yellow-500 text-black'}`}>
                        {isPaused ? <Play size={14} /> : <Pause size={14} />}
                    </button>
                    {!isRoundComplete && (
                        <button onClick={skipPlayer} className="p-2 rounded-lg bg-red-900/50 border border-red-700 hover:bg-red-900 text-red-200 flex items-center justify-center gap-2 font-bold text-xs transition-colors">
                            <SkipForward size={14} />
                        </button>
                    )}
                    {/* Small next button kept for quick access */}
                    <button onClick={nextPlayer} className="p-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors">
                        <FastForward size={14} />
                    </button>
                </div>
            )}

            {/* Left: Purse Info & Auto Pilot Toggle */}
            <div className="flex items-center gap-4 border-r border-slate-700 pr-6 w-full md:w-auto justify-between md:justify-start">
                <div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">Available Purse</div>
                    <div className="text-2xl font-mono font-bold text-white">{formatCurrency(myTeam.purseRemaining)}</div>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <button 
                        onClick={toggleAutoPilot}
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest transition-all ${isAutoPilot ? 'bg-cyan-900 text-cyan-400 border border-cyan-500 shadow-lg shadow-cyan-500/20' : 'bg-slate-800 text-slate-500 border border-slate-700 hover:border-slate-500'}`}
                        title="Let AI take over if you go offline"
                    >
                        <Bot size={12} /> {isAutoPilot ? 'Auto ON' : 'Auto OFF'}
                    </button>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">Squad: {myTeam.squadCount}/25</div>
                </div>
            </div>

            {/* Center: Action Button */}
            <div className="flex-1 w-full md:w-auto flex justify-center">
                {isRoundComplete ? (
                    isHost ? (
                         <button
                            onClick={nextPlayer}
                            className="relative w-full md:w-auto px-10 py-4 rounded-xl bg-white text-black text-xl font-bold uppercase tracking-wider shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 hover:scale-105 hover:bg-slate-200 animate-[pulse_2s_infinite]"
                        >
                            Next Player <ArrowRight size={24} />
                        </button>
                    ) : (
                        <div className="flex flex-col items-center animate-pulse">
                            <span className="text-slate-500 uppercase tracking-widest text-xs">Waiting for Host</span>
                             <div className="flex gap-1 mt-1">
                                <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></div>
                                <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                            </div>
                        </div>
                    )
                ) : isAutoPilot ? (
                    <div className="w-full md:w-auto px-10 py-4 rounded-xl border border-cyan-500/30 bg-cyan-950/30 flex items-center justify-center gap-3 animate-pulse">
                        <Bot size={24} className="text-cyan-400" />
                        <span className="text-cyan-400 font-teko text-2xl uppercase tracking-wide">AI Bidding Active</span>
                    </div>
                ) : (
                    <button
                        onClick={() => placeBid(userTeamId)}
                        disabled={isPaused || isMyBid || !canAfford}
                        className={`relative w-full md:w-auto px-10 py-4 rounded-xl text-xl font-bold uppercase tracking-wider shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 group ${
                            isMyBid 
                            ? 'bg-green-600/20 border-2 border-green-500 text-green-500 cursor-not-allowed' 
                            : !canAfford
                                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                : isPaused 
                                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                                    : 'bg-gradient-to-r from-ipl-gold to-yellow-500 text-black hover:shadow-[0_0_30px_rgba(251,191,36,0.4)] border border-yellow-400'
                        }`}
                        style={(!isMyBid && canAfford && !isPaused) ? { animation: 'subtle-pulse 2s infinite' } : {}}
                    >
                        {isMyBid ? (
                            <>You Lead <span className="absolute -top-3 -right-3 bg-green-500 text-black text-[10px] px-2 py-1 rounded-full animate-bounce">TOP BIDDER</span></>
                        ) : !canAfford ? (
                            <>Insufficient Funds <AlertCircle size={20} /></>
                        ) : (
                            <>
                                <Gavel size={24} className="group-hover:rotate-12 transition-transform" />
                                Bid {formatCurrency(nextBid)}
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
      </div>
    );
  }

  // Render ADMIN View
  if (userRole === 'ADMIN' || isHost) {
    const isRoundComplete = currentPlayer.status === 'SOLD' || currentPlayer.status === 'UNSOLD';
    
    return (
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-2">
         <div className="bg-slate-900/90 backdrop-blur border border-slate-600 p-4 rounded-xl shadow-2xl w-64">
            <h3 className="text-[10px] uppercase font-bold text-slate-400 mb-3 tracking-widest border-b border-slate-700 pb-2">Admin Control Deck</h3>
            
            <div className="grid grid-cols-2 gap-2 mb-3">
                <button onClick={isPaused ? resumeAuction : pauseAuction} className={`p-3 rounded-lg flex items-center justify-center gap-2 font-bold text-sm transition-colors ${isPaused ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-yellow-600 hover:bg-yellow-500 text-black'}`}>
                    {isPaused ? <><Play size={16} /> Resume</> : <><Pause size={16} /> Pause</>}
                </button>
                <button onClick={skipPlayer} className="p-3 rounded-lg bg-red-900/50 border border-red-700 hover:bg-red-900 text-red-200 flex items-center justify-center gap-2 font-bold text-sm transition-colors">
                    <SkipForward size={16} /> Unsold
                </button>
            </div>

            <button 
                onClick={nextPlayer} 
                className={`w-full p-3 rounded-lg text-white font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 ${isRoundComplete ? 'bg-white text-black hover:bg-slate-200 animate-pulse' : 'bg-blue-600 hover:bg-blue-500'}`}
            >
                Next Player <FastForward size={16} />
            </button>
         </div>
      </div>
    );
  }

  return null;
};

export default AuctionControl;