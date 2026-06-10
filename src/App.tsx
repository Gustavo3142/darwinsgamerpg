import React, { useState, useEffect, useRef } from "react";
import { RefreshCw, Settings, LogOut } from "lucide-react";
import { Player, Mission, Squad, ShopItem, LogEntry, Notification } from "./types";
import { generateUniqueId } from "./utils/id";
import MainGate from "./components/MainGate";
import PlayerDashboard from "./components/PlayerDashboard";
import GMDashboard from "./components/GMDashboard";

// Default seed values for offline or fresh starts
const defaultPlayers: Player[] = [
  {
    id: 1,
    name: "Kael'thas Neo",
    class: "Cyber Ninja",
    subClass: "Netrunner",
    password: "123",
    level: 12,
    currentXp: 850,
    totalXpForLevel: 1200,
    spBalance: 1450,
    attributes: {
      Confiabilidade: 8,
      Agilidade: 9,
      "Resolução de Problemas": 7,
      Proatividade: 8,
      Foco: 6,
      "Abertura à Experiência": 5,
      Consciência: 8,
      Extroversão: 3,
      Compaixão: 4,
      "Estabilidade Emocional": 9,
      Paciência: 7,
      Popularidade: 6,
    },
    conquistas: ["Mestre da Fuga", "Primeiro Sangue Neural"],
    inventory: [
      { id: 1, name: "Data Shard Corrompido", desc: "Fragmento de dados roubado de uma megacorp.", quantity: 1 }
    ],
    realName: "Jogador Um",
    email: "j1@email.com",
    sigla: "J1"
  },
  {
    id: 2,
    name: "Sarah Connor",
    class: "Mercenária",
    subClass: "Especialista em Armas",
    password: "123",
    level: 8,
    currentXp: 400,
    totalXpForLevel: 800,
    spBalance: 320,
    attributes: {
      Confiabilidade: 6,
      Agilidade: 7,
      "Resolução de Problemas": 5,
      Proatividade: 9,
      Foco: 8,
      "Abertura à Experiência": 6,
      Consciência: 5,
      Extroversão: 8,
      Compaixão: 7,
      "Estabilidade Emocional": 4,
      Paciência: 8,
      Popularidade: 5,
    },
    conquistas: ["Sobrevivente do Apocalipse"],
    inventory: [],
    realName: "Jogador Dois",
    email: "j2@email.com",
    sigla: "J2"
  }
];

const defaultSquads: Squad[] = [{ id: 1, name: "Esquadrão Alpha", members: [1, 2] }];
const defaultShopItems: ShopItem[] = [
  { id: 1, name: "Estimulante Neural", desc: "Regenera o foco instantaneamente.", cost: 150, stock: 5, targetPlayerId: null }
];

export default function App() {
  const [sessionType, setSessionType] = useState<"none" | "player" | "gm">("none");
  const [view, setView] = useState<"player" | "gm">("player");
  const [loggedPlayerId, setLoggedPlayerId] = useState<number | null>(null);

  const [isSyncing, setIsSyncing] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [squads, setSquads] = useState<Squad[]>([]);
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]); 
  const [geminiKey, setGeminiKey] = useState("");
  const [gms, setGms] = useState<any[]>([]); 

  const [showSettings, setShowSettings] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const initialFetchDone = useRef(false);
  const isDataLoaded = useRef(false);
  const skipNextPush = useRef<{ [key: string]: boolean }>({});

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const pullFromMainframe = async (silent = false) => {
    if (!silent) setIsSyncing(true);
    try {
      const res = await fetch("/api/mainframe");
      if (res.ok) {
        const cloudDatabase = await res.json();
        
        // CHAVES CORRIGIDAS DE ACORDO COM AS ROTAS EXATAS DE ENVIO:
        skipNextPush.current = {
          players: true,
          missions: true,
          dg_groups: true,
          dg_shop: true,
          logs: true,
          dg_notifications: true,
          ai_key: true,
        };

        setPlayers(cloudDatabase.players || []);
        setMissions(cloudDatabase.missions || []);
        setSquads(cloudDatabase.squads || []);
        setShopItems(cloudDatabase.shopItems || []);
        setLogs(cloudDatabase.logs || []);
        setNotifications(cloudDatabase.notifications || []); 
        
        isDataLoaded.current = true;
        if (!silent) showToast("Mainframe Sincronizado!", "success");
      }
    } catch (e) {
      if (!silent) showToast("Mainframe ocupado. Tentando novamente.", "error");
      // CARREGAMENTO SECO ADVERSO REMOVIDO PARA EVITAR LIMPEZAS INVOLUNTÁRIAS DE BANCO DE DADOS
    } finally {
      if (!silent) setIsSyncing(false);
    }
  };

  const pushToMainframe = async (key: string, valueObj: any) => {
    if (skipNextPush.current[key]) {
      skipNextPush.current[key] = false;
      return;
    }
    try {
      await fetch("/api/mainframe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value: valueObj }),
      });
    } catch (e) {
      // Background fail silent
    }
  };

  useEffect(() => {
    if (!initialFetchDone.current) {
      initialFetchDone.current = true;
      pullFromMainframe(true);
    }
  }, []);

  useEffect(() => {
    if (isDataLoaded.current && players.length > 0) pushToMainframe("players", players);
  }, [players]);

  useEffect(() => {
    if (isDataLoaded.current) {
      // NOVA TRAVA DE SEGURANÇA: Se a lista estiver vazia, ele para aqui e não envia para o servidor
      if (missions.length === 0) {
        console.warn("Bloqueado salvamento de missões vazias para proteger o servidor.");
        return; 
      }
      
      // Se passou da trava de segurança (tem missões), ele salva normalmente!
      pushToMainframe("missions", missions);
    }
  }, [missions]);

  useEffect(() => {
    if (isDataLoaded.current && squads.length > 0) pushToMainframe("dg_groups", squads);
  }, [squads]);

  useEffect(() => {
    if (isDataLoaded.current && shopItems.length > 0) pushToMainframe("dg_shop", shopItems);
  }, [shopItems]);

  useEffect(() => {
    if (isDataLoaded.current && logs.length > 0) pushToMainframe("logs", logs);
  }, [logs]);

  useEffect(() => {
    if (isDataLoaded.current) pushToMainframe("dg_notifications", notifications);
  }, [notifications]);

  useEffect(() => {
    if (isDataLoaded.current && geminiKey) pushToMainframe("ai_key", geminiKey);
  }, [geminiKey]);

  useEffect(() => {
    if (sessionType === "gm" && view === "player" && loggedPlayerId === null && players.length > 0) {
      setLoggedPlayerId(players[0].id);
    }
  }, [sessionType, view, loggedPlayerId, players]);

  const addLog = (playerId: number, action: string, desc: string, xp = 0, sp = 0) => {
    const newLog: LogEntry = {
      id: generateUniqueId(),
      date: new Date().toISOString(),
      playerId,
      action,
      desc,
      xp,
      sp,
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  const handleLogout = () => {
    setSessionType("none");
    setLoggedPlayerId(null);
    showToast("Conexão neural encerrada.", "success");
  };

  const activePlayer = players.find((p) => p.id === loggedPlayerId);

  return (
    <div className="min-h-screen text-slate-100 flex flex-col font-sans">
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 border font-bold uppercase tracking-widest text-xs rounded transition-all duration-300 shadow-[0_0_15px_rgba(0,0,0,0.6)] ${
            toast.type === "error" ? "bg-red-950/90 border-red-500 text-red-400" : "bg-cyan-950/90 border-cyan-500 text-cyan-400"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {sessionType !== "none" && (
        <nav className="bg-zinc-950 border-b border-zinc-850 p-4 sticky top-0 z-40 shadow-md">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-xl font-black uppercase tracking-widest text-white flex items-center gap-2">
              <span>Darwin's</span> <span className="text-pink-500">Game</span>
              <span className="text-[10px] bg-zinc-900 border border-zinc-700 text-slate-400 px-2.5 py-0.5 rounded uppercase font-bold tracking-wide font-sans">
                v2.0
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {sessionType === "gm" && (
                <div className="bg-zinc-900 rounded p-1 flex items-center border border-zinc-800 gap-1 flex-wrap justify-center">
                  <button
                    onClick={() => setView("player")}
                    className={`px-4 py-2 text-xs font-bold uppercase rounded transition cursor-pointer ${
                      view === "player" ? "bg-pink-600 text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Ficha Jogador
                  </button>
                  <div className="w-px h-6 bg-zinc-800 mx-1 hidden md:block"></div>
                  <button
                    onClick={() => setView("gm")}
                    className={`px-4 py-2 text-xs font-bold uppercase rounded transition cursor-pointer ${
                      view === "gm" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Painel GM
                  </button>
                </div>
              )}

              {sessionType === "player" && activePlayer && (
                <div className="text-cyan-400 text-xs font-bold uppercase tracking-widest px-4 border-r border-zinc-800 shrink-0">
                  Operador: <span className="text-white font-black">{activePlayer.name}</span>
                </div>
              )}

              {sessionType === "gm" && view === "player" && (
                <div className="flex items-center gap-2 px-4 border-r border-zinc-800 shrink-0">
                  <span className="text-pink-400 text-xs font-bold uppercase tracking-widest">Inspecionar:</span>
                  <select
                    value={loggedPlayerId || ""}
                    onChange={(e) => setLoggedPlayerId(Number(e.target.value))}
                    className="bg-zinc-900 border border-zinc-800 text-white rounded text-xs px-2.5 py-1 font-bold focus:outline-none focus:border-pink-500"
                  >
                    {players.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <button
                onClick={() => pullFromMainframe(false)}
                disabled={isSyncing}
                className={`p-2 bg-zinc-900 text-cyan-400 hover:text-white rounded border border-zinc-800 cursor-pointer transition-all duration-200 ${
                  isSyncing ? "animate-spin opacity-50" : "hover:bg-zinc-800"
                }`}
                title="Sincronizar Cloud Mainframe"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              {sessionType === "gm" && (
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className={`p-2 bg-zinc-900 text-slate-400 hover:text-white rounded border border-zinc-800 cursor-pointer transition ${
                    showSettings ? "border-pink-500 text-pink-500 bg-pink-500/10" : "hover:bg-zinc-800"
                  }`}
                  title="Configurações Core"
                >
                  <Settings className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={handleLogout}
                className="p-2 bg-zinc-900 text-red-400 hover:text-white hover:bg-red-600 rounded border border-zinc-850 transition-colors cursor-pointer"
                title="Desconectar Sinal"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </nav>
      )}

      {showSettings && sessionType === "gm" && (
        <div className="bg-zinc-900 border-b border-zinc-800 p-4">
          <div className="max-w-7xl mx-auto flex items-end gap-4 flex-wrap">
            <div className="flex-1 min-w-[280px]">
              <label className="block text-xs uppercase text-slate-400 font-bold mb-1">
                Sobrescrita Criptografada Gemini Key
              </label>
              <input
                type="password"
                placeholder="AIzaSyB..."
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                className="gm-input !border-zinc-700 !bg-zinc-950 text-slate-100"
              />
            </div>
            <button
              onClick={() => {
                setShowSettings(false);
                showToast("Key updated no Mainframe.", "success");
              }}
              className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded font-bold text-xs uppercase tracking-widest transition cursor-pointer"
            >
              Confirmar
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 pb-16">
        {sessionType === "none" ? (
          <MainGate
            players={players}
            gms={gms} 
            showToast={showToast}
            onGMLogin={() => { setSessionType("gm"); setView("gm"); }}
            onPlayerLogin={(id) => { setSessionType("player"); setLoggedPlayerId(id); setView("player"); }}
          />
        ) : view === "player" ? (
          activePlayer ? (
            <PlayerDashboard
              player={activePlayer}
              players={players}
              setPlayers={setPlayers}
              missions={missions}
              setMissions={setMissions}
              squads={squads}
              shopItems={shopItems}
              setShopItems={setShopItems}
              logs={logs}
              notifications={notifications}
              setNotifications={setNotifications}
              addLog={addLog}
              geminiKey={geminiKey}
              showToast={showToast}
            />
          ) : (
            <div className="text-center p-8 text-slate-500 font-bold uppercase tracking-widest mt-12 select-none">
              Aguardando sincronização neural do sujeito no terminal...
            </div>
          )
        ) : (
          <GMDashboard
            players={players}
            setPlayers={setPlayers}
            missions={missions}
            setMissions={setMissions}
            squads={squads}
            setSquads={setSquads}
            shopItems={shopItems}
            setShopItems={setShopItems}
            logs={logs}
            notifications={notifications}
            setNotifications={setNotifications}
            addLog={addLog}
            showToast={showToast}
          />
        )}
      </main>
    </div>
  );
}