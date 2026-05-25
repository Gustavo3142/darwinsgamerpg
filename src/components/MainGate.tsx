import React, { useState } from "react";
import { Shield, Activity } from "lucide-react";
import { Player } from "../types";

interface MainGateProps {
  players: Player[];
  onGMLogin: () => void;
  onPlayerLogin: (playerId: number) => void;
  showToast: (msg: string, type?: "success" | "error") => void;
  gmUser?: string;       // Injetado para credenciais dinâmicas da planilha
  gmPassword?: string;   // Injetado para credenciais dinâmicas da planilha
}

export default function MainGate({
  players,
  onGMLogin,
  onPlayerLogin,
  showToast,
  gmUser,
  gmPassword,
}: MainGateProps) {
  const [loginMode, setLoginMode] = useState<"player" | "gm" | null>(null);
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");

  const handleGMLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Validação inteligente usando os dados dinâmicos da planilha ou os fallbacks padrão
    if (user === (gmUser || "admin") && pass === (gmPassword || "admin")) {
      onGMLogin();
      showToast("Acesso autorizado. Bem-vindo, GM.", "success");
    } else {
      showToast("Acesso Negado! Usuário ou senha incorretos.", "error");
    }
  };

  const handlePlayerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const foundPlayer = players.find(
      (p) =>
        (p.sigla.toLowerCase() === user.toLowerCase() ||
          p.email.toLowerCase() === user.toLowerCase()) &&
        p.password === pass
    );
    if (foundPlayer) {
      onPlayerLogin(foundPlayer.id);
      showToast(`Sincronização Neural concluída. Bem-vindo, ${foundPlayer.name}.`, "success");
    } else {
      showToast("Acesso Negado! Sigla/Email ou senha incorretos.", "error");
    }
  };

  if (!loginMode) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black neon-text-primary uppercase tracking-widest mb-2">
            Darwin's Game
          </h1>
          <p className="text-cyan-400 font-bold uppercase tracking-widest text-sm">
            Mainframe Gateway
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
          <button
            onClick={() => setLoginMode("player")}
            className="neon-card hud-corner p-10 flex flex-col items-center justify-center gap-4 hover:bg-zinc-800/50 transition-all duration-300 group cursor-pointer"
          >
            <Activity className="w-16 h-16 text-cyan-400 group-hover:scale-110 transition-transform" />
            <h2 className="text-2xl font-bold text-white uppercase tracking-widest">
              Acesso Jogador
            </h2>
            <p className="text-xs text-slate-500 uppercase text-center">
              Sincronização de Painel Neural
            </p>
          </button>
          <button
            onClick={() => setLoginMode("gm")}
            className="neon-card hud-corner p-10 flex flex-col items-center justify-center gap-4 hover:bg-zinc-800/50 transition-all duration-300 group cursor-pointer border-pink-500/30"
          >
            <Shield className="w-16 h-16 text-pink-500 group-hover:scale-110 transition-transform" />
            <h2 className="text-2xl font-bold text-white uppercase tracking-widest">
              Acesso GM
            </h2>
            <p className="text-xs text-slate-500 uppercase text-center">
              Terminal de Mestre de Jogo
            </p>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[70vh] p-4">
      <div className="neon-card hud-corner p-6 sm:p-8 max-w-sm w-full space-y-6 bg-zinc-950/80">
        <button
          onClick={() => {
            setLoginMode(null);
            setUser("");
            setPass("");
          }}
          className="text-[10px] text-slate-500 hover:text-white uppercase font-bold tracking-widest mb-2 block cursor-pointer transition-colors"
        >
          &larr; Voltar ao Gateway
        </button>
        <div className="text-center">
          {loginMode === "gm" ? (
            <Shield className="w-12 h-12 text-pink-500 mx-auto mb-4" />
          ) : (
            <Activity className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
          )}
          <h2
            className={`text-2xl font-bold uppercase tracking-widest ${
              loginMode === "gm" ? "neon-text-primary" : "neon-text-secondary"
            }`}
          >
            Acesso Restrito
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {loginMode === "gm" ? "Terminal do Game Master" : "Interface de Sujeito"}
          </p>
        </div>
        <form onSubmit={loginMode === "gm" ? handleGMLogin : handlePlayerLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {loginMode === "gm" ? "ID do Mestre" : "Sigla ou E-mail"}
            </label>
            <input
              type="text"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              className="gm-input mt-1"
              placeholder={loginMode === "gm" ? "Ex: admin" : "Ex: J1"}
              required
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Código de Acesso
            </label>
            <input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              className="gm-input mt-1"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className={`w-full text-white font-bold py-3 rounded uppercase tracking-widest text-sm transition-all duration-300 mt-4 cursor-pointer ${
              loginMode === "gm"
                ? "bg-pink-600 hover:bg-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.3)]"
                : "bg-cyan-600 hover:bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            }`}
          >
            Autenticar
          </button>
        </form>
      </div>
    </div>
  );
}