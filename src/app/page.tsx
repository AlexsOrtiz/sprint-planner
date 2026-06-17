"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [mode, setMode] = useState<"idle" | "create" | "join">("idle");
  const [sessionName, setSessionName] = useState("");
  const [hostName, setHostName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!sessionName.trim() || !hostName.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: sessionName.trim(),
          hostName: hostName.trim(),
        }),
      });
      const room = await res.json();
      if (room.code) {
        sessionStorage.setItem(
          `room-${room.code}-id`,
          room.participants[0].id
        );
        router.push(`/room/${room.code}`);
      }
    } catch {
      setError("Failed to create room. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!joinCode.trim()) return;
    router.push(`/room/${joinCode.trim().toUpperCase()}`);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Sprint Planner</h1>
            <p className="text-gray-500 mt-2">
              Planning Poker for your team — no login required
            </p>
          </div>

          {mode === "idle" && (
            <div className="space-y-3 animate-fade-in">
              <button
                onClick={() => setMode("create")}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white p-4 rounded-2xl font-semibold transition-colors shadow-sm cursor-pointer text-left flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <div className="text-lg">Create Session</div>
                  <div className="text-sm text-white/70 font-normal">
                    Start a new planning poker session and invite your team
                  </div>
                </div>
              </button>

              <button
                onClick={() => setMode("join")}
                className="w-full bg-white hover:bg-gray-50 text-gray-900 p-4 rounded-2xl font-semibold transition-colors shadow-sm border border-gray-200 cursor-pointer text-left flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.87-9.87a4.5 4.5 0 010 6.364l-4.5 4.5a4.5 4.5 0 01-6.364 0" />
                  </svg>
                </div>
                <div>
                  <div className="text-lg">Join with Code</div>
                  <div className="text-sm text-gray-500 font-normal">
                    Enter a room code to join an existing session
                  </div>
                </div>
              </button>
            </div>
          )}

          {mode === "create" && (
            <form
              onSubmit={handleCreate}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-slide-up"
            >
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Session Name
                  </label>
                  <input
                    type="text"
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                    placeholder="e.g., Sprint 12 Planning"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-lg"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={hostName}
                    onChange={(e) => setHostName(e.target.value)}
                    placeholder="e.g., Sarah (PM)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-lg"
                  />
                </div>

                {error && (
                  <p className="text-sm text-danger-500">{error}</p>
                )}
              </div>

              <div className="px-6 pb-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setMode("idle")}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={!sessionName.trim() || !hostName.trim() || loading}
                  className="flex-1 px-4 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white rounded-xl transition-colors font-medium cursor-pointer"
                >
                  {loading ? "Creating..." : "Create & Share"}
                </button>
              </div>
            </form>
          )}

          {mode === "join" && (
            <form
              onSubmit={handleJoin}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-slide-up"
            >
              <div className="p-6">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Room Code
                </label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) =>
                    setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))
                  }
                  placeholder="e.g., AB3K7"
                  maxLength={5}
                  className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-3xl text-center font-mono font-bold tracking-[0.3em]"
                  autoFocus
                />
                <p className="text-xs text-gray-400 text-center mt-2">
                  Ask the host for the 5-character room code
                </p>
              </div>

              <div className="px-6 pb-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setMode("idle")}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={joinCode.length < 5}
                  className="flex-1 px-4 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white rounded-xl transition-colors font-medium cursor-pointer"
                >
                  Join Room
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <footer className="text-center py-4 text-xs text-gray-400">
        Data is stored in server memory. Sessions expire when the server restarts.
      </footer>
    </div>
  );
}
