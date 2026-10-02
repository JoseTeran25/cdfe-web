import type { RosterAssignment, RosterRole, RosterServiceRef, User } from "@/types";
import type { RosterRow } from "./rosterConfig";

export interface RosterViewProps {
  rows: RosterRow[];
  cells: Map<string, RosterAssignment[]>;
  serviceByRow: Map<string, RosterServiceRef>;
  users: User[];
  today: string;
  highlightUserId: string | null;
  applying: string | null;
  onEditCell: (row: RosterRow, role: RosterRole) => void;
  onApply: (serviceId: string) => void;
  large?: boolean;
}
