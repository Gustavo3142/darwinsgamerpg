import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(process.cwd(), "data", "db.json");

if (!fs.existsSync(path.dirname(DB_FILE))) {
  fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
}

const initialPlayers: any[] = [];
const initialMissions: any[] = [];
const initialSquads = [{ id: 1, name: "Esquadrão Alpha", members: [1, 2] }];
const initialShopItems = [
  {
    id: 1,
    name: "Estimulante Neural",
    desc: "Regenera o foco instantaneamente.",
    cost: 150,
    stock: 5,
    targetPlayerId: null,
  },
];

interface RPGDB {
  players: any[];
  missions: any[];
  squads: any[];
  shopItems: any[];
  logs: any[];
  notifications: any[];
  geminiKey: string;
  gms?: any[];
}

const defaultDB: RPGDB = {
  players: initialPlayers,
  missions: initialMissions,
  squads: initialSquads,
  shopItems: initialShopItems,
  logs: [],
  notifications: [],
  geminiKey: "",
  gms: [{ user: "admin", pass: "admin" }]
};

function loadLocalDB(): RPGDB {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(data);
      return {
        players: parsed.players || initialPlayers,
        missions: parsed.missions || initialMissions,
        squads: parsed.squads || initialSquads,
        shopItems: parsed.shopItems || initialShopItems,
        logs: parsed.logs || [],
        notifications: parsed.notifications || [],
        geminiKey: parsed.geminiKey || "",
        gms: parsed.gms || [{ user: "admin", pass: "admin" }]
      };
    }
  } catch (err) {
    console.error("Erro ao carregar banco local:", err);
  }
  return defaultDB;
}

function saveLocalDB(data: RPGDB) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Erro ao salvar banco local:", err);
  }
}

let activeDB = loadLocalDB();
app.use(express.json({ limit: "50mb" }));

const GAS_URL = "https://script.google.com/macros/s/AKfycbz4240i9n-_ncrsfDXUISP5CCGrKwQ8zvdo6jeM-JuQmhj5tTOkeBcrpWh1WOI5meGyeA/exec";

// 1. API: Get Mainframe Data
app.get("/api/mainframe", async (req, res) => {
  try {
    const response = await fetch(GAS_URL);
    if (response.ok) {
      const cloudDatabase: any = await response.json();
      
      if (cloudDatabase.players) activeDB.players = JSON.parse(cloudDatabase.players);
      if (cloudDatabase.missions) activeDB.missions = JSON.parse(cloudDatabase.missions);
      if (cloudDatabase.dg_groups) activeDB.squads = JSON.parse(cloudDatabase.dg_groups);
      if (cloudDatabase.dg_shop) activeDB.shopItems = JSON.parse(cloudDatabase.dg_shop);
      if (cloudDatabase.dg_notifications) activeDB.notifications = JSON.parse(cloudDatabase.dg_notifications);
      if (cloudDatabase.ai_key) activeDB.geminiKey = cloudDatabase.ai_key;
      
      if (cloudDatabase.logs) {
        const cloudLogs = JSON.parse(cloudDatabase.logs);
        const incomingLogs = Array.isArray(cloudLogs) ? cloudLogs : [cloudLogs];
        const existingLogs = activeDB.logs || [];
        
        // União simples de tabelas baseada em IDs para os Logs
        const combined = [...incomingLogs, ...existingLogs];
        const uniqueMap = new Map();
        combined.forEach((log) => {
          if (log && log.id && !uniqueMap.has(log.id)) {
            uniqueMap.set(log.id, log);
          }
        });
        
        activeDB.logs = Array.from(uniqueMap.values()).sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      }
      
      const temporaryGmsList: { user: string; pass: string }[] = [];
      Object.keys(cloudDatabase).forEach((cloudKey) => {
        if (cloudKey.startsWith("gm_user_")) {
          const suffix = cloudKey.replace("gm_user_", "");
          const username = cloudDatabase[cloudKey];
          const password = cloudDatabase[`gm_pass_${suffix}`] || "";
          if (username) {
            temporaryGmsList.push({ user: username, pass: password });
          }
        }
      });

      if (temporaryGmsList.length > 0) {
        activeDB.gms = temporaryGmsList;
      } else if (cloudDatabase.gm_user && cloudDatabase.gm_pass) {
        activeDB.gms = [{ user: cloudDatabase.gm_user, pass: cloudDatabase.gm_pass }];
      } else {
        activeDB.gms = [{ user: "admin", pass: "admin" }];
      }
      
      saveLocalDB(activeDB);
    }
  } catch (err) {
    console.log("Erro de comunicação com a planilha. Entregando dados locais.");
  }

  // Cria uma cópia segura dos jogadores, removendo o campo de senha
  const safePlayers = activeDB.players.map(p => {
    const { password, ...playerSemSenha } = p;
    return playerSemSenha;
  });

  // Retorna apenas dados que são seguros para a internet ver
  res.json({
    players: safePlayers,
    missions: activeDB.missions,
    squads: activeDB.squads,
    shopItems: activeDB.shopItems,
    logs: activeDB.logs,
    notifications: activeDB.notifications
    // ATENÇÃO: geminiKey e gms foram removidos daqui para proteção!
  });
}); // Fim do app.get("/api/mainframe"

