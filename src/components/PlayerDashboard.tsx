import React, { useState } from "react";
import {
  Shield,
  Activity,
  Brain,
  Zap,
  Crosshair,
  Battery,
  Sparkles,
  FileText,
  Users,
  Heart,
  Trophy,
  Eye,
  ShoppingCart,
  Box,
  TrendingUp,
  Cpu
} from "lucide-react";
import { Player, Mission, ShopItem } from "../types";
import { generateUniqueId } from "../utils/id";

const attributeIconsMap: { [key: string]: React.ComponentType<any> } = {
  Confiabilidade: Shield,
  Agilidade: Activity,
  "Resolução de Problemas": Brain,
  Proatividade: Zap,
  Foco: Crosshair,
  "Abertura à Experiência": Sparkles,
  Consciência: FileText,
  Extroversão: Users,
  Compaixão: Heart,
  "Estabilidade Emocional": Shield,
  Paciência: Battery,
  Popularidade: TrendingUp,
};

interface PlayerDashboardProps {
  player: Player;
  players: Player[];
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  missions: Mission[];
  setMissions: React.Dispatch<React.SetStateAction<Mission[]>>;
  squads: Array<{ id: number; name: string; members: number[] }>;
  shopItems: ShopItem[];
  setShopItems: React.Dispatch<React.SetStateAction<ShopItem[]>>;
  addLog: (playerId: number, action: string, desc: string, xp?: number, sp?: number) => void;
  geminiKey: string;
  showToast: (msg: string, type?: "success" | "error") => void;
}

