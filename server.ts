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

// Ensure data folder exists
if (!fs.existsSync(path.dirname(DB_FILE))) {
  fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
}

// Initial default state
const initialPlayers = [
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
      {
        id: 1,
        name: "Data Shard Corrompido",
        desc: "Fragmento de dados roubado de uma megacorp.",
        quantity: 1,
      },
    ],
    realName: "Jogador Um",
    email: "j1@email.com",
    sigla: "J1",
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
    sigla: "J2",
  },
];

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
  geminiKey: string;
  gms?: any[]; // Alterado para suportar múltiplos GMs sequenciais dinâmicos
}

const defaultDB: RPGDB = {
  players: initialPlayers,
  missions: initialMissions,
  squads: initialSquads,
  shopItems: initialShopItems,
  logs: [],
  geminiKey: "",
  gms: [{ user: "admin", pass: "admin" }] // Contingência padrão estruturada
};

let hasSyncedWithCloud = false;

// Helper: load local db
function loadLocalDB(): RPGDB {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(data);
      hasSyncedWithCloud = true;
      return {
        players: parsed.players || initialPlayers,
        missions: parsed.missions || initialMissions,
        squads: parsed.squads || initialSquads,
        shopItems: parsed.shopItems || initialShopItems,
        logs: parsed.logs || [],
        geminiKey: parsed.geminiKey || "",
        gms: parsed.gms || [{ user: "admin", pass: "admin" }]
      };
    }
  } catch (err) {
    console.error("Erro ao carregar banco local:", err);
  }
  return defaultDB;
}

// Helper: save local db
function saveLocalDB(data: RPGDB) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Erro ao salvar banco local:", err);
  }
}

// Global in-memory storage synced with local file
let activeDB = loadLocalDB();

app.use(express.json({ limit: "50mb" }));

// Google Web App GAS Sync API Proxy URL
const GAS_URL = "https://script.google.com/macros/s/AKfycbz4240i9n-_ncrsfDXUISP5CCGrKwQ8zvdo6jeM-JuQmhj5tTOkeBcrpWh1WOI5meGyeA/exec";

// 1. API: Get Mainframe Data
app.get("/api/mainframe", async (req, res) => {
  try {
    // Attempt to pull from GAS sheet for multi-user sync
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout max for quick response

    const response = await fetch(GAS_URL, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      const cloudDatabase: any = await response.json();
      
      // Merge spreadsheet remote database with local
      if (cloudDatabase.players) activeDB.players = JSON.parse(cloudDatabase.players);
      if (cloudDatabase.missions) activeDB.missions = JSON.parse(cloudDatabase.missions);
      if (cloudDatabase.dg_groups) activeDB.squads = JSON.parse(cloudDatabase.dg_groups);
      if (cloudDatabase.dg_shop) activeDB.shopItems = JSON.parse(cloudDatabase.dg_shop);
      if (cloudDatabase.logs) activeDB.logs = JSON.parse(cloudDatabase.logs);
      if (cloudDatabase.ai_key) activeDB.geminiKey = cloudDatabase.ai_key;
      
      // Varredura de chaves dinâmicas sequenciais (gm_user_1, gm_user_2, etc.)
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

      // Aloca a lista se encontrar dados, senão mantém a contingência estável
      if (temporaryGmsList.length > 0) {
        activeDB.gms = temporaryGmsList;
      } else if (cloudDatabase.gm_user && cloudDatabase.gm_pass) {
        activeDB.gms = [{ user: cloudDatabase.gm_user, pass: cloudDatabase.gm_pass }];
      } else {
        activeDB.gms = [{ user: "admin", pass: "admin" }];
      }
      
      hasSyncedWithCloud = true;
      saveLocalDB(activeDB);
    }
  } catch (err) {
    console.log("GAS mainframe sync timed out or unreachable. Serving local db state instead.");
    if (!hasSyncedWithCloud) {
      return res.status(503).json({ error: "Mainframe em inicialização ou nuvem indisponível. Aguarde." });
    }
  }

  res.json({
    players: activeDB.players,
    missions: activeDB.missions,
    squads: activeDB.squads,
    shopItems: activeDB.shopItems,
    logs: activeDB.logs,
    geminiKey: activeDB.geminiKey,
    gms: activeDB.gms || [{ user: "admin", pass: "admin" }] // Despacha a lista mapeada
  });
});

