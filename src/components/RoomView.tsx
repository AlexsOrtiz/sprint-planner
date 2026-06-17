"use client";

import { useState } from "react";
import { Room } from "@/lib/types";
import { getInitials } from "@/lib/utils";
import PlanningPoker from "./PlanningPoker";

interface Props {
  room: Room;
  myId: string;
  sendAction: (action: string, data?: Record<string, unknown>) => Promise<unknown>;
}

export default function RoomView({ room, myId, sendAction }: Props) {
  const [copied, setCopied] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);

  const me = room.participants.find((p) => p.id === myId);
  const isHost = me?.isHost ?? false;

  function copyLink() {
    const url = `${window.location.origin}/room/${room.code}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3">
            <a href="/" className="p-2 hover:bg-gray-100 rounded-xl transition-colors shrink-0">
              <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </a>

            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-gray-900 truncate">{room.name}</h1>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="bg-gray-100 px-2 py-0.5 rounded font-mono font-semibold text-gray-600">
                  {room.code}
                </span>
                <span>Round {room.round}</span>
                <span>·</span>
                <span>{room.participants.length} online</span>
              </div>
            </div>

            {/* Share button */}
            <button
              onClick={copyLink}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                copied
                  ? "bg-accent-100 text-accent-600"
                  : "bg-primary-50 text-primary-600 hover:bg-primary-100"
              }`}
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.87-9.87a4.5 4.5 0 010 6.364l-4.5 4.5a4.5 4.5 0 01-6.364 0" />
                  </svg>
                  <span className="hidden sm:inline">Invite</span>
                </>
              )}
            </button>

            {/* Participants toggle */}
            <button
              onClick={() => setShowParticipants(!showParticipants)}
              className="flex items-center gap-1 px-2 py-2 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              <div className="flex -space-x-1.5">
                {room.participants.slice(0, 4).map((p) => (
                  <div
                    key={p.id}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold border-2 border-white ${
                      p.id === myId ? "ring-2 ring-primary-400" : ""
                    }`}
                    style={{ backgroundColor: p.color }}
                  >
                    {getInitials(p.name).charAt(0)}
                  </div>
                ))}
              </div>
              {room.participants.length > 4 && (
                <span className="text-xs text-gray-500 font-medium">+{room.participants.length - 4}</span>
              )}
            </button>
          </div>

          {/* Participants panel */}
          {showParticipants && (
            <div className="mt-3 pt-3 border-t border-gray-100 animate-fade-in">
              <div className="flex flex-wrap gap-2">
                {room.participants.map((p) => (
                  <div key={p.id} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 group">
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                      style={{ backgroundColor: p.color }}
                    >
                      {getInitials(p.name).charAt(0)}
                    </span>
                    <span className="text-sm text-gray-700 font-medium">
                      {p.name}
                      {p.id === myId && <span className="text-gray-400"> (you)</span>}
                    </span>
                    {p.isHost && (
                      <span className="text-[10px] text-warning-600 bg-warning-100 px-1.5 py-0.5 rounded font-medium">Host</span>
                    )}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                      p.role === "voter" ? "bg-primary-100 text-primary-600" : "bg-gray-200 text-gray-500"
                    }`}>
                      {p.role === "voter" ? "Voter" : "Observer"}
                    </span>
                    {isHost && !p.isHost && (
                      <>
                        <button
                          onClick={() => sendAction("toggle-role", { participantId: p.id })}
                          className="text-[10px] text-gray-400 hover:text-primary-500 cursor-pointer opacity-0 group-hover:opacity-100 transition-all"
                        >
                          switch
                        </button>
                        <button
                          onClick={() => sendAction("remove-participant", { participantId: p.id })}
                          className="text-gray-300 hover:text-danger-500 cursor-pointer opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Poker Table */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <PlanningPoker
          room={room}
          myId={myId}
          isHost={isHost}
          onVote={(value) => sendAction("vote", { participantId: myId, value })}
          onReveal={() => sendAction("reveal")}
          onNewRound={() => sendAction("new-round")}
        />
      </main>
    </div>
  );
}
