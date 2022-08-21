import React from "react";
import { ScheduleOfEveryDayType } from "../../types/types";

function ScheduleTable({
  scheduleOfEveryDay,
  styleSpanOfCurrentSchedule,
}: {
  scheduleOfEveryDay: ScheduleOfEveryDayType;
  styleSpanOfCurrentSchedule: any;
}) {
  // manage the days that are 24H opened !
  const modifiedSchedule: ScheduleOfEveryDayType = {
    mon: [],
    tue: [],
    wed: [],
    thu: [],
    fri: [],
    sat: [],
    san: [],
  };
  for (const [key, value] of Object.entries(scheduleOfEveryDay)) {
    console.log(key, value);
    let isIt24HoursSession = false;
    let thisDayContainTheActiveSession = false;
    for (const schedule of value) {
      if (schedule.fulltime) isIt24HoursSession = true;
      if (schedule.currentOrNextOne) thisDayContainTheActiveSession = true;
    }
    if (isIt24HoursSession) {
      const singleFullSession = {
        currentOrNextOne: thisDayContainTheActiveSession,
        endH: 24,
        endM: 0,
        fulltime: true,
        index: 0,
        startH: 0,
        startM: 0,
      };
      // this day has one single session now : from 00 to midnight
      modifiedSchedule[key as keyof ScheduleOfEveryDayType] = [singleFullSession];
    } else {
      // nothing changed in this day
      modifiedSchedule[key as keyof ScheduleOfEveryDayType] = value;
    }
  }

  console.log(modifiedSchedule);
  return (
    <div className="shop-div-schedule-root-container">
      {Object.keys(modifiedSchedule).map((dayKey) => {
        if (modifiedSchedule[dayKey as keyof ScheduleOfEveryDayType].length) {
          return (
            <div key={dayKey} className="shop-single-schedule-column-container">
              <p>{dayKey}</p>
              <ul>
                {modifiedSchedule[dayKey as keyof ScheduleOfEveryDayType].map(
                  (singleSchedule: any) => {
                    return (
                      <li key={singleSchedule.index}>
                        <span
                          style={
                            singleSchedule.currentOrNextOne
                              ? styleSpanOfCurrentSchedule
                              : { backgroundColor: "" }
                          }
                        >{`${singleSchedule.startH}:${singleSchedule.startM}-${singleSchedule.endH}:${singleSchedule.endM}`}</span>
                      </li>
                    );
                  }
                )}
              </ul>
            </div>
          );
        } else {
          return (
            <div key={dayKey} className="shop-single-schedule-column-container">
              <p>{dayKey}</p>
              <ul>
                <li>
                  <span>closed</span>
                </li>
              </ul>
            </div>
          );
        }
      })}
    </div>
  );
}

export default ScheduleTable;
