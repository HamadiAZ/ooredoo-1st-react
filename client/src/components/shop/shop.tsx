import { useState, useEffect,useMemo ,useRef} from "react";
import { useParams } from "react-router-dom";

import { ShopObjectJSONType, ScheduleOfEveryDayType ,scheduleObjectType} from "../../types/types";
import { daysOfWeek } from "../../const/const";

import "../../styles/shop.css";
const initialState = {
  mon: [],
  tue: [],
  wed: [],
  thu: [],
  fri: [],
  sat: [],
  san: [],
};

export default function Shop({
  globalPath,
}: {
  globalPath: string;
}): JSX.Element {
  let { shopId } = useParams();

  let [currentScheduleIndex,currentDayIndex]=[0,""]
  const [shopData, setShopData] = useState<ShopObjectJSONType>({
    store_id: 9999,
    name: "looooool",
    address: { address: "a", lat: 1, long: 1 },
    mdv: {
      surplace: false,
      delivery: false,
      export: false,
    },
    mdp: {
      cash: false,
      check: false,
      voucher: false,
      cc: false,
    },
    schedule: []
  });

  const timesSpanRef=useRef(null);

  async function getShopData(): Promise<void> {
    try {
      let res = await fetch(globalPath + "/api/getShopData/" + shopId);
      let data: any = await res.json();
      data = data[0];
      setShopData(data);
    } catch (error) {
      console.error(error);
    }
  }

  const address = shopData ? shopData.address.address : 0;
  const long = shopData ? shopData.address.long : 0;
  const lat = shopData ? shopData.address.lat : 0;
  const name = shopData ? shopData.name : "";

  const d = new Date();

  function getCurrenDayAsString(): string {
    const dayNumber: number = d.getDay();

    return daysOfWeek[dayNumber as keyof typeof daysOfWeek];
  }
  function isShopOpenNow(): boolean {
    const hoursNow = d.getHours();
    const minutesNow = d.getMinutes();
    const currentDay: string = getCurrenDayAsString();
    if (shopData) {
      const { schedule } = shopData;
      for (let group of schedule) {
        if ((group.days as any)[currentDay]) {
          for (let singleSession of group.schedule) {
            if (
              singleSession.startH < hoursNow &&
              hoursNow < singleSession.endH
            )
              return true
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
          }
        }
      }
    }
    return false;
  }

  function getScheduleOfShop(): any {
    let ScheduleOfEveryDayConst: ScheduleOfEveryDayType = initialState;
    
      const { schedule } = shopData;
      for (let i = 0; i < 7; i++) {
        for (let group of schedule) {
          let dayOfWeek=daysOfWeek[i as keyof typeof daysOfWeek] as keyof typeof group.days
          
          if (group.days[dayOfWeek]) {
            let day= daysOfWeek[i as keyof typeof daysOfWeek] as keyof typeof ScheduleOfEveryDayConst
            const copyOfGroupSchedule=[];
            for (let item of group.schedule){
              copyOfGroupSchedule.push({...item}) // copy and not take the same reference
            }
            ScheduleOfEveryDayConst[day] = [...copyOfGroupSchedule]; 
          }
        }
      }
      const currentDay: string = getCurrenDayAsString();

      let currentDaySchedule=ScheduleOfEveryDayConst[currentDay as keyof typeof ScheduleOfEveryDayConst]
      if(isShopOpenNow()){ //green background somewhere
        currentDaySchedule.forEach((item)=>{
          if(checkIfItsCurrentScheduleActiveTime(item)){
            item.currentOrNextOne=true;
          }
          else {item.currentOrNextOne=false;
        }
        })
      }else{ // shop is closed now // blue background somewhere
        let dayIndex=d.getDay();
        const arrayOfUpcomingSessionsOfaDay:scheduleObjectType[]=[];
        for(let counter=0;counter<8;counter++){
          
            let day=daysOfWeek[dayIndex as keyof typeof daysOfWeek]; // current day
            //day index is actual day index corresponding to day position in the week;
            // counter just to ensure a full week loop
            let scheduleOfDay=ScheduleOfEveryDayConst[day as keyof typeof ScheduleOfEveryDayConst]
            let dayFound=false;
            
            if(scheduleOfDay.length) //only if the day has opened sessions
            {
              if(counter===0) { // current day 
                // find the next session
                  for(let singleSession of scheduleOfDay){
                    if(checkIfItWillOpenInThisSessionOfToday(singleSession)){
                      dayFound=true;
                      const singleSessionCopy={...singleSession};
                      arrayOfUpcomingSessionsOfaDay.push(singleSessionCopy);
                      console.log("item Added");
                    }
                  }
                  
              }else{ //upcoming days 
                //find the first session of the next DAY THAT THE SHOP IS OPENED AT
                for(let singleSession of scheduleOfDay){
                  if(singleSession){
                    console.log("found day");
                    dayFound=true;
                    
                    const daySessionCopy=[...scheduleOfDay];
                    arrayOfUpcomingSessionsOfaDay.push(...daySessionCopy);
                    break;
                  }
                }

              }
             
              if(dayFound) break;
             
            }
            dayIndex = dayIndex<6 ? dayIndex+1 : 0; //check the first day of the next week..
           
        }
        //find the minimum startH : first session 
        let orderTempArray=[]
        if(arrayOfUpcomingSessionsOfaDay.length){
          orderTempArray=arrayOfUpcomingSessionsOfaDay.map((item)=>item.startH)
          orderTempArray.sort();
          let nextStartH=orderTempArray[0];
          let scheduleToChange=getScheduleToChange(dayIndex,nextStartH);
          scheduleToChange.currentOrNextOne=true;
        }
      }
      function getScheduleToChange(dayIndex:number,nextStartH:number):scheduleObjectType{
        let day=daysOfWeek[dayIndex as keyof typeof daysOfWeek]; //
        let scheduleOfDay=ScheduleOfEveryDayConst[day as keyof typeof ScheduleOfEveryDayConst]
          
        let found=scheduleOfDay[0];
        return found;
    }
      function checkIfItWillOpenInThisSessionOfToday(singleSession:any):boolean{
        const hoursNow = d.getHours();
        const minutesNow = d.getMinutes();
        if(hoursNow<singleSession.endH) return true
        if(hoursNow===singleSession.endH && minutesNow<=singleSession.endM) return true
        return false;
      }
      function checkIfItsCurrentScheduleActiveTime(singleSession:any):boolean{
        const hoursNow = d.getHours();
        const minutesNow = d.getMinutes();
        if (
          singleSession.startH < hoursNow &&
          hoursNow < singleSession.endH
        )
          return true
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
        return false
      }

     return ScheduleOfEveryDayConst
  }

  
  useEffect(() => {
    getShopData();
  }, []);

  const scheduleOfEveryDay = useMemo(() => getScheduleOfShop(),[shopData]);
  
  //console.log(scheduleOfEveryDay)
  let styleSpanOfCurrentSchedule=isShopOpenNow() ? {backgroundColor:"green"} : {backgroundColor:"blue"} 
  return (
    <div>
      <h1>welcome to ooredoo {name} shop</h1>
      <p>
        {"our shop is now "}
        {isShopOpenNow() ? (
          <span style={{ color: "#02992a", fontWeight: "bold" }}>Open</span>
        ) : (
          <span style={{ color: "#b80000", fontWeight: "bold" }}>Close</span>
        )}
      </p>
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
      <div className="shop-div-double-items-flex-container">
        <iframe
          id="gmap_canvas"
          src={`https://maps.google.com/maps?q=${lat},${long}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
          frameBorder={0}
          scrolling="no"
          marginHeight={0}
          marginWidth={0}
        />

        <div className="div-card-text">
          <h4>About us</h4>
          <p>
            {" "}
            we are a small local shop in {name}, founded in 2013, we offer
            professional services , guaranteed products and refund
            <br />
            possibilities. contacts : +216 93111251 <br /> owner : hammadi
            azaiez
            <br />
            address : {address}
          </p>
        </div>
      </div>
    </div>
  );
}
