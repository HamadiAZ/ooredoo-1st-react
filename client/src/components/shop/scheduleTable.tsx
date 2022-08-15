import React from 'react'

function ScheduleTable({scheduleOfEveryDay,styleSpanOfCurrentSchedule}:any) {
  return (
    <div className="shop-div-schedule-root-container">
        {Object.keys(scheduleOfEveryDay).map((item) => {
          if (
            scheduleOfEveryDay[item as keyof typeof scheduleOfEveryDay].length
          ) {
            return (
              <div key={item} className="shop-single-schedule-column-container">
                <p>{item}</p>
                <ul>
                  {scheduleOfEveryDay[
                    item as keyof typeof scheduleOfEveryDay
                  ].map((item: any) => {
                    return (
                      <li key={item.index}>
                        <span style={item.currentOrNextOne ? styleSpanOfCurrentSchedule : {backgroundColor:""}}>{`${item.startH}:${item.startM}-${item.endH}:${item.endM}`}</span>
                      </li>
                    );
                    // we have to change spans background color
                  })}
                </ul>
              </div>
            );
          } else {
            return (
              <div key={item} className="shop-single-schedule-column-container">
                <p>{item}</p>
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
  )
}

export default ScheduleTable