import React from 'react';
import { Player } from '../types';
import { formatCurrency } from '../constants';
import { User, MapPin, Sparkles, Zap, Trophy, TrendingUp, Target, Shield, Activity } from 'lucide-react';

interface PlayerCardProps {
  player: Player | null;
  currentBidAmount: number | null;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player, currentBidAmount }) => {
  if (!player) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-600 animate-pulse">
        <div className="w-32 h-32 rounded-full border-4 border-slate-700 flex items-center justify-center mb-4">
           <User size={64} className="opacity-50" />
        </div>
        <h3 className="text-3xl font-teko uppercase tracking-widest">Waiting for next player</h3>
      </div>
    );
  }

  const isOverseas = player.isOverseas;

  return (
    <div className="relative w-full max-w-5xl mx-auto transform transition-all duration-500 hover:scale-[1.01]">
      {/* Main Card Container */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-black rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-slate-700/50 relative">
        
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-ipl-blue/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-ipl-gold/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>

        <div className="flex flex-col md:flex-row min-h-[500px]">
            
            {/* Left: Player Visuals (Simulated) */}
            <div className="md:w-5/12 relative bg-gradient-to-b from-slate-800 to-slate-950 flex items-end justify-center overflow-hidden border-r border-slate-700/50 p-6 md:p-0">
                <div className="absolute top-4 left-4 z-10">
                    <span className={`px-3 py-1 text-sm font-bold tracking-widest uppercase rounded flex items-center gap-1 shadow-lg ${isOverseas ? 'bg-purple-900 text-purple-200 border border-purple-500' : 'bg-blue-900 text-blue-200 border border-blue-500'}`}>
                        {isOverseas ? <span className="text-lg">✈</span> : <span className="text-lg">IN</span>}
                        {isOverseas ? 'Overseas' : 'Indian'}
                    </span>
                </div>
                {player.isUncapped && (
                     <div className="absolute top-4 right-4 z-10">
                        <span className="px-3 py-1 text-sm font-bold tracking-widest uppercase rounded bg-green-900 text-green-200 border border-green-500 shadow-lg">
                            Uncapped
                        </span>
                    </div>
                )}
                
                {/* Player Image or Silhouette */}
                <div className="relative z-0 opacity-100 mb-[-20px] transform transition-transform duration-700 hover:scale-105 flex justify-center w-full">
                     {player.imgUrl ? (
                         <img 
                            src={player.imgUrl} 
                            alt={player.name} 
                            className="h-[400px] object-cover drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]" 
                         />
                     ) : (
                         <User size={300} className="text-slate-600 drop-shadow-2xl" strokeWidth={0.5} />
                     )}
                </div>
                
                {/* Name Overlay on Mobile */}
                <div className="absolute bottom-10 left-0 right-0 text-center md:hidden z-20">
                    <h2 className="text-5xl font-teko font-bold text-white uppercase drop-shadow-md bg-black/50 backdrop-blur-sm py-2">{player.name}</h2>
                </div>
            </div>

            {/* Right: Stats & Auction Info */}
            <div className="md:w-7/12 p-8 flex flex-col justify-between relative z-10">
                
                {/* Header Info */}
                <div>
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2 text-ipl-gold font-bold tracking-wider uppercase text-sm">
                            <span className="bg-ipl-gold/20 px-2 py-0.5 rounded border border-ipl-gold/30">{player.role}</span>
                            <span className="flex items-center text-slate-400"><MapPin size={14} className="mr-1" /> {player.country}</span>
                        </div>
                        <div className="text-right">
                            <span className="text-xs text-slate-500 uppercase tracking-widest">Base Price</span>
                            <div className="text-2xl font-mono font-bold text-slate-300">{formatCurrency(player.basePrice)}</div>
                        </div>
                    </div>
                    
                    <h1 className="hidden md:block text-6xl lg:text-7xl font-teko font-bold text-white uppercase leading-none mb-6 gold-text-gradient drop-shadow-lg">
                        {player.name}
                    </h1>
                </div>

                {/* Stats Grid - Enhanced */}
                <div className="grid grid-cols-3 gap-3 mb-8">
                    {/* Matches */}
                    <div className="bg-slate-800/40 border border-slate-700/50 p-3 rounded-xl flex flex-col items-center justify-center backdrop-blur-sm hover:bg-slate-800 transition-colors group">
                        <div className="flex items-center gap-1 mb-1">
                            <Activity size={10} className="text-slate-500 group-hover:text-blue-400" />
                            <span className="text-[10px] text-slate-500 uppercase tracking-widest group-hover:text-blue-400 transition-colors">Mat</span>
                        </div>
                        <span className="text-2xl font-mono font-bold text-white">{player.stats.matches}</span>
                    </div>

                    {/* Runs */}
                    {player.stats.runs !== undefined && (
                        <div className="bg-slate-800/40 border border-slate-700/50 p-3 rounded-xl flex flex-col items-center justify-center backdrop-blur-sm hover:bg-slate-800 transition-colors group">
                            <div className="flex items-center gap-1 mb-1">
                                <TrendingUp size={10} className="text-slate-500 group-hover:text-yellow-400" />
                                <span className="text-[10px] text-slate-500 uppercase tracking-widest group-hover:text-yellow-400 transition-colors">Runs</span>
                            </div>
                             <span className="text-2xl font-mono font-bold text-white">{player.stats.runs}</span>
                        </div>
                    )}

                    {/* Batting Average */}
                    {player.stats.average !== undefined && (
                        <div className="bg-slate-800/40 border border-slate-700/50 p-3 rounded-xl flex flex-col items-center justify-center backdrop-blur-sm hover:bg-slate-800 transition-colors group">
                            <div className="flex items-center gap-1 mb-1">
                                <Trophy size={10} className="text-slate-500 group-hover:text-yellow-400" />
                                <span className="text-[10px] text-slate-500 uppercase tracking-widest group-hover:text-yellow-400 transition-colors">Avg</span>
                            </div>
                             <span className="text-2xl font-mono font-bold text-white">{player.stats.average}</span>
                        </div>
                    )}

                    {/* Strike Rate */}
                    {player.stats.strikeRate !== undefined && (
                        <div className="bg-slate-800/40 border border-slate-700/50 p-3 rounded-xl flex flex-col items-center justify-center backdrop-blur-sm hover:bg-slate-800 transition-colors group">
                            <div className="flex items-center gap-1 mb-1">
                                <Zap size={10} className="text-slate-500 group-hover:text-orange-400" />
                                <span className="text-[10px] text-slate-500 uppercase tracking-widest group-hover:text-orange-400 transition-colors">SR</span>
                            </div>
                             <span className="text-2xl font-mono font-bold text-white">{player.stats.strikeRate}</span>
                        </div>
                    )}
                    
                    {/* Wickets */}
                    {player.stats.wickets !== undefined && (
                        <div className="bg-slate-800/40 border border-slate-700/50 p-3 rounded-xl flex flex-col items-center justify-center backdrop-blur-sm hover:bg-slate-800 transition-colors group">
                            <div className="flex items-center gap-1 mb-1">
                                <Target size={10} className="text-slate-500 group-hover:text-purple-400" />
                                <span className="text-[10px] text-slate-500 uppercase tracking-widest group-hover:text-purple-400 transition-colors">Wkts</span>
                            </div>
                             <span className="text-2xl font-mono font-bold text-white">{player.stats.wickets}</span>
                        </div>
                    )}

                    {/* Economy */}
                    {player.stats.economy !== undefined && (
                        <div className="bg-slate-800/40 border border-slate-700/50 p-3 rounded-xl flex flex-col items-center justify-center backdrop-blur-sm hover:bg-slate-800 transition-colors group">
                            <div className="flex items-center gap-1 mb-1">
                                <Shield size={10} className="text-slate-500 group-hover:text-green-400" />
                                <span className="text-[10px] text-slate-500 uppercase tracking-widest group-hover:text-green-400 transition-colors">Econ</span>
                            </div>
                             <span className="text-2xl font-mono font-bold text-white">{player.stats.economy}</span>
                        </div>
                    )}
                </div>

                {/* AI Insight */}
                <div className="mb-8 relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                    <div className="relative bg-slate-900 p-4 rounded-lg border border-slate-700/50">
                        <h4 className="flex items-center text-cyan-400 font-bold uppercase text-xs mb-2 tracking-widest">
                            <Sparkles size={14} className="mr-2" /> AI Scout Report
                        </h4>
                        <p className="text-slate-300 text-sm leading-relaxed italic border-l-2 border-cyan-500 pl-3">
                            "{player.aiAnalysis || "Analyzing player statistics..."}"
                        </p>
                    </div>
                </div>

                {/* Live Bid Section */}
                <div className="mt-auto">
                    <div className="bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-600 p-4 rounded-xl flex justify-between items-center shadow-inner relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-ipl-gold"></div>
                        <div className="z-10">
                            <div className="text-ipl-gold text-xs font-bold uppercase tracking-[0.2em] mb-1 flex items-center gap-2">
                                <Zap size={14} className="animate-pulse" /> Current Highest Bid
                            </div>
                            <div className="text-4xl md:text-5xl font-mono font-bold text-white tracking-tight">
                                {currentBidAmount ? formatCurrency(currentBidAmount) : <span className="text-slate-500">OPENING...</span>}
                            </div>
                        </div>
                        {currentBidAmount && (
                             <div className="z-10 bg-green-500/10 border border-green-500/30 px-4 py-2 rounded flex flex-col items-center animate-pulse-fast">
                                 <span className="text-xs text-green-400 font-bold uppercase">Active</span>
                                 <span className="w-2 h-2 bg-green-500 rounded-full mt-1"></span>
                             </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerCard;