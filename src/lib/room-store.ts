import { Redis } from "@upstash/redis";
import { Room } from "./types";

function getRedis() {
  return Redis.fromEnv();
}

function roomKey(code: string) {
  return `room:${code.toUpperCase()}`;
}

const ROOM_TTL = 60 * 60 * 12; // 12 hours

function generateId(): string {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

const COLORS = [
  "#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6",
  "#ec4899", "#06b6d4", "#f97316", "#14b8a6", "#6366f1",
  "#e11d48", "#0ea5e9", "#84cc16", "#a855f7", "#d946ef",
];

export function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function createRoom(name: string, hostName: string): Promise<Room> {
  const redis = getRedis();
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
  await redis.set(roomKey(code), JSON.stringify(room), { ex: ROOM_TTL });
  return room;
}

export async function getRoom(code: string): Promise<Room | null> {
  const redis = getRedis();
  const data = await redis.get<string>(roomKey(code));
  if (!data) return null;
  if (typeof data === "string") return JSON.parse(data);
  return data as unknown as Room;
}

export async function saveRoom(room: Room): Promise<void> {
  const redis = getRedis();
  await redis.set(roomKey(room.code), JSON.stringify(room), { ex: ROOM_TTL });
}

export async function deleteRoom(code: string): Promise<void> {
  const redis = getRedis();
  await redis.del(roomKey(code));
}

export async function addParticipant(
  code: string,
  name: string,
  role: "voter" | "observer" = "voter"
): Promise<{ room: Room; participantId: string } | null> {
  const room = await getRoom(code);
  if (!room) return null;

  const existing = room.participants.find(
    (p) => p.name.toLowerCase() === name.trim().toLowerCase()
  );
  if (existing) return { room, participantId: existing.id };

  const id = generateId();
  const color = COLORS[room.participants.length % COLORS.length];
  room.participants.push({ id, name: name.trim(), color, role, isHost: false });
  await saveRoom(room);
  return { room, participantId: id };
}