// 2. API: Push Mainframe Data
app.post("/api/mainframe", async (req, res) => {
  const { key, value } = req.body;
  if (!key || value === undefined) {
    return res.status(400).json({ error: "Missing key or value fields" });
  }

  try {
    const parsedValue = typeof value === "string" ? JSON.parse(value) : value;
    let valueToSendToCloud = value;

    if (key === "players") activeDB.players = parsedValue;
    else if (key === "missions") activeDB.missions = parsedValue;
    else if (key === "dg_groups") activeDB.squads = parsedValue;
    else if (key === "dg_shop") activeDB.shopItems = parsedValue;
    else if (key === "ai_key") activeDB.geminiKey = parsedValue;
    else if (key === "gms") activeDB.gms = parsedValue;
    else if (key === "dg_notifications") activeDB.notifications = parsedValue;
    else if (key === "logs") {
      const incomingLogs = Array.isArray(parsedValue) ? parsedValue : [parsedValue];
      const existingLogs = activeDB.logs || [];
      
      // Juntamos os logs antigos com os novos
      const combined = [...existingLogs, ...incomingLogs];
      
      // Filtramos as duplicatas manualmente como seu código original fazia
      const uniqueMap = new Map();
      combined.forEach((log) => {
        if (log && log.id && !uniqueMap.has(log.id)) {
          uniqueMap.set(log.id, log);
        }
      });
      
      // Salvamos no banco e organizamos por data
      activeDB.logs = Array.from(uniqueMap.values()).sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      // Preparamos a string final para mandar pro Google Sheets
      valueToSendToCloud = JSON.stringify(activeDB.logs);
    }

    saveLocalDB(activeDB);

    fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value: typeof valueToSendToCloud === "string" ? valueToSendToCloud : JSON.stringify(valueToSendToCloud) }),
    }).catch(() => {});

    res.json({ success: true });
  } catch (err) {
    console.error("Erro de gravação no mainframe:", err);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
});

function getGeminiClient(customKey?: string) {
  const key = customKey || process.env.GEMINI_API_KEY || activeDB.geminiKey;
  if (!key) {
    throw new Error("API Key do Gemini indisponível.");
  }
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: { headers: { "User-Agent": "aistudio-build" } },
  });
}
// NOVA ROTA DE LOGIN SEGURO
app.post("/api/login", (req, res) => {
  const { user, pass, type } = req.body;

  // Se quem está tentando logar é o GM
  if (type === "gm") {
    const isValidGM = activeDB.gms?.some(
      (g) => g.user.toLowerCase() === user.toLowerCase() && g.pass === pass
    );
    if (isValidGM || (user === "admin" && pass === "admin")) {
      return res.json({ success: true, role: "gm" });
    }
  } 
  // Se quem está tentando logar é um Jogador
  else if (type === "player") {
    const foundPlayer = activeDB.players.find(
      (p) =>
        (p.sigla.toLowerCase() === user.toLowerCase() ||
         p.email.toLowerCase() === user.toLowerCase()) &&
        p.password === pass
    );
    if (foundPlayer) {
      return res.json({ 
        success: true, 
        role: "player", 
        playerId: foundPlayer.id, 
        playerName: foundPlayer.name 
      });
    }
  }

  // Se não encontrou ou a senha tá errada:
  return res.status(401).json({ success: false, error: "Credenciais inválidas" });
});

app.post("/api/gemini/analyze", async (req, res) => {
  const { player, customKey } = req.body;
  if (!player) return res.status(400).json({ error: "Missing data" });
  try {
    const ai = getGeminiClient(customKey);
    const prompt = `Você é um sistema de Inteligência Artificial corporativa ultratecnológica e fria avaliando o perfil de um jogador. Escreva exatamente um parágrafo curto, persuasivo e impactante elogiando o principal ponto forte do jogador e apontando uma área de melhoria calculada taticamente. use termos cyberpunk, jargões hackers-corporativos e seja direto. Dados do sujeito: Nome: ${player.name} Classe: ${player.class} Subclasse: ${player.subClass} Nível: ${player.level} Atributos Biométricos: ${JSON.stringify(player.attributes)} Não use saudoções amigáveis ou encerramento, seja o sistema mainframe avaliando. Responda em português brasileiro.`;
    const response = await ai.models.generateContent({ model: "gemini-3.5-flash", contents: prompt });
    res.json({ analysis: response.text });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/gemini/mission", async (req, res) => {
  const { player, customKey } = req.body;
  if (!player) return res.status(400).json({ error: "Missing data" });
  try {
    const ai = getGeminiClient(customKey);
    const prompt = `Você é um Fixer experiente que envia missões mortais para agentes na dark web. Crie um contrato tático ou missão cyberpunk perigosa focada nas habilidades de um agente de nível ${player.level} cuja classe é ${player.class} e subclasse é ${player.subClass}. Responda APENAS com um objeto JSON válido correspondente à seguinte estrutura (não inclua marcações markdown adicionais, blocos de código ou explicações): { "title": "Nome da Missão", "desc": "Descrição", "diff": "Médio", "sp": 150, "xp": 300 }`;
    const response = await ai.models.generateContent({ model: "gemini-3.5-flash", contents: prompt, config: { responseMimeType: "application/json" } });
    const textResult = response.text || "{}";
    try {
      res.json(JSON.parse(textResult.trim()));
    } catch {
      const cleanJsonStr = textResult.replace(/```json/g, "").replace(/```/g, "").trim();
      res.json(JSON.parse(cleanJsonStr));
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => { res.sendFile(path.join(distPath, "index.html")); });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Mainframe Server] running on http://localhost:${PORT}`);
  });
}
startServer();