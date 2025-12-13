
import React, { useState, useEffect, useRef } from 'react';
import { useAuction } from '../context/AuctionContext';
import { formatCurrency, INITIAL_TEAMS, MOCK_PLAYERS } from '../constants';
import { Trophy, Users, MonitorPlay, Zap, ArrowRight, Calendar, Settings, Gavel, Crown, Cpu, Globe, CheckCircle2, LogIn, Plus, Copy, Play, Trash2, Sliders, Database, RefreshCw, Upload, FileJson, Check, Edit, X, Save, Search, Lock, Key, FileSpreadsheet, Download, User, AlertTriangle, FileOutput } from 'lucide-react';
import { Player, PlayerCategory, AuctionSet } from '../types';

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

const DEFAULT_NEW_PLAYER: Player = {
    id: '',
    name: '',
    country: 'India',
    role: PlayerCategory.BATSMAN,
    isOverseas: false,
    isUncapped: false,
    basePrice: 2000000,
    set: AuctionSet.UNCAPPED,
    status: 'UPCOMING',
    stats: { matches: 0, runs: 0, wickets: 0, average: 0, strikeRate: 0, economy: 0 }
};

const Lobby: React.FC = () => {
  const { setRole, startAuction, setIsHost, setRoomCode: setContextRoomCode, roomCode: contextRoomCode, isHost, userTeamId, setGameMode, setAuctionMode, teams, setUserName: setContextUserName, setupCustomAuction, joinRoom, connectedUsers, selectTeam, userName: contextUserName, assignTeamToUser } = useAuction();
  const [yearSuffix, setYearSuffix] = useState(20);
  const [lobbyStep, setLobbyStep] = useState<'MODES' | 'PLAY_MODE' | 'MULTIPLAYER_SETUP' | 'MULTIPLAYER_WAITING_ROOM' | 'CUSTOM_ROOM_SETUP' | 'ROLES'>('MODES');
  const [selectedMode, setSelectedMode] = useState<{title: string, subtitle: string} | null>(null);

  // Multiplayer Form State
  const [userName, setUserName] = useState(''); 
  const [createName, setCreateName] = useState(''); 
  const [joinName, setJoinName] = useState(''); 
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Custom Room State
  const [customRoomName, setCustomRoomName] = useState('My Auction Room');
  const [customHostName, setCustomHostName] = useState(''); // New state for Custom Host Name
  const [hostNameError, setHostNameError] = useState(false); // Error state for host name
  const [customBudget, setCustomBudget] = useState<number>(90); 
  const [customMaxOverseas, setCustomMaxOverseas] = useState<number>(8);
  const [customSquadSize, setCustomSquadSize] = useState<number>(25); // New state for Max Squad Size
  const [customMinBid, setCustomMinBid] = useState<number>(0);
  const [customTeams, setCustomTeams] = useState(INITIAL_TEAMS.map(t => ({ ...t })));
  
  // Custom Player List Upload & Edit State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [customPlayers, setCustomPlayers] = useState<Player[] | null>(null);
  const [customListFileName, setCustomListFileName] = useState<string>('');
  
  // Player Manager Modal State
  const [showPlayerManager, setShowPlayerManager] = useState(false);
  const [managerSearch, setManagerSearch] = useState('');
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null); // If null, we are adding new or viewing list
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Custom Join Modal State
  const [showJoinCustomModal, setShowJoinCustomModal] = useState(false);
  const [joinCustomName, setJoinCustomName] = useState('');
  const [joinCustomCode, setJoinCustomCode] = useState('');
  const [joinError, setJoinError] = useState('');

  // Animation for title
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
          setLobbyStep('PLAY_MODE');
      }
      if (mode === 'MINI') {
          setSelectedMode({ title: 'IPL 2026', subtitle: 'MINI AUCTION' });
          setAuctionMode('MINI');
          setLobbyStep('PLAY_MODE');
      }
      if (mode === 'CUSTOM') {
          setSelectedMode({ title: 'CUSTOM ROOM', subtitle: 'PRIVATE LOBBY' });
          setAuctionMode('MEGA'); 
          setCustomTeams(INITIAL_TEAMS.map(t => ({...t})));
          setCustomPlayers(null); 
          setCustomListFileName('');
          setCustomHostName(''); // Reset host name
          setHostNameError(false);
          setCustomSquadSize(25); // Reset squad size
          setLobbyStep('CUSTOM_ROOM_SETUP');
      }
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
      } else if (lobbyStep === 'CUSTOM_ROOM_SETUP') {
          setLobbyStep('MODES');
          setSelectedMode(null);
      } else if (lobbyStep === 'PLAY_MODE') {
          setLobbyStep('MODES');
          setSelectedMode(null);
      }
  };

  // --- CUSTOM ROOM HANDLERS ---
  const handleCustomBudgetChange = (amount: string) => {
      const val = parseFloat(amount);
      setCustomBudget(isNaN(val) ? 0 : val);
  };
  
  const toggleTeamActive = (teamId: string) => {
      setCustomTeams(prev => prev.filter(t => t.id !== teamId));
  };
  
  const addTeamBack = (team: any) => {
      setCustomTeams(prev => [...prev, { ...team }]);
  };
  
  const restoreTeams = () => {
      setCustomTeams(INITIAL_TEAMS.map(t => ({...t})));
  };

  // Helpers for mapping Excel data
  const mapRole = (roleStr: string): PlayerCategory => {
      if (!roleStr) return PlayerCategory.BATSMAN;
      const r = roleStr.toUpperCase().trim();
      
      // Standard mappings
      if (r.includes('BOWL')) return PlayerCategory.BOWLER;
      if (r.includes('ALL') || r === 'AR') return PlayerCategory.ALL_ROUNDER;
      if (r.includes('KEEP') || r === 'WK') return PlayerCategory.WICKET_KEEPER;
      
      // Specialism mappings (Raw Data Support)
      if (r === 'BAT') return PlayerCategory.BATSMAN;
      if (r === 'BOWL') return PlayerCategory.BOWLER;
      
      return PlayerCategory.BATSMAN;
  };

  const mapSet = (setStr: string, basePrice: number): AuctionSet => {
      if (!setStr) {
          // Fallback logic if set is empty
          if (basePrice > 5000000) return AuctionSet.MARQUEE;
          if (basePrice <= 2000000) return AuctionSet.UNCAPPED;
          return AuctionSet.BATTERS_1; // Default middle ground
      }
      
      const s = setStr.toLowerCase();
      if (s.includes('marquee')) return AuctionSet.MARQUEE;
      if (s.includes('bat')) return AuctionSet.BATTERS_1;
      if (s.includes('all') && s.includes('1')) return AuctionSet.ALLROUNDERS_1;
      if (s.includes('wicket') || s.includes('wk')) return AuctionSet.WICKETKEEPERS_1;
      if (s.includes('fast') || s.includes('pace')) return AuctionSet.FAST_BOWLERS_1;
      if (s.includes('spin')) return AuctionSet.SPINNERS_1;
      if (s.includes('uncapped') || s.includes('uc')) return AuctionSet.UNCAPPED;
      
      return AuctionSet.UNCAPPED;
  };

  const handleDownloadTemplate = () => {
      try {
          if (!(window as any).XLSX) {
              alert("Excel generator loading... please wait a moment.");
              return;
          }
          // ADDED: "Is Uncapped" column to template
          const headers = ["Name", "Country", "Role", "Base Price", "Set", "Is Uncapped", "Matches", "Runs", "Wickets", "Average", "Strike Rate", "Economy", "Image URL"];
          const sampleData = [
              ["Virat Kohli", "India", "Batsman", 20000000, "Marquee Set", "No", 237, 7263, 0, 37.25, 130.02, 0, "https://documents.iplt20.com/ipl/IPLHeadshot2024/2.png"],
              ["Sameer Rizvi", "India", "Batsman", 2000000, "Uncapped", "Yes", 5, 120, 0, 30.00, 150.00, 0, "https://documents.iplt20.com/ipl/IPLHeadshot2024/1210.png"]
          ];
          
          const wb = (window as any).XLSX.utils.book_new();
          const ws = (window as any).XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
          (window as any).XLSX.utils.book_append_sheet(wb, ws, "Players");
          (window as any).XLSX.writeFile(wb, "IPL_Auction_Player_Template.xlsx");
      } catch (err) {
          console.error(err);
          alert("Failed to download template.");
      }
  };
  
  const handleExportPlayers = () => {
      if (!customPlayers || customPlayers.length === 0) {
          alert("No players to export.");
          return;
      }

      try {
          if (!(window as any).XLSX) return;

          const data = customPlayers.map(p => ({
              "Name": p.name,
              "Role": p.role,
              "Base Price": p.basePrice,
              "Set": p.set,
              "Country": p.country,
              "Is Uncapped": p.isUncapped ? "Yes" : "No",
              "Matches": p.stats.matches,
              "Runs": p.stats.runs || 0,
              "Wickets": p.stats.wickets || 0,
              "Image URL": p.imgUrl || ""
          }));

          const wb = (window as any).XLSX.utils.book_new();
          const ws = (window as any).XLSX.utils.json_to_sheet(data);
          (window as any).XLSX.utils.book_append_sheet(wb, ws, "Cleaned_Players");
          (window as any).XLSX.writeFile(wb, "IPL_Cleaned_Player_List.xlsx");
      } catch (err) {
          console.error(err);
          alert("Export failed.");
      }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop()?.toLowerCase();

      // JSON Handling (Legacy)
      if (fileExt === 'json') {
          const reader = new FileReader();
          reader.onload = (event) => {
              try {
                  const content = event.target?.result as string;
                  const parsed = JSON.parse(content);
                  
                  if (Array.isArray(parsed)) {
                      if (parsed.length > 0 && parsed[0].name && parsed[0].role) {
                           const sanitized = parsed.map((p: any, idx: number) => ({
                               ...p,
                               id: p.id || `custom-p-${Date.now()}-${idx}`,
                               status: 'UPCOMING',
                               stats: p.stats || { matches: 0, runs: 0, wickets: 0 }
                           })) as Player[];
                           setCustomPlayers(sanitized);
                           setCustomListFileName(file.name);
                           setShowPlayerManager(true);
                      } else {
                          alert("Invalid player data structure.");
                      }
                  } else {
                      alert("Invalid JSON. Root must be an array.");
                  }
              } catch (err) {
                  alert("Failed to parse JSON file.");
              }
          };
          reader.readAsText(file);
          return;
      }

      // Excel/CSV Handling
      if (['xlsx', 'xls', 'csv'].includes(fileExt || '')) {
          const reader = new FileReader();
          reader.onload = (event) => {
              try {
                  const data = new Uint8Array(event.target?.result as ArrayBuffer);
                  const workbook = (window as any).XLSX.read(data, { type: 'array' });
                  const sheetName = workbook.SheetNames[0];
                  const sheet = workbook.Sheets[sheetName];
                  const jsonData = (window as any).XLSX.utils.sheet_to_json(sheet);

                  if (!jsonData || jsonData.length === 0) {
                      alert("No data found in spreadsheet.");
                      return;
                  }

                  const mappedPlayers: Player[] = jsonData.map((row: any, index: number) => {
                      // ... (Same mapping logic as before) ...
                      const isRawFormat = row['First_Name'] !== undefined;
                      let name, country, role, basePrice, setStr, isUncapped, imgUrl, matches, runs, wickets, avg, sr, econ;

                      if (isRawFormat) {
                          name = `${row['First_Name']} ${row['Surname']}`;
                          country = row['Country'] || 'India';
                          role = mapRole(row['Specialism']);
                          let rawPrice = row['Reserve_Price'] || row['Base Price'] || row['Reserve Price'];
                          if (rawPrice) {
                              const p = parseFloat(rawPrice.toString().replace(/,/g, '').replace(/₹/g, ''));
                              basePrice = p < 10000 ? p * 100000 : p; 
                          } else {
                              const isOverseasCheck = country.trim().toLowerCase() !== 'india';
                              const setCheck = (row['2025_Set'] || '').toString().toLowerCase();
                              if (isOverseasCheck) {
                                  basePrice = 5000000;
                              } else {
                                  if (setCheck.includes('uncapped') || (row['Age'] && parseInt(row['Age']) < 23)) { 
                                      basePrice = 2000000;
                                  } else {
                                      basePrice = 5000000;
                                  }
                              }
                          }
                          setStr = row['2025_Set'] || row['Set_no'] || '';
                          isUncapped = basePrice <= 2000000 || setStr.toString().toLowerCase().includes('uncapped');
                          matches = parseInt(row['Matches'] || '0');
                          runs = parseInt(row['Runs'] || '0');
                          wickets = parseInt(row['Wickets'] || '0');
                          imgUrl = row['Image'] || '';
                      } else {
                          name = row['Name'] || row['name'] || `Player ${index + 1}`;
                          country = row['Country'] || row['country'] || 'India';
                          role = mapRole(row['Role'] || row['role'] || 'Batsman');
                          basePrice = parseInt(row['Base Price'] || row['basePrice'] || '2000000');
                          setStr = row['Set'] || row['set'] || 'Uncapped';
                          const isUncappedRaw = row['Is Uncapped'] || row['isUncapped'] || 'No';
                          isUncapped = isUncappedRaw.toString().toLowerCase().includes('yes') || isUncappedRaw.toString().toLowerCase() === 'true';
                          matches = parseInt(row['Matches'] || row['matches'] || '0');
                          runs = parseInt(row['Runs'] || row['runs'] || '0');
                          wickets = parseInt(row['Wickets'] || row['wickets'] || '0');
                          avg = parseFloat(row['Average'] || row['average'] || '0');
                          sr = parseFloat(row['Strike Rate'] || row['StrikeRate'] || '0');
                          econ = parseFloat(row['Economy'] || row['economy'] || '0');
                          imgUrl = row['Image URL'] || row['Image'] || row['imgUrl'] || '';
                      }

                      return {
                          id: `custom-${Date.now()}-${index}`,
                          name: name,
                          country: country,
                          role: role,
                          isOverseas: country.trim().toLowerCase() !== 'india',
                          isUncapped: isUncapped,
                          basePrice: isNaN(basePrice) ? 2000000 : basePrice,
                          set: mapSet(setStr, basePrice || 2000000),
                          status: 'UPCOMING',
                          stats: { matches: matches || 0, runs: runs || 0, wickets: wickets || 0, average: avg || 0, strikeRate: sr || 0, economy: econ || 0 },
                          imgUrl: imgUrl
                      };
                  });

                  setCustomPlayers(mappedPlayers);
                  setCustomListFileName(file.name);
                  setShowPlayerManager(true);
              } catch (err) {
                  console.error(err);
                  alert("Failed to parse spreadsheet. Ensure it matches the template format.");
              }
          };
          reader.readAsArrayBuffer(file);
          return;
      }

      alert("Unsupported file format. Please upload .xlsx, .xls, .csv, or .json");
  };

  const handleUploadClick = () => {
      fileInputRef.current?.click();
  };

  const clearCustomList = () => {
      setCustomPlayers(null);
      setCustomListFileName('');
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- PLAYER MANAGER LOGIC ---
  
  const openPlayerManager = () => {
      if (!customPlayers) {
          // DEEP COPY to prevent reference issues with constants
          setCustomPlayers(JSON.parse(JSON.stringify(MOCK_PLAYERS)));
      } 
      setShowPlayerManager(true);
      setEditingPlayer(null);
      setIsAddingNew(false);
  };

  const handleDeletePlayer = (id: string, e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      setCustomPlayers(prev => prev ? prev.filter(p => p.id !== id) : []);
  };

  const handleClearAllPlayers = () => {
      if (window.confirm('WARNING: This will remove ALL players from the list. Are you sure?')) {
          setCustomPlayers([]);
      }
  };

  const handleEditClick = (player: Player) => {
      setEditingPlayer({ ...player });
      setIsAddingNew(false);
  };

  const handleAddClick = () => {
      setEditingPlayer({ ...DEFAULT_NEW_PLAYER, id: `new-${Date.now()}` });
      setIsAddingNew(true);
  };

  const handleSavePlayer = () => {
      if (!editingPlayer) return;
      if (!editingPlayer.name) {
          alert("Player name is required");
          return;
      }
      if (isAddingNew) {
          setCustomPlayers(prev => [...(prev || []), editingPlayer]);
      } else {
          setCustomPlayers(prev => prev ? prev.map(p => p.id === editingPlayer.id ? editingPlayer : p) : [editingPlayer]);
      }
      setEditingPlayer(null);
      setIsAddingNew(false);
  };

  // --- CREATE CUSTOM ROOM LOGIC ---
  const handleCreateCustomRoom = () => {
      // 1. Validation
      let valid = true;
      if (!customHostName.trim()) { 
          setHostNameError(true);
          valid = false;
      } else {
          setHostNameError(false);
      }
      
      if (!customRoomName) { 
          alert("Please name your room"); 
          valid = false; 
      }
      
      if (!valid) return;

      try {
          // 2. Prepare Teams
          const teamsWithBudget = customTeams.map(t => ({
              ...t,
              purseRemaining: Number(customBudget) * 10000000
          }));

          // 3. Prepare Players
          const finalPlayers = customPlayers && customPlayers.length > 0 
            ? customPlayers 
            : JSON.parse(JSON.stringify(MOCK_PLAYERS));

          // 4. Setup Context
          setupCustomAuction(teamsWithBudget, finalPlayers, {
              maxOverseas: customMaxOverseas,
              maxSquadSize: customSquadSize, 
              minBidIncrement: customMinBid
          });

          // 5. Generate Room Code & Join
          const code = Math.random().toString(36).substring(2, 8).toUpperCase();
          const hostName = customHostName.trim();
          
          setContextRoomCode(code);
          setContextUserName(hostName); 
          setUserName(hostName); 
          
          joinRoom(hostName, code);
          localStorage.setItem('ipl_auction_sim_code', code);
          
          // 6. Navigate directly to Auction (skip waiting room)
          setRole('ADMIN'); // Set host as admin initially
          startAuction(); 
          
      } catch (error) {
          console.error("Failed to create room:", error);
          alert("An error occurred while creating the room. Please check the console or try again.");
      }
  };
  
  const handleRefresh = () => {
      setIsRefreshing(true);
      setTimeout(() => setIsRefreshing(false), 1500);
  };

  // Multiplayer handlers
  const handleCreateRoom = () => {
      if (!createName.trim()) { alert("Please enter your name"); return; }
      setUserName(createName); 
      setContextUserName(createName);
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      setContextRoomCode(code); 
      setIsHost(true); 
      // Initialize connected users with self
      joinRoom(createName, code); 
      setLobbyStep('MULTIPLAYER_WAITING_ROOM');
  };

  const handleJoinRoom = () => {
      if (!joinName.trim()) { alert("Please enter your name"); return; }
      if (roomCodeInput.length < 4) { alert("Invalid Room Code"); return; }
      joinRoom(joinName, roomCodeInput.toUpperCase());
      setLobbyStep('MULTIPLAYER_WAITING_ROOM');
  };

  // --- JOIN CUSTOM ROOM MODAL HANDLER ---
  const handleCustomJoinSubmit = () => {
      setJoinError('');
      if (!joinCustomName.trim()) {
          setJoinError("Name is required");
          return;
      }
      if (!joinCustomCode.trim()) {
          setJoinError("Room Code is required");
          return;
      }

      // Mock validation against localStorage or active context
      const storedCode = localStorage.getItem('ipl_auction_sim_code');
      const validCodes = [storedCode, contextRoomCode, 'DEMO12'].filter(Boolean);

      if (validCodes.includes(joinCustomCode.toUpperCase())) {
          joinRoom(joinCustomName, joinCustomCode.toUpperCase());
          setLobbyStep('MULTIPLAYER_WAITING_ROOM');
          setShowJoinCustomModal(false);
      } else {
          setJoinError("Room code is invalid or room does not exist.");
      }
  };

  const openJoinCustomModal = () => {
      setJoinCustomName('');
      setJoinCustomCode('');
      setJoinError('');
      setShowJoinCustomModal(true);
  };

  const handleCopyCode = async () => {
    if (contextRoomCode) {
      try { await navigator.clipboard.writeText(contextRoomCode); setCopied(true); } catch (err) { setCopied(true); }
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSelectTeam = (teamId: string) => {
      // Check if team is taken by another user
      const isTaken = connectedUsers.some(u => u.selectedTeamId === teamId && u.name !== contextUserName);
      if (isTaken) return;

      selectTeam(teamId);
  };

  const handleStartAuction = () => {
      if (!userTeamId) { alert("Please select a team first!"); return; }
      startAuction();
  };

  const getTeamStyles = (teamId: string) => {
      switch(teamId) {
          case 't1': return { bg: 'bg-yellow-500', border: 'hover:border-yellow-500', text: 'text-yellow-500', shadow: 'hover:shadow-yellow-500/20', ring: 'group-hover:ring-yellow-500/30' }; 
          default: return { bg: 'bg-slate-500', border: 'hover:border-slate-500', text: 'text-slate-500', shadow: 'hover:shadow-slate-500/20', ring: 'group-hover:ring-slate-500/30' };
      }
  };

  // Filter for Manager List
  const filteredManagerList = customPlayers?.filter(p => 
      p.name.toLowerCase().includes(managerSearch.toLowerCase()) || 
      p.country.toLowerCase().includes(managerSearch.toLowerCase())
  ) || [];

  // Available Teams Calculation
  const availableTeams = INITIAL_TEAMS.filter(t => !customTeams.some(ct => ct.id === t.id));

  return (
    <div className="min-h-screen bg-ipl-dark flex flex-col items-center justify-center p-4 relative overflow-hidden font-roboto">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#0a0f1e] to-black z-0"></div>
      
      {/* JOIN CUSTOM ROOM MODAL */}
      {showJoinCustomModal && (
          <div className="fixed inset-0 z-[250] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in-up">
              <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative">
                   <div className="p-6">
                       <div className="flex justify-between items-center mb-6">
                           <h3 className="text-2xl font-teko font-bold text-white uppercase tracking-wide">Join Private Room</h3>
                           <button onClick={() => setShowJoinCustomModal(false)} className="text-slate-500 hover:text-white transition-colors">
                               <X size={24} />
                           </button>
                       </div>
                       
                       {joinError && (
                           <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-wide">
                               <Lock size={14} /> {joinError}
                           </div>
                       )}

                       <div className="space-y-4">
                           <div className="space-y-2">
                               <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Your Name</label>
                               <input 
                                    type="text" 
                                    value={joinCustomName}
                                    onChange={(e) => setJoinCustomName(e.target.value)}
                                    placeholder="Enter your display name"
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-purple-500 transition-colors"
                               />
                           </div>
                           <div className="space-y-2">
                               <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Room Code</label>
                               <div className="relative">
                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                    <input 
                                            type="text" 
                                            value={joinCustomCode}
                                            onChange={(e) => setJoinCustomCode(e.target.value)}
                                            placeholder="XXXXXX"
                                            maxLength={8}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-3 py-3 text-white font-mono uppercase outline-none focus:border-purple-500 transition-colors"
                                    />
                               </div>
                           </div>
                       </div>

                       <button 
                            onClick={handleCustomJoinSubmit}
                            className="w-full mt-8 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                       >
                           Join Room <ArrowRight size={18} />
                       </button>
                   </div>
              </div>
          </div>
      )}

      {/* Player Manager Modal (Unchanged) */}
      {showPlayerManager && (
          <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in-up">
              <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl h-[85vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col">
                  {/* Modal Header */}
                  <div className="p-5 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-600 rounded-lg">
                              <Database size={20} className="text-white" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-teko font-bold text-white uppercase tracking-wide leading-none">Manage Custom Player List</h3>
                            <p className="text-xs text-slate-400 uppercase tracking-widest">{customPlayers?.length || 0} Players Loaded</p>
                          </div>
                      </div>
                      <div className="flex items-center gap-3">
                          {!editingPlayer && (
                             <>
                                 <button 
                                    onClick={handleExportPlayers}
                                    className="flex items-center gap-2 bg-blue-600/20 border border-blue-500/50 hover:bg-blue-600 text-blue-200 hover:text-white px-3 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all"
                                    title="Export Cleaned List"
                                 >
                                    <FileOutput size={16} /> Export List
                                 </button>
                                 <button 
                                    onClick={handleClearAllPlayers}
                                    className="flex items-center gap-2 bg-red-900/50 border border-red-700 hover:bg-red-800 text-red-200 px-3 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all"
                                    title="Remove all players"
                                 >
                                    <Trash2 size={16} /> Clear All
                                 </button>
                                 <button 
                                    onClick={handleAddClick}
                                    className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all"
                                 >
                                    <Plus size={16} /> Add Player
                                 </button>
                             </>
                          )}
                          <button onClick={() => setShowPlayerManager(false)} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">
                              <X size={20} />
                          </button>
                      </div>
                  </div>

                  {/* Modal Body */}
                  <div className="flex-1 overflow-hidden p-6 relative">
                      {/* ... (Previous Manager Content) ... */}
                      {editingPlayer ? (
                          <div className="h-full overflow-y-auto custom-scrollbar animate-fade-in-up px-2">
                              {/* ... Edit Form ... */}
                              <h4 className="text-xl font-teko font-bold text-ipl-gold mb-6 uppercase border-b border-slate-700 pb-2">
                                  {isAddingNew ? 'Add New Player' : 'Edit Player Details'}
                              </h4>
                              {/* ... Form Fields ... */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="space-y-4">
                                      <div className="flex flex-col gap-1">
                                          <label className="text-xs uppercase font-bold text-slate-500">Player Name</label>
                                          <input type="text" value={editingPlayer.name} onChange={e => setEditingPlayer({...editingPlayer, name: e.target.value})} className="bg-slate-950 border border-slate-700 p-3 rounded-lg text-white outline-none focus:border-purple-500" />
                                      </div>
                                      <div className="flex flex-col gap-1">
                                          <label className="text-xs uppercase font-bold text-slate-500">Country</label>
                                          <input type="text" value={editingPlayer.country} onChange={e => setEditingPlayer({...editingPlayer, country: e.target.value, isOverseas: e.target.value.toLowerCase() !== 'india'})} className="bg-slate-950 border border-slate-700 p-3 rounded-lg text-white outline-none focus:border-purple-500" />
                                      </div>
                                      <div className="flex flex-col gap-1">
                                          <label className="text-xs uppercase font-bold text-slate-500">Role</label>
                                          <select value={editingPlayer.role} onChange={e => setEditingPlayer({...editingPlayer, role: e.target.value as PlayerCategory})} className="bg-slate-950 border border-slate-700 p-3 rounded-lg text-white outline-none focus:border-purple-500">
                                              {Object.values(PlayerCategory).map(role => <option key={role} value={role}>{role}</option>)}
                                          </select>
                                      </div>
                                      <div className="flex flex-col gap-1">
                                          <label className="text-xs uppercase font-bold text-slate-500">Auction Set</label>
                                          <select value={editingPlayer.set} onChange={e => setEditingPlayer({...editingPlayer, set: e.target.value as AuctionSet})} className="bg-slate-950 border border-slate-700 p-3 rounded-lg text-white outline-none focus:border-purple-500">
                                              {Object.values(AuctionSet).map(set => <option key={set} value={set}>{set}</option>)}
                                          </select>
                                      </div>
                                      <div className="flex items-center gap-2 pt-2">
                                          <input type="checkbox" checked={editingPlayer.isUncapped} onChange={e => setEditingPlayer({...editingPlayer, isUncapped: e.target.checked})} id="isUncapped" className="w-5 h-5 accent-purple-500 cursor-pointer" />
                                          <label htmlFor="isUncapped" className="text-xs uppercase font-bold text-slate-500 cursor-pointer select-none">Is Uncapped Player?</label>
                                      </div>
                                  </div>
                                  <div className="space-y-4">
                                      <div className="flex flex-col gap-1">
                                          <label className="text-xs uppercase font-bold text-slate-500">Base Price (₹)</label>
                                          <input type="number" value={editingPlayer.basePrice} onChange={e => setEditingPlayer({...editingPlayer, basePrice: parseInt(e.target.value)})} className="bg-slate-950 border border-slate-700 p-3 rounded-lg text-white outline-none focus:border-purple-500" />
                                      </div>
                                      <div className="grid grid-cols-2 gap-4">
                                           <div className="flex flex-col gap-1">
                                              <label className="text-xs uppercase font-bold text-slate-500">Matches</label>
                                              <input type="number" value={editingPlayer.stats.matches} onChange={e => setEditingPlayer({...editingPlayer, stats: {...editingPlayer.stats, matches: parseInt(e.target.value)}})} className="bg-slate-950 border border-slate-700 p-3 rounded-lg text-white outline-none focus:border-purple-500" />
                                          </div>
                                          <div className="flex flex-col gap-1">
                                              <label className="text-xs uppercase font-bold text-slate-500">Runs</label>
                                              <input type="number" value={editingPlayer.stats.runs || 0} onChange={e => setEditingPlayer({...editingPlayer, stats: {...editingPlayer.stats, runs: parseInt(e.target.value)}})} className="bg-slate-950 border border-slate-700 p-3 rounded-lg text-white outline-none focus:border-purple-500" />
                                          </div>
                                          <div className="flex flex-col gap-1">
                                              <label className="text-xs uppercase font-bold text-slate-500">Wickets</label>
                                              <input type="number" value={editingPlayer.stats.wickets || 0} onChange={e => setEditingPlayer({...editingPlayer, stats: {...editingPlayer.stats, wickets: parseInt(e.target.value)}})} className="bg-slate-950 border border-slate-700 p-3 rounded-lg text-white outline-none focus:border-purple-500" />
                                          </div>
                                          <div className="flex flex-col gap-1">
                                              <label className="text-xs uppercase font-bold text-slate-500">Image URL</label>
                                              <input type="text" value={editingPlayer.imgUrl || ''} onChange={e => setEditingPlayer({...editingPlayer, imgUrl: e.target.value})} placeholder="https://..." className="bg-slate-950 border border-slate-700 p-3 rounded-lg text-white outline-none focus:border-purple-500" />
                                          </div>
                                      </div>
                                      {/* Image Preview */}
                                      {editingPlayer.imgUrl && (
                                          <div className="mt-2 flex items-center gap-3 bg-slate-800/50 p-2 rounded-lg border border-slate-700/50">
                                              <div className="w-12 h-12 rounded bg-slate-900 overflow-hidden border border-slate-700">
                                                  <img src={editingPlayer.imgUrl} alt="Preview" className="w-full h-full object-cover" />
                                              </div>
                                              <span className="text-[10px] text-slate-500 uppercase tracking-widest">Image Preview</span>
                                          </div>
                                      )}
                                  </div>
                              </div>
                              
                              <div className="mt-8 flex gap-4 border-t border-slate-700 pt-6">
                                  <button onClick={() => setEditingPlayer(null)} className="px-6 py-3 bg-slate-800 text-white rounded-xl font-bold uppercase tracking-wider hover:bg-slate-700 transition-colors">Cancel</button>
                                  <button onClick={handleSavePlayer} className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold uppercase tracking-wider hover:bg-green-500 transition-colors shadow-lg flex items-center gap-2">
                                      <Save size={18} /> Save Player
                                  </button>
                              </div>
                          </div>
                      ) : (
                          <div className="flex flex-col h-full">
                              <div className="flex gap-4 mb-4">
                                  <div className="relative flex-1">
                                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                      <input 
                                          type="text" 
                                          placeholder="Search by name or country..." 
                                          value={managerSearch}
                                          onChange={e => setManagerSearch(e.target.value)}
                                          className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-sm text-white focus:border-purple-500 outline-none"
                                      />
                                  </div>
                              </div>
                              
                              <div className="flex-1 overflow-y-auto custom-scrollbar border border-slate-700 rounded-lg bg-slate-900/50">
                                  <table className="w-full text-left border-collapse">
                                      <thead className="bg-slate-800 sticky top-0 z-10">
                                          <tr>
                                              <th className="p-3 text-xs uppercase font-bold text-slate-500 tracking-wider">Player</th>
                                              <th className="p-3 text-xs uppercase font-bold text-slate-500 tracking-wider">Role</th>
                                              <th className="p-3 text-xs uppercase font-bold text-slate-500 tracking-wider">Base Price</th>
                                              <th className="p-3 text-xs uppercase font-bold text-slate-500 tracking-wider">Set</th>
                                              <th className="p-3 text-xs uppercase font-bold text-slate-500 tracking-wider text-right">Actions</th>
                                          </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-700/50">
                                          {filteredManagerList.map(p => (
                                              <tr key={p.id} className="hover:bg-slate-800/50 transition-colors">
                                                  <td className="p-3 flex items-center gap-3">
                                                      <div className="w-8 h-8 rounded bg-slate-800 flex-shrink-0 overflow-hidden border border-slate-700">
                                                          {p.imgUrl ? <img src={p.imgUrl} className="w-full h-full object-cover" /> : <User size={16} className="text-slate-500 m-auto mt-2" />}
                                                      </div>
                                                      <div>
                                                          <div className="font-bold text-white">{p.name}</div>
                                                          <div className="text-[10px] text-slate-500 uppercase">{p.country}</div>
                                                      </div>
                                                  </td>
                                                  <td className="p-3 text-sm text-slate-300">{p.role}</td>
                                                  <td className="p-3 text-sm font-mono text-green-400">{formatCurrency(p.basePrice)}</td>
                                                  <td className="p-3 text-xs text-slate-400 uppercase">{p.set.split('Set')[0]}</td>
                                                  <td className="p-3 text-right">
                                                      <div className="flex justify-end gap-2">
                                                          <button onClick={() => handleEditClick(p)} className="p-2 bg-slate-800 border border-slate-700 rounded hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all text-slate-400" title="Edit"><Edit size={14} /></button>
                                                          <button onClick={(e) => handleDeletePlayer(p.id, e)} className="p-2 bg-slate-800 border border-slate-700 rounded hover:bg-red-600 hover:text-white hover:border-red-500 transition-all text-slate-400" title="Delete"><Trash2 size={14} /></button>
                                                      </div>
                                                  </td>
                                              </tr>
                                          ))}
                                          {filteredManagerList.length === 0 && (
                                              <tr>
                                                  <td colSpan={5} className="p-8 text-center text-slate-500 italic">No players found</td>
                                              </tr>
                                          )}
                                      </tbody>
                                  </table>
                              </div>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}

      <div className="z-10 text-center max-w-7xl w-full">
        
        {/* Dynamic Header (Same) */}
        {lobbyStep !== 'ROLES' && lobbyStep !== 'MULTIPLAYER_SETUP' && lobbyStep !== 'MULTIPLAYER_WAITING_ROOM' && lobbyStep !== 'CUSTOM_ROOM_SETUP' && (
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

        {/* STEP 1: MODE SELECTION (Unchanged) */}
        {lobbyStep === 'MODES' && (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full px-4 animate-scale-in">
                {/* ... Boxes ... */}
                {/* BOX 1 */}
                <div onClick={() => handleModeSelect('MEGA')} className="group relative cursor-pointer h-96 rounded-3xl overflow-hidden border border-ipl-gold/30 hover:border-ipl-gold transition-all duration-500 hover:shadow-[0_0_50px_rgba(209,171,62,0.3)] hover:-translate-y-2 bg-slate-900">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1631194758628-71ec7c35137e?q=80&w=2532&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover:scale-110 transition-transform duration-700"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 z-10">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-700 flex items-center justify-center mb-6 shadow-lg group-hover:rotate-12 transition-transform"><Crown size={40} className="text-white" /></div>
                        <h2 className="text-5xl font-teko font-bold text-white mb-2 group-hover:text-ipl-gold transition-colors">2025 - MEGA</h2>
                        <p className="text-slate-300 text-sm max-w-[80%] leading-relaxed">The Grand Reset. All teams rebuild from scratch. Massive purse, Marquee players, and high stakes.</p>
                        <div className="mt-8 px-6 py-2 border border-ipl-gold/50 rounded-full text-ipl-gold uppercase tracking-widest text-xs font-bold group-hover:bg-ipl-gold group-hover:text-black transition-all">Enter Mega Auction</div>
                    </div>
                </div>
                {/* BOX 2 */}
                <div onClick={() => handleModeSelect('MINI')} className="group relative cursor-pointer h-96 rounded-3xl overflow-hidden border border-blue-500/30 hover:border-blue-400 transition-all duration-500 hover:shadow-[0_0_50px_rgba(59,130,246,0.3)] hover:-translate-y-2 bg-slate-900">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=2612&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover:scale-110 transition-transform duration-700"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 z-10">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center mb-6 shadow-lg group-hover:rotate-12 transition-transform"><Gavel size={40} className="text-white" /></div>
                        <h2 className="text-5xl font-teko font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">2026 - MINI</h2>
                        <p className="text-slate-300 text-sm max-w-[80%] leading-relaxed">Strategic reinforcements. Fill the gaps in your squad with a limited purse and targeted buys.</p>
                        <div className="mt-8 px-6 py-2 border border-blue-500/50 rounded-full text-blue-400 uppercase tracking-widest text-xs font-bold group-hover:bg-blue-500 group-hover:text-white transition-all">Enter Mini Auction</div>
                    </div>
                </div>
                {/* BOX 3 */}
                <div className="group relative h-96 rounded-3xl overflow-hidden border border-purple-500/30 bg-slate-900 transition-all duration-500 hover:shadow-[0_0_50px_rgba(168,85,247,0.3)] hover:-translate-y-2">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover:scale-110 transition-transform duration-700"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 z-10">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-700 flex items-center justify-center mb-6 shadow-lg group-hover:rotate-12 transition-transform"><Settings size={40} className="text-white" /></div>
                        <h2 className="text-5xl font-teko font-bold text-white mb-2 text-purple-400">CUSTOM BIT</h2>
                        <p className="text-slate-300 text-sm max-w-[80%] leading-relaxed mb-6">Create your own rules or join a private league.</p>
                        <div className="flex gap-4">
                            <button onClick={(e) => { e.stopPropagation(); handleModeSelect('CUSTOM'); }} className="px-6 py-2 border border-purple-500 bg-purple-600/20 hover:bg-purple-600 text-white rounded-full uppercase tracking-widest text-xs font-bold transition-all shadow-lg hover:shadow-purple-500/20">Create Room</button>
                            <button onClick={(e) => { e.stopPropagation(); openJoinCustomModal(); }} className="px-6 py-2 border border-white/20 bg-white/5 hover:bg-white/20 text-white rounded-full uppercase tracking-widest text-xs font-bold transition-all">Join Room</button>
                        </div>
                    </div>
                </div>
             </div>
        )}

        {/* STEP 1.5: CUSTOM ROOM SETUP */}
        {lobbyStep === 'CUSTOM_ROOM_SETUP' && (
            <div className="w-full max-w-5xl px-4 animate-scale-in">
                <h2 className="text-5xl font-teko font-bold text-white mb-6 text-left">Create Custom Room</h2>
                
                {/* Auction Rules Section */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-700/50 mb-6">
                    <h3 className="text-purple-400 font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Settings size={18} /> Auction Rules
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="flex flex-col gap-2 text-left">
                            <label className="text-slate-400 text-xs font-bold uppercase tracking-wide">Room Name</label>
                            <input 
                                type="text" 
                                value={customRoomName} 
                                onChange={(e) => setCustomRoomName(e.target.value)}
                                className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-purple-500 outline-none"
                            />
                        </div>
                         {/* NEW: Host Name Input with Error State */}
                        <div className="flex flex-col gap-2 text-left">
                            <label className={`text-xs font-bold uppercase tracking-wide ${hostNameError ? 'text-red-500 animate-pulse' : 'text-slate-400'}`}>
                                Your Name (Host) *
                            </label>
                            <input 
                                type="text" 
                                value={customHostName} 
                                onChange={(e) => {
                                    setCustomHostName(e.target.value);
                                    if(e.target.value.trim()) setHostNameError(false);
                                }}
                                className={`bg-slate-900 border ${hostNameError ? 'border-red-500 ring-1 ring-red-500/50' : 'border-slate-700'} rounded-lg p-3 text-white focus:border-purple-500 outline-none transition-all placeholder:text-slate-600`}
                                placeholder={hostNameError ? "Required!" : "Enter your name"}
                            />
                        </div>

                        <div className="flex flex-col gap-2 text-left">
                            <label className="text-slate-400 text-xs font-bold uppercase tracking-wide">Team Budget (Crores)</label>
                            <input 
                                type="number" 
                                value={customBudget} 
                                onChange={(e) => handleCustomBudgetChange(e.target.value)}
                                className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-purple-500 outline-none"
                            />
                        </div>
                         <div className="flex flex-col gap-2 text-left">
                            <label className="text-slate-400 text-xs font-bold uppercase tracking-wide">Max Overseas Players: <span className="text-white">{customMaxOverseas}</span></label>
                            <input 
                                type="range" 
                                min="1" max="11" 
                                value={customMaxOverseas} 
                                onChange={(e) => setCustomMaxOverseas(parseInt(e.target.value))}
                                className="w-full accent-purple-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer mt-3"
                            />
                        </div>
                        
                         {/* NEW INPUT: TOTAL PLAYERS / SQUAD SIZE */}
                        <div className="flex flex-col gap-2 text-left">
                            <label className="text-slate-400 text-xs font-bold uppercase tracking-wide">Total Players (Squad Size): <span className="text-white">{customSquadSize}</span></label>
                            <input 
                                type="range" 
                                min="15" max="35" 
                                value={customSquadSize} 
                                onChange={(e) => setCustomSquadSize(parseInt(e.target.value))}
                                className="w-full accent-blue-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer mt-3"
                            />
                        </div>

                        <div className="flex flex-col gap-2 text-left">
                            <label className="text-slate-400 text-xs font-bold uppercase tracking-wide">Min Bid Increment</label>
                            <select 
                                value={customMinBid}
                                onChange={(e) => setCustomMinBid(parseInt(e.target.value))}
                                className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-purple-500 outline-none"
                            >
                                <option value={0}>Standard (Dynamic)</option>
                                <option value={2000000}>20 Lakhs</option>
                                <option value={5000000}>50 Lakhs</option>
                                <option value={10000000}>1 Crore</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Participating Teams Section */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-700/50 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-blue-400 font-bold uppercase tracking-wider flex items-center gap-2">
                            <Users size={18} /> Participating Teams ({customTeams.length}/{INITIAL_TEAMS.length})
                        </h3>
                        {customTeams.length < INITIAL_TEAMS.length && (
                             <button onClick={restoreTeams} className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded text-white transition-colors">
                                Reset All
                             </button>
                        )}
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto custom-scrollbar pr-2 mb-4">
                        {customTeams.map(team => (
                            <div key={team.id} className="flex items-center justify-between bg-slate-900/50 border border-slate-700 p-3 rounded-lg hover:bg-slate-800/80 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center p-1 border border-slate-600">
                                        <TeamLogo team={team} className="w-full h-full object-contain" />
                                    </div>
                                    <span className="text-white font-bold text-sm">{team.name}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-500 uppercase">Purse</span>
                                        <span className="text-sm font-mono text-green-400 font-bold">{customBudget} Cr</span>
                                    </div>
                                    <div className="bg-slate-800 px-2 py-1 rounded text-[10px] text-slate-400 font-bold border border-slate-700">BOT</div>
                                    <button 
                                        onClick={() => toggleTeamActive(team.id)}
                                        className="text-slate-500 hover:text-red-500 transition-colors p-1"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {availableTeams.length > 0 ? (
                        <div className="border-t border-slate-700 pt-4">
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Add Team</div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                {availableTeams.map(team => (
                                    <button 
                                        key={team.id} 
                                        onClick={() => addTeamBack(team)}
                                        className="flex items-center gap-2 bg-slate-800/50 hover:bg-slate-700 border border-slate-700 hover:border-green-500 p-2 rounded-lg transition-all group text-left"
                                    >
                                        <div className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center p-0.5 border border-slate-600">
                                            <TeamLogo team={team} className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all" />
                                        </div>
                                        <span className="text-slate-400 group-hover:text-white text-xs font-bold truncate flex-1">{team.shortName}</span>
                                        <Plus size={14} className="text-slate-600 group-hover:text-green-500" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <button className="w-full py-2 border border-dashed border-slate-600 text-slate-500 rounded-lg text-sm uppercase tracking-wide flex items-center justify-center gap-2 cursor-not-allowed opacity-50">
                            <Check size={16} /> Limit Reached (Max {INITIAL_TEAMS.length})
                        </button>
                    )}
                </div>

                {/* Player Pool Section */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-700/50 mb-8">
                     <h3 className="text-yellow-400 font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Database size={18} /> Player Pool
                    </h3>
                    
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                        accept=".xlsx, .xls, .csv, .json" 
                        className="hidden" 
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {/* Download Template Button */}
                        <button 
                            onClick={handleDownloadTemplate}
                            className="border py-4 rounded-xl font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white hover:border-slate-500"
                        >
                            <Download size={18} /> Download Template
                        </button>
                        
                        <div className="flex gap-2">
                            <button 
                                onClick={handleUploadClick}
                                className={`flex-1 border py-4 rounded-xl font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${customPlayers !== null ? 'bg-purple-600 border-purple-500 text-white shadow-lg' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                            >
                                <FileSpreadsheet size={18} /> {customPlayers !== null ? 'Re-upload List' : 'Upload Excel/CSV'}
                            </button>
                            
                            {/* New Manage Button */}
                            <button 
                                onClick={openPlayerManager}
                                className="px-6 border border-slate-700 bg-slate-800 hover:bg-purple-600 hover:border-purple-500 hover:text-white text-slate-400 rounded-xl transition-all"
                                title="Manage Players"
                            >
                                <Edit size={20} />
                            </button>
                        </div>
                    </div>
                    {customPlayers !== null && (
                         <div className="mt-3 text-center">
                             <span className="text-xs text-green-400 font-mono">Loaded {customPlayers.length} players from {customListFileName}</span>
                         </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    <button 
                        onClick={() => {
                            setLobbyStep('MODES');
                            setSelectedMode(null);
                        }}
                        className="flex-1 py-4 bg-slate-800 text-white rounded-xl font-bold uppercase tracking-widest hover:bg-slate-700 transition-all"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleCreateCustomRoom}
                        className="flex-[2] py-4 bg-green-600 text-white rounded-xl font-bold uppercase tracking-widest hover:bg-green-500 transition-all shadow-lg hover:shadow-green-500/20"
                    >
                        Create Room
                    </button>
                </div>
            </div>
        )}

        {/* ... Rest of steps (MULTIPLAYER_WAITING_ROOM, PLAY_MODE, MULTIPLAYER_SETUP, ROLES) ... */}
        {/* Only keeping surrounding structure to show placement, actual content remains as previously provided/updated */}
        
        {/* STEP 2: PLAY MODE SELECTION (SINGLE / MULTI) */}
        {lobbyStep === 'PLAY_MODE' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl px-4 animate-fade-in-up">
                {/* ... (Same as before) */}
                <div onClick={() => handlePlayModeSelect('SINGLE')} className="group relative cursor-pointer h-80 rounded-3xl overflow-hidden border border-emerald-500/30 hover:border-emerald-400 transition-all duration-500 hover:shadow-[0_0_50px_rgba(16,185,129,0.3)] hover:-translate-y-2 bg-slate-900">
                     <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 to-black z-0"></div>
                     <div className="absolute inset-0 flex flex-col items-center justify-between p-8 z-10 text-center">
                        <div className="flex flex-col items-center">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform"><Cpu size={40} className="text-white" /></div>
                            <h2 className="text-5xl font-teko font-bold text-white group-hover:text-emerald-400 transition-colors leading-none">Single Player</h2>
                        </div>
                        <p className="text-slate-300 text-sm max-w-[90%] leading-relaxed">Solo Offline Mode. Compete against smart AI bots that bid based on real player stats and logic.</p>
                        <div className="px-8 py-2 border border-emerald-500/50 rounded-full text-emerald-400 uppercase tracking-widest text-xs font-bold group-hover:bg-emerald-500 group-hover:text-white transition-all">Play vs AI</div>
                     </div>
                </div>
                <div onClick={() => handlePlayModeSelect('MULTI')} className="group relative cursor-pointer h-80 rounded-3xl overflow-hidden border border-indigo-500/30 hover:border-indigo-400 transition-all duration-500 hover:shadow-[0_0_50px_rgba(99,102,241,0.3)] hover:-translate-y-2 bg-slate-900">
                     <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 to-black z-0"></div>
                     <div className="absolute inset-0 flex flex-col items-center justify-between p-8 z-10 text-center">
                        <div className="flex flex-col items-center">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-700 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform"><Globe size={40} className="text-white" /></div>
                            <h2 className="text-5xl font-teko font-bold text-white group-hover:text-indigo-400 transition-colors leading-none">Multiplayer</h2>
                        </div>
                        <p className="text-slate-300 text-sm max-w-[90%] leading-relaxed">Online PvP. Create a room, invite friends, and bid in real-time synchronisation.</p>
                        <div className="px-8 py-2 border border-indigo-500/50 rounded-full text-indigo-400 uppercase tracking-widest text-xs font-bold group-hover:bg-indigo-500 group-hover:text-white transition-all">Connect Online</div>
                     </div>
                </div>
            </div>
        )}

        {/* STEP 2.5: MULTIPLAYER SETUP SCREEN */}
        {lobbyStep === 'MULTIPLAYER_SETUP' && (
            <div className="w-full max-w-6xl px-4 animate-scale-in flex flex-col items-center">
                <h2 className="text-6xl font-teko font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-8 drop-shadow-lg uppercase">Multiplayer Auction</h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
                    {/* ... (Same as before) */}
                    <div className="lg:col-span-2 glass-panel rounded-2xl p-8 border border-slate-700/50 flex flex-col gap-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px]"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4"><Plus className="text-blue-400" size={24} /><h3 className="text-3xl font-teko font-bold text-white uppercase tracking-wide">Create a Room</h3></div>
                            <div className="flex flex-col gap-4">
                                <input type="text" placeholder="Enter your name" className="w-full bg-slate-950/80 border border-slate-700 rounded-lg p-4 text-white placeholder-slate-500 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" value={createName} onChange={(e) => setCreateName(e.target.value)} />
                                <label className="flex items-center gap-3 cursor-pointer group w-fit">
                                    <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${isPublic ? 'bg-blue-500 border-blue-500' : 'bg-transparent border-slate-600'}`} onClick={() => setIsPublic(!isPublic)}>
                                        {isPublic && <CheckCircle2 size={16} className="text-white" />}
                                    </div>
                                    <span className="text-slate-400 group-hover:text-slate-200 text-sm uppercase tracking-wider select-none">Make this room Public</span>
                                </label>
                                <button onClick={handleCreateRoom} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-lg uppercase tracking-widest shadow-lg hover:shadow-blue-500/20 transition-all transform active:scale-[0.99] flex items-center justify-center gap-2">Create Room</button>
                            </div>
                        </div>
                        <div className="relative flex items-center py-2"><div className="flex-grow border-t border-slate-700"></div><span className="flex-shrink-0 mx-4 text-slate-500 font-teko text-xl">OR</span><div className="flex-grow border-t border-slate-700"></div></div>
                        <div className="relative z-10">
                             <div className="flex items-center gap-2 mb-4"><LogIn className="text-purple-400" size={24} /><h3 className="text-3xl font-teko font-bold text-white uppercase tracking-wide">Join a Room</h3></div>
                            <div className="flex flex-col gap-4">
                                <input type="text" placeholder="Enter your name (Required)" className="w-full bg-slate-950/80 border border-slate-700 rounded-lg p-4 text-white placeholder-slate-500 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none" value={joinName} onChange={(e) => setJoinName(e.target.value)} />
                                <div className="flex gap-4">
                                    <input type="text" placeholder="ROOM CODE" className="flex-1 bg-slate-950/80 border border-slate-700 rounded-lg p-4 text-white placeholder-slate-500 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none font-mono uppercase tracking-widest" value={roomCodeInput} onChange={(e) => setRoomCodeInput(e.target.value)} />
                                    <button onClick={handleJoinRoom} className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-8 rounded-lg uppercase tracking-widest shadow-lg hover:shadow-purple-500/20 transition-all">Join</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="glass-panel rounded-2xl border border-slate-700/50 flex flex-col h-full shadow-2xl relative overflow-hidden min-h-[400px]">
                        <div className="p-6 border-b border-slate-700/50 bg-slate-900/50 flex justify-between items-center"><h3 className="text-2xl font-teko font-bold text-green-400 uppercase tracking-wide flex items-center gap-2"><Users size={20} /> Public Auctions</h3><button onClick={handleRefresh} className={`text-slate-400 hover:text-white transition-colors bg-slate-800 p-2 rounded ${isRefreshing ? 'animate-spin' : ''}`}><RefreshCw size={16} /></button></div>
                        <div className="flex-1 p-6 flex flex-col items-center justify-center text-slate-500 relative">
                             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-5"></div>
                             <div className="bg-slate-800/50 p-6 rounded-full mb-4 border border-slate-700"><Globe size={48} className="opacity-50" /></div>
                             <p className="text-lg mb-2">No public rooms available.</p><p className="text-sm text-slate-600">Why not create one?</p>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* STEP 2.75: MULTIPLAYER WAITING ROOM (New Requested View) */}
        {lobbyStep === 'MULTIPLAYER_WAITING_ROOM' && (
             <div className="w-full max-w-7xl px-4 animate-fade-in-up flex flex-col lg:flex-row gap-8 items-start h-[80vh]">
                 {/* ... (Same as before) */}
                 <div className="w-full lg:w-1/4 flex flex-col gap-4 h-full">
                     <div className="glass-panel rounded-2xl p-6 border border-slate-700/50 relative overflow-hidden">
                         <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-transparent"></div>
                         <h3 className="text-slate-400 uppercase tracking-widest text-xs font-bold mb-2">Room Code</h3>
                         <div className="flex items-center justify-between bg-slate-900/80 p-3 rounded-lg border border-slate-700">
                             <span className="text-3xl font-mono font-bold text-blue-400 tracking-widest">{contextRoomCode || 'WAITING'}</span>
                             <button onClick={handleCopyCode} className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 text-xs font-bold uppercase tracking-widest ${copied ? 'bg-green-500/10 border-green-500/50 text-green-400' : 'bg-slate-800 border-slate-600 text-slate-400 hover:text-white hover:border-slate-500 hover:bg-slate-700'}`} title="Copy Code">
                                 {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}<span>{copied ? 'Copied' : 'Copy'}</span>
                             </button>
                         </div>
                         <p className="text-slate-500 text-[10px] mt-2">Share this code with your friends to join.</p>
                     </div>
                     <div className="glass-panel rounded-2xl p-6 border border-slate-700/50 flex-1 flex flex-col">
                         <h3 className="text-slate-300 uppercase tracking-widest text-sm font-bold mb-4 flex items-center gap-2"><Users size={16} /> Players ({connectedUsers.length})</h3>
                         <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                             {connectedUsers.map((user, index) => {
                                 const isMe = user.name === contextUserName;
                                 const isUserHost = index === 0; 
                                 return (
                                     <div key={index} className="flex flex-col gap-2 bg-slate-800/40 p-3 rounded-lg border border-slate-700/50">
                                         <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-sm">{user.name.charAt(0).toUpperCase()}</div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2"><div className="text-white font-bold text-sm truncate max-w-[100px]">{user.name}</div>{isMe && <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded uppercase">You</span>}</div>
                                                <div className="text-[10px] text-yellow-500 font-bold uppercase tracking-wider">{isUserHost ? 'Host' : 'Guest'}</div>
                                            </div>
                                         </div>
                                         {isHost ? (
                                             <select className="w-full bg-slate-900 border border-slate-700 text-xs text-white p-2 rounded outline-none focus:border-blue-500" value={user.selectedTeamId || ''} onChange={(e) => assignTeamToUser(user.name, e.target.value)}>
                                                 <option value="">Assign Team...</option>
                                                 {teams.map(t => (<option key={t.id} value={t.id}>{t.shortName}</option>))}
                                             </select>
                                         ) : (
                                             user.selectedTeamId && (<div className="flex items-center gap-2 bg-slate-900/50 p-1.5 rounded border border-slate-800"><div className="w-4 h-4 rounded-full bg-slate-700 overflow-hidden"><TeamLogo team={teams.find(t => t.id === user.selectedTeamId)} className="w-full h-full object-cover" /></div><span className="text-xs text-slate-300 font-bold">{teams.find(t => t.id === user.selectedTeamId)?.shortName}</span></div>)
                                         )}
                                     </div>
                                 );
                             })}
                         </div>
                         <div className="mt-4 pt-4 border-t border-slate-700">
                             {isHost ? (
                                 <button onClick={handleStartAuction} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"><Play size={20} fill="currentColor" /> Start Auction</button>
                             ) : (<div className="text-center text-slate-500 text-xs uppercase tracking-widest animate-pulse">Waiting for Host to start...</div>)}
                         </div>
                     </div>
                 </div>
                 <div className="w-full lg:w-3/4 h-full flex flex-col">
                     <h2 className="text-4xl font-teko font-bold text-white mb-6">Select Your Team</h2>
                     <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-12">
                         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {teams.map(team => {
                                const takenBy = connectedUsers.find(u => u.selectedTeamId === team.id);
                                const isTaken = !!takenBy && takenBy.name !== contextUserName;
                                const isSelectedByMe = userTeamId === team.id;
                                const styles = getTeamStyles(team.id);
                                return (
                                    <div key={team.id} onClick={() => !isTaken && handleSelectTeam(team.id)} className={`relative rounded-xl border p-4 flex items-center gap-4 transition-all duration-200 ${isTaken ? 'opacity-75 cursor-not-allowed border-red-900/50 bg-red-900/10' : 'cursor-pointer'} ${isSelectedByMe ? `bg-slate-800 border-${styles.text.split('-')[1]}-500 shadow-lg shadow-${styles.text.split('-')[1]}-500/20` : (!isTaken && 'bg-slate-900/50 border-slate-700 hover:border-slate-500 hover:bg-slate-800')}`}>
                                        {isTaken && (<div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg z-10 animate-in fade-in zoom-in uppercase tracking-wider">TAKEN</div>)}
                                        <div className="w-16 h-16 rounded-full bg-slate-950 flex items-center justify-center p-2 border border-slate-700 shrink-0"><TeamLogo team={team} className={`w-full h-full object-contain ${isTaken ? 'grayscale' : ''}`} /></div>
                                        <div className="flex-1 min-w-0"><div className="flex justify-between items-center mb-1"><h3 className={`text-xl font-teko font-bold tracking-wide truncate pr-2 ${isTaken ? 'text-slate-500' : 'text-white'}`}>{team.shortName}</h3>{isSelectedByMe && <CheckCircle2 size={20} className="text-green-500 shrink-0" />}</div><div className="text-xs text-slate-400 mb-1">Purse: <span className="text-white font-mono">{formatCurrency(team.purseRemaining)}</span></div><div className="text-[10px] text-slate-500 uppercase tracking-widest">{isTaken ? `Taken by ${takenBy?.name}` : 'Click to Select'}</div></div>
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
                {/* ... (Same as before) */}
                <div className="text-center mb-10"><h2 className="text-5xl md:text-6xl font-teko font-bold text-white uppercase tracking-wide mb-2 text-glow">Select Your Team</h2><p className="text-slate-400 text-lg tracking-widest uppercase">Choose a franchise to manage in the {selectedMode?.subtitle || 'Auction'}</p></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-16 w-full">
                    {teams.map(team => {
                         const styles = getTeamStyles(team.id);
                         return (
                            <button key={team.id} onClick={() => { setRole('TEAM', team.id); startAuction(); }} className={`group relative bg-slate-900/80 backdrop-blur-md border border-slate-700 ${styles.border} ${styles.shadow} ${styles.ring} hover:ring-1 rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] flex flex-col h-[340px] w-full text-left shadow-2xl`}>
                                <div className={`absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity ${styles.text}`}><CheckCircle2 size={24} /></div>
                                <div className="flex-1 p-6 flex flex-col items-center justify-center relative">
                                     <div className={`absolute inset-0 bg-gradient-to-b from-slate-800 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                                     <div className={`absolute top-0 left-0 w-full h-32 opacity-10 bg-gradient-to-b ${styles.bg === 'bg-white' ? 'from-slate-500' : 'from-' + styles.text.split('-')[1] + '-500'} to-transparent blur-xl`}></div>
                                     <div className={`w-28 h-28 rounded-full bg-white/5 border-2 border-white/10 group-hover:border-current ${styles.text} flex items-center justify-center mb-6 shadow-2xl group-hover:scale-110 transition-transform duration-300 relative z-10 overflow-hidden p-2`}><TeamLogo team={team} className="w-full h-full object-contain drop-shadow-lg" /></div>
                                     <h3 className="text-5xl font-teko font-bold text-white leading-none mb-2 relative z-10 tracking-wide">{team.shortName}</h3>
                                     <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold text-center relative z-10 leading-relaxed min-h-[30px] flex items-center">{team.name}</p>
                                </div>
                                <div className="bg-slate-950/80 border-t border-white/5 p-5 flex justify-between items-center w-full group-hover:bg-slate-950 transition-colors relative z-20"><span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Purse</span><span className={`text-2xl font-mono font-bold text-white group-hover:${styles.text.split(' ')[0]} transition-colors`}>{formatCurrency(team.purseRemaining)}</span></div>
                            </button>
                        );
                    })}
                </div>
            </div>
        )}

        {/* Back Button (Unchanged) */}
        {lobbyStep !== 'MODES' && (
            <button onClick={handleBack} className="mt-12 text-slate-500 hover:text-white uppercase tracking-widest text-xs font-bold transition-colors fixed top-4 left-4 z-50 flex items-center gap-2 bg-black/20 backdrop-blur px-4 py-2 rounded-full border border-white/5 hover:border-white/20"><ArrowRight className="rotate-180" size={14} /> Back</button>
        )}

      </div>
    </div>
  );
};

export default Lobby;
