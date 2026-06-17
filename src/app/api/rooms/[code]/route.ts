import { NextResponse } from "next/server";
import { getRoom, saveRoom, deleteRoom, addParticipant } from "@/lib/room-store";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const room = await getRoom(code);
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
      const result = await addParticipant(code, name);
      if (!result) return NextResponse.json({ error: "Room not found" }, { status: 404 });
      return NextResponse.json(result);
    }

    default: {
      const room = await getRoom(code);
      if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });

      switch (action) {
        case "vote": {
          const { participantId, value } = body;
          room.votes = room.votes.filter((v) => v.participantId !== participantId);
          room.votes.push({ participantId, value });
          break;
        }
        case "reveal":
          room.revealed = true;
          break;
        case "new-round":
          room.votes = [];
          room.revealed = false;
          room.round += 1;
          break;
        case "toggle-role": {
          const { participantId } = body;
          room.participants = room.participants.map((p) =>
            p.id === participantId
              ? { ...p, role: p.role === "voter" ? "observer" as const : "voter" as const }
              : p
          );
          room.votes = room.votes.filter((v) => v.participantId !== participantId);
          break;
        }
        case "remove-participant": {
          const { participantId } = body;
          room.participants = room.participants.filter((p) => p.id !== participantId);
          room.votes = room.votes.filter((v) => v.participantId !== participantId);
          break;
        }
        default:
          return NextResponse.json({ error: "Unknown action" }, { status: 400 });
      }

      await saveRoom(room);
      return NextResponse.json(room);
    }
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  await deleteRoom(code);
  return NextResponse.json({ ok: true });
}
