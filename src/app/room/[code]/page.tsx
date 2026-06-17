"use client";

import { useState, useEffect, use } from "react";
import { useRoom } from "@/lib/useRoom";
import RoomView from "@/components/RoomView";

export default function RoomPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const { room, loading, error, sendAction } = useRoom(code);
  const [myId, setMyId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(`room-${code}-id`);
    if (stored) setMyId(stored);
  }, [code]);

  useEffect(() => {
    if (myId && room) {
      const stillExists = room.participants.some((p) => p.id === myId);
      if (!stillExists) {
        sessionStorage.removeItem(`room-${code}-id`);
        setMyId(null);
      }
    }
  }, [myId, room, code]);

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setJoining(true);
    const result = await sendAction("join", { name: name.trim() });
    if (result?.participantId) {
      setMyId(result.participantId);
      sessionStorage.setItem(`room-${code}-id`, result.participantId);
    }
    setJoining(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Connecting to room...</p>
        </div>
      </div>
    );
  }

  if (error === "Room not found" || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-danger-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-danger-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Room Not Found</h2>
          <p className="text-gray-500 mb-6">This room doesn&apos;t exist or has expired.</p>
          <a href="/" className="text-primary-600 hover:text-primary-700 font-medium">Go to Home</a>
        </div>
      </div>
    );
  }

  if (!myId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-md animate-slide-up overflow-hidden">
          <div className="bg-gradient-to-br from-teal-600 to-teal-800 p-8 text-center">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
              🃏
            </div>
            <h1 className="text-2xl font-bold text-white">{room.name}</h1>
            <p className="text-white/70 text-sm mt-1">
              {room.participants.length} participant{room.participants.length !== 1 ? "s" : ""} in room
            </p>
          </div>

          <form onSubmit={handleJoin} className="p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter your name to join
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              autoFocus
            />
            <button
              type="submit"
              disabled={!name.trim() || joining}
              className="w-full mt-4 px-4 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white rounded-xl font-semibold transition-colors cursor-pointer"
            >
              {joining ? "Joining..." : "Join as Voter"}
            </button>

            {room.participants.length > 0 && (
              <div className="flex items-center gap-2 mt-4 justify-center">
                <span className="text-xs text-gray-400">Already inside:</span>
                <div className="flex -space-x-1">
                  {room.participants.slice(0, 6).map((p) => (
                    <div
                      key={p.id}
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold border-2 border-white"
                      style={{ backgroundColor: p.color }}
                      title={p.name}
                    >
                      {p.name[0].toUpperCase()}
                    </div>
                  ))}
                </div>
                {room.participants.length > 6 && (
                  <span className="text-xs text-gray-400">+{room.participants.length - 6}</span>
                )}
              </div>
            )}
          </form>
        </div>
      </div>
    );
  }

  return <RoomView room={room} myId={myId} sendAction={sendAction} />;
}
