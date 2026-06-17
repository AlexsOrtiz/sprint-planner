import { NextResponse } from "next/server";
import { getRoom, updateRoom, addParticipant } from "@/lib/room-store";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const room = getRoom(code);
  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }
  return NextResponse.json(room);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const body = await req.json();
  const { action } = body;

  switch (action) {
    case "join": {
      const { name } = body;
      if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });
      const result = addParticipant(code, name);
      if (!result) return NextResponse.json({ error: "Room not found" }, { status: 404 });
      return NextResponse.json(result);
    }

    case "vote": {
      const { participantId, value } = body;
      const updated = updateRoom(code, (r) => {
        const filtered = r.votes.filter((v) => v.participantId !== participantId);
        return { ...r, votes: [...filtered, { participantId, value }] };
      });
      if (!updated) return NextResponse.json({ error: "Room not found" }, { status: 404 });
      return NextResponse.json(updated);
    }

    case "reveal": {
      const updated = updateRoom(code, (r) => ({ ...r, revealed: true }));
      if (!updated) return NextResponse.json({ error: "Room not found" }, { status: 404 });
      return NextResponse.json(updated);
    }

    case "new-round": {
      const updated = updateRoom(code, (r) => ({
        ...r,
        votes: [],
        revealed: false,
        round: r.round + 1,
      }));
      if (!updated) return NextResponse.json({ error: "Room not found" }, { status: 404 });
      return NextResponse.json(updated);
    }

    case "toggle-role": {
      const { participantId } = body;
      const updated = updateRoom(code, (r) => ({
        ...r,
        participants: r.participants.map((p) =>
          p.id === participantId
            ? { ...p, role: p.role === "voter" ? "observer" as const : "voter" as const }
            : p
        ),
        votes: r.votes.filter((v) => v.participantId !== participantId),
      }));
      if (!updated) return NextResponse.json({ error: "Room not found" }, { status: 404 });
      return NextResponse.json(updated);
    }

    case "remove-participant": {
      const { participantId } = body;
      const updated = updateRoom(code, (r) => ({
        ...r,
        participants: r.participants.filter((p) => p.id !== participantId),
        votes: r.votes.filter((v) => v.participantId !== participantId),
      }));
      if (!updated) return NextResponse.json({ error: "Room not found" }, { status: 404 });
      return NextResponse.json(updated);
    }

    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
}
