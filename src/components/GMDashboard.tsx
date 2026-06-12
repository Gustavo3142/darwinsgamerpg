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
  Box,
  Check,
  Cpu,
  Trash,
  Save,
  Edit,
  TrendingUp,
  TrendingDown,
  Eye,
  ShoppingCart,
  Bell,
  Radio
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Player, Mission, Squad, ShopItem, LogEntry, Notification } from "../types";
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

interface GMDashboardProps {
  players: Player[];
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  missions: Mission[];
  setMissions: React.Dispatch<React.SetStateAction<Mission[]>>;
  squads: Squad[];
  setSquads: React.Dispatch<React.SetStateAction<Squad[]>>;
  shopItems: ShopItem[];
  setShopItems: React.Dispatch<React.SetStateAction<ShopItem[]>>;
  logs: LogEntry[];
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  addLog: (playerId: number, action: string, desc: string, xp?: number, sp?: number) => void;
  showToast: (msg: string, type?: "success" | "error") => void;
}

export default function GMDashboard({
  players,
  setPlayers,
  missions,
  setMissions,
  squads,
  setSquads,
  shopItems,
  setShopItems,
  logs,
  notifications,
  setNotifications,
  addLog,
  showToast,
}: GMDashboardProps) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(players[0]?.id || null);
  const [gmTab, setGmTab] = useState("jogadores");

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Player | null>(null);
  const [newConquista, setNewConquista] = useState("");
  const [newConquistaDesc, setNewConquistaDesc] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Estados de Filtros Padronizados em 2 Níveis
  const [missionFilterType, setMissionFilterType] = useState("todas");
  const [missionFilterTargetId, setMissionFilterTargetId] = useState("");

  const [shopFilterType, setShopFilterType] = useState("todas");
  const [shopFilterTargetId, setShopFilterTargetId] = useState("");

  const [notifFilterType, setNotifFilterType] = useState("todas");
  const [notifFilterTargetId, setNotifFilterTargetId] = useState("");

  const [newConquistaRarity, setNewConquistaRarity] = useState("comum");
  const [removeQtyState, setRemoveQtyState] = useState<{ [key: number]: string }>({});
  const [newItemRarity, setNewItemRarity] = useState("comum");
  const [shopRarity, setShopRarity] = useState("comum");

  const [logFilterType, setLogFilterType] = useState("todos");
  const [logTargetId, setLogTargetId] = useState("");

  const [degradeTargetType, setDegradeTargetType] = useState("player");
  const [degradePlayerId, setDegradePlayerId] = useState(players[0]?.id?.toString() || "");
  const [degradeSquadId, setDegradeSquadId] = useState(squads[0]?.id?.toString() || "");

  const [shopVisibilityType, setShopVisibilityType] = useState("geral");
  const [shopTargetPlayerId, setShopTargetPlayerId] = useState(players[0]?.id?.toString() || "");
  const [shopTargetSquadId, setShopTargetSquadId] = useState(squads[0]?.id?.toString() || "");

  const missionTemplates = [
    { title: "Incursão Datacenter Arasaka", desc: "Infiltre o subnível 4, drene os núcleos criptografados e sabote o gerador principal sem detecção.", sp: 200, xp: 450 },
    { title: "Extração de Informante Corp", desc: "Escolte o desertor da Militech em segurança pelas docas industriais até o ponto de extração.", sp: 150, xp: 300 },
    { title: "Limpeza de Malware", desc: "Expurgue a infecção cibernética dos servidores locais infectados por um esquadrão hacker rival.", sp: 100, xp: 200 }
  ];

 // Analytics State
  const [reportStartDate, setReportStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7); // Define 7 dias atrás como padrão
    return d.toISOString().split('T')[0];
  });
  const [reportEndDate, setReportEndDate] = useState("");
  const [reportPlayerId, setReportPlayerId] = useState("");
  const [selectedCompareIds, setSelectedCompareIds] = useState<number[]>([]);
  const [logStatusFilter, setLogStatusFilter] = useState("todos"); // Novo filtro (Ativos/Excluídos)

  const [mTitle, setMTitle] = useState("");
  const [mDesc, setMDesc] = useState("");
  const [mSP, setMSp] = useState("50");
  const [mXP, setMXp] = useState("100");
  const [mQty, setMQty] = useState("1");
  const [mType, setMType] = useState("geral");
  const [mTargetId, setMTargetId] = useState(players[0]?.id?.toString() || "");
  const [mTargetSquadId, setMTargetSquadId] = useState(squads[0]?.id?.toString() || "");
  const [missionWinnerId, setMissionWinnerId] = useState("");

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regSigla, setRegSigla] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regCharName, setRegCharName] = useState("");
  const [regClass, setRegClass] = useState("");
  const [regSubClass, setRegSubClass] = useState("");

  const [creditTargetType, setCreditTargetType] = useState("player");
  const [creditPlayerId, setCreditPlayerId] = useState(players[0]?.id?.toString() || "");
  const [creditSquadId, setCreditSquadId] = useState(squads[0]?.id?.toString() || "");
  const [creditXp, setCreditXp] = useState("0");
  const [creditSp, setCreditSp] = useState("0");
  const [creditAttrKey, setCreditAttrKey] = useState("");
  const [creditAttrValue, setCreditAttrValue] = useState("0");

  const [newItemName, setNewItemName] = useState("");
  const [newItemDesc, setNewItemDesc] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState("1");

  const [degradeXp, setDegradeXp] = useState("0");
  const [degradeSp, setDegradeSp] = useState("0");
  const [degradeAttrKey, setDegradeAttrKey] = useState("");
  const [degradeAttrValue, setDegradeAttrValue] = useState("0");

  const [newSquadName, setNewSquadName] = useState("");
  const [selectedSquadMembers, setSelectedSquadMembers] = useState<number[]>([]);

  const [shopName, setShopName] = useState("");
  const [shopDesc, setShopDesc] = useState("");
  const [shopCost, setShopCost] = useState("100");
  const [shopStock, setShopStock] = useState("5");

  // Notification Creation State
  const [notifMsg, setNotifMsg] = useState("");
  const [notifType, setNotifType] = useState<"info" | "alert" | "success">("info");
  const [notifVisibilityType, setNotifVisibilityType] = useState("geral");
  const [notifTargetPlayerId, setNotifTargetPlayerId] = useState(players[0]?.id?.toString() || "");
  const [notifTargetSquadId, setNotifTargetSquadId] = useState(squads[0]?.id?.toString() || "");

  const selectedPlayer = players.find((p) => p.id === selectedPlayerId) || players[0];
  const selectedCreditPlayer = players.find((p) => p.id === Number(creditPlayerId)) || players[0];

  const handleEditClick = () => {
    if (selectedPlayer) {
      setEditForm(JSON.parse(JSON.stringify(selectedPlayer)));
      setIsEditing(true);
      setShowDeleteConfirm(false);
    }
  };

  const handleSave = () => {
    if (editForm) {
      setPlayers((prev) => prev.map((p) => (p.id === editForm.id ? editForm : p)));
      addLog(editForm.id, "STATUS", `Atualização manual de status e/ou credenciais pelo GM.`);
      setIsEditing(false);
      showToast("Dados do jogador atualizados no Mainframe.", "success");
    }
  };

  const handleDeletePlayer = () => {
    if (selectedPlayerId) {
      const updatedPlayers = players.filter((p) => p.id !== selectedPlayerId);
      setPlayers(updatedPlayers);
      setIsEditing(false);
      setShowDeleteConfirm(false);
      setSelectedPlayerId(updatedPlayers[0]?.id || null);
      showToast("Perfil de jogador completamente apagado.", "success");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    if (editForm) {
      setEditForm({
        ...editForm,
        [name]: type === "number" ? Number(value) : value,
      });
    }
  };

  const handleAttributeChange = (attrName: string, value: string) => {
    if (editForm) {
      setEditForm({
        ...editForm,
        attributes: {
          ...editForm.attributes,
          [attrName]: Number(value),
        },
      });
    }
  };

  const handleAddConquista = () => {
    if (!newConquista.trim() || !selectedPlayerId) return;
    const item = { 
      name: newConquista.trim(), 
      desc: newConquistaDesc.trim(), 
      rarity: newConquistaRarity 
    };
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id === selectedPlayerId) {
          return { ...p, conquistas: [...p.conquistas, item] };
        }
        return p;
      })
    );
    addLog(selectedPlayerId, "CONQUISTA", `Conquista adicionada: ${newConquista.trim()} (${newConquistaRarity})`);
    setNewConquista("");
    setNewConquistaDesc("");
    showToast("Título honorário outorgado.", "success");
  };

  const handleRemoveConquista = (idx: number) => {
    if (!selectedPlayerId) return;
    let removedTitle = "";
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id === selectedPlayerId) {
          const novaLista = [...p.conquistas];
          const removida = novaLista.splice(idx, 1)[0];
          removedTitle = removida && typeof removida === "object" ? (removida as any).name : (removida || "");
          return { ...p, conquistas: novaLista };
        }
        return p;
      })
    );
    if (removedTitle) {
      addLog(selectedPlayerId, "CONQUISTA", `Conquista revogada: ${removedTitle}`);
    }
    showToast("Conquista deletada do sujeito.", "success");
  };

  const handleCompleteMission = (missionId: number, targetIdStr: string) => {
    const mission = missions.find((m) => m.id === missionId);
    if (!mission) return;

    let idsToReward: number[] = [];

    if (mission.targetSquadId) {
      const squad = squads.find((s) => s.id === mission.targetSquadId);
      if (squad) idsToReward = squad.members;
    } else if (mission.targetPlayerId) {
      idsToReward = [mission.targetPlayerId];
    } else {
      if (!targetIdStr) {
        return showToast("Selecione quem concluiu essa diretriz.", "error");
      }
      if (targetIdStr.startsWith("squad_")) {
        const sId = Number(targetIdStr.split("_")[1]);
        const squad = squads.find((s) => s.id === sId);
        if (squad) idsToReward = squad.members;
      } else {
        idsToReward = [Number(targetIdStr)];
      }
    }

    if (idsToReward.length === 0) {
      return showToast("Nenhum agente válido identificado para receber o pagamento.", "error");
    }

    setPlayers((prevPlayers) =>
      prevPlayers.map((p) => {
        if (idsToReward.includes(p.id)) {
          let newXp = p.currentXp + mission.xp;
          let newLevel = p.level;
          let totalXpNeeded = p.totalXpForLevel;

          while (newXp >= totalXpNeeded) {
            newXp -= totalXpNeeded;
            newLevel += 1;
            totalXpNeeded = Math.floor(totalXpNeeded * 1.5);
            showToast(`${p.name} subiu para o NÍVEL ${newLevel}!`, "success");
          }
          addLog(p.id, "MISSÃO", `Concluiu a missão: ${mission.title}`, mission.xp, mission.sp);
          return {
            ...p,
            currentXp: newXp,
            level: newLevel,
            totalXpForLevel: totalXpNeeded,
            spBalance: p.spBalance + mission.sp,
          };
        }
        return p;
      })
    );

    if (mission.quantity > 1) {
      setMissions((prev) =>
        prev.map((m) => (m.id === missionId ? { ...m, quantity: m.quantity - 1, claimedBy: [] } : m))
      );
    } else {
      setMissions((prev) => prev.filter((m) => m.id !== missionId));
    }
    showToast("Recompensas injetadas com sucesso.", "success");
  };

  const handleCreateMission = (e: React.FormEvent) => {
    e.preventDefault();
    const newTask: Mission = {
      id: generateUniqueId(),
      title: mTitle,
      desc: mDesc,
      sp: Number(mSP) || 50,
      xp: Number(mXP) || 100,
      quantity: Number(mQty) || 1,
      diff: "Médio",
      status: "available",
      targetPlayerId: mType === "especifica" ? Number(mTargetId) : null,
      targetSquadId: mType === "esquadrao" ? Number(mTargetSquadId) : null,
      claimedBy: [],
    };
    setMissions((prev) => [newTask, ...prev]);
    setMTitle("");
    setMDesc("");
    setMQty("1");
    showToast("Contrato publicado no Mainframe.", "success");
  };

  const deleteMission = (id: number) => {
    setMissions((prev) => prev.filter((m) => m.id !== id));
    showToast("Diretriz de missão cancelada.", "success");
  };

  const handleRegisterPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    const newPlayer: Player = {
      id: generateUniqueId(),
      name: regCharName,
      realName: regName,
      email: regEmail,
      sigla: regSigla,
      password: regPassword || "123",
      class: regClass,
      subClass: regSubClass,
      level: 1,
      currentXp: 0,
      totalXpForLevel: 100,
      spBalance: 0,
      attributes: {
        Confiabilidade: 1,
        Agilidade: 1,
        "Resolução de Problemas": 1,
        Proatividade: 1,
        Foco: 1,
        "Abertura à Experiência": 1,
        Consciência: 1,
        Extroversão: 1,
        Compaixão: 1,
        "Estabilidade Emocional": 1,
        Paciência: 1,
        Popularidade: 1,
      },
      conquistas: [],
      inventory: [],
    };
    setPlayers((prev) => [...prev, newPlayer]);
    showToast(`Operador ${regCharName} cadastrado com sucesso!`, "success");
    setGmTab("jogadores");
    setRegName("");
    setRegEmail("");
    setRegSigla("");
    setRegPassword("");
    setRegCharName("");
    setRegClass("");
    setRegSubClass("");
  };

  const handleCredit = (e: React.FormEvent) => {
    e.preventDefault();

    let targetIds: number[] = [];
    let targetNameLog = "";

    if (creditTargetType === "player") {
      if (!creditPlayerId) return showToast("Selecione um jogador público.", "error");
      targetIds = [Number(creditPlayerId)];
      targetNameLog = players.find((p) => p.id === Number(creditPlayerId))?.name || "Desconhecido";
    } else if (creditTargetType === "squad") {
      if (!creditSquadId) return showToast("Selecione um esquadrão divisor.", "error");
      const squad = squads.find((s) => s.id === Number(creditSquadId));
      if (!squad) return showToast("Esquadrão não identificado.", "error");
      targetIds = squad.members;
      targetNameLog = `Esquadrão ${squad.name}`;
    }

    if (targetIds.length === 0) return showToast("Nenhum alvo elegível.", "error");

    setPlayers((prevPlayers) =>
      prevPlayers.map((p) => {
        if (targetIds.includes(p.id)) {
          let newXp = p.currentXp + Number(creditXp);
          let newLevel = p.level;
          let totalXpNeeded = p.totalXpForLevel;

          while (newXp >= totalXpNeeded) {
            newXp -= totalXpNeeded;
            newLevel += 1;
            totalXpNeeded = Math.floor(totalXpNeeded * 1.5);
            showToast(`${p.name} subiu para o NÍVEL ${newLevel}!`, "success");
          }

          const updatedAttributes = { ...p.attributes };
          if (creditAttrKey && Number(creditAttrValue) !== 0) {
            updatedAttributes[creditAttrKey] = (updatedAttributes[creditAttrKey] || 0) + Number(creditAttrValue);
          }

          addLog(
            p.id,
            "CRÉDITO",
            `Injeção manual via GM (${targetNameLog})${
              creditAttrKey ? ` + Atributo: ${creditAttrKey}` : ""
            }`,
            Number(creditXp),
            Number(creditSp)
          );

          return {
            ...p,
            currentXp: newXp,
            level: newLevel,
            totalXpForLevel: totalXpNeeded,
            spBalance: p.spBalance + Number(creditSp),
            attributes: updatedAttributes,
          };
        }
        return p;
      })
    );

    showToast("Status e recursos injetados com êxito.", "success");
    setCreditXp("0");
    setCreditSp("0");
    setCreditAttrValue("0");
  };

  const handleDegrade = (e: React.FormEvent) => {
    e.preventDefault();
    
    let targetIds: number[] = [];
    let targetNameLog = "";

    if (degradeTargetType === "player") {
      if (!degradePlayerId) return showToast("Selecione um operador.", "error");
      targetIds = [Number(degradePlayerId)];
      targetNameLog = players.find((p) => p.id === Number(degradePlayerId))?.name || "Desconhecido";
    } else if (degradeTargetType === "squad") {
      if (!degradeSquadId) return showToast("Selecione um esquadrão divisor.", "error");
      const squad = squads.find((s) => s.id === Number(degradeSquadId));
      if (!squad) return showToast("Esquadrão não identificado.", "error");
      targetIds = squad.members;
      targetNameLog = `Esquadrão ${squad.name}`;
    }

    if (targetIds.length === 0) return showToast("Nenhum alvo qualificado para corte.", "error");

    setPlayers((prevPlayers) =>
      prevPlayers.map((p) => {
        if (targetIds.includes(p.id)) {
          let newXp = p.currentXp - Number(degradeXp);
          let newLevel = p.level;
          let totalXpNeeded = p.totalXpForLevel;

          while (newXp < 0 && newLevel > 1) {
            newLevel -= 1;
            totalXpNeeded = Math.ceil(totalXpNeeded / 1.5);
            newXp += totalXpNeeded;
            showToast(`${p.name} SOFREU DOWNGRADE PARA O NÍVEL ${newLevel}!`, "error");
          }
          if (newLevel === 1 && newXp < 0) newXp = 0;

          const updatedAttributes = { ...p.attributes };
          if (degradeAttrKey && Number(degradeAttrValue) > 0) {
            updatedAttributes[degradeAttrKey] = Math.max(
              1,
              (updatedAttributes[degradeAttrKey] || 1) - Number(degradeAttrValue)
            );
          }

          return {
            ...p,
            currentXp: newXp,
            level: newLevel,
            totalXpForLevel: totalXpNeeded,
            spBalance: Math.max(0, p.spBalance - Number(degradeSp)),
            attributes: updatedAttributes,
          };
        }
        return p;
      })
    );

    targetIds.forEach(id => {
      addLog(
        id,
        "DEGRADAÇÃO",
        `Protocolo de penalidade via GM (${targetNameLog})${degradeAttrKey ? ` - Atributo: ${degradeAttrKey}` : ""}`,
        -Number(degradeXp),
        -Number(degradeSp)
      );
    });

    showToast("Protocolo de Degradação concluído.", "success");
    setDegradeXp("0");
    setDegradeSp("0");
    setDegradeAttrValue("0");
  };

  const handleAddItemToSelected = () => {
    if (!newItemName.trim()) return;
    const targetId = Number(creditPlayerId);
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id === targetId) {
          const inv = p.inventory || [];
          const existingIndex = inv.findIndex(
            (i) => i.name.toLowerCase() === newItemName.toLowerCase()
          );
          if (existingIndex >= 0) {
            const newInv = [...inv];
            newInv[existingIndex].quantity += Number(newItemQuantity);
            return { ...p, inventory: newInv };
          }
          return {
            ...p,
            inventory: [
              ...inv,
              {
                id: generateUniqueId(),
                name: newItemName.trim(),
                desc: newItemDesc.trim() || "Item injetado por protocolo mestre.",
                quantity: Number(newItemQuantity),
                rarity: newItemRarity,
              },
            ],
          };
        }
        return p;
      })
    );
    addLog(targetId, "INVENTÁRIO", `Item concedido por GM: ${newItemName} (x${newItemQuantity}) [${newItemRarity}]`);
    setNewItemName("");
    setNewItemDesc("");
    setNewItemQuantity("1");
    showToast("Item outorgado ao agente.", "success");
  };

  const handleRemoveItemFromSelected = (playerId: number, itemId: number) => {
    const qtyToRemove = Number(removeQtyState[itemId]) || 1;
    let itemRemovedName = "Desconhecido";
    
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id === playerId) {
          const item = p.inventory.find((i) => i.id === itemId);
          if (item) {
            itemRemovedName = item.name;
            if (item.quantity <= qtyToRemove) {
              return { ...p, inventory: p.inventory.filter((i) => i.id !== itemId) };
            } else {
              const newInv = p.inventory.map(i => i.id === itemId ? { ...i, quantity: i.quantity - qtyToRemove } : i);
              return { ...p, inventory: newInv };
            }
          }
        }
        return p;
      })
    );
    addLog(playerId, "INVENTÁRIO", `GM removeu ${qtyToRemove}x: ${itemRemovedName}`);
    showToast(`${qtyToRemove}x ${itemRemovedName} removido(s).`, "success");
    setRemoveQtyState(prev => ({ ...prev, [itemId]: "" }));
  };

  const handleDeleteShopItem = (id: number) => {
    setShopItems((prev) => prev.filter((i) => i.id !== id));
    showToast("Lote excluído do mercado.", "success");
  };

  const toggleSquadMember = (id: number) => {
    setSelectedSquadMembers((prev) =>
      prev.includes(id) ? prev.filter((mid) => mid !== id) : [...prev, id]
    );
  };

  const handleCreateSquad = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSquadMembers.length === 0) {
      return showToast("Selecione no mínimo um membro operador.", "error");
    }
    const newSquad: Squad = {
      id: generateUniqueId(),
      name: newSquadName.trim(),
      members: selectedSquadMembers,
    };
    setSquads((prev) => [newSquad, ...prev]);
    setNewSquadName("");
    setSelectedSquadMembers([]);
    showToast("Esquadrão oficializado no Mainframe.", "success");
  };

  const handleDeleteSquad = (id: number) => {
    setSquads((prev) => prev.filter((s) => s.id !== id));
    showToast("Esquadrão dissolvido.", "success");
  };

  const handleCreateShopItem = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: ShopItem = {
      id: generateUniqueId(),
      name: shopName.trim(),
      desc: shopDesc.trim(),
      cost: Number(shopCost) || 100,
      stock: Number(shopStock) || 5,
      targetPlayerId: shopVisibilityType === "especifica" ? Number(shopTargetPlayerId) : null,
      targetSquadId: shopVisibilityType === "esquadrao" ? Number(shopTargetSquadId) : null,
      rarity: shopRarity,
    } as any;
    setShopItems((prev) => [newItem, ...prev]);
    setShopName("");
    setShopDesc("");
    setShopCost("100");
    setShopStock("5");
    showToast("Item catalogado para transações.", "success");
  };

  const restockItem = (id: number) => {
    setShopItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, stock: item.stock + 5 } : item))
    );
    showToast("Estoque do lote expandido (+5 unidades).", "success");
  };

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifMsg.trim()) return;

    const newNotif: Notification = {
      id: generateUniqueId(),
      date: new Date().toISOString(),
      message: notifMsg.trim(),
      type: notifType,
      targetPlayerId: notifVisibilityType === "especifica" ? Number(notifTargetPlayerId) : null,
      targetSquadId: notifVisibilityType === "esquadrao" ? Number(notifTargetSquadId) : null,
      readBy: [], 
    };

    setNotifications(prev => [newNotif, ...prev]);
    setNotifMsg("");
    showToast("Transmissão enviada para a rede.", "success");
  };

  const handleDeleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    showToast("Aviso deletado do banco de dados.", "success");
  };

  const exportPDF = () => {
    showToast("Iniciando canal de renderização nativo do Mainframe...", "success");
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const filteredLogs = logs.filter((log) => {
    if (reportStartDate && new Date(log.date) < new Date(reportStartDate + "T00:00:00")) return false;
    if (reportEndDate && new Date(log.date) > new Date(reportEndDate + "T23:59:59")) return false;
    
    if (logFilterType === "individual" && logTargetId && log.playerId !== Number(logTargetId)) return false;
    if (logFilterType === "esquadrao" && logTargetId) {
      const squad = squads.find(s => s.id === Number(logTargetId));
      if (squad && !squad.members.includes(log.playerId)) return false;
    }

    // NOVO: Filtro por Jogador Ativo ou Excluído
    const isPlayerActive = players.some(p => p.id === log.playerId);
    if (logStatusFilter === "ativos" && !isPlayerActive) return false;
    if (logStatusFilter === "excluidos" && isPlayerActive) return false;

    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-8">
      {/* Navigation Headers */}
      <header className="border-b border-pink-500/30 pb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 overflow-x-auto print:hidden">
        <div className="shrink-0">
          <h1 className="text-3xl font-bold neon-text-primary uppercase flex items-center gap-3">
            <Shield className="w-8 h-8" /> Terminal de Mestre GM
          </h1>
          <p className="text-cyan-400 font-semibold tracking-widest text-xs mt-1">
            NÍVEL DE PRIVILÉGIOS: DEUS EX MACHINA
          </p>
        </div>

        <div className="flex bg-zinc-900 border border-zinc-800 rounded p-1 flex-wrap gap-1 shrink-0">
          <button
            onClick={() => setGmTab("jogadores")}
            className={`px-4 py-2 uppercase text-xs font-bold rounded cursor-pointer transition-colors ${
              gmTab === "jogadores" ? "bg-pink-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Suj. Ativos
          </button>
          <button
            onClick={() => setGmTab("esquadroes")}
            className={`px-4 py-2 uppercase text-xs font-bold rounded flex items-center gap-1 cursor-pointer transition-colors ${
              gmTab === "esquadroes" ? "bg-pink-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Esquadrões
          </button>
          <button
            onClick={() => setGmTab("missoes")}
            className={`px-4 py-2 uppercase text-xs font-bold rounded cursor-pointer transition-colors ${
              gmTab === "missoes" ? "bg-pink-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Contratos
          </button>
          <button
            onClick={() => setGmTab("fornecedor")}
            className={`px-4 py-2 uppercase text-xs font-bold rounded flex items-center gap-1 cursor-pointer transition-colors ${
              gmTab === "fornecedor" ? "bg-pink-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Fornecedor
          </button>
          <button
            onClick={() => setGmTab("creditar")}
            className={`px-4 py-2 uppercase text-xs font-bold rounded cursor-pointer transition-colors ${
              gmTab === "creditar" ? "bg-pink-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Injetor
          </button>
          <button
            onClick={() => setGmTab("degradacao")}
            className={`px-4 py-2 uppercase text-xs font-bold rounded cursor-pointer transition-colors ${
              gmTab === "degradacao" ? "bg-pink-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Penalidades
          </button>
          <button
            onClick={() => setGmTab("cadastro")}
            className={`px-4 py-2 uppercase text-xs font-bold rounded cursor-pointer transition-colors ${
              gmTab === "cadastro" ? "bg-pink-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Novo Jogador.
          </button>
          <button
            onClick={() => setGmTab("transmissoes")}
            className={`px-4 py-2 uppercase text-xs font-bold rounded flex items-center gap-1 cursor-pointer transition-colors ${
              gmTab === "transmissoes" ? "bg-pink-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            <Bell className="w-3.5 h-3.5" /> Avisos
          </button>
          <button
            onClick={() => setGmTab("relatorio")}
            className={`px-4 py-2 uppercase text-xs font-bold rounded flex items-center gap-1 cursor-pointer transition-colors ${
              gmTab === "relatorio" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Analytics
          </button>
        </div>
      </header>

      {/* VIEW: MAIN PLAYERS REGULATOR */}
      {gmTab === "jogadores" && (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-64 shrink-0 space-y-4">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-zinc-800 pb-2">
              Sujs. Conectados
            </h2>
            <div className="space-y-2">
              {players.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedPlayerId(p.id);
                    setIsEditing(false);
                    setShowDeleteConfirm(false);
                  }}
                  className={`w-full text-left p-4 rounded border transition-all cursor-pointer ${
                    selectedPlayerId === p.id
                      ? "bg-pink-900/20 border-pink-500 shadow-[inset_4px_0_0_rgba(236,72,153,1)]"
                      : "bg-zinc-900 border-zinc-800 hover:border-cyan-500/50"
                  }`}
                >
                  <div
                    className={`font-bold text-lg ${
                      selectedPlayerId === p.id ? "text-pink-400" : "text-slate-200"
                    }`}
                  >
                    {p.name}
                  </div>
                  <div className="text-[10px] uppercase opacity-70 tracking-wider mt-1 text-slate-400 font-sans">
                    Nv. {p.level} | {p.class}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1">
            {selectedPlayer && !isEditing && (
              <div className="neon-card hud-corner p-6 md:p-8 space-y-8 animate-fade-in border-cyan-500/30">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div>
                    <h2 className="text-4xl font-bold neon-text-secondary uppercase tracking-tight">
                      {selectedPlayer.name}
                    </h2>
                    <p className="text-slate-400 font-medium tracking-widest mt-1 uppercase text-sm font-semibold">
                      {selectedPlayer.class} <span className="text-slate-600">//</span>{" "}
                      {selectedPlayer.subClass}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      ID Civil: {selectedPlayer.realName} | E-mail: {selectedPlayer.email} | Código:{" "}
                      {selectedPlayer.sigla}
                    </p>
                  </div>
                  <button
                    onClick={handleEditClick}
                    className="flex items-center gap-2 bg-zinc-800 hover:bg-cyan-600/20 border border-zinc-700 hover:border-cyan-500 text-white px-5 py-2.5 rounded text-xs font-bold uppercase tracking-widest transition-all cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" /> Editar Status de Sujeito
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-zinc-900 border border-zinc-800/50 p-5 rounded flex flex-col items-center justify-center">
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">
                      Nível de Sincronia
                    </div>
                    <div className="text-4xl font-bold text-white">{selectedPlayer.level}</div>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800/50 p-5 rounded flex flex-col items-center justify-center">
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">
                      XP Operacional
                    </div>
                    <div className="text-3xl font-bold text-cyan-400">
                      {selectedPlayer.currentXp}{" "}
                      <span className="text-xl text-slate-600">/ {selectedPlayer.totalXpForLevel}</span>
                    </div>
                  </div>
                  <div className="bg-zinc-900 border border-pink-500/20 shadow-[0_0_15px_rgba(236,72,153,0.05)] p-5 rounded flex flex-col items-center justify-center">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">
                      Survivor Points (SP)
                    </div>
                    <div className="text-4xl font-bold neon-text-primary flex items-center gap-1.5">
                      <Zap className="w-7 h-7 shrink-0" /> {selectedPlayer.spBalance}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-zinc-900">
                  <div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-zinc-800 pb-2 mb-4">
                      Matriz de Atributos do Sujeito
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(selectedPlayer.attributes).map(([attr, value]) => {
                        const IconComponent = attributeIconsMap[attr] || Activity;
                        const maxVal = Math.max(10, ...Object.values(selectedPlayer.attributes));
                        return (
                          <div
                            key={attr}
                            className="bg-zinc-900/40 p-3 border border-zinc-800/50 rounded flex flex-col justify-center"
                          >
                            <div className="flex justify-between items-center mb-1.5 gap-2">
                              <div className="flex items-center gap-1.5 truncate">
                                <IconComponent className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300 truncate">
                                  {attr}
                                </span>
                              </div>
                              <span className="font-bold text-cyan-400">{value}</span>
                            </div>
                            <div className="h-1 bg-zinc-850 rounded w-full overflow-hidden">
                              <div
                                className="h-full bg-cyan-500"
                                style={{ width: `${(value / maxVal) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-zinc-800 pb-2 mb-4 flex justify-between items-center">
                      <span>Conquistas Registradas</span>
                      <span className="bg-zinc-800 text-yellow-400 text-[11px] px-2 py-0.5 rounded-full font-bold">
                        {selectedPlayer.conquistas.length}
                      </span>
                    </h3>
                    <div className="space-y-3">
                      <div className="space-y-2 bg-zinc-950 p-3 rounded border border-zinc-900 border-dashed">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newConquista}
                            onChange={(e) => setNewConquista(e.target.value)}
                            placeholder="Nome / Título..."
                            className="gm-input !py-1.5 !text-xs flex-[2]"
                          />
                          <select
                            value={newConquistaRarity}
                            onChange={(e) => setNewConquistaRarity(e.target.value)}
                            className="gm-input !py-1.5 !text-xs flex-[1] px-1 text-slate-300"
                          >
                            <option value="comum">Comum</option>
                            <option value="raro">Raro</option>
                            <option value="epico">Épico</option>
                            <option value="lendario">Lendário</option>
                            <option value="especial">Especial</option>
                          </select>
                          <button
                            onClick={handleAddConquista}
                            className="bg-pink-600 hover:bg-pink-500 text-white px-4 text-xs font-bold uppercase rounded cursor-pointer transition-colors shrink-0"
                          >
                            Outorgar
                          </button>
                        </div>
                        <input
                          type="text"
                          value={newConquistaDesc}
                          onChange={(e) => setNewConquistaDesc(e.target.value)}
                          placeholder="Descrição opcional do feito..."
                          className="gm-input !py-1.5 !text-xs w-full"
                        />
                      </div>
                      <div className="space-y-1.5 max-h-[250px] overflow-y-auto pr-2">
                        {selectedPlayer.conquistas.map((c, i) => {
                          const isObj = c && typeof c === "object";
                          const name = isObj ? (c as any).name : c;
                          const desc = isObj ? (c as any).desc : "";
                          const rarity = isObj ? (c as any).rarity : "comum";

                          let colors = "text-slate-300 border-slate-500/30";
                          let iconClass = "text-slate-400";
                          let shadow = "";

                          if (rarity === "raro") {
                            colors = "text-blue-400 border-blue-500/50";
                            iconClass = "text-blue-500";
                          } else if (rarity === "epico") {
                            colors = "text-purple-500 border-purple-500/50";
                            iconClass = "text-purple-500";
                          } else if (rarity === "lendario") {
                            colors = "text-orange-500 border-orange-500 font-black";
                            iconClass = "text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]";
                            shadow = "shadow-[0_0_15px_rgba(249,115,22,0.6)]";
                          } else if (rarity === "especial") {
                            colors = "text-yellow-400 border-yellow-400 font-black bg-yellow-900/10";
                            iconClass = "text-yellow-400 animate-spin-3d drop-shadow-[0_0_10px_rgba(250,204,21,1)]";
                            shadow = "shadow-[0_0_20px_rgba(250,204,21,0.8)]";
                          }

                          return (
                            <div
                              key={i}
                              className={`flex justify-between items-start bg-zinc-900/50 border p-2 rounded ${colors} ${shadow}`}
                            >
                              <div className="flex flex-col gap-0.5">
                                <span className={`text-sm font-bold flex items-center gap-1.5 ${colors}`}>
                                  <Trophy className={`w-4 h-4 shrink-0 ${iconClass}`} /> {name}
                                </span>
                                {desc && (
                                  <span className="text-xs text-slate-400 pl-5 font-normal">
                                    {desc}
                                  </span>
                                )}
                              </div>
                              <button
                                onClick={() => handleRemoveConquista(i)}
                                className="text-slate-500 hover:text-red-500 cursor-pointer transition-colors p-1 shrink-0 ml-2"
                                title="Revogar Conquista"
                              >
                                <Trash className="w-4 h-4" />
                              </button>
                            </div>
                          );
                        })}
                        {selectedPlayer.conquistas.length === 0 && (
                          <p className="text-xs text-slate-500 italic p-2">
                            Nenhum título honorário outorgado.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedPlayer && isEditing && editForm && (
              <div className="bg-zinc-900/80 border border-pink-500/50 p-6 md:p-8 rounded relative shadow-[0_0_30px_rgba(236,72,153,0.1)] mb-8">
                <div className="absolute top-0 right-0 bg-pink-600 text-white text-[9px] font-bold px-3 py-1 rounded-bl uppercase tracking-widest font-sans">
                  Sincronia Mapeamento Ativa (Override OS)
                </div>

                <div className="space-y-8 mt-2">
                  <div>
                    <h3 className="text-pink-400 font-bold uppercase tracking-widest text-xs mb-4 border-b border-pink-500/20 pb-1.5">
                      Identificação Civil & Credenciais
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-zinc-950 p-4 rounded border border-zinc-900">
                      <div>
                        <label className="block text-[10px] uppercase text-slate-500 font-bold mb-1">
                          Apelido
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={editForm.name}
                          onChange={handleInputChange}
                          className="gm-input"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase text-slate-500 font-bold mb-1">
                          Nome Real
                        </label>
                        <input
                          type="text"
                          name="realName"
                          value={editForm.realName}
                          onChange={handleInputChange}
                          className="gm-input"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase text-slate-500 font-bold mb-1">
                          E-mail
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={editForm.email}
                          onChange={handleInputChange}
                          className="gm-input"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase text-slate-500 font-bold mb-1">
                          Sigla Ident. (ID)
                        </label>
                        <input
                          type="text"
                          name="sigla"
                          value={editForm.sigla}
                          onChange={handleInputChange}
                          className="gm-input"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-cyan-400 font-bold uppercase tracking-widest text-xs mb-4 border-b border-cyan-500/20 pb-1.5">
                      Sub-Redes de Status & Classe
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-zinc-950 p-4 rounded border border-zinc-900">
                      <div>
                        <label className="block text-[10px] uppercase text-slate-500 font-bold mb-1">
                          Classe
                        </label>
                        <input
                          type="text"
                          name="class"
                          value={editForm.class}
                          onChange={handleInputChange}
                          className="gm-input"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase text-slate-500 font-bold mb-1">
                          Subclasse
                        </label>
                        <input
                          type="text"
                          name="subClass"
                          value={editForm.subClass}
                          onChange={handleInputChange}
                          className="gm-input"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase text-pink-500 font-bold mb-1">
                          Senha de Sincronia
                        </label>
                        <input
                          type="password"
                          name="password"
                          value={editForm.password || ""}
                          onChange={handleInputChange}
                          className="gm-input border-pink-500/30 font-sans"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-pink-500 font-bold uppercase tracking-widest text-xs mb-4 border-b border-pink-500/20 pb-1.5">
                      Diretrizes de Leveling, XP & SP
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-zinc-950 p-4 rounded border border-zinc-900">
                      <div>
                        <label className="block text-[10px] uppercase text-slate-500 font-bold mb-1">
                          Nível Operacional
                        </label>
                        <input
                          type="number"
                          name="level"
                          value={editForm.level}
                          onChange={handleInputChange}
                          className="gm-input"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase text-slate-500 font-bold mb-1">
                          XP Acumulado
                        </label>
                        <input
                          type="number"
                          name="currentXp"
                          value={editForm.currentXp}
                          onChange={handleInputChange}
                          className="gm-input"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase text-slate-500 font-bold mb-1">
                          XP Alvo (Meta)
                        </label>
                        <input
                          type="number"
                          name="totalXpForLevel"
                          value={editForm.totalXpForLevel}
                          onChange={handleInputChange}
                          className="gm-input"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase text-pink-500 font-bold mb-1">
                          Ficha SP balance
                        </label>
                        <input
                          type="number"
                          name="spBalance"
                          value={editForm.spBalance}
                          onChange={handleInputChange}
                          className="gm-input border-pink-500/40 text-pink-400 font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-purple-400 font-bold uppercase tracking-widest text-xs mb-4 border-b border-purple-500/20 pb-1.5">
                      Matriz Biométrica (Sobrescrita Ilimitada)
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-zinc-950 p-4 rounded border border-zinc-900">
                      {Object.entries(editForm.attributes).map(([attr, value]) => (
                        <div key={attr} className="bg-zinc-900/60 p-3.5 border border-zinc-800 rounded">
                          <label className="block text-[10px] uppercase text-slate-300 font-bold mb-2 truncate">
                            {attr}
                          </label>
                          <input
                            type="number"
                            value={value}
                            onChange={(e) => handleAttributeChange(attr, e.target.value)}
                            className="gm-input text-purple-400 !border-purple-500/30 font-bold"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-zinc-800 pt-6">
                    {!showDeleteConfirm ? (
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded text-[10px] font-bold uppercase tracking-widest text-red-400 border border-red-500/50 hover:bg-red-500/20 transition w-full sm:w-auto justify-center cursor-pointer"
                      >
                        <Trash className="w-3.5 h-3.5" /> Excluir Perfil Civil
                      </button>
                    ) : (
                      <div className="flex items-center gap-2.5 bg-red-950/60 p-2 border border-red-500/60 rounded w-full sm:w-auto justify-center">
                        <span className="text-[10px] text-red-400 uppercase font-bold tracking-wider animate-pulse">
                          Confirmar protocolos?
                        </span>
                        <button
                          onClick={handleDeletePlayer}
                          className="bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded text-[10px] font-bold uppercase cursor-pointer"
                        >
                          Sim, Excluir
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          className="bg-zinc-800 text-white px-3 py-1.5 rounded text-[10px] font-bold uppercase cursor-pointer"
                        >
                          Cancelar
                        </button>
                      </div>
                    )}

                    <div className="flex gap-4 w-full sm:w-auto">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="flex-1 sm:flex-none px-6 py-2.5 rounded text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white bg-zinc-950 border border-zinc-850 hover:bg-zinc-800 transition cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleSave}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-6 py-2.5 rounded text-xs font-bold uppercase tracking-widest text-white bg-cyan-600 hover:bg-cyan-500 transition shadow-[0_0_15px_rgba(6,182,212,0.4)] cursor-pointer"
                      >
                        <Save className="w-4 h-4" /> Registrar Sobrescrição
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW: SQUAD ASSEMBLY & FACTIONS */}
      {gmTab === "esquadroes" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="neon-card p-6 h-fit border-blue-500/30">
            <h2 className="text-lg font-bold text-blue-500 uppercase tracking-widest border-b border-blue-500/20 pb-2 mb-4 flex items-center gap-1.5">
              <Users className="w-5 h-5 animate-pulse" /> Criar Esquadrão
            </h2>
            <form onSubmit={handleCreateSquad} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Codinome do Esquadrão
                </label>
                <input
                  required
                  type="text"
                  value={newSquadName}
                  onChange={(e) => setNewSquadName(e.target.value)}
                  className="gm-input mt-1 border-blue-500/30 focus:border-blue-500 text-blue-400"
                  placeholder="Ex: Blackwatch Ops"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block font-semibold">
                  Selecionar Operadores Ativos
                </label>
                <div className="space-y-1.5 max-h-[250px] overflow-y-auto pr-2 border border-zinc-800 p-2 rounded bg-zinc-950">
                  {players.map((p) => {
                    const isChecked = selectedSquadMembers.includes(p.id);
                    return (
                      <label
                        key={p.id}
                        className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${
                          isChecked
                            ? "bg-blue-900/10 border border-blue-500/20"
                            : "hover:bg-zinc-900/65"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSquadMember(p.id)}
                          className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                        />
                        <span
                          className={`text-sm font-bold uppercase tracking-widest ${
                            isChecked ? "text-blue-400" : "text-slate-400"
                          }`}
                        >
                          {p.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 mt-2 rounded uppercase tracking-widest text-sm transition-all duration-300 shadow-[0_0_15px_rgba(37,99,235,0.3)] cursor-pointer"
              >
                Registrar Esquadrão
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-slate-200 uppercase tracking-widest border-b border-zinc-800 pb-2 mb-4">
              Esquadrões Criptografados no Servidor
            </h2>
            {squads.length === 0 && (
              <p className="text-slate-500 italic p-8 text-center border border-dashed border-zinc-800 rounded">
                Nenhum esquadrão registrado.
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {squads.map((s) => (
                <div
                  key={s.id}
                  className="bg-zinc-900 border border-blue-500/20 p-5 rounded relative group hover:border-blue-500/50 transition-all duration-300 shadow-lg"
                >
                  <button
                    onClick={() => handleDeleteSquad(s.id)}
                    className="absolute top-4 right-4 text-slate-600 hover:text-red-500 transition-colors cursor-pointer"
                    title="Excluir"
                  >
                    <Trash className="w-4.5 h-4.5" />
                  </button>
                  <h3 className="text-xl font-bold text-blue-400 uppercase tracking-widest mb-4">
                    {s.name}
                  </h3>
                  <div className="space-y-1.5">
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">
                      Membros Integrados ({s.members.length}):
                    </div>
                    {s.members.map((mid) => {
                      const p = players.find((pl) => pl.id === mid);
                      return (
                        <div key={mid} className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                          <Activity className="w-3.5 h-3.5 text-slate-600" />
                          <span>{p ? p.name : "Operador Morto/Removido"}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW: FORNECEDOR COM FILTRO MULTI-NÍVEL PADRONIZADO */}
      {gmTab === "fornecedor" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="neon-card p-6 h-fit border-purple-500/30">
            <h2 className="text-lg font-bold text-purple-400 uppercase tracking-widest border-b border-purple-500/20 pb-2 mb-4 flex items-center gap-1.5">
              <Box className="w-5 h-5 animate-pulse" /> Cadastrar Lote Fornecedor
            </h2>
            <form onSubmit={handleCreateShopItem} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Nome do Item
                </label>
                <input
                  required
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="gm-input mt-1 border-purple-500/30 focus:border-purple-500 text-purple-400"
                  placeholder="Ex: Reforçador Neural"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Descrição / Atribuições
                </label>
                <input
                  required
                  type="text"
                  value={shopDesc}
                  onChange={(e) => setShopDesc(e.target.value)}
                  className="gm-input mt-1 border-purple-500/30 focus:border-purple-500 text-purple-400"
                  placeholder="Restaura resiliência biológica instantaneamente."
                />
              </div>
              <div className="grid grid-cols-2 gap-4 animate-fade-in">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Custo (SP)
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={shopCost}
                    onChange={(e) => setShopCost(e.target.value)}
                    className="gm-input mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Estoque Inicial
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={shopStock}
                    onChange={(e) => setShopStock(e.target.value)}
                    className="gm-input mt-1"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Raridade do Item Mercado
                </label>
                <select
                  value={shopRarity}
                  onChange={(e) => setShopRarity(e.target.value)}
                  className="gm-input mt-1 text-slate-300"
                >
                  <option value="comum">Comum</option>
                  <option value="raro">Raro</option>
                  <option value="epico">Épico</option>
                  <option value="lendario">Lendário</option>
                  <option value="especial">Especial</option>
                </select>
              </div>
              
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Visibilidade Privilégio
                </label>
                <select
                  value={shopVisibilityType}
                  onChange={(e) => {
                    setShopVisibilityType(e.target.value);
                    setShopTargetPlayerId(players[0]?.id?.toString() || "");
                    setShopTargetSquadId(squads[0]?.id?.toString() || "");
                  }}
                  className="gm-input mt-1 text-slate-300"
                >
                  <option value="geral">Mercado Público (Todos)</option>
                  <option value="esquadrao">Restrito a Esquadrão</option>
                  <option value="especifica">Foco Único (Sujeito exclusivo)</option>
                </select>
              </div>
              {shopVisibilityType === "especifica" && (
                <div className="animate-fade-in">
                  <label className="text-xs font-bold text-purple-400 uppercase tracking-widest">
                    Selecionar Alvo Exclusivo
                  </label>
                  <select
                    value={shopTargetPlayerId}
                    onChange={(e) => setShopTargetPlayerId(e.target.value)}
                    className="gm-input mt-1 border-purple-500 text-purple-400 font-semibold text-sm"
                  >
                    {players.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {shopVisibilityType === "esquadrao" && (
                <div className="animate-fade-in">
                  <label className="text-xs font-bold text-blue-400 uppercase tracking-widest">
                    Selecionar Esquadrão Alvo
                  </label>
                  <select
                    value={shopTargetSquadId}
                    onChange={(e) => setShopTargetSquadId(e.target.value)}
                    className="gm-input mt-1 border-blue-500 text-blue-400 font-semibold text-sm"
                  >
                    {squads.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 mt-2 rounded uppercase tracking-widest text-sm transition-all duration-300 shadow-[0_0_15px_rgba(147,51,234,0.3)] cursor-pointer"
              >
                Disponibilizar no Mercado
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-4 animate-fade-in">
            <div className="flex justify-between items-center border-b border-purple-500/20 pb-2 mb-4 flex-wrap gap-2">
              <h2 className="text-lg font-bold text-slate-200 uppercase tracking-widest m-0 border-none pb-0">
                Catálogo Ativo no Mercado Negro
              </h2>
              <div className="flex gap-2 min-w-0">
                <select
                  value={shopFilterType}
                  onChange={(e) => {
                    setShopFilterType(e.target.value);
                    setShopFilterTargetId("");
                  }}
                  className="gm-input !w-auto !py-1 !text-xs text-purple-400 font-bold border-purple-500/30"
                >
                  <option value="todas">Todos</option>
                  <option value="geral">Gerais (Públicos)</option>
                  <option value="esquadrao">Por Esquadrão</option>
                  <option value="especifica">Individuais</option>
                </select>

                {shopFilterType === "esquadrao" && (
                  <select
                    value={shopFilterTargetId}
                    onChange={(e) => setShopFilterTargetId(e.target.value)}
                    className="gm-input !w-auto !py-1 !text-xs text-blue-400 font-bold border-blue-500/30 animate-fade-in"
                  >
                    <option value="">-- Qual Esquadrão? --</option>
                    {squads.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                )}

                {shopFilterType === "especifica" && (
                  <select
                    value={shopFilterTargetId}
                    onChange={(e) => setShopFilterTargetId(e.target.value)}
                    className="gm-input !w-auto !py-1 !text-xs text-purple-400 font-bold border-purple-500/30 animate-fade-in"
                  >
                    <option value="">-- Qual Sujeito? --</option>
                    {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                )}
              </div>
            </div>
            
            {shopItems.filter(i => {
              if (shopFilterType === "geral") return i.targetPlayerId === null && !i.targetSquadId;
              if (shopFilterType === "esquadrao") {
                if (shopFilterTargetId) return i.targetSquadId === Number(shopFilterTargetId);
                return i.targetSquadId != null;
              }
              if (shopFilterType === "especifica") {
                if (shopFilterTargetId) return i.targetPlayerId === Number(shopFilterTargetId);
                return i.targetPlayerId !== null;
              }
              return true;
            }).length === 0 && (
              <p className="text-slate-500 italic p-8 text-center border border-dashed border-zinc-800 rounded">
                Nenhum item catalogado correspondente aos filtros.
              </p>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {shopItems
                .filter(i => {
                  if (shopFilterType === "geral") return i.targetPlayerId === null && !i.targetSquadId;
                  if (shopFilterType === "esquadrao") {
                    if (shopFilterTargetId) return i.targetSquadId === Number(shopFilterTargetId);
                    return i.targetSquadId != null;
                  }
                  if (shopFilterType === "especifica") {
                    if (shopFilterTargetId) return i.targetPlayerId === Number(shopFilterTargetId);
                    return i.targetPlayerId !== null;
                  }
                  return true;
                })
                .map((item) => {
                const r = (item as any).rarity || "comum";
                const tSquadId = (item as any).targetSquadId;
                let shopColor = "border-purple-500/20";
                let titleColor = "text-purple-400";
                let shadow = "";

                if (r === "raro") { shopColor = "border-blue-500/40"; titleColor = "text-blue-400"; }
                else if (r === "epico") { shopColor = "border-purple-500/60"; titleColor = "text-purple-400"; }
                else if (r === "lendario") { shopColor = "border-orange-500 font-bold"; titleColor = "text-orange-500"; shadow = "shadow-[0_0_10px_rgba(249,115,22,0.2)]"; }
                else if (r === "especial") { shopColor = "border-yellow-400 font-bold bg-yellow-900/5"; titleColor = "text-yellow-400"; shadow = "shadow-[0_0_15px_rgba(250,204,21,0.3)]"; }

                return (
                  <div
                    key={item.id}
                    className={`bg-zinc-900 border p-4 rounded flex flex-col justify-between ${shopColor} ${shadow}`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-1.5">
                        <h3 className={`font-bold text-lg uppercase ${titleColor}`}>{item.name}</h3>
                        <div className="flex gap-1.5 flex-wrap justify-end">
                          {item.targetPlayerId && (
                            <span className="text-[9px] bg-purple-900/50 text-purple-300 px-2 py-0.5 rounded uppercase tracking-widest border border-purple-500/30 font-bold">
                              Alvo: {players.find(p => p.id === item.targetPlayerId)?.name}
                            </span>
                          )}
                          {tSquadId && (
                            <span className="text-[9px] bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded uppercase tracking-widest border border-blue-500/30 font-bold">
                              Esquadrão: {squads.find(s => s.id === tSquadId)?.name}
                            </span>
                          )}
                          <span className={`text-[9px] px-2 py-0.5 rounded uppercase tracking-widest font-bold bg-zinc-950 border ${shopColor} ${titleColor}`}>
                            {r}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 mb-4 leading-relaxed">{item.desc}</p>
                    </div>
                    <div className="flex justify-between items-end border-t border-zinc-800 pt-3 flex-wrap gap-2">
                      <div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">
                          Valores / Quantidade
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-pink-400 text-sm flex items-center gap-0.5 animate-pulse">
                            <Zap className="w-3.5 h-3.5" /> {item.cost}
                          </span>
                          <span className={`text-sm font-bold ${item.stock > 0 ? "text-cyan-400" : "text-red-500"}`}>
                            {item.stock > 0 ? `${item.stock} UN` : "ESGOTADO"}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => restockItem(item.id)}
                          className="bg-zinc-800 hover:bg-purple-600 text-[10px] text-white px-3 py-1.5 rounded uppercase font-bold transition-all duration-200 cursor-pointer border border-zinc-700 hover:border-purple-500"
                        >
                          Restocar (+5)
                        </button>
                        <button
                          onClick={() => handleDeleteShopItem(item.id)}
                          className="bg-zinc-800 hover:bg-red-600 text-white px-2.5 py-1.5 rounded transition-all duration-200 cursor-pointer border border-zinc-700 hover:border-red-500"
                          title="Excluir item da loja"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW: RESOURCE INJECTOR */}
      {gmTab === "creditar" && (
        <div className="neon-card p-6 md:p-8 space-y-6 max-w-3xl mx-auto bg-zinc-900/50 animate-fade-in border-cyan-500/30 shadow-2xl">
          <h2 className="text-xl font-bold text-cyan-400 uppercase tracking-widest border-b border-cyan-500/20 pb-2 mb-6 flex items-center gap-1.5">
            <Zap className="w-5 h-5 text-cyan-400 animate-pulse" /> Injetar Créditos de Sistema
          </h2>

          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-950 p-4 rounded border border-zinc-900">
            <div>
              <label className="block text-xs uppercase text-slate-400 font-bold mb-1">
                Alvo Requerido
              </label>
              <select
                value={creditTargetType}
                onChange={(e) => {
                  setCreditTargetType(e.target.value);
                  setCreditPlayerId(players[0]?.id?.toString() || "");
                  setCreditSquadId(squads[0]?.id?.toString() || "");
                }}
                className="gm-input text-base"
              >
                <option value="player">Individual (Jogador)</option>
                <option value="squad">Divisão Inteira (Esquadrão)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase text-cyan-400 font-bold mb-1">
                Selecionar Alvo
              </label>
              {creditTargetType === "player" ? (
                <select
                  value={creditPlayerId}
                  onChange={(e) => setCreditPlayerId(e.target.value)}
                  className="gm-input border-cyan-500/50 text-cyan-400 text-sm font-semibold"
                >
                  <option value="">-- Escolher Operador --</option>
                  {players.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  value={creditSquadId}
                  onChange={(e) => setCreditSquadId(e.target.value)}
                  className="gm-input border-blue-500/50 text-blue-400 text-sm font-semibold"
                >
                  <option value="">-- Escolher Esquadrão --</option>
                  {squads.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.members.length} membros)
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <form onSubmit={handleCredit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-zinc-950 p-4 border border-zinc-850 rounded">
                <label className="block text-xs uppercase text-cyan-400 font-bold mb-1.5">
                  <TrendingUp className="inline w-3.5 h-3.5 mr-1" /> XP EXP Bônus
                </label>
                <input
                  type="number"
                  min="0"
                  value={creditXp}
                  onChange={(e) => setCreditXp(e.target.value)}
                  className="gm-input font-bold"
                />
              </div>
              <div className="bg-zinc-950 p-4 border border-zinc-850 rounded">
                <label className="block text-xs uppercase text-pink-400 font-bold mb-1.5">
                  <Zap className="inline w-3.5 h-3.5 mr-1" /> SP Bônus
                </label>
                <input
                  type="number"
                  min="0"
                  value={creditSp}
                  onChange={(e) => setCreditSp(e.target.value)}
                  className="gm-input font-bold text-pink-400"
                />
              </div>
            </div>

            <div className="bg-zinc-950 p-4 border border-purple-500/30 rounded">
              <label className="block text-xs uppercase text-purple-400 font-bold mb-3 font-semibold">
                Injetar Pontos de Atributo (Opcional)
              </label>
              <div className="flex gap-4 w-full">
                <select
                  value={creditAttrKey}
                  onChange={(e) => setCreditAttrKey(e.target.value)}
                  className="gm-input flex-[3] text-slate-300 min-w-0"
                >
                  <option value="">-- Escolher Atributo --</option>
                  <option value="Confiabilidade">Confiabilidade</option>
                  <option value="Agilidade">Agilidade</option>
                  <option value="Resolução de Problemas">Resolução de Problemas</option>
                  <option value="Proatividade">Proatividade</option>
                  <option value="Foco">Foco</option>
                  <option value="Abertura à Experiência">Abertura à Experiência</option>
                  <option value="Consciência">Consciência</option>
                  <option value="Extroversão">Extroversão</option>
                  <option value="Compaixão">Compaixão</option>
                  <option value="Estabilidade Emocional">Estabilidade Emocional</option>
                  <option value="Paciência">Paciência</option>
                  <option value="Popularidade">Popularidade</option>
                </select>
                <input
                  type="number"
                  value={creditAttrValue}
                  onChange={(e) => setCreditAttrValue(e.target.value)}
                  className="gm-input flex-[1] max-w-[120px] text-center text-purple-400 font-bold shrink-0 min-w-0"
                  placeholder="+0"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded uppercase tracking-widest text-sm transition-colors shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer"
            >
              Executar Transferência de Recursos
            </button>
          </form>

          {creditTargetType === "player" && creditPlayerId && selectedCreditPlayer && (
            <div className="mt-8 pt-8 border-t border-cyan-500/20">
              <h3 className="text-lg font-bold text-cyan-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                <Box className="w-5 h-5 text-cyan-400" /> Gerenciar Inventário de {selectedCreditPlayer.name}
              </h3>

              <div className="bg-zinc-950 p-4 border border-zinc-850 rounded space-y-4">
                <div className="flex gap-2 flex-wrap">
                  <input
                    type="text"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="Nome do Item..."
                    className="gm-input !py-1.5 !text-sm flex-[2] min-w-[150px]"
                  />
                  <input
                    type="number"
                    value={newItemQuantity}
                    onChange={(e) => setNewItemQuantity(e.target.value)}
                    placeholder="Qtd"
                    min="1"
                    className="gm-input !py-1.5 !text-sm w-16 text-center font-bold"
                  />
                  <select
                    value={newItemRarity}
                    onChange={(e) => setNewItemRarity(e.target.value)}
                    className="gm-input !py-1.5 !text-sm flex-[1] px-1 text-slate-300"
                  >
                    <option value="comum">Comum</option>
                    <option value="raro">Raro</option>
                    <option value="epico">Épico</option>
                    <option value="lendario">Lendário</option>
                    <option value="especial">Especial</option>
                  </select>
                  <input
                    type="text"
                    value={newItemDesc}
                    onChange={(e) => setNewItemDesc(e.target.value)}
                    placeholder="Descrição..."
                    className="gm-input !py-1.5 !text-xs flex-[2] min-w-[150px]"
                  />
                  <button
                    type="button"
                    onClick={handleAddItemToSelected}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 text-xs font-bold uppercase rounded h-[38px] whitespace-nowrap cursor-pointer transition-colors"
                  >
                    Add Item
                  </button>
                </div>

                <div className="space-y-1.5 mt-4 max-h-[250px] overflow-y-auto pr-2">
                 {(selectedCreditPlayer.inventory || []).map((item) => {
                    const r = (item as any).rarity || "comum";
                    let itemColor = "text-cyan-400 border-cyan-500/10";
                    if (r === "raro") itemColor = "text-blue-400 border-blue-500/30";
                    else if (r === "epico") itemColor = "text-purple-400 border-purple-500/30";
                    else if (r === "lendario") itemColor = "text-orange-500 border-orange-500/40 shadow-[0_0_10px_rgba(249,115,22,0.2)]";
                    else if (r === "especial") itemColor = "text-yellow-400 border-yellow-400/50 bg-yellow-900/5 shadow-[0_0_12px_rgba(250,204,21,0.3)]";

                    return (
                      <div
                        key={item.id}
                        className={`flex justify-between items-center bg-zinc-900/50 border p-2.5 rounded transition-all ${itemColor}`}
                      >
                        <div className="flex items-center gap-3">
                          <Cpu className={`w-4 h-4 ${r === "especial" ? "animate-spin-3d" : ""}`} />
                          <div className="flex flex-col">
                            <span className="text-sm font-bold">
                              {item.name} <span className="text-pink-500 text-xs ml-1 font-sans">x{item.quantity}</span>
                            </span>
                            <span className="text-[10px] text-slate-400">{item.desc}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            max={item.quantity}
                            placeholder="Qtd"
                            value={removeQtyState[item.id] || ""}
                            onChange={(e) => setRemoveQtyState({ ...removeQtyState, [item.id]: e.target.value })}
                            className="gm-input !py-1 !px-2 !text-xs w-16 text-center"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveItemFromSelected(selectedCreditPlayer.id, item.id)}
                            className="text-slate-400 hover:text-red-500 p-2 transition-colors cursor-pointer bg-zinc-950 border border-zinc-800 rounded"
                            title="Remover quantidade"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {(!selectedCreditPlayer.inventory || selectedCreditPlayer.inventory.length === 0) && (
                    <p className="text-xs text-slate-500 italic p-4 text-center border border-dashed border-zinc-800 rounded">
                      Nenhum item alocado no inventário deste agente.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW: DEGRADE PENALTIES */}
      {gmTab === "degradacao" && (
        <div className="neon-card p-6 md:p-8 space-y-6 max-w-3xl mx-auto bg-zinc-900/50 animate-fade-in border-red-500/30 shadow-2xl">
          <h2 className="text-xl font-bold text-red-400 uppercase tracking-widest border-b border-red-500/20 pb-2 mb-6 flex items-center gap-1.5">
            <TrendingDown className="w-5 h-5 text-red-500 animate-pulse" /> Protocolo Severo de Degradação
          </h2>

          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-950 p-4 rounded border border-zinc-900">
            <div>
              <label className="block text-xs uppercase text-slate-400 font-bold mb-1">
                Alvo Requerido
              </label>
              <select
                value={degradeTargetType}
                onChange={(e) => {
                  setDegradeTargetType(e.target.value); 
                  setDegradePlayerId(players[0]?.id?.toString() || "");
                  setDegradeSquadId(squads[0]?.id?.toString() || "");
                }}
                className="gm-input border-red-500/40 text-red-400 text-base font-bold"
              >
                <option value="player">Individual (Jogador)</option>
                <option value="squad">Divisão Inteira (Esquadrão)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase text-red-400 font-bold mb-1">
                Selecionar Alvo
              </label>
              {degradeTargetType === "player" ? (
                <select
                  value={degradePlayerId}
                  onChange={(e) => setDegradePlayerId(e.target.value)}
                  className="gm-input border-red-500/50 text-red-400 text-sm font-semibold"
                >
                  <option value="">-- Escolher Operador --</option>
                  {players.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  value={degradeSquadId}
                  onChange={(e) => setDegradeSquadId(e.target.value)}
                  className="gm-input border-blue-500/50 text-blue-400 text-sm font-semibold"
                >
                  <option value="">-- Escolher Esquadrão --</option>
                  {squads.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.members.length} membros)
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <form onSubmit={handleDegrade} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-zinc-950 p-4 border border-zinc-850 rounded">
                <label className="block text-xs uppercase text-red-400 font-bold mb-1.5">
                  <TrendingDown className="inline w-3.5 h-3.5 mr-1" /> XP Penalidade
                </label>
                <input
                  type="number"
                  min="0"
                  value={degradeXp}
                  onChange={(e) => setDegradeXp(e.target.value)}
                  className="gm-input focus:border-red-500 font-bold text-red-400"
                />
              </div>
              <div className="bg-zinc-950 p-4 border border-zinc-850 rounded">
                <label className="block text-xs uppercase text-red-400 font-bold mb-1.5">
                  <Activity className="inline w-3.5 h-3.5 mr-1" /> SP Penalidade
                </label>
                <input
                  type="number"
                  min="0"
                  value={degradeSp}
                  onChange={(e) => setDegradeSp(e.target.value)}
                  className="gm-input focus:border-red-500 font-bold text-red-400"
                />
              </div>
            </div>

            <div className="bg-zinc-950 p-4 border border-red-500/30 rounded">
              <label className="block text-xs uppercase text-red-400 font-bold mb-3 font-semibold">
                Drenar Pontos de Atributo (Opcional)
              </label>
              <div className="flex gap-4 w-full">
                <select
                  value={degradeAttrKey}
                  onChange={(e) => setDegradeAttrKey(e.target.value)}
                  className="gm-input flex-[3] focus:border-red-500 text-slate-300 min-w-0"
                >
                  <option value="">-- Escolher Atributo --</option>
                  <option value="Confiabilidade">Confiabilidade</option>
                  <option value="Agilidade">Agilidade</option>
                  <option value="Resolução de Problemas">Resolução de Problemas</option>
                  <option value="Proatividade">Proatividade</option>
                  <option value="Foco">Foco</option>
                  <option value="Abertura à Experiência">Abertura à Experiência</option>
                  <option value="Consciência">Consciência</option>
                  <option value="Extroversão">Extroversão</option>
                  <option value="Compaixão">Compaixão</option>
                  <option value="Estabilidade Emocional">Estabilidade Emocional</option>
                  <option value="Paciência">Paciência</option>
                  <option value="Popularidade">Popularidade</option>
                </select>
                <input
                  type="number"
                  min="0"
                  value={degradeAttrValue}
                  onChange={(e) => setDegradeAttrValue(e.target.value)}
                  className="gm-input flex-[1] max-w-[120px] text-center focus:border-red-500 font-bold text-red-400 shrink-0 min-w-0"
                  placeholder="-0"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded uppercase tracking-widest text-sm transition-all duration-300 shadow-[0_0_15px_rgba(239,68,68,0.3)] cursor-pointer"
            >
              Executar Protocolo Penal
            </button>
          </form>
        </div>
      )}

      {/* VIEW: DIRECTIVES & CONTRACTS PUBLICATION COM FILTRO MULTI-NÍVEL PADRONIZADO */}
      {gmTab === "missoes" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="neon-card p-6 bg-zinc-900/50">
              <h2 className="text-base font-bold text-pink-500 uppercase border-b border-pink-500/20 pb-2 mb-4">
                Nova Diretriz / Missão Contract
              </h2>
              <form onSubmit={handleCreateMission} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">
                    Título do Contrato
                  </label>
                  <input
                    required
                    type="text"
                    value={mTitle}
                    onChange={(e) => setMTitle(e.target.value)}
                    className="gm-input mt-1"
                    placeholder="Ex: Incursão de Servidor Arasaka"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest font-semibold">
                    Descrição dos Objetivos
                  </label>
                  <textarea
                    required
                    value={mDesc}
                    onChange={(e) => setMDesc(e.target.value)}
                    className="gm-input mt-1 h-16 text-slate-300 pr-2 resize-none"
                    placeholder="Infiltre o datacenter e recupere o decodificador..."
                  ></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      SP Drop
                    </label>
                    <input
                      required
                      type="number"
                      value={mSP}
                      onChange={(e) => setMSp(e.target.value)}
                      className="gm-input mt-1 text-pink-400 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      XP Drop
                    </label>
                    <input
                      required
                      type="number"
                      value={mXP}
                      onChange={(e) => setMXp(e.target.value)}
                      className="gm-input mt-1 text-cyan-400 font-bold"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-purple-400 uppercase tracking-widest font-semibold">
                    Qtd. Contratos Disponíveis
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={mQty}
                    onChange={(e) => setMQty(e.target.value)}
                    className="gm-input mt-1 border-purple-500/30 text-purple-400 font-bold text-center"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Visibilidade Privilégio
                  </label>
                  <select
                    value={mType}
                    onChange={(e) => {
                      setMType(e.target.value);
                      setMTargetId(players[0]?.id?.toString() || "");
                      setMTargetSquadId(squads[0]?.id?.toString() || "");
                    }}
                    className="gm-input mt-1 text-slate-300"
                  >
                    <option value="geral">Público Geral (Pra Todos)</option>
                    <option value="esquadrao">Restrito a Esquadrão</option>
                    <option value="especifica">Foco Único (Sujeito específico)</option>
                  </select>
                </div>
                {mType === "especifica" && (
                  <div>
                    <label className="text-xs font-bold text-purple-400 uppercase tracking-widest">
                      Selecionar Alvo
                    </label>
                    <select
                      value={mTargetId}
                      onChange={(e) => setMTargetId(e.target.value)}
                      className="gm-input mt-1 border-purple-500 text-purple-400 font-semibold text-sm"
                    >
                      {players.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {mType === "esquadrao" && (
                  <div>
                    <label className="text-xs font-bold text-blue-400 uppercase tracking-widest">
                      Selecionar Esquadrão
                    </label>
                    <select
                      value={mTargetSquadId}
                      onChange={(e) => setMTargetSquadId(e.target.value)}
                      className="gm-input mt-1 border-blue-500 text-blue-400 font-semibold text-sm"
                    >
                      {squads.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <button
                  type="submit"
                  className="w-full bg-pink-600 hover:bg-pink-500 text-white font-bold py-3 mt-2 rounded uppercase tracking-widest text-sm transition-all duration-300 shadow-[0_0_15px_rgba(236,72,153,0.3)] cursor-pointer"
                >
                  Publicar Diretriz
                </button>
              </form>
            </div>

            <div className="neon-card p-4 border-dashed border-zinc-800 bg-zinc-950/60">
              <h3 className="text-xs font-bold uppercase tracking-wider mb-3 text-slate-400">
                Banco de Diretrizes Prontas
              </h3>
              <div className="space-y-2">
                {missionTemplates.map((t, idx) => (
                  <div key={idx} className="bg-zinc-900 p-2.5 rounded border border-zinc-850 flex justify-between items-center text-xs">
                    <div className="truncate flex flex-col max-w-[70%]">
                      <span className="font-bold text-slate-200 truncate">{t.title}</span>
                      <span className="text-[10px] text-slate-500 truncate mt-0.5">{t.desc}</span>
                    </div>
                    <button
                      onClick={() => {
                        setMissions(p => [{
                          id: generateUniqueId(), title: t.title, desc: t.desc, sp: t.sp, xp: t.xp, quantity: 1, diff: "Médio", status: "available", targetPlayerId: null, targetSquadId: null, claimedBy: []
                        }, ...p]);
                        showToast("Contrato injetado do banco.", "success");
                      }}
                      className="bg-zinc-950 text-pink-400 border border-zinc-800 px-3 py-1 rounded font-bold uppercase tracking-widest text-[9px] hover:bg-pink-900/10 cursor-pointer"
                    >
                      Injetar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center border-b border-cyan-500/20 pb-2 mb-4 flex-wrap gap-2">
              <h2 className="text-lg font-bold text-cyan-500 uppercase tracking-widest m-0 border-none pb-0">
                Diretrizes Ativas no Servidor
              </h2>
              <div className="flex gap-2 min-w-0">
                <select
                  value={missionFilterType}
                  onChange={(e) => {
                    setMissionFilterType(e.target.value);
                    setMissionFilterTargetId("");
                  }}
                  className="gm-input !w-auto !py-1 !text-xs text-cyan-400 font-bold border-cyan-500/30"
                >
                  <option value="todas">Todas</option>
                  <option value="geral">Gerais (Públicas)</option>
                  <option value="esquadrao">Por Esquadrão</option>
                  <option value="especifica">Individuais</option>
                </select>

                {missionFilterType === "esquadrao" && (
                  <select
                    value={missionFilterTargetId}
                    onChange={(e) => setMissionFilterTargetId(e.target.value)}
                    className="gm-input !w-auto !py-1 !text-xs text-blue-400 font-bold border-blue-500/30 animate-fade-in"
                  >
                    <option value="">-- Qual Esquadrão? --</option>
                    {squads.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                )}

                {missionFilterType === "especifica" && (
                  <select
                    value={missionFilterTargetId}
                    onChange={(e) => setMissionFilterTargetId(e.target.value)}
                    className="gm-input !w-auto !py-1 !text-xs text-purple-400 font-bold border-purple-500/30 animate-fade-in"
                  >
                    <option value="">-- Qual Sujeito? --</option>
                    {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                )}
              </div>
            </div>
            
            {missions.filter(m => {
              if (missionFilterType === "geral") return m.targetPlayerId === null && m.targetSquadId === null;
              if (missionFilterType === "esquadrao") {
                if (missionFilterTargetId) return m.targetSquadId === Number(missionFilterTargetId);
                return m.targetSquadId !== null;
              }
              if (missionFilterType === "especifica") {
                if (missionFilterTargetId) return m.targetPlayerId === Number(missionFilterTargetId);
                return m.targetPlayerId !== null;
              }
              return true; 
            }).length === 0 && (
              <p className="text-slate-500 italic p-8 text-center border border-dashed border-zinc-800 rounded">
                Nenhuma diretriz de missão encontrada neste filtro.
              </p>
            )}

            {missions
              .filter(m => {
                if (missionFilterType === "geral") return m.targetPlayerId === null && m.targetSquadId === null;
                if (missionFilterType === "esquadrao") {
                  if (missionFilterTargetId) return m.targetSquadId === Number(missionFilterTargetId);
                  return m.targetSquadId !== null;
                }
                if (missionFilterType === "especifica") {
                  if (missionFilterTargetId) return m.targetPlayerId === Number(missionFilterTargetId);
                  return m.targetPlayerId !== null;
                }
                return true; 
              })
              .map((m) => {
                const claimedCount = (m.claimedBy || []).length;
                return (
                  <div
                    key={m.id}
                    className="bg-zinc-900 border border-zinc-850 p-5 rounded relative overflow-hidden group shadow-md hover:border-zinc-700 transition"
                  >
                    {m.targetPlayerId ? (
                      <div className="absolute top-0 right-0 bg-purple-600 text-white text-[9px] font-bold px-3 py-1 rounded-bl uppercase tracking-widest font-sans">
                        Alvo: {players.find((p) => p.id === m.targetPlayerId)?.name}
                      </div>
                    ) : m.targetSquadId ? (
                      <div className="absolute top-0 right-0 bg-blue-600 text-white text-[9px] font-bold px-3 py-1 rounded-bl uppercase tracking-widest font-sans">
                        Esquadrão: {squads.find((s) => s.id === m.targetSquadId)?.name}
                      </div>
                    ) : (
                      <div className="absolute top-0 right-0 bg-cyan-600 text-white text-[9px] font-bold px-3 py-1 rounded-bl uppercase tracking-widest font-sans">
                        Missão Pública
                      </div>
                    )}

                    <h3 className="font-bold text-xl text-white pr-20">{m.title}</h3>
                    <p className="text-xs text-slate-400 mt-2 mb-4 leading-relaxed">{m.desc}</p>
                    <div className="flex justify-between items-center flex-wrap gap-3 border-t border-zinc-800 pt-3">
                      <div className="flex gap-4">
                        <span className="bg-pink-500/10 border border-pink-500/20 text-pink-400 px-3 py-1 rounded text-xs font-bold tracking-widest">
                          +{m.sp} SP
                        </span>
                        <span className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-3 py-1 rounded text-xs font-bold tracking-widest">
                          +{m.xp} XP
                        </span>
                        <span className="bg-purple-500/10 border border-purple-500/20 text-purple-400 px-3 py-1 rounded text-[11px] font-bold">
                          Stock: {m.quantity - claimedCount} / {m.quantity}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {!m.targetPlayerId && !m.targetSquadId && (
                          <select
                            onChange={(e) => setMissionWinnerId(e.target.value)}
                            className="gm-input !py-1 !text-xs !w-auto"
                          >
                            <option value="">Quem Concluiu?</option>
                            <optgroup label="Jogadores Individuais">
                              {players.map((p) => (
                                <option key={`p_${p.id}`} value={p.id}>
                                  {p.name}
                                </option>
                              ))}
                            </optgroup>
                            <optgroup label="Esquadrões Inteiros">
                              {squads.map((s) => (
                                <option key={`s_${s.id}`} value={`squad_${s.id}`}>
                                  Esquadrão: {s.name}
                                </option>
                              ))}
                            </optgroup>
                          </select>
                        )}

                        <button
                          onClick={() => {
                            setMissions(p => p.map(it => it.id === m.id ? { ...it, quantity: it.quantity + 1 } : it));
                            showToast("Cota de Contrato expandida (+1).", "success");
                          }}
                          className="bg-zinc-800 text-purple-400 text-xs px-3 py-1.5 rounded font-bold border border-zinc-750 hover:bg-zinc-700 transition cursor-pointer"
                        >
                          Reabastecer (+1)
                        </button>

                        <button
                          onClick={() => handleCompleteMission(m.id, missionWinnerId)}
                          className="text-green-400 hover:text-green-300 text-xs font-semibold uppercase flex items-center gap-1 bg-zinc-800 hover:bg-zinc-700/60 px-3 py-1.5 rounded transition border border-zinc-750 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5 mr-0.5" /> Pagar Contrato
                        </button>
                        <button
                          onClick={() => deleteMission(m.id)}
                          className="text-red-500 hover:text-red-400 text-xs font-semibold uppercase flex items-center gap-1 bg-zinc-800 hover:bg-zinc-700/60 px-3 py-1.5 rounded transition border border-zinc-750 cursor-pointer"
                          title="Deletar"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* VIEW: REGISTER NEW OPERATOR - RESTAURADO TOTALMENTE */}
      {gmTab === "cadastro" && (
        <div className="neon-card p-6 md:p-8 space-y-6 max-w-3xl mx-auto bg-zinc-900/50 animate-fade-in border-pink-500/30 shadow-2xl">
          <h2 className="text-xl font-bold text-pink-500 uppercase tracking-widest border-b border-pink-500/20 pb-2 mb-6">
            Cadastrar Novo Operador no Servidor
          </h2>
          <form onSubmit={handleRegisterPlayer} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs uppercase text-slate-400 font-bold mb-1">
                  Nome Completo
                </label>
                <input
                  required
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="gm-input text-slate-200"
                  placeholder="Ex: Gustavo Bach"
                />
              </div>
              <div>
                <label className="block text-xs uppercase text-slate-400 font-bold mb-1">
                  E-mail de Cadastro
                </label>
                <input
                  required
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="gm-input text-slate-200"
                  placeholder="usuario@dominio.com"
                />
              </div>
              <div>
                <label className="block text-xs uppercase text-slate-400 font-bold mb-1">
                  Sigla ID (Ex: J1)
                </label>
                <input
                  required
                  type="text"
                  value={regSigla}
                  onChange={(e) => setRegSigla(e.target.value)}
                  className="gm-input text-slate-200"
                  placeholder="Ex: G1"
                />
              </div>
              <div>
                <label className="block text-xs uppercase text-pink-400 font-bold mb-1">
                  Senha Provisória
                </label>
                <input
                  required
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="gm-input border-pink-500/50 text-slate-200 font-sans"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <h3 className="text-cyan-400 font-bold uppercase tracking-widest text-sm border-b border-cyan-500/20 pb-1.5 mt-6 mb-4">
              Dados do Operador Cyborg
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs uppercase text-slate-400 font-bold mb-1">
                  Apelido Cyborg
                </label>
                <input
                  required
                  type="text"
                  value={regCharName}
                  onChange={(e) => setRegCharName(e.target.value)}
                  className="gm-input text-slate-200"
                  placeholder="Ex: Kael'thas Neo"
                />
              </div>
              <div>
                <label className="block text-xs uppercase text-slate-400 font-bold mb-1">
                  Classe
                </label>
                <input
                  required
                  type="text"
                  value={regClass}
                  onChange={(e) => setRegClass(e.target.value)}
                  className="gm-input text-slate-200"
                  placeholder="Ex: Cyber Ninja"
                />
              </div>
              <div>
                <label className="block text-xs uppercase text-slate-400 font-bold mb-1">
                  Subclasse
                </label>
                <input
                  required
                  type="text"
                  value={regSubClass}
                  onChange={(e) => setRegSubClass(e.target.value)}
                  className="gm-input text-slate-200"
                  placeholder="Ex: Netrunner"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-pink-600 hover:bg-pink-500 text-white font-bold py-3 mt-4 rounded uppercase tracking-widest text-sm transition-all duration-300 shadow-[0_0_15px_rgba(236,72,153,0.3)] cursor-pointer"
            >
              Registrar Operador
            </button>
          </form>
        </div>
      )}

      {/* VIEW: TRANSMISSÕES (NOTIFICAÇÕES) COM FILTRO MULTI-NÍVEL PADRONIZADO */}
      {gmTab === "transmissoes" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          <div className="neon-card p-6 h-fit border-cyan-500/30">
            <h2 className="text-lg font-bold text-cyan-400 uppercase tracking-widest border-b border-cyan-500/20 pb-2 mb-4 flex items-center gap-1.5">
              <Radio className="w-5 h-5 animate-pulse" /> Emitir Aviso na Rede
            </h2>
            <form onSubmit={handleSendNotification} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Urgência / Categoria
                </label>
                <select
                  value={notifType}
                  onChange={(e) => setNotifType(e.target.value as any)}
                  className="gm-input mt-1"
                >
                  <option value="info">Informativo (Ciano)</option>
                  <option value="success">Recompensa / Evento (Verde)</option>
                  <option value="alert">Alerta Crítico (Vermelho)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Visibilidade Privilégio
                </label>
                <select
                  value={notifVisibilityType}
                  onChange={(e) => {
                    setNotifVisibilityType(e.target.value);
                    setNotifTargetPlayerId(players[0]?.id?.toString() || "");
                    setNotifTargetSquadId(squads[0]?.id?.toString() || "");
                  }}
                  className="gm-input mt-1 text-slate-300"
                >
                  <option value="geral">Aviso Global (Todos)</option>
                  <option value="esquadrao">Restrito a Esquadrão</option>
                  <option value="especifica">Foco Único (Sujeito específico)</option>
                </select>
              </div>
              {notifVisibilityType === "especifica" && (
                <div className="animate-fade-in">
                  <label className="text-xs font-bold text-purple-400 uppercase tracking-widest">
                    Selecionar Alvo
                  </label>
                  <select
                    value={notifTargetPlayerId}
                    onChange={(e) => setNotifTargetPlayerId(e.target.value)}
                    className="gm-input mt-1 border-purple-500 text-purple-400 font-semibold text-sm"
                  >
                    {players.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {notifVisibilityType === "esquadrao" && (
                <div className="animate-fade-in">
                  <label className="text-xs font-bold text-blue-400 uppercase tracking-widest">
                    Selecionar Esquadrão Alvo
                  </label>
                  <select
                    value={notifTargetSquadId}
                    onChange={(e) => setNotifTargetSquadId(e.target.value)}
                    className="gm-input mt-1 border-blue-500 text-blue-400 font-semibold text-sm"
                  >
                    {squads.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Mensagem Criptografada
                </label>
                <textarea
                  required
                  value={notifMsg}
                  onChange={(e) => setNotifMsg(e.target.value)}
                  className="gm-input mt-1 h-24 text-slate-300 resize-none"
                  placeholder="Escreva sua mensagem aqui..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 mt-2 rounded uppercase tracking-widest text-sm transition-all duration-300 shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer"
              >
                Disparar Transmissão
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-4 animate-fade-in">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2 mb-4 flex-wrap gap-2">
              <h2 className="text-lg font-bold text-slate-200 uppercase tracking-widest m-0 border-none pb-0">
                Histórico de Transmissões
              </h2>
              <div className="flex gap-2 min-w-0">
                <select
                  value={notifFilterType}
                  onChange={(e) => {
                    setNotifFilterType(e.target.value);
                    setNotifFilterTargetId("");
                  }}
                  className="gm-input !w-auto !py-1 !text-xs text-cyan-400 font-bold border-cyan-500/30"
                >
                  <option value="todas">Todas</option>
                  <option value="geral">Gerais (Públicas)</option>
                  <option value="esquadrao">Por Esquadrão</option>
                  <option value="especifica">Individuais</option>
                </select>

                {notifFilterType === "esquadrao" && (
                  <select
                    value={notifFilterTargetId}
                    onChange={(e) => setNotifFilterTargetId(e.target.value)}
                    className="gm-input !w-auto !py-1 !text-xs text-blue-400 font-bold border-blue-500/30 animate-fade-in"
                  >
                    <option value="">-- Qual Esquadrão? --</option>
                    {squads.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                )}

                {notifFilterType === "especifica" && (
                  <select
                    value={notifFilterTargetId}
                    onChange={(e) => setNotifFilterTargetId(e.target.value)}
                    className="gm-input !w-auto !py-1 !text-xs text-purple-400 font-bold border-purple-500/30 animate-fade-in"
                  >
                    <option value="">-- Qual Sujeito? --</option>
                    {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                )}
              </div>
            </div>
            
            {notifications.filter(n => {
              if (notifFilterType === "geral") return n.targetPlayerId === null && n.targetSquadId === null;
              if (notifFilterType === "esquadrao") {
                if (notifFilterTargetId) return n.targetSquadId === Number(notifFilterTargetId);
                return n.targetSquadId !== null;
              }
              if (notifFilterType === "especifica") {
                if (notifFilterTargetId) return n.targetPlayerId === Number(notifFilterTargetId);
                return n.targetPlayerId !== null;
              }
              return true;
            }).length === 0 && (
              <p className="text-slate-500 italic p-8 text-center border border-dashed border-zinc-800 rounded">
                Nenhum aviso encontrado neste filtro.
              </p>
            )}

            <div className="space-y-3">
              {notifications
                .filter(n => {
                  if (notifFilterType === "geral") return n.targetPlayerId === null && n.targetSquadId === null;
                  if (notifFilterType === "esquadrao") {
                    if (notifFilterTargetId) return n.targetSquadId === Number(notifFilterTargetId);
                    return n.targetSquadId !== null;
                  }
                  if (notifFilterType === "especifica") {
                    if (notifFilterTargetId) return n.targetPlayerId === Number(notifFilterTargetId);
                    return n.targetPlayerId !== null;
                  }
                  return true;
                })
                .map(notif => {
                let colors = "border-cyan-500/30 text-cyan-400";
                let badge = "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
                if (notif.type === "alert") { colors = "border-red-500/30 text-red-400"; badge = "bg-red-500/10 text-red-500 border-red-500/20"; }
                if (notif.type === "success") { colors = "border-green-500/30 text-green-400"; badge = "bg-green-500/10 text-green-500 border-green-500/20"; }

                const targetName = notif.targetPlayerId 
                  ? players.find(p => p.id === notif.targetPlayerId)?.name || "Desconhecido"
                  : notif.targetSquadId
                  ? squads.find(s => s.id === notif.targetSquadId)?.name || "Desconhecido"
                  : "Todos";
                  
                const scopeLabel = notif.targetPlayerId ? "Indivíduo" : notif.targetSquadId ? "Esquadrão" : "Global";

                return (
                  <div key={notif.id} className={`bg-zinc-900 border p-4 rounded flex flex-col gap-2 relative group transition-colors hover:bg-zinc-800/50 ${colors}`}>
                    <button
                      onClick={() => handleDeleteNotification(notif.id)}
                      className="absolute top-4 right-4 text-slate-600 hover:text-red-500 transition-colors cursor-pointer"
                      title="Deletar aviso da nuvem"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                    
                    <div className="flex gap-2 items-center flex-wrap pr-6">
                      <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded border tracking-widest ${badge}`}>
                        {notif.type}
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                        Alvo ({scopeLabel}): {targetName}
                      </span>
                      <span className="text-[10px] text-slate-500 font-sans ml-auto">
                        {new Date(notif.date).toLocaleString('pt-BR')}
                      </span>
                    </div>

                    <p className="text-sm text-slate-300">"{notif.message}"</p>
                    
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2 border-t border-zinc-800/50 pt-2 flex items-center gap-2">
                      <Eye className="w-3.5 h-3.5" /> Lida por: {(notif.readBy || []).length} Agente(s)
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW: RELATÓRIOS / ANALYTICS INSIGHTS */}
      {gmTab === "relatorio" && (
        <div className="space-y-6">
          <style dangerouslySetInnerHTML={{__html: `
            @media print {
              body { background: #06060c !important; color: #fff !important; font-family: 'Rajdhani', sans-serif !important; }
              nav, header, .print\\:hidden, button, select, input, .gm-input { display: none !important; }
              #report-container { position: absolute; left: 0; top: 0; width: 100% !important; border: none !important; background: #06060c !important; padding: 0 !important; box-shadow: none !important; }
              .bg-zinc-900, .bg-zinc-950 { background: #111116 !important; border-color: #222 !important; }
              text { fill: #a1a1aa !important; }
              /* Força os gráficos a ficarem alinhados na página A4 */
              .recharts-responsive-container { width: 100% !important; min-height: 250px !important; }
              .h-64 { height: auto !important; }
            }
          `}} />

          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded flex flex-col md:flex-row justify-between items-stretch md:items-end gap-4 shadow-lg print:hidden">
            <div className="flex flex-col gap-4 flex-1">
              <div className="flex gap-4 items-end flex-wrap w-full md:w-auto">
                <div className="flex-1 min-w-[120px]">
                  <label className="block text-[10px] uppercase text-slate-400 font-bold mb-1">
                    Filtro Data Início
                  </label>
                  <input
                    type="date"
                    value={reportStartDate}
                    onChange={(e) => setReportStartDate(e.target.value)}
                    className="gm-input !py-1.5 !text-xs w-full text-slate-300"
                  />
                </div>
                <div className="flex-1 min-w-[120px]">
                  <label className="block text-[10px] uppercase text-slate-400 font-bold mb-1">
                    Filtro Data Final
                  </label>
                  <input
                    type="date"
                    value={reportEndDate}
                    onChange={(e) => setReportEndDate(e.target.value)}
                    className="gm-input !py-1.5 !text-xs w-full text-slate-300"
                  />
                </div>
              </div>

              <div className="border-t border-zinc-800/50 pt-3 flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 min-w-[180px]">
                  <span className="text-[10px] uppercase text-cyan-400 font-bold tracking-wider block mb-1">
                    Filtrar Logs por Categoria:
                  </span>
                  <select
                    value={logFilterType}
                    onChange={(e) => {
                      setLogFilterType(e.target.value);
                      setLogTargetId("");
                    }}
                    className="gm-input text-xs font-bold text-cyan-400 border-cyan-500/30"
                  >
                    <option value="todos">Todos os Operadores / Grupos</option>
                    <option value="individual">Individual (Sujeito Único)</option>
                    <option value="esquadrao">Por Esquadrão</option>
                  </select>
                </div>

                {logFilterType === "individual" && (
                  <div className="flex-1 min-w-[180px] animate-fade-in">
                    <span className="text-[10px] uppercase text-pink-400 font-bold tracking-wider block mb-1">
                      Selecionar Sujeito:
                    </span>
                    <select
                      value={logTargetId}
                      onChange={(e) => setLogTargetId(e.target.value)}
                      className="gm-input text-xs font-bold text-pink-400 border-pink-500/30"
                    >
                      <option value="">-- Escolher Operador --</option>
                      {players.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {logFilterType === "esquadrao" && (
                  <div className="flex-1 min-w-[180px] animate-fade-in">
                    <span className="text-[10px] uppercase text-blue-400 font-bold tracking-wider block mb-1">
                      Selecionar Esquadrão:
                    </span>
                    <select
                      value={logTargetId}
                      onChange={(e) => setLogTargetId(e.target.value)}
                      className="gm-input text-xs font-bold text-blue-400 border-blue-500/30"
                    >
                      <option value="">-- Escolher Esquadrão --</option>
                      {squads.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={exportPDF}
              className="bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-2.5 rounded text-xs font-bold uppercase w-full md:w-auto justify-center transition flex items-center gap-1.5 shadow-[0_0_10px_rgba(6,182,212,0.3)] cursor-pointer h-10 shrink-0 self-start md:self-end"
            >
              <FileText className="w-4 h-4" /> COMPILAR PDF ANALYTICS
            </button>
          </div>

          <div
            id="report-container"
            className="bg-zinc-950 border border-zinc-850 p-6 md:p-8 rounded shadow-2xl text-slate-200 relative overflow-hidden"
          >
            <div className="border-b-4 border-pink-600 pb-4 mb-6">
              <h1 className="text-3xl font-black uppercase tracking-tighter text-white m-0">
                Analytics Mainframe
              </h1>
              <p className="text-xs font-bold text-pink-500 uppercase tracking-widest mt-0.5">
                Relatório de Auditoria e Inteligência do Mestre
              </p>
              <div className="text-[10px] text-slate-500 mt-2 font-bold uppercase">
                Período auditado: {reportStartDate ? reportStartDate : "Início de registros"} até{" "}
                {reportEndDate ? reportEndDate : "Instante presente"}
              </div>
            </div>

            <h2 className="text-lg font-bold text-white uppercase border-b border-zinc-800 pb-2 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" /> Indicadores Críticos (KPIs)
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <div className="bg-zinc-900 border border-zinc-850 p-4 rounded text-center">
                <div className="text-[9px] uppercase font-bold text-slate-500 mb-1">
                  Ações de Tráfego (Logs)
                </div>
                <div className="text-2xl font-bold text-white">{filteredLogs.length}</div>
              </div>
              <div className="bg-zinc-900 border border-zinc-850 border-t-4 border-t-green-500 p-4 rounded text-center">
                <div className="text-[9px] uppercase font-bold text-slate-500 mb-1">
                  XP Injetada Total
                </div>
                <div className="text-2xl font-bold text-green-500">
                  +
                  {filteredLogs.reduce((acc, log) => (log.xp > 0 ? acc + log.xp : acc), 0)}
                </div>
              </div>
              <div className="bg-zinc-900 border border-zinc-850 border-t-4 border-t-red-500 p-4 rounded text-center">
                <div className="text-[9px] uppercase font-bold text-slate-500 mb-1">
                  XP Drenada (Penas)
                </div>
                <div className="text-2xl font-bold text-red-500">
                  {filteredLogs.reduce((acc, log) => (log.xp < 0 ? acc + log.xp : acc), 0)}
                </div>
              </div>
              <div className="bg-zinc-900 border border-zinc-850 border-t-4 border-t-cyan-500 p-4 rounded text-center">
                <div className="text-[9px] uppercase font-bold text-slate-500 mb-1">
                  SP Gerado Ativo
                </div>
                <div className="text-2xl font-bold text-cyan-400">
                  +
                  {filteredLogs.reduce((acc, log) => (log.sp > 0 ? acc + log.sp : acc), 0)}
                </div>
              </div>
              {/* NOVA CAIXA: MISSÕES CONCLUÍDAS */}
           <div className="bg-zinc-900 border border-zinc-850 border-t-4 border-t-purple-500 p-4 rounded text-center">
             <div className="text-[9px] uppercase font-bold text-slate-500 mb-1">
               Missões Concluídas
             </div>
             <div className="text-2xl font-bold text-purple-400">
               {filteredLogs.filter(log => log.action === "MISSÃO").length}
             </div>
           </div>
            </div>

            {/* GRÁFICOS INTERATIVOS RECHARTS */}
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-zinc-900 border border-zinc-850 rounded p-4 shadow-lg pb-6">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                    Oscilação Diária de Fluxo de Recursos (XP/SP)
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={(() => {
                          const map: { [key: string]: any } = {};
                          [...filteredLogs].reverse().forEach((l) => {
                            const d = new Date(l.date).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                            });
                            if (!map[d]) map[d] = { date: d, xp: 0, sp: 0 };
                            map[d].xp += l.xp;
                            map[d].sp += l.sp;
                          });
                          return Object.values(map);
                        })()}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                        <XAxis dataKey="date" stroke="#71717a" fontSize={10} />
                        <YAxis yAxisId="left" stroke="#22c55e" fontSize={10} />
                        <YAxis yAxisId="right" orientation="right" stroke="#06b6d4" fontSize={10} />
                        <Tooltip contentStyle={{ backgroundColor: "#06060c", border: "1px solid #1f2937" }} />
                        <Legend wrapperStyle={{ fontSize: "10px" }} />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="xp"
                          name="Balanço EXP"
                          stroke="#22c55e"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="sp"
                          name="Balanço SP"
                          stroke="#06b6d4"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-850 rounded p-4 shadow-lg flex flex-col justify-between">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 text-center">
                    Balanço de Utilização de SP
                  </h3>
                  <div className="h-48 flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={(() => {
                            let spGain = 0;
                            let spLoss = 0;
                            let spSpent = 0;
                            filteredLogs.forEach((l) => {
                              if (l.action === "MISSÃO" || l.action === "CRÉDITO") {
                                spGain += l.sp > 0 ? l.sp : 0;
                              }
                              if (l.action === "DEGRADAÇÃO") {
                                spLoss += Math.abs(l.sp < 0 ? l.sp : 0);
                              }
                              if (l.action === "MERCADO") {
                                spSpent += Math.abs(l.sp < 0 ? l.sp : 0);
                              }
                            });
                            return [
                              { name: "Injeção / Ganho", value: spGain, color: "#06b6d4" },
                              { name: "Cortes / Penas", value: spLoss, color: "#ef4444" },
                              { name: "Mercantil / Gasto", value: spSpent, color: "#a855f7" },
                            ].filter((d) => d.value > 0);
                          })()}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={70}
                          dataKey="value"
                        >
                          {(() => {
                            const entries = [];
                            let spGain = 0;
                            let spLoss = 0;
                            let spSpent = 0;
                            filteredLogs.forEach((l) => {
                              if (l.action === "MISSÃO" || l.action === "CRÉDITO") {
                                spGain += l.sp > 0 ? l.sp : 0;
                              }
                              if (l.action === "DEGRADAÇÃO") {
                                spLoss += Math.abs(l.sp < 0 ? l.sp : 0);
                              }
                              if (l.action === "MERCADO") {
                                spSpent += Math.abs(l.sp < 0 ? l.sp : 0);
                              }
                            });
                            if (spGain > 0) entries.push({ color: "#06b6d4" });
                            if (spLoss > 0) entries.push({ color: "#ef4444" });
                            if (spSpent > 0) entries.push({ color: "#a855f7" });
                            return entries.map((entry, idx) => (
                              <Cell key={`cell-${idx}`} fill={entry.color} />
                            ));
                          })()}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: "#06060c", border: "1px solid #1f2937" }} />
                        <Legend wrapperStyle={{ fontSize: "9px" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-4">
                <div className="bg-zinc-900 border border-zinc-850 rounded p-4 shadow-lg">
                  <div className="flex justify-between items-start mb-4 flex-wrap gap-2">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest shrink-0">
                      Comparação de Biomas Sub-Rede (Radar)
                    </h3>
                    <select
                      value={reportPlayerId}
                      onChange={(e) => setReportPlayerId(e.target.value)}
                      className="bg-zinc-950 border border-zinc-800 text-xs text-cyan-400 px-2.5 py-1 rounded outline-none max-w-[150px] font-bold"
                    >
                      <option value="">Selecione Jogador</option>
                      {players.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart
                        cx="50%"
                        cy="50%"
                        outerRadius="65%"
                        data={(() => {
                          const attrs = [
                            "Confiabilidade",
                            "Agilidade",
                            "Resolução de Problemas",
                            "Proatividade",
                            "Foco",
                            "Abertura à Experiência",
                            "Consciência",
                            "Extroversão",
                            "Compaixão",
                            "Estabilidade Emocional",
                            "Paciência",
                            "Popularidade",
                          ];
                          const avgAttrs: { [key: string]: number } = {};
                          attrs.forEach((a) => {
                            const sum = players.reduce((acc, p) => acc + (p.attributes[a] || 1), 0);
                            avgAttrs[a] = Number((sum / Math.max(1, players.length)).toFixed(1));
                          });
                          const targetP = players.find((p) => p.id === Number(reportPlayerId));
                          return attrs.map((a) => ({
                            subject: a.substring(0, 10) + ".",
                            Sujeito: targetP ? targetP.attributes[a] || 1 : 0,
                            Média: avgAttrs[a],
                          }));
                        })()}
                      >
                        <PolarGrid stroke="#222" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: "#a1a1aa", fontSize: 9 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fill: "#52525b", fontSize: 9 }} />
                        <Radar
                          name="Alvo Selecionado"
                          dataKey="Sujeito"
                          stroke="#ec4899"
                          fill="#ec4899"
                          fillOpacity={0.4}
                        />
                        <Radar
                          name="Média Mainframe"
                          dataKey="Média"
                          stroke="#06b6d4"
                          fill="#06b6d4"
                          fillOpacity={0.15}
                        />
                        <Legend wrapperStyle={{ fontSize: "9px" }} />
                        <Tooltip contentStyle={{ backgroundColor: "#06060c", border: "1px solid #1f2937" }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-850 rounded p-4 shadow-lg flex flex-col">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest shrink-0">
                      Corrida Dinâmica de XP Comparada
                    </h3>
                    
                    <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-end print:hidden">
                      {selectedCompareIds.map((id, idx) => {
                        const p = players.find(pl => pl.id === id);
                        const cols = ["bg-pink-600/10 text-pink-400 border-pink-500/30", "bg-cyan-600/10 text-cyan-400 border-cyan-500/30", "bg-purple-600/10 text-purple-400 border-purple-500/30"];
                        return (
                          <span
                            key={id}
                            onClick={() => setSelectedCompareIds(prev => prev.filter(mid => mid !== id))}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border cursor-pointer hover:bg-red-950/40 hover:text-red-400 hover:border-red-500/30 transition-all ${cols[idx]}`}
                            title="Clique para remover"
                          >
                            {p ? p.name : id} &times;
                          </span>
                        );
                      })}
                      <select
                        value=""
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if (!val) return;
                          if (selectedCompareIds.includes(val)) {
                            setSelectedCompareIds(prev => prev.filter(id => id !== val));
                          } else if (selectedCompareIds.length < 3) {
                            setSelectedCompareIds(prev => [...prev, val]);
                          }
                        }}
                        className="bg-zinc-950 border border-zinc-800 text-[10px] text-cyan-400 px-2 py-1 rounded outline-none max-w-[150px] font-bold cursor-pointer"
                      >
                        <option value="">+ Selecionar (Max 3)</option>
                        {players.map((p) => {
                          const isComp = selectedCompareIds.includes(p.id);
                          return (
                            <option key={p.id} value={p.id} disabled={!isComp && selectedCompareIds.length >= 3}>
                              {isComp ? "✓ " : ""} {p.name}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                  
                  <div className="h-64 flex-1">
                    {selectedCompareIds.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-xs text-slate-600 italic uppercase">
                        Selecione até 3 sujeitos no menu suspenso acima.
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={(() => {
                            const dateSet = new Set<string>();
                            logs.forEach((l) =>
                              dateSet.add(new Date(l.date).toLocaleDateString("pt-BR"))
                            );
                            const sortedDates = Array.from(dateSet).sort((a, b) => {
                              const [da, ma, ya] = a.split("/");
                              const [db, mb, yb] = b.split("/");
                              return (
                                new Date(Number(ya), Number(ma) - 1, Number(da)).getTime() -
                                new Date(Number(yb), Number(mb) - 1, Number(db)).getTime()
                              );
                            });

                            const chartData: any[] = [];
                            const runningXP: { [key: number]: number } = {};
                            selectedCompareIds.forEach((id) => (runningXP[id] = 0));

                            sortedDates.forEach((d) => {
                              const entry: any = { date: d.substring(0, 5) };
                              const logsOfDay = logs.filter(
                                (l) => new Date(l.date).toLocaleDateString("pt-BR") === d
                              );
                              selectedCompareIds.forEach((id) => {
                                const xpGain = logsOfDay
                                  .filter((l) => l.playerId === id)
                                  .reduce((acc, l) => acc + (l.xp || 0), 0);
                                runningXP[id] += xpGain;
                                const pName = players.find((pl) => pl.id === id)?.name || id.toString();
                                entry[pName] = runningXP[id];
                              });
                              chartData.push(entry);
                            });
                            return chartData;
                          })()}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                          <XAxis dataKey="date" stroke="#71717a" fontSize={10} />
                          <YAxis stroke="#71717a" fontSize={10} />
                          <Tooltip contentStyle={{ backgroundColor: "#06060c", border: "1px solid #1f2937" }} />
                          <Legend wrapperStyle={{ fontSize: "9px" }} />
                          {selectedCompareIds.map((id, idx) => {
                            const cols = ["#ec4899", "#06b6d4", "#a855f7"];
                            const name = players.find((pl) => pl.id === id)?.name || id.toString();
                            return (
                              <Line
                                key={id}
                                type="monotone"
                                dataKey={name}
                                stroke={cols[idx]}
                                strokeWidth={2.5}
                                dot={{ r: 2 }}
                              />
                            );
                          })}
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>
            </div>

           {/* RAW AUDIT LOG TABLE - A classe print:hidden faz a tabela desaparecer no PDF */}
            <div className="print:hidden">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-zinc-800 pb-2 mb-4 mt-6 gap-4">
                <h2 className="text-lg font-bold text-white uppercase flex items-center gap-2 m-0 border-none pb-0">
                  <FileText className="w-5 h-5 text-pink-500 animate-pulse" /> Logs de Eventos de Rede
                </h2>
                
                {/* MENU SUSPENSO DE STATUS (Ativos/Excluídos) */}
                <select
                  value={logStatusFilter}
                  onChange={(e) => setLogStatusFilter(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 text-xs text-slate-300 px-3 py-1.5 rounded outline-none font-bold"
                >
                  <option value="todos">Status: Todos os Jogadores</option>
                  <option value="ativos">Status: Apenas Operadores Ativos</option>
                  <option value="excluidos">Status: Apenas Operadores Excluídos</option>
                </select>
              </div>

              {filteredLogs.length === 0 ? (
                <p className="text-slate-500 italic text-sm text-center py-8 bg-zinc-900 border border-zinc-800 rounded">
                  Nenhum sinal ou tráfego registado com estes filtros.
                </p>
              ) : (
                <div className="overflow-x-auto bg-zinc-900 border border-zinc-850 rounded">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead>
                      <tr className="bg-zinc-950 border-b border-zinc-800 text-[10px] uppercase font-bold tracking-wider text-slate-500">
                        <th className="p-3">Data / Hora</th>
                        <th className="p-3">Agente</th>
                        <th className="p-3">Módulo</th>
                        <th className="p-3">Evento Técnico</th>
                        <th className="p-3 text-right">XP</th>
                        <th className="p-3 text-right">SP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/40 text-xs">
                      {filteredLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-zinc-850/40">
                          <td className="p-3 whitespace-nowrap text-slate-500 text-[10px]">
                            {new Date(log.date).toLocaleString("pt-BR")}
                          </td>
                          <td className="p-3 font-bold text-white uppercase select-none">
                            {players.find((pl) => pl.id === log.playerId)?.name || "Sujeito Drenado"}
                          </td>
                          <td className="p-3">
                            <span
                              className={`text-[8px] px-2 py-0.5 rounded font-black tracking-widest uppercase ${
                                log.action === "DEGRADAÇÃO"
                                  ? "bg-red-500/10 text-red-500 border border-red-500/20"
                                  : log.action === "CRÉDITO"
                                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                                  : log.action === "MISSÃO"
                                  ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                  : log.action === "CONQUISTA"
                                  ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                                  : log.action === "MERCADO"
                                  ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                                  : "bg-slate-800/10 text-slate-400"
                              }`}
                            >
                              {log.action}
                            </span>
                          </td>
                          <td className="p-3 text-slate-300 font-medium">{log.desc}</td>
                          <td
                            className={`p-3 text-right font-bold font-sans ${
                              log.xp > 0 ? "text-green-400" : log.xp < 0 ? "text-red-400" : "text-slate-600"
                            }`}
                          >
                            {log.xp > 0 ? `+${log.xp}` : log.xp === 0 ? "--" : log.xp}
                          </td>
                          <td
                            className={`p-3 text-right font-bold font-sans ${
                              log.sp > 0 ? "text-cyan-400" : log.sp < 0 ? "text-red-400" : "text-slate-600"
                            }`}
                          >
                            {log.sp > 0 ? `+${log.sp}` : log.sp === 0 ? "--" : log.sp}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div> {/* Fim da div print:hidden que esconde a tabela */}

          </div> {/* Fim da div report-container */}
        </div>
      )}
    </div>
  );
}