"use client";

import { useMemo } from "react";
import { Room } from "@/lib/types";
import { getInitials } from "@/lib/utils";

interface Props {
  room: Room;
  myId: string;
  isHost: boolean;
  onVote: (value: number | string) => void;
  onReveal: () => void;
  onNewRound: () => void;
}

const CARD_VALUES: (number | string)[] = [1, 2, 3, 5, 8, 13, 21, 34, "?", "pass"];

export default function PlanningPoker({
  room,
  myId,
  isHost,
  onVote,
  onReveal,
  onNewRound,
}: Props) {
  const voters = room.participants.filter((p) => p.role === "voter");
  const observers = room.participants.filter((p) => p.role === "observer");

  const voteMap = useMemo(() => {
    const map: Record<string, number | string> = {};
    room.votes.forEach((v) => {
      map[v.participantId] = v.value;
    });
    return map;
  }, [room.votes]);

  const myVote = voteMap[myId];
  const iAmVoter = voters.some((p) => p.id === myId);
  const allVotersVoted = voters.length > 0 && voters.every((p) => voteMap[p.id] !== undefined);

  const stats = useMemo(() => {
    if (!room.revealed) return null;
    const numericVotes = room.votes
      .map((v) => v.value)
      .filter((v): v is number => typeof v === "number" && v > 0);
    if (numericVotes.length === 0) return null;
    const avg = numericVotes.reduce((a, b) => a + b, 0) / numericVotes.length;
    const min = Math.min(...numericVotes);
    const max = Math.max(...numericVotes);
    const allSame = numericVotes.every((v) => v === numericVotes[0]);
    return {
      avg: Math.round(avg * 10) / 10,
      min,
      max,
      consensus: allSame,
      consensusValue: numericVotes[0],
    };
  }, [room.votes, room.revealed]);

  function displayVote(value: number | string): string {
    if (value === "?") return "?";
    if (value === "pass") return "—";
    return String(value);
  }

  function getCardPosition(index: number, total: number) {
    const angleStep = (2 * Math.PI) / Math.max(total, 1);
    const startAngle = -Math.PI / 2;
    const angle = startAngle + angleStep * index;
    const radiusX = 42;
    const radiusY = 38;
    return {
      x: 50 + radiusX * Math.cos(angle),
      y: 50 + radiusY * Math.sin(angle),
    };
  }

  return (
    <div className="animate-fade-in">
      {/* Poker Table */}
      <div className="relative mb-8">
        <div className="aspect-square max-w-[520px] mx-auto relative">
          {/* Table circle */}
          <div className="absolute inset-[12%] rounded-full bg-gradient-to-br from-teal-600 to-teal-800 shadow-2xl border-8 border-teal-700/50">
            <div className="absolute inset-3 rounded-full border-2 border-teal-600/30" />

            {/* Center content */}
            <div className="absolute inset-0 flex items-center justify-center">
              {room.revealed && stats ? (
                <div className="text-center animate-pop-in">
                  {stats.consensus ? (
                    <>
                      <div className="text-white/60 text-sm font-medium tracking-wide mb-1">
                        Consensus!
                      </div>
                      <div className="text-6xl font-bold text-white drop-shadow-lg">
                        {stats.consensusValue}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-white/60 text-sm font-medium mb-1">Average</div>
                      <div className="text-5xl font-bold text-white drop-shadow-lg">
                        {stats.avg}
                      </div>
                      <div className="flex gap-4 mt-3 text-xs text-white/50">
                        <span>Low: {stats.min}</span>
                        <span>High: {stats.max}</span>
                      </div>
                    </>
                  )}
                </div>
              ) : room.revealed && !stats ? (
                <div className="text-white/50 text-sm">No votes</div>
              ) : (
                <div className="text-center">
                  {allVotersVoted ? (
                    <div className="animate-pop-in">
                      <div className="text-white/80 text-base font-semibold">All votes in!</div>
                      {isHost && (
                        <div className="text-white/40 text-xs mt-1">Ready to reveal</div>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="text-white/40 text-xs mb-1">Round {room.round}</div>
                      <div className="text-4xl font-bold text-white/30">
                        {room.votes.length}/{voters.length}
                      </div>
                      <div className="text-white/50 text-xs mt-1">votes</div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Participants around the table */}
          {voters.map((participant, i) => {
            const pos = getCardPosition(i, voters.length);
            const hasVoted = voteMap[participant.id] !== undefined;
            const vote = voteMap[participant.id];
            const isMe = participant.id === myId;

            return (
              <div
                key={participant.id}
                className="absolute"
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                {/* Card */}
                <div className="mb-1.5">
                  <div
                    className={`w-12 h-16 sm:w-14 sm:h-20 rounded-lg mx-auto transition-all duration-500 ${
                      room.revealed && hasVoted ? "animate-card-flip" : ""
                    }`}
                  >
                    {!hasVoted ? (
                      <div className="w-full h-full rounded-lg border-2 border-dashed border-white/20 bg-white/5 flex items-center justify-center">
                        <span className="text-white/20 text-xl">?</span>
                      </div>
                    ) : room.revealed ? (
                      <div className={`w-full h-full rounded-lg bg-white shadow-lg border-2 flex items-center justify-center ${
                        vote === "?" ? "border-warning-500" : vote === "pass" ? "border-gray-300" : "border-accent-400"
                      }`}>
                        <span className={`text-2xl sm:text-3xl font-bold ${
                          vote === "?" ? "text-warning-500" : vote === "pass" ? "text-gray-400" : "text-accent-600"
                        }`}>
                          {displayVote(vote)}
                        </span>
                      </div>
                    ) : (
                      <div className="w-full h-full rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg border-2 border-primary-400 flex items-center justify-center">
                        <div className="w-7 h-10 sm:w-8 sm:h-12 rounded border border-primary-300/40 bg-primary-600/40 flex items-center justify-center">
                          <svg className="w-4 h-4 text-primary-200" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Name badge */}
                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap mx-auto w-fit ${
                    isMe
                      ? "bg-white shadow-md ring-2 ring-primary-400 text-gray-900"
                      : "bg-white/90 shadow text-gray-700"
                  }`}
                >
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                    style={{ backgroundColor: participant.color }}
                  >
                    {getInitials(participant.name).charAt(0)}
                  </span>
                  <span className="max-w-[60px] truncate">{participant.name}</span>
                  {hasVoted && !room.revealed && (
                    <svg className="w-3 h-3 text-accent-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Observers */}
        {observers.length > 0 && (
          <div className="flex items-center gap-2 justify-center mt-2">
            <div className="flex items-center gap-1.5 text-xs text-gray-400 border border-dashed border-gray-300 rounded-full px-3 py-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Observing:</span>
              {observers.map((o, i) => (
                <span key={o.id} className="font-medium text-gray-500">
                  {o.name}{i < observers.length - 1 ? "," : ""}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Card selector — always visible for voters */}
      {iAmVoter && (
        <div className="mb-6 animate-fade-in">
          <div className="text-center mb-3">
            <h3 className="text-sm font-semibold text-gray-600">
              {myVote !== undefined ? "Change your vote" : "Pick your card"}
            </h3>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
            {CARD_VALUES.map((val) => {
              const isChosen = myVote === val;
              const isSpecial = val === "?" || val === "pass";
              return (
                <button
                  key={String(val)}
                  onClick={() => onVote(val)}
                  className={`w-14 h-20 sm:w-16 sm:h-24 rounded-xl border-2 font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                    isChosen
                      ? isSpecial
                        ? "border-warning-400 bg-warning-50 text-warning-600 shadow-lg scale-110 ring-2 ring-warning-200"
                        : "border-primary-500 bg-primary-50 text-primary-600 shadow-lg scale-110 ring-2 ring-primary-200"
                      : "border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:shadow-md hover:-translate-y-2"
                  }`}
                >
                  {val === "?" ? (
                    <>
                      <span className="text-2xl sm:text-3xl">?</span>
                      <span className="text-[9px] font-medium text-gray-400 leading-none">doubt</span>
                    </>
                  ) : val === "pass" ? (
                    <>
                      <span className="text-2xl sm:text-3xl">—</span>
                      <span className="text-[9px] font-medium text-gray-400 leading-none">pass</span>
                    </>
                  ) : (
                    <span className="text-xl sm:text-2xl">{val}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Observer message */}
      {!iAmVoter && !room.revealed && (
        <div className="text-center mb-6 text-sm text-gray-400">
          You are observing this round. Waiting for votes...
        </div>
      )}

      {/* Host controls */}
      <div className="flex flex-wrap gap-3 justify-center">
        {!room.revealed ? (
          isHost && (
            <button
              onClick={onReveal}
              disabled={room.votes.length === 0}
              className="px-8 py-3.5 bg-accent-500 hover:bg-accent-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-lg transition-all shadow-sm cursor-pointer flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Reveal Votes
            </button>
          )
        ) : (
          isHost && (
            <button
              onClick={onNewRound}
              className="px-8 py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold text-lg transition-all shadow-sm cursor-pointer flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
              </svg>
              New Round
            </button>
          )
        )}
      </div>

      {/* Waiting messages */}
      {!room.revealed && !isHost && room.votes.length > 0 && iAmVoter && myVote !== undefined && (
        <div className="text-center mt-4 text-sm text-gray-400">
          Waiting for the host to reveal...
        </div>
      )}

      {room.revealed && !isHost && (
        <div className="text-center mt-4 text-sm text-gray-400">
          Waiting for the host to start a new round...
        </div>
      )}

      {voters.length === 0 && (
        <div className="text-center py-6 text-gray-400 text-sm">
          No voters yet. Participants join as voters automatically.
        </div>
      )}
    </div>
  );
}
