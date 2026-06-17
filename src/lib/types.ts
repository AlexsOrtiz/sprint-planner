export interface Participant {
  id: string;
  name: string;
  color: string;
  role: "voter" | "observer";
  isHost: boolean;
}

export interface Vote {
  participantId: string;
  value: number | string;
}

export interface Room {
  code: string;
  name: string;
  participants: Participant[];
  votes: Vote[];
  revealed: boolean;
  round: number;
  createdAt: string;
}
