import { isScheduleInTime } from "../../functions/functions";
import {
  basketProductType,
  scheduleCheckoutObjectType,
  scheduleObjectType,
} from "../../types/types";

export function generateSelector(
  shoppingBasket: basketProductType[],
  basketCounter: number
): scheduleCheckoutObjectType[] {
  const selectorArray: scheduleCheckoutObjectType[] = [];
  if (basketCounter) {
    const { shopUpcomingSessions } = shoppingBasket[0];
    //console.log(shopUpcomingSessions);
    const { day } = shopUpcomingSessions;
    for (const schedule of shopUpcomingSessions.schedule) {
      let newItems: scheduleCheckoutObjectType[] = getArraysOf15Minutes(schedule, day);
      selectorArray.push(...newItems);
    }
  }
  // update init value only if array[0] exist
  return selectorArray;
}

function getArraysOf15Minutes(
  schedule: scheduleObjectType,
  day: string
): scheduleCheckoutObjectType[] {
  const d = new Date();
  const hoursNow = d.getHours();
  const minutesNow = d.getMinutes();
  const timeAfter15M = add15Min(hoursNow, minutesNow);
  const isCurrentTimeInSchedule = checkIfTimeInSchedule(schedule, hoursNow, minutesNow);
  const isCurrentTimePlus15InSchedule = checkIfTimeInSchedule(
    schedule,
    timeAfter15M.h,
    timeAfter15M.m
  );
  let arrayStartH = 0;
  let arrayStartM = 0;
  const arrayOf15Minutes: scheduleCheckoutObjectType[] = [];

  if (isCurrentTimePlus15InSchedule) {
    arrayStartH = hoursNow;
    arrayStartM = minutesNow;
  } else if (isCurrentTimeInSchedule) {
    //current time in schedule but shop will be closed in less than 15m
    arrayStartH = -2;
    arrayStartM = -2;
  } else {
    // shop is closed now
    arrayStartH = schedule.startH;
    arrayStartM = schedule.startM;
  }
  let condition = true;
  let newItemTime: { h: number; m: number };

  while (condition) {
    if (!arrayOf15Minutes.length) {
      // first element
      if (arrayStartH === -2) break; // skip this element
      newItemTime = add15Min(arrayStartH, arrayStartM);
      let con = checkIfTimeInSchedule(schedule, newItemTime.h, newItemTime.m);
      if (con) {
        let newItem: scheduleCheckoutObjectType = {
          day: day,
          hours: newItemTime.h,
          minutes: newItemTime.m,
        };
        arrayOf15Minutes.push(newItem);
      } else {
        // first item cant be put in the array
        // keep adding temp time until its out of schedule or "inside again?? i don't think so"
        arrayStartH = newItemTime.h;
        arrayStartM = newItemTime.m;
        if (arrayStartH > schedule.endH || arrayStartH) break;
      }
    } else {
      // already elements in the array : adding depends on the last element
      let lastItemHours = arrayOf15Minutes.at(-1)?.hours || 0;
      let lastItemMinutes = arrayOf15Minutes.at(-1)?.minutes || 0;
      newItemTime = add15Min(lastItemHours, lastItemMinutes);
      const con = checkIfTimeInSchedule(schedule, newItemTime.h, newItemTime.m);
      if (con) {
        let newItem: scheduleCheckoutObjectType = {
          day: day,
          hours: newItemTime.h,
          minutes: newItemTime.m,
        };
        arrayOf15Minutes.push(newItem);
      } else break;
    }
  }
  return arrayOf15Minutes;
}

function checkIfTimeInSchedule(
  singleSession: scheduleObjectType,
  h: number = -1,
  m: number = -1
): boolean {
  if (singleSession) {
    const res = isScheduleInTime(singleSession, h, m);
    if (res === true || res === false) return res;
  }
  return false;
}

function add15Min(h: number, m: number): { h: number; m: number } {
  let M, H;
  if (m < 45) {
    M = m + 15;
    H = h;
  } else {
    // m>=45
    if (h < 23) {
      M = m - 45; //-(45-m)
      H = h + 1;
    } else {
      // h>=23
      M = m - 45; //-(45-m)
      H = h - 23;
    }
  }
  return { h: H, m: M };
}
