"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Room } from "./types";

const POLL_INTERVAL = 2000;

export function useRoom(code: string | null) {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchRoom = useCallback(async () => {
    if (!code) return;
    try {
      const res = await fetch(`/api/rooms/${code}`);
      if (!res.ok) {
        if (res.status === 404) {
          setError("Room not found");
          setRoom(null);
        }
        return;
      }
      const data = await res.json();
      setRoom(data);
      setError(null);
    } catch {
      setError("Connection lost");
    } finally {
      setLoading(false);
    }
  }, [code]);

  useEffect(() => {
    if (!code) return;
    fetchRoom();
    intervalRef.current = setInterval(fetchRoom, POLL_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [code, fetchRoom]);

  const sendAction = useCallback(
    async (action: string, data: Record<string, unknown> = {}) => {
      if (!code) return null;
      try {
        const res = await fetch(`/api/rooms/${code}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, ...data }),
        });
        const result = await res.json();
        if (result.room) {
          setRoom(result.room);
          return result;
        }
        if (result.code) {
          setRoom(result);
        }
        return result;
      } catch {
        setError("Failed to send action");
        return null;
      }
    },
    [code]
  );

  return { room, loading, error, sendAction, refetch: fetchRoom };
}
