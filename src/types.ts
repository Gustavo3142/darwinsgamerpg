export interface AttributeMap {
  [key: string]: number;
}

export interface InventoryItem {
  id: number;
  name: string;
  desc: string;
  quantity: number;
}

export interface Player {
  id: number;
  name: string;
  class: string;
  subClass: string;
  password?: string;
  level: number;
  currentXp: number;
  totalXpForLevel: number;
  spBalance: number;
  attributes: AttributeMap;
  conquistas: string[];
  inventory: InventoryItem[];
  realName: string;
  email: string;
  sigla: string;
}

export interface Mission {
  id: number;
  title: string;
  desc: string;
  sp: number;
  xp: number;
  quantity: number;
  diff: string;
  status: string;
  targetPlayerId: number | null;
  targetSquadId: number | null;
  claimedBy?: number[];
}

export interface Squad {
  id: number;
  name: string;
  members: number[];
}

export interface ShopItem {
  id: number;
  name: string;
  desc: string;
  cost: number;
  stock: number;
  targetPlayerId: number | null;
  targetSquadId?: number | null;
}

export interface LogEntry {
  id: number;
  date: string;
  playerId: number;
  action: string;
  desc: string;
  xp: number;
  sp: number;
}

export interface Notification {
  id: number;
  date: string;
  message: string;
  type: "info" | "alert" | "success";
  targetPlayerId: number | null;
  targetSquadId: number | null;
  readBy: number[];
}

export interface SystemState {
  players: Player[];
  missions: Mission[];
  squads: Squad[];
  shopItems: ShopItem[];
  logs: LogEntry[];
  notifications: Notification[];
  geminiKey: string;
}