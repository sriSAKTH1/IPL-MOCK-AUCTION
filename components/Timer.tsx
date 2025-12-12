import React from 'react';

interface TimerProps {
  seconds: number;
}

const Timer: React.FC<TimerProps> = ({ seconds }) => {
  const isCritical = seconds <= 5;
  const percentage = (seconds / 20) * 100;
  
  // Color logic
  const color = isCritical ? '#dc2626' : '#D1AB3E';

  return (
    <div className="relative w-24 h-24 md:w-32 md:h-32 flex items-center justify-center">
        {/* Outer Ring / Glow */}
        <div 
            className={`absolute inset-0 rounded-full blur-md transition-all duration-500 ${isCritical ? 'bg-red-900/40' : 'bg-yellow-900/20'}`}
        ></div>

        {/* Conic Gradient for Progress */}
        <div 
            className="w-full h-full rounded-full flex items-center justify-center shadow-2xl"
            style={{
                background: `radial-gradient(closest-side, #0f172a 79%, transparent 80% 100%),
                conic-gradient(${color} ${percentage}%, #334155 0)`
            }}
        >
             {/* Inner Text */}
             <div className="flex flex-col items-center">
                 <span className={`text-4xl md:text-5xl font-mono font-bold transition-colors duration-300 ${isCritical ? 'text-red-500 text-glow' : 'text-white'}`}>
                    {seconds}
                 </span>
                 <span className="text-[10px] uppercase tracking-widest text-slate-500">Secs</span>
             </div>
        </div>
    </div>
  );
};

export default Timer;