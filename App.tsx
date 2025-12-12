import React from 'react';
import { AuctionProvider, useAuction } from './context/AuctionContext';
import Lobby from './pages/Lobby';
import AuctionRoom from './pages/AuctionRoom';
import { formatCurrency } from './constants';
import { Trophy } from 'lucide-react';

const AppContent: React.FC = () => {
  const { phase, players, teams } = useAuction();

  if (phase === 'LOBBY') {
    return <Lobby />;
  }

  if (phase === 'SUMMARY') {
      return (
          <div className="min-h-screen bg-ipl-dark text-white p-8 font-roboto">
              <header className="mb-12 text-center">
                   <h1 className="text-6xl font-teko font-bold text-ipl-gold mb-2 uppercase">Auction Summary</h1>
                   <p className="text-slate-400 tracking-widest uppercase text-sm">Squad Composition Report</p>
              </header>
              
              <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {teams.map(team => (
                    <div key={team.id} className="bg-slate-800/50 backdrop-blur rounded-xl overflow-hidden border border-slate-700 hover:border-slate-500 transition-colors">
                        {/* Card Header */}
                        <div className={`p-6 border-b border-white/5 bg-gradient-to-r ${team.color.replace('text-', 'from-').split(' ')[0]}/20 to-transparent relative overflow-hidden`}>
                             <div className={`absolute top-0 right-0 w-24 h-24 opacity-10 rounded-full blur-2xl ${team.color.replace('text-', 'bg-').split(' ')[0]}`}></div>
                             <h2 className="text-3xl font-teko font-bold text-white uppercase tracking-wide relative z-10">{team.name}</h2>
                             <div className="flex justify-between items-end mt-4 relative z-10">
                                 <div>
                                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">Purse Remaining</div>
                                    <div className="text-xl font-mono font-bold text-green-400">{formatCurrency(team.purseRemaining)}</div>
                                 </div>
                                 <div className="text-right">
                                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">Squad Size</div>
                                    <div className="text-xl font-bold text-white">{team.squadCount}<span className="text-sm text-slate-500">/25</span></div>
                                 </div>
                             </div>
                        </div>

                        {/* Player List */}
                        <div className="p-4">
                            <h3 className="text-xs uppercase font-bold text-slate-500 mb-4 tracking-widest pl-2">Acquired Players</h3>
                            {team.players.length === 0 ? (
                                <div className="text-center text-slate-600 py-8 italic text-sm">No players purchased</div>
                            ) : (
                                <ul className="space-y-2">
                                    {team.players.map(pid => {
                                        const p = players.find(pl => pl.id === pid);
                                        return (
                                            <li key={pid} className="flex justify-between items-center bg-slate-900/50 p-3 rounded border border-white/5 hover:bg-slate-900 transition-colors">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-200 text-sm">{p?.name}</span>
                                                    <span className="text-[10px] text-slate-500 uppercase">{p?.role} • {p?.isOverseas ? '✈' : 'IN'}</span>
                                                </div>
                                                <span className="text-ipl-gold font-mono text-sm">{p?.soldPrice ? formatCurrency(p.soldPrice) : '-'}</span>
                                            </li>
                                        )
                                    })}
                                </ul>
                            )}
                        </div>
                    </div>
                ))}
              </div>
          </div>
      )
  }

  return <AuctionRoom />;
};

const App: React.FC = () => {
  return (
    <AuctionProvider>
      <AppContent />
    </AuctionProvider>
  );
};

export default App;