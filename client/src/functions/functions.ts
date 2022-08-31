import { scheduleObjectType } from "../types/types";

export function isScheduleInTime(
  singleSession: scheduleObjectType,
  h: number = -1,
  m: number = -1
): boolean | undefined {
  // if not given hour and minute : compare to current time
  const d = new Date();
  const hoursNow = d.getHours();
  const minutesNow = d.getMinutes();
  const hoursToCompare = h === -1 ? hoursNow : h; // hours given as parameters
  const minutesToCompare = h === -1 ? minutesNow : m;

  if (singleSession.fulltime === true) return true;
  if (singleSession.startH < hoursToCompare && hoursToCompare < singleSession.endH) return true;
  if (
    // time is 9:10 // session 9:20 =>9:30
    singleSession.startH === hoursToCompare &&
    hoursToCompare < singleSession.endH &&
    singleSession.startM > minutesToCompare
  )
    return false;
  if (
    // time is 9:10 // session 8:20 =>9:30
    singleSession.startH < hoursToCompare &&
    hoursToCompare == singleSession.endH &&
    singleSession.endM > minutesToCompare
  )
    return true;
  if (
    // time is 8:30 // session 8:20 =>9:30
    singleSession.startH == hoursToCompare &&
    hoursToCompare < singleSession.endH &&
    singleSession.startM < minutesToCompare
  )
    return true;
  if (
    // time 15:45 // session 15:10=>15:40
    singleSession.startH <= hoursToCompare &&
    hoursToCompare === singleSession.endH &&
    singleSession.endM < minutesToCompare
  )
    return false;
  if (
    // time 15:45 // session 15:10=>15:40
    singleSession.startH === hoursToCompare &&
    hoursToCompare === singleSession.endH &&
    singleSession.endM > minutesToCompare &&
    singleSession.startM < minutesToCompare
  )
    return true;
  return undefined;
}
