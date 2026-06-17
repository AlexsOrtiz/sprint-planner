import { Room } from "./types";

const rooms = new Map<string, Room>();

export function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  if (rooms.has(code)) return generateRoomCode();
  return code;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

const COLORS = [
  "#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6",
  "#ec4899", "#06b6d4", "#f97316", "#14b8a6", "#6366f1",
  "#e11d48", "#0ea5e9", "#84cc16", "#a855f7", "#d946ef",
];

export function createRoom(name: string, hostName: string): Room {
  const code = generateRoomCode();
  const room: Room = {
    code,
    name,
    participants: [
      {
        id: generateId(),
        name: hostName,
        color: COLORS[0],
        role: "voter",
        isHost: true,
      },
    ],
    votes: [],
    revealed: false,
    round: 1,
    createdAt: new Date().toISOString(),
  };
  rooms.set(code, room);
  return room;
}

export function getRoom(code: string): Room | undefined {
  return rooms.get(code.toUpperCase());
}

export function updateRoom(code: string, updater: (room: Room) => Room): Room | undefined {
  const room = rooms.get(code.toUpperCase());
  if (!room) return undefined;
  const updated = updater(room);
  rooms.set(code.toUpperCase(), updated);
  return updated;
}

export function deleteRoom(code: string): boolean {
  return rooms.delete(code.toUpperCase());
}

export function addParticipant(code: string, name: string, role: "voter" | "observer" = "voter") {
  const room = getRoom(code);
  if (!room) return null;
  const existing = room.participants.find(
    (p) => p.name.toLowerCase() === name.trim().toLowerCase()
  );
  if (existing) return { room, participantId: existing.id };
  const id = generateId();
  const color = COLORS[room.participants.length % COLORS.length];
  const updated = updateRoom(code, (r) => ({
    ...r,
    participants: [...r.participants, { id, name: name.trim(), color, role, isHost: false }],
  }));
  return { room: updated, participantId: id };
}
