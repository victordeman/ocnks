import { RfqStatus, Role } from "@prisma/client";

const NON_TERMINAL_STATES: readonly RfqStatus[] = [
  RfqStatus.RECEIVED,
  RfqStatus.UNDER_REVIEW,
  RfqStatus.QUOTED,
];

/**
 * Pure function enforcing the RFQ status state machine.
 *
 * States: RECEIVED → UNDER_REVIEW → QUOTED → AWARDED | DECLINED.
 * Any non-terminal state may go to CLOSED.
 * No backwards transitions except ADMIN (ADMIN may move any non-terminal state
 * to any other non-terminal state; CLOSED is absorbing — nothing moves out of CLOSED,
 * not even ADMIN).
 */
export function canTransition(
  from: RfqStatus,
  to: RfqStatus,
  actorRole: Role
): boolean {
  if (from === to) {
    return false;
  }

  // Terminal states (CLOSED, AWARDED, DECLINED) have no outgoing transitions for any role
  if (!NON_TERMINAL_STATES.includes(from)) {
    return false;
  }

  // Standard forward transitions (STAFF & ADMIN)
  if (from === RfqStatus.RECEIVED) {
    if (to === RfqStatus.UNDER_REVIEW || to === RfqStatus.CLOSED) {
      return true;
    }
  } else if (from === RfqStatus.UNDER_REVIEW) {
    if (to === RfqStatus.QUOTED || to === RfqStatus.CLOSED) {
      return true;
    }
  } else if (from === RfqStatus.QUOTED) {
    if (
      to === RfqStatus.AWARDED ||
      to === RfqStatus.DECLINED ||
      to === RfqStatus.CLOSED
    ) {
      return true;
    }
  }

  // ADMIN backwards or lateral transitions between non-terminal states
  if (actorRole === Role.ADMIN) {
    if (NON_TERMINAL_STATES.includes(to)) {
      return true;
    }
  }

  return false;
}
