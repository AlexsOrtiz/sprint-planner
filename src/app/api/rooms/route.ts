import { NextResponse } from "next/server";
import { createRoom } from "@/lib/room-store";

export async function POST(req: Request) {
  const { name, hostName } = await req.json();
  if (!name || !hostName) {
    return NextResponse.json({ error: "name and hostName required" }, { status: 400 });
  }
  const room = await createRoom(name.trim(), hostName.trim());
  return NextResponse.json(room);
}
