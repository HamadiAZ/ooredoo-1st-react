//icons
import { AiFillDelete } from "react-icons/ai";
import { BiAlarmAdd } from "react-icons/bi";
import { BsCalendarDay } from "react-icons/bs";

export default function ScheduleInput({
  group_id,
  index,
  handleDeleteSchedule,
  schedule,
  partialCheckScheduleValue,
  handleScheduleInputChange,
  handleAddSchedule,
  handleAddScheduleGroup,
  handleDeleteGroup,
}: any) {
  return (
    <div className="schedule-input--full-inputs-icons-container">
      <input
        type="number"
        id={index}
        placeholder="start H "
        name="startH"
        value={schedule[index].startH}
        onChange={handleScheduleInputChange}
        className={
          partialCheckScheduleValue &&
          schedule[index].startH <= schedule[index].endH &&
          schedule[index].startH >= 0 &&
          schedule[index].startH <= 24
            ? "add-shop--horaire-input"
            : "add-shop--horaire-input-error"
        }
      ></input>
      <span>:</span>
      <input
        type="number"
        id={index}
        placeholder="start M"
        name="startM"
        value={schedule[index].startM}
        onChange={handleScheduleInputChange}
        className={
          partialCheckScheduleValue &&
          schedule[index].startH <= schedule[index].endH &&
          schedule[index].startM >= 0 &&
          schedule[index].startM <= 60
            ? "add-shop--horaire-input"
            : "add-shop--horaire-input-error"
        }
      ></input>
      <span> to</span>
      <input
        type="number"
        id={index}
        placeholder="end H"
        name="endH"
        value={schedule[index].endH}
        onChange={handleScheduleInputChange}
        className={
          partialCheckScheduleValue &&
          schedule[index].startH <= schedule[index].endH &&
          schedule[index].endH >= 0 &&
          schedule[index].endH <= 24
            ? "add-shop--horaire-input"
            : "add-shop--horaire-input-error"
        }
      ></input>
      <span>:</span>
      <input
        name="endM"
        type="number"
        id={index}
        placeholder="end M"
        value={schedule[index].endM}
        onChange={handleScheduleInputChange}
        className={
          partialCheckScheduleValue &&
          schedule[index].startH <= schedule[index].endH &&
          schedule[index].endM >= 0 &&
          schedule[index].endM <= 60
            ? "add-shop--horaire-input"
            : "add-shop--horaire-input-error"
        }
      ></input>
      {index === 0 ? (
        <>
          <BiAlarmAdd
            onClick={handleAddSchedule}
            style={{
              width: "1.7rem",
              height: "1.7rem",
              marginLeft: "1rem",
              cursor: "pointer",
            }}
          />
          {group_id === 0 ? (
            <BsCalendarDay
              onClick={handleAddScheduleGroup}
              style={{
                width: "1.7rem",
                height: "1.7rem",
                marginLeft: "1rem",
                cursor: "pointer",
              }}
            />
          ) : (
            <AiFillDelete
              style={{
                width: "1.7rem",
                height: "1.7rem",
                marginLeft: "1rem",
                cursor: "pointer",
              }}
              onClick={() => handleDeleteGroup(group_id)}
            />
          )}
        </>
      ) : (
        <AiFillDelete
          style={{
            width: "1.7rem",
            height: "1.7rem",
            marginLeft: "1rem",
            cursor: "pointer",
          }}
          onClick={() => handleDeleteSchedule(index)}
        />
      )}
    </div>
  );
}