// 2. API: Push Mainframe Data (supports incremental key savings)
app.post("/api/mainframe", async (req, res) => {
  const { key, value } = req.body;
  if (!key || value === undefined) {
    return res.status(400).json({ error: "Missing key or value fields" });
  }

  try {
    const parsedValue = typeof value === "string" ? JSON.parse(value) : value;

    // Update active memory
    if (key === "players") activeDB.players = parsedValue;
    else if (key === "missions") activeDB.missions = parsedValue;
    else if (key === "dg_groups") activeDB.squads = parsedValue;
    else if (key === "dg_shop") activeDB.shopItems = parsedValue;
    else if (key === "logs") activeDB.logs = parsedValue;
    else if (key === "ai_key") activeDB.geminiKey = parsedValue;
    else if (key === "gms") activeDB.gms = parsedValue;

    saveLocalDB(activeDB);

    // Proxy the POST to Google Apps Script asynchronously (without blocking response)
    fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value: typeof value === "string" ? value : JSON.stringify(value) }),
    }).catch((err) => {
      // Intentionally capture background fetch failures silently
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Erro no processamento da gravação do mainframe:", err);
    res.status(500).json({ error: "Erro ao processar dados no servidor." });
  }
});

// Helper for Gemini AI client initialization
function getGeminiClient(customKey?: string) {
  const key = customKey || process.env.GEMINI_API_KEY || activeDB.geminiKey;
  if (!key) {
    throw new Error("API Key do Gemini indisponível. Cadastre na aba de Configurações do GM ou configure a variável GEMINI_API_KEY.");
  }
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// 3. API: Gemini Profile Bio Scan / Evaluation
app.post("/api/gemini/analyze", async (req, res) => {
  const { player, customKey } = req.body;
  if (!player) {
    return res.status(400).json({ error: "Missing player data for analysis" });
  }

  try {
    const ai = getGeminiClient(customKey);
    const prompt = `Você é um sistema de Inteligência Artificial corporativa ultratecnológica e fria avaliando o perfil de um jogador.
Escreva exatamente um parágrafo curto, persuasivo e impactante elogiando o principal ponto forte do jogador e apontando uma área de melhoria calculada taticamente. use termos cyberpunk, jargões hackers-corporativos e seja direto.

Dados do sujeito:
Nome: ${player.name}
Classe: ${player.class}
Subclasse: ${player.subClass}
Nível: ${player.level}
Atributos Biométricos: ${JSON.stringify(player.attributes)}

Não use saudações amigáveis ou encerramento, seja o sistema mainframe avaliando. Responda em português brasileiro.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({ analysis: response.text });
  } catch (err: any) {
    console.error("Erro na análise do Gemini:", err);
    res.status(500).json({ error: err.message || "Erro na rede neural do Gemini." });
  }
});

// 4. API: Gemini RPG Mission Generator
app.post("/api/gemini/mission", async (req, res) => {
  const { player, customKey } = req.body;
  if (!player) {
    return res.status(400).json({ error: "Missing player data for generating contracts" });
  }

  try {
    const ai = getGeminiClient(customKey);
    const prompt = `Você é um Fixer experiente que envia missões mortais para agentes na dark web.
Crie um contrato tático ou missão cyberpunk perigosa focada nas habilidades de um agente de nível ${player.level} cuja classe é ${player.class} e subclasse é ${player.subClass}.
Responda APENAS com um objeto JSON válido correspondente à seguinte estrutura (não inclua marcações markdown adicionais, blocos de código ou explicações):

{
  "title": "Nome da Missão / Contrato (impactante e tecnológico)",
  "desc": "Uma descrição breve do trabalho, contexto corporativo e objetivos claros",
  "diff": "Dificuldade sugerida (Fácil, Médio, Difícil ou Mortal)",
  "sp": 150,
  "xp": 300
}

Determine os valores de SP (Survivor Points) e XP proporcionalmente ao nível do jogador.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const textResult = response.text || "{}";
    try {
      const parsedMission = JSON.parse(textResult.trim());
      res.json(parsedMission);
    } catch {
      // Fallback clean extraction if JSON was wrapped in markdown
      const cleanJsonStr = textResult.replace(/```json/g, "").replace(/```/g, "").trim();
      res.json(JSON.parse(cleanJsonStr));
    }
  } catch (err: any) {
    console.error("Erro na geração de missão pelo Gemini:", err);
    res.status(500).json({ error: err.message || "Erro de rede no Fixer." });
  }
});

// Configure Vite or Static Asset delivery
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Mainframe Server Node] running on http://localhost:${PORT}`);
  });
}

startServer();