export default function PlayerDashboard({
  player,
  players,
  setPlayers,
  missions,
  setMissions,
  squads,
  shopItems,
  setShopItems,
  addLog,
  geminiKey,
  showToast,
}: PlayerDashboardProps) {
  const [activeTab, setActiveTab] = useState("attributes");
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysis, setAnalysis] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [inspectedPlayer, setInspectedPlayer] = useState<Player | null>(null);

  if (!player) return null;

  const mySquads = squads.filter((s) => s.members.includes(player.id)).map((s) => s.id);

  const availableMissions = missions.filter(
    (m) =>
      (m.targetPlayerId === null && m.targetSquadId === null) ||
      m.targetPlayerId === player.id ||
      (m.targetSquadId !== null && mySquads.includes(m.targetSquadId))
  );

  const analyzeProfile = async () => {
    setIsAnalyzing(true);
    setAnalysis("");
    try {
      const res = await fetch("/api/gemini/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          player,
          customKey: geminiKey,
        }),
      });
      const data = await res.json();
      if (res.ok && data.analysis) {
        setAnalysis(data.analysis);
        showToast("Escaneamento biométrico executado.", "success");
      } else {
        throw new Error(data.error || "Operação abortada pelo servidor");
      }
    } catch (e: any) {
      setAnalysis(`Falha na rede Neural: ${e.message || "IA desconectada"}`);
      showToast("Falha ao contatar bio-analista.", "error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateMission = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/gemini/mission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          player,
          customKey: geminiKey,
        }),
      });
      const data = await res.json();
      if (res.ok && data.title) {
        const newMission: Mission = {
          id: generateUniqueId(),
          title: data.title,
          desc: data.desc || "Assinatura de contrato tático.",
          sp: Number(data.sp) || 50,
          xp: Number(data.xp) || 120,
          quantity: 1,
          diff: data.diff || "Médio",
          status: "available",
          targetPlayerId: player.id,
          targetSquadId: null,
          claimedBy: [],
        };

        // Push new mission to server
        setMissions((prev) => [newMission, ...prev]);
        showToast("Novo contrato do Fixer criptografado na Dark Web!", "success");
      } else {
        throw new Error(data.error || "Falha ao gerar contrato.");
      }
    } catch (e: any) {
      showToast(`Falha tática na Dark Web: ${e.message || "Erro desconhecido"}`, "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const claimMission = (missionId: number) => {
    setMissions((prev) =>
      prev.map((m) => {
        if (m.id === missionId) {
          const currentClaimants = m.claimedBy || [];
          if (!currentClaimants.includes(player.id)) {
            return { ...m, claimedBy: [...currentClaimants, player.id] };
          }
        }
        return m;
      })
    );
    showToast("Diretriz de missão reivindicada com sucesso!", "success");
  };

  const handleBuyItem = (item: ShopItem) => {
    if (player.spBalance < item.cost) {
      return showToast("Survivor Points (SP) insuficientes.", "error");
    }
    if (item.stock <= 0) {
      return showToast("Estoque esgotado para esse item.", "error");
    }

    // Deduct stock
    setShopItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, stock: i.stock - 1 } : i)));

    // Update player inventory and deduct SP
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id === player.id) {
          const inv = [...p.inventory];
          const existing = inv.find((i) => i.name.toLowerCase() === item.name.toLowerCase());
          if (existing) {
            existing.quantity += 1;
          } else {
            inv.push({ id: generateUniqueId(), name: item.name, desc: item.desc, quantity: 1 });
          }
          return { ...p, spBalance: p.spBalance - item.cost, inventory: inv };
        }
        return p;
      })
    );

    addLog(player.id, "MERCADO", `Compra efetuada: ${item.name}`, 0, -item.cost);
    showToast("Transação autorizada. Item despachado.", "success");
  };

  const maxAttr = Math.max(10, ...Object.values(player.attributes));

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-8 relative">
      {/* Competitor Inspect Modal */}
      {inspectedPlayer && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="neon-card hud-corner p-6 md:p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
            <div className="flex justify-between items-start mb-6 border-b border-cyan-500/20 pb-4">
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1 flex items-center gap-2">
                  <Eye className="w-3 h-3 text-cyan-400" /> Inspeção Remota de Perfil
                </div>
                <h2 className="text-3xl font-bold neon-text-secondary uppercase">
                  {inspectedPlayer.name}
                </h2>
                <p className="text-sm text-cyan-400 font-bold uppercase tracking-widest">
                  {inspectedPlayer.class} // {inspectedPlayer.subClass}
                </p>
              </div>
              <button
                onClick={() => setInspectedPlayer(null)}
                className="text-slate-400 hover:text-white font-bold text-2xl transition-colors cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded text-center">
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">
                  Nível Sincronizado
                </div>
                <div className="text-3xl font-bold text-white">{inspectedPlayer.level}</div>
              </div>
              <div className="bg-zinc-900/50 border border-pink-500/20 p-4 rounded text-center shadow-[inset_0_0_10px_rgba(236,72,153,0.05)]">
                <div className="text-[10px] text-pink-500 font-bold uppercase tracking-widest mb-1">
                  Survivor Points (SP)
                </div>
                <div className="text-3xl font-bold text-pink-400">{inspectedPlayer.spBalance}</div>
              </div>
            </div>

            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-zinc-800 pb-2 mb-4">
              Matriz Biométrica
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {Object.entries(inspectedPlayer.attributes).map(([attr, value]) => {
                const IconComponent = attributeIconsMap[attr] || Activity;
                const attrsAsNumbers = Object.values(inspectedPlayer.attributes) as number[];
                const rivalMax = Math.max(10, ...attrsAsNumbers);
                const valNum = Number(value);
                return (
                  <div key={attr} className="bg-zinc-950 p-3 border border-zinc-800 rounded">
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <IconComponent className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300 truncate">
                          {attr}
                        </span>
                      </div>
                      <span className="font-bold text-cyan-400 text-xs shrink-0">{valNum}</span>
                    </div>
                    <div className="h-1 bg-zinc-800 rounded w-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-500 opacity-50 transition-all duration-500"
                        style={{ width: `${(valNum / rivalMax) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-zinc-800 pb-2 mb-4 animate-pulse">
              Conquistas Abertas
            </h3>
            <div className="flex flex-wrap gap-2">
              {inspectedPlayer.conquistas.length === 0 && (
                <span className="text-xs text-slate-500 italic">
                  Nenhum dado cadastrado para este perfil.
                </span>
              )}
              {inspectedPlayer.conquistas.map((c, i) => {
                const isObj = c && typeof c === "object";
                const name = isObj ? (c as any).name : c;
                const desc = isObj ? (c as any).desc : "";
                return (
                  <div
                    key={i}
                    className="bg-zinc-900 border border-yellow-500/30 px-3 py-2 rounded text-xs text-yellow-400 tracking-wide flex flex-col gap-1 items-start max-w-full"
                  >
                    <span className="font-bold uppercase flex items-center gap-1.5 shrink-0">
                      <Trophy className="w-3.5 h-3.5 text-yellow-500" /> {name}
                    </span>
                    {desc && (
                      <span className="text-[11px] text-slate-400 font-normal normal-case italic pl-5">
                        {desc}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Header Profile Summary */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-pink-500/20 pb-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold neon-text-primary uppercase tracking-tight">
            {player.name}
          </h1>
          <p className="text-base text-cyan-400 font-semibold tracking-widest mt-1 uppercase">
            {player.class} // <span className="text-slate-400">{player.subClass}</span>
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase tracking-widest text-slate-400">Nível Operacional</div>
          <div className="text-3xl font-bold neon-text-secondary">{player.level}</div>
        </div>
      </header>

      {/* Progress Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="neon-card hud-corner p-4 flex flex-col justify-center">
          <div className="w-full">
            <div className="text-xs font-semibold tracking-wider text-slate-300 mb-1 flex justify-between uppercase">
              <span>Frequência de EXP</span>
              <span className="text-cyan-400">
                {player.currentXp} / {player.totalXpForLevel}
              </span>
            </div>
            <div className="hud-progress-bg">
              <div
                className="hud-progress-fill"
                style={{
                  width: `${Math.min(100, (player.currentXp / player.totalXpForLevel) * 100)}%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        <div className="neon-card hud-corner p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Survivor Points (SP)
            </span>
            <Zap className="text-pink-500 w-4 h-4" />
          </div>
          <div>
            <div className="text-3xl font-bold neon-text-primary">{player.spBalance}</div>
          </div>
        </div>

        <div className="neon-card hud-corner p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Conquistas Desbloqueadas
            </span>
            <Trophy className="text-cyan-400 w-4 h-4" />
          </div>
          <div>
            <div className="text-3xl font-bold neon-text-secondary">{player.conquistas.length}</div>
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex gap-2 border-b border-zinc-800 overflow-x-auto pb-1 mt-6">
        <button
          onClick={() => setActiveTab("attributes")}
          className={`px-4 py-2 font-bold uppercase tracking-widest text-xs transition-all border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === "attributes"
              ? "border-pink-500 text-pink-500 bg-pink-500/10"
              : "border-transparent text-slate-500 hover:text-slate-300"
          }`}
        >
          Atributos
        </button>
        <button
          onClick={() => setActiveTab("missions")}
          className={`px-4 py-2 font-bold uppercase tracking-widest text-xs transition-all border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === "missions"
              ? "border-pink-500 text-pink-500 bg-pink-500/10"
              : "border-transparent text-slate-500 hover:text-slate-300"
          }`}
        >
          Missões
        </button>
        <button
          onClick={() => setActiveTab("mercado")}
          className={`px-4 py-2 font-bold uppercase tracking-widest text-xs transition-all border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === "mercado"
              ? "border-purple-500 text-purple-500 bg-purple-500/10"
              : "border-transparent text-slate-500 hover:text-slate-300"
          }`}
        >
          Mercado Negro
        </button>
        <button
          onClick={() => setActiveTab("conquistas")}
          className={`px-4 py-2 font-bold uppercase tracking-widest text-xs transition-all border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === "conquistas"
              ? "border-pink-500 text-pink-500 bg-pink-500/10"
              : "border-transparent text-slate-500 hover:text-slate-300"
          }`}
        >
          Conquistas
        </button>
        <button
          onClick={() => setActiveTab("inventory")}
          className={`px-4 py-2 font-bold uppercase tracking-widest text-xs transition-all border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === "inventory"
              ? "border-pink-500 text-pink-500 bg-pink-500/10"
              : "border-transparent text-slate-500 hover:text-slate-300"
          }`}
        >
          Inventário
        </button>
        <button
          onClick={() => setActiveTab("ranking")}
          className={`px-4 py-2 font-bold uppercase tracking-widest text-xs transition-all border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === "ranking"
              ? "border-cyan-500 text-cyan-500 bg-cyan-500/10"
              : "border-transparent text-slate-500 hover:text-slate-300"
          }`}
        >
          Hall da Fama
        </button>
      </div>

      {/* Tabs panels */}
      <div className="py-2">
        {/* TAB 1: ATTRIBUTES */}
        {activeTab === "attributes" && (
          <div className="space-y-4">
            <div className="bg-zinc-900 border border-purple-500/30 p-4 rounded-md hud-corner">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-base uppercase tracking-wider text-purple-400 flex items-center gap-2">
                  <Brain className="w-5 h-5" /> Neuro-Analista IA Mainframe
                </h3>
                <button
                  onClick={analyzeProfile}
                  disabled={isAnalyzing}
                  className="flex items-center gap-1.5 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/50 px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-colors cursor-pointer"
                >
                  {isAnalyzing ? (
                    "Processando..."
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" /> Escanear Biometria (IA)
                    </>
                  )}
                </button>
              </div>
              {analysis ? (
                <p className="text-slate-200 text-xs leading-relaxed border-l-2 border-purple-500 pl-3 italic bg-purple-900/10 p-2">
                  "{analysis}"
                </p>
              ) : (
                <p className="text-slate-600 text-xs italic">
                  Mainframe biométrico ocioso. Solicite o escaneamento neural para gerar o relatório corporativo.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(player.attributes).map(([attr, value]) => {
                const IconComponent = attributeIconsMap[attr] || Activity;
                return (
                  <div
                    key={attr}
                    className="bg-zinc-900/50 border border-zinc-800 p-3.5 rounded flex items-center gap-3"
                  >
                    <div className="p-2 bg-zinc-950 rounded border border-cyan-500/30 text-cyan-500">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-end mb-1">
                        <span className="font-semibold uppercase text-[10px] tracking-wider text-slate-300 truncate">
                          {attr}
                        </span>
                        <span className="font-bold text-cyan-400 text-sm">{value}</span>
                      </div>
                      <div className="h-1 w-full bg-zinc-800 rounded overflow-hidden">
                        <div
                          className="h-full bg-cyan-500"
                          style={{ width: `${(value / maxAttr) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: MISSIONS */}
        {activeTab === "missions" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-zinc-900 p-3 rounded border border-pink-500/20">
              <h3 className="font-bold text-slate-200 uppercase tracking-widest text-xs">
                Contratos Ativos da Dark Web
              </h3>
              <button
                onClick={generateMission}
                disabled={isGenerating}
                className="flex items-center gap-1.5 bg-pink-600 hover:bg-pink-500 text-white px-4 py-1.5 rounded text-[10px] font-bold uppercase transition cursor-pointer"
              >
                {isGenerating ? (
                  "Injetando Codificação..."
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" /> Contatar Fixer (Gerar Missão IA)
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableMissions.length === 0 && (
                <p className="text-slate-500 italic p-4 text-sm col-span-full text-center border border-dashed border-zinc-800 rounded">
                  Nenhuma diretriz de missão ativa ou encontrada na sub-rede.
                </p>
              )}
              {availableMissions.map((mission) => {
                const isClaimedByMe = (mission.claimedBy || []).includes(player.id);
                const canClaim = mission.quantity > (mission.claimedBy || []).length;

                return (
                  <div
                    key={mission.id}
                    className={`p-4 rounded border ${
                      isClaimedByMe
                        ? "bg-cyan-900/10 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.05)]"
                        : "bg-zinc-900 border-zinc-800 hover:border-pink-500/30"
                    } relative overflow-hidden group transition-all duration-300`}
                  >
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-pink-500/5 to-transparent -z-0"></div>
                    <div className="flex justify-between items-start mb-2 relative z-10 gap-3">
                      <h3 className="font-bold text-base text-white pr-4 flex flex-col group-hover:text-pink-400 transition-colors">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span>{mission.title}</span>
                          {mission.targetPlayerId && (
                            <span className="text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded uppercase font-bold">
                              Específica
                            </span>
                          )}
                          {mission.targetSquadId && (
                            <span className="text-[9px] bg-blue-500/20 text-blue-300 border border-blue-500/20 px-2 py-0.5 rounded uppercase font-bold">
                              Esquadrão
                            </span>
                          )}
                        </div>
                      </h3>
                      <span
                        className={`text-[9px] px-2 py-1 uppercase tracking-wider rounded font-bold whitespace-nowrap ${
                          isClaimedByMe
                            ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                            : canClaim
                            ? "bg-pink-500/20 text-pink-400 border border-pink-500/30"
                            : "bg-zinc-800 text-zinc-500"
                        }`}
                      >
                        {isClaimedByMe ? "Em Progresso" : canClaim ? "Disponível" : "Esgotada"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mb-4 relative z-10 leading-relaxed">
                      {mission.desc}
                    </p>
                    <div className="flex justify-between items-end relative z-10 flex-wrap gap-2 pt-2 border-t border-zinc-800">
                      <div className="flex items-center gap-3 text-xs font-semibold flex-wrap">
                        <span className="flex items-center gap-1 text-pink-400">
                          <Zap className="w-3.5 h-3.5" /> +{mission.sp} SP
                        </span>
                        <span className="flex items-center gap-1 text-cyan-400">
                          <TrendingUp className="w-3.5 h-3.5" /> +{mission.xp} XP
                        </span>
                        {mission.quantity > 1 && (
                          <span className="flex items-center gap-1 text-purple-400 text-[11px]">
                            <Box className="w-3.5 h-3.5" /> Stock:{" "}
                            {mission.quantity - (mission.claimedBy || []).length} /{" "}
                            {mission.quantity}
                          </span>
                        )}
                      </div>
                      {!isClaimedByMe && canClaim && (
                        <button
                          onClick={() => claimMission(mission.id)}
                          className="bg-zinc-800 hover:bg-pink-600 text-[10px] text-white px-3 py-1.5 rounded uppercase font-bold transition-all duration-200 hover:shadow-[0_0_10px_rgba(236,72,153,0.3)] cursor-pointer"
                        >
                          Reivindicar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: BLACK MARKET */}
        {activeTab === "mercado" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {shopItems
                .filter((i) => i.targetPlayerId === null || i.targetPlayerId === player.id)
                .map((item) => {
                  const hasSP = player.spBalance >= item.cost;
                  const hasStock = item.stock > 0;
                  return (
                    <div
                      key={item.id}
                      className="neon-card p-4 flex flex-col justify-between border-purple-500/30 group hover:border-purple-500 transition-all duration-300"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-white text-lg group-hover:text-purple-400 transition-colors">
                            {item.name}
                          </h3>
                          <ShoppingCart className="text-purple-400 opacity-50 group-hover:opacity-100 transition-opacity w-4.5 h-4.5" />
                        </div>
                        <p className="text-xs text-slate-400 mb-4 leading-relaxed">{item.desc}</p>
                      </div>
                      <div className="flex justify-between items-end pt-3 border-t border-zinc-800">
                        <div>
                          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">
                            SP Custo / Estoque
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-bold text-pink-400 flex items-center gap-0.5">
                              <Zap className="w-3.5 h-3.5" /> {item.cost}
                            </span>
                            <span className="text-xs text-slate-500">| Qtd: {item.stock}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleBuyItem(item)}
                          disabled={!hasSP || !hasStock}
                          className={`px-4 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest transition-all duration-200 cursor-pointer ${
                            hasSP && hasStock
                              ? "bg-purple-600 hover:bg-purple-500 text-white hover:shadow-[0_0_10px_rgba(168,85,247,0.4)]"
                              : "bg-zinc-800 text-slate-500 cursor-not-allowed"
                          }`}
                        >
                          {hasStock ? "Adquirir" : "Esgotado"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              {shopItems.length === 0 && (
                <p className="text-slate-500 italic text-sm col-span-full text-center py-8">
                  Nenhum lote catalogado no Mercado Negro do servidor neste momento.
                </p>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: BADGES / CONQUISTAS */}
        {activeTab === "conquistas" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {player.conquistas.length === 0 && (
              <p className="text-slate-500 italic p-4 text-sm col-span-full text-center border border-dashed border-zinc-800 rounded py-12">
                Nenhum título honorário ou conquista desbloqueada. Complete diretrizes críticas para receber méritos do GM.
              </p>
            )}
           {player.conquistas.map((c, i) => {
              const isObj = c && typeof c === "object";
              const name = isObj ? (c as any).name : c;
              const desc = isObj ? (c as any).desc : "";
              const rarity = isObj ? (c as any).rarity : "comum";

              let colors = "text-slate-300 border-slate-500/30";
              let iconClass = "text-slate-400";
              let bgIcon = "bg-slate-500/10 border-slate-500/30";
              let shadow = "";

              if (rarity === "raro") {
                colors = "text-blue-400 border-blue-500/50";
                iconClass = "text-blue-500";
                bgIcon = "bg-blue-500/10 border-blue-500/50";
              } else if (rarity === "epico") {
                colors = "text-purple-500 border-purple-500/50";
                iconClass = "text-purple-500";
                bgIcon = "bg-purple-500/10 border-purple-500/50";
              } else if (rarity === "lendario") {
                colors = "text-orange-500 border-orange-500 font-black";
                iconClass = "text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]";
                bgIcon = "bg-orange-500/10 border-orange-500";
                shadow = "shadow-[0_0_15px_rgba(249,115,22,0.6)]";
              } else if (rarity === "especial") {
                colors = "text-yellow-400 border-yellow-400 font-black";
                iconClass = "text-yellow-400 animate-spin-3d drop-shadow-[0_0_10px_rgba(250,204,21,1)]";
                bgIcon = "bg-yellow-500/20 border-yellow-500";
                shadow = "shadow-[0_0_20px_rgba(250,204,21,0.8)]";
              }

              return (
                <div
                  key={i}
                  className={`neon-card p-4 flex gap-3 items-start ${colors} ${shadow}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border shrink-0 ${bgIcon}`}>
                    <Trophy className={`w-5 h-5 ${iconClass}`} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className={`font-bold text-sm uppercase tracking-wider ${colors}`}>{name}</div>
                    {desc && <div className="text-xs text-slate-400 font-sans italic font-normal">{desc}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 5: INVENTORY */}
        {activeTab === "inventory" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {player.inventory.length === 0 && (
              <div className="col-span-full text-center py-16 text-slate-500 font-bold uppercase tracking-widest border border-dashed border-zinc-800 rounded flex flex-col items-center justify-center gap-3 text-sm">
                <Box className="w-8 h-8 text-slate-700" /> INVENTÁRIO VAZIO NO MAINFRAME
              </div>
            )}
            {player.inventory.map((item) => (
              <div key={item.id} className="neon-card p-4 border-slate-500/30 flex items-start gap-3">
                <div className="mt-1 text-cyan-400 shrink-0">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-200 text-sm mb-1 uppercase">
                    {item.name}{" "}
                    <span className="text-pink-500 text-xs ml-1.5 font-sans font-medium">
                      x{item.quantity}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 leading-relaxed">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 6: LEADERBOARD / HALL OF FAME */}
        {activeTab === "ranking" && (
          <div className="space-y-4">
            <div className="overflow-x-auto bg-zinc-900 border border-zinc-800 rounded shadow-xl">
              <table className="w-full text-left min-w-[500px]">
                <thead>
                  <tr className="border-b border-zinc-800 text-slate-400 text-[10px] uppercase tracking-widest bg-zinc-950 font-bold">
                    <th className="p-4">Rank</th>
                    <th className="p-4">Sujeito</th>
                    <th className="p-4">Nível</th>
                    <th className="p-4">SP Global</th>
                    <th className="p-4 text-right">Módulo de Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {[...players]
                    .sort((a, b) => b.level - a.level || b.spBalance - a.spBalance)
                    .map((p, idx) => (
                      <tr
                        key={p.id}
                        className={`border-b border-zinc-800/40 hover:bg-zinc-800/30 transition-colors ${
                          p.id === player.id ? "bg-cyan-900/10" : ""
                        }`}
                      >
                        <td className="p-4 font-bold text-cyan-400 text-base">#{idx + 1}</td>
                        <td className="p-4">
                          <span className="font-bold text-slate-200 text-sm uppercase block">
                            {p.name}
                            {p.id === player.id && (
                              <span className="ml-2 text-[8px] bg-cyan-600 text-white px-1.5 py-0.5 rounded uppercase tracking-widest font-sans font-medium">
                                Você
                              </span>
                            )}
                          </span>
                          <span className="text-[9px] text-slate-500 block uppercase tracking-widest mt-0.5">
                            {p.class}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-white text-base">{p.level}</td>
                        <td className="p-4 font-bold text-pink-400">
                          <div className="flex items-center gap-1">
                            <Zap className="w-3.5 h-3.5 shrink-0" />
                            <span>{p.spBalance}</span>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          {p.id !== player.id ? (
                            <button
                              onClick={() => setInspectedPlayer(p)}
                              className="bg-zinc-800 hover:bg-cyan-600 text-[9px] text-white px-2.5 py-1.5 rounded uppercase font-bold transition-all duration-200 inline-flex items-center gap-1 hover:shadow-[0_0_10px_rgba(6,182,212,0.2)] cursor-pointer"
                            >
                              <Eye className="w-3 h-3" /> Inspecionar
                            </button>
                          ) : (
                            <span className="text-xs text-slate-600 italic uppercase">Logon ativo</span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
