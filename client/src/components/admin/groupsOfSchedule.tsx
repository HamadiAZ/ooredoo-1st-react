import { useState } from "react";
import ScheduleInput from "./scheduleInput";

import { scheduleObjectType, fullScheduleGroupType } from "../../types/types";

// icons

export default function GroupsOfSchedule({
  handleAddScheduleGroup,
  data,
  handleDeleteGroup,
  setFullSchedule,
}: {
  handleAddScheduleGroup: any;
  data: fullScheduleGroupType;
  handleDeleteGroup: (group_id: number) => void;
  setFullSchedule: any;
}): any {
  let scheduleArrayCounter = 0;

  let schedule: scheduleObjectType[] = data.schedule;

  const [isFullTime, setIsFullTime] = useState<boolean>(false);
  let days: any = { ...data.days };

  function partialCheckSchedule(): boolean {
    let lastHourValue = 0;
    let lastMinuteValue = 0;
    if (schedule) {
      for (let item of schedule) {
        if (item.startH === item.endH && item.startM === item.endM) {
          item.fulltime = true;
          return true;
        }
        if (item.startH < lastHourValue) return false;
        if (item.startH === item.endH && item.startM > item.endM) return false;
        if (item.startH === lastHourValue && item.startM < lastMinuteValue)
          return false;
        if (item.startH === lastHourValue && item.startM === lastMinuteValue)
          return false;
        lastHourValue = item.endH;
        lastMinuteValue = item.endM;
      }

      return true;
    }
    return false;
  }

  function fullScheduleCheckForSubmit(): boolean {
    if (!partialCheckSchedule()) return false;

    for (let item of schedule) {
      if (item.startH === item.endH && item.startM === item.endM) {
        item.fulltime = true;
        return true;
      }
      if (item.startH > item.endH) return false;
      if (item.startH > 24 || item.startH < 0) return false;
      if (item.endH > 24 || item.endH < 0) return false;
      if (item.endM > 60 || item.endM < 0) return false;
      if (item.startM > 60 || item.startM < 0) return false;
    }

    return true;
  }

  function handleJoursCheckChange(
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ): void {
    days = { ...days, [e.target.name]: !days[e.target.name] };
    let switchOthers: boolean = days[e.target.name] ? true : false;
    setFullSchedule((prev: any): void => {
      return prev.map((item: fullScheduleGroupType) => {
        if (item.id === data.id) {
          return { ...item, days: days };
        } else if (switchOthers) {
          //disCheck to same day on other items
          return {
            ...item,
            days: { ...item.days, [e.target.name]: false },
          };
        } else {
          return {
            ...item,
          };
        }
      });
    });
  }

  function checkIfFullTime(): void {
    for (let obj of schedule) {
      if (obj.fulltime) {
        return setIsFullTime(true);
      }
    }
    setIsFullTime(false);
  }
  function handleDeleteSchedule(index: number) {
    schedule = schedule.filter((item: any) => item !== schedule[index]);
    updateFullSchedule(schedule);
  }

  function handleAddSchedule(): void {
    let newSchedule: scheduleObjectType = {
      startH: 14,
      startM: 0,
      endH: 18,
      endM: 0,
      fulltime: false,
      index: schedule.length,
      currentOrNextOne:false,
    };
    schedule.push(newSchedule);
    updateFullSchedule(schedule);
  }
  console.log(data);
  function updateFullSchedule(schedule: scheduleObjectType[]): void {
    setFullSchedule((prev: any): void => {
      return prev.map((item: fullScheduleGroupType) => {
        if (item.id === data.id) {
          let isFormCorrect = fullScheduleCheckForSubmit();
          return { ...item, schedule: schedule, formCheck: isFormCorrect };
        } else return item;
      });
    });
  }

  async function handleScheduleInputChange(
    e: React.KeyboardEvent<HTMLInputElement>
  ) {
    schedule = schedule.map((item: scheduleObjectType) => {
      const target = e.target as HTMLInputElement;
      if (item.index === parseInt(target.id)) {
        return {
          ...item,
          [target.name]: parseInt(target.value),
        };
      } else return item;
    });

    //fulltime changing
    for (let scheduleObj of schedule) {
      if (
        scheduleObj.startH === scheduleObj.endH &&
        scheduleObj.startM === scheduleObj.endM
      ) {
        scheduleObj.fulltime = true;
      } else {
        scheduleObj.fulltime = false;
      }
    }

    updateFullSchedule(schedule);
    checkIfFullTime();
  }
  let partialCheckScheduleValue = partialCheckSchedule();

  return (
    <div className="schedule-single-group-container">
      <div className="add-shop--schedule-days-container">
        <span>jours:&nbsp;&nbsp; </span>
        <span>
          Lun
          <input
            name="mon"
            type="checkbox"
            checked={data.days.mon}
            onChange={(event) => {
              handleJoursCheckChange(event, data.id);
            }}
          />
        </span>
        <span>
          Mar
          <input
            name="tue"
            type="checkbox"
            checked={data.days.tue}
            onChange={(event) => {
              handleJoursCheckChange(event, data.id);
            }}
          />
        </span>
        <span>
          Mer
          <input
            name="wed"
            type="checkbox"
            checked={data.days.wed}
            onChange={(event) => {
              handleJoursCheckChange(event, data.id);
            }}
          />
        </span>
        <span>
          Jeu
          <input
            name="thu"
            type="checkbox"
            checked={data.days.thu}
            onChange={(event) => {
              handleJoursCheckChange(event, data.id);
            }}
          />
        </span>
        <span>
          Ven
          <input
            name="fri"
            type="checkbox"
            checked={data.days.fri}
            onChange={(event) => {
              handleJoursCheckChange(event, data.id);
            }}
          />
        </span>
        <span>
          Sam
          <input
            name="sat"
            type="checkbox"
            checked={data.days.sat}
            onChange={(event) => {
              handleJoursCheckChange(event, data.id);
            }}
          />
        </span>
        <span>
          Dim
          <input
            name="san"
            type="checkbox"
            checked={data.days.san}
            onChange={(event) => {
              handleJoursCheckChange(event, data.id);
            }}
          />
        </span>
      </div>
      <div>
        {isFullTime && <p style={{ color: "red" }}>opened for 24H !!</p>}
      </div>

      {schedule.map(() => {
        return (
          <ScheduleInput
            group_id={data.id}
            handleScheduleInputChange={handleScheduleInputChange}
            index={scheduleArrayCounter++}
            key={scheduleArrayCounter}
            schedule={data.schedule}
            partialCheckScheduleValue={partialCheckScheduleValue}
            handleAddSchedule={handleAddSchedule}
            handleDeleteSchedule={handleDeleteSchedule}
            handleAddScheduleGroup={handleAddScheduleGroup}
            handleDeleteGroup={handleDeleteGroup}
          />
        );
      })}
    </div>
  );
}
