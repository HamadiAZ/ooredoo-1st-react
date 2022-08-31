import { scheduleObjectType } from "../types/types";

export function isScheduleInTime(singleSession: scheduleObjectType): boolean | undefined {
  const d = new Date();
  const hoursNow = d.getHours();
  const minutesNow = d.getMinutes();
  if (singleSession.fulltime === true) return true;
  if (singleSession.startH < hoursNow && hoursNow < singleSession.endH) return true;
  if (
    // time is 9:10 // session 9:20 =>9:30
    singleSession.startH === hoursNow &&
    hoursNow < singleSession.endH &&
    singleSession.startM > minutesNow
  )
    return false;
  if (
    // time is 9:10 // session 8:20 =>9:30
    singleSession.startH < hoursNow &&
    hoursNow == singleSession.endH &&
    singleSession.endM > minutesNow
  )
    return true;
  if (
    // time is 8:30 // session 8:20 =>9:30
    singleSession.startH == hoursNow &&
    hoursNow < singleSession.endH &&
    singleSession.startM < minutesNow
  )
    return true;
  if (
    // time 15:45 // session 15:10=>15:40
    singleSession.startH <= hoursNow &&
    hoursNow === singleSession.endH &&
    singleSession.endM < minutesNow
  )
    return false;
  if (
    // time 15:45 // session 15:10=>15:40
    singleSession.startH === hoursNow &&
    hoursNow === singleSession.endH &&
    singleSession.endM > minutesNow &&
    singleSession.startM < minutesNow
  )
    return true;
  return undefined;
}
