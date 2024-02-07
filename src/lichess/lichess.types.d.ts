interface LichessTournamentResponse {
  id: string;
  createdBy: string;
  system: string;
  minutes: number;
  clock: {
    limit: number;
    increment: number;
  };
  rated: boolean;
  fullName: string;
  nbPlayers: number;
  variant: {
    key: string;
    short: string;
    name: string;
  };
  startsAt: number;
  finishesAt: number;
  status: number;
  perf: {
    key: string;
    name: string;
    position: number;
    icon: string;
  };
  secondsToStart?: number;
  teamMember: string;
  winner?: {
    id: string;
    name: string;
    title: string | null;
  };
}
