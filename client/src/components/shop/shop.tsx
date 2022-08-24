import { useState, useEffect, useMemo, useContext } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";

import ScheduleTable from "./scheduleTable";
import ProductMenu from "./productMenu";

import {
  ShopObjectJSONType,
  ScheduleOfEveryDayType,
  scheduleObjectType,
  singleProductObjectType,
  basketProductType,
  daysOfWeekType,
  LoggedInState,
} from "../../types/types";

import { daysOfWeek, ShopDataInit, products } from "../../const/const";

import "../../styles/shop.css";
import PaymentMethods from "./paymentMethods";
import AuthContext from "../context/authContext";
import AllOrdersPromptManager from "./orderPrompt/allOrdersPromptManager";
import AutoAcceptedOrdersManager from "./autoAcceptedOrders/autoAcceptedOrdersManager";

const initialState = {
  mon: [],
  tue: [],
  wed: [],
  thu: [],
  fri: [],
  sat: [],
  san: [],
};
const socket = io("localhost:5000");

export default function Shop({
  globalPath,
  shoppingBasket,
  setShoppingBasket,
}: {
  globalPath: string;
  shoppingBasket: any;
  setShoppingBasket: (arg: any) => any;
}): JSX.Element {
  let { shopId } = useParams();

  let upcomingDaySessions: scheduleObjectType[] = [];

  const [upcomingSessions, setUpcomingSessions] = useState<{
    day: string;
    schedule: scheduleObjectType[];
  }>({ day: "", schedule: [] });

  const [shopData, setShopData] = useState<ShopObjectJSONType>(ShopDataInit);

  const { loginStatus }: { loginStatus: LoggedInState; getLoginStatus: () => Promise<void> } =
    useContext(AuthContext);

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

  function getProductInfo(productName: string): {
    category: string;
    manufacture: string;
  } {
    let category: string = "";
    let manufacture: string = "";
    for (const menu of products) {
      category = menu.category;
      for (const subMenu of menu.subMenus) {
        manufacture = subMenu.manufacture;
        for (const product of subMenu.products) {
          if (product.name === productName)
            return {
              category: category,
              manufacture: manufacture,
            };
        }
      }
    }
    return {
      category: "",
      manufacture: "",
    };
  }

  function handleAddToCard(item: singleProductObjectType): void {
    const newItemInfo = getProductInfo(item.name);
    const newItem: basketProductType = {
      product_id: item.id,
      name: item.name,
      category: newItemInfo.category,
      manufacture: newItemInfo.manufacture,
      price: item.price,
      quantity: 1,
      quantityLeft: item.quantity,
      shopId: parseInt(shopId || "0"),
      shopUpcomingSessions: upcomingSessions,
    };
    if (!checkIfBasketContainElementFromOtherShops()) {
      setShoppingBasket((prev: basketProductType[]) => {
        const arrayOfProductNames: string[] = prev.map((item: basketProductType) => item.name);

        if (arrayOfProductNames.includes(item.name)) {
          //if it exist : add quantity +1
          const copyOfArray = [...prev];
          const indexOfObjectToModifyQuantity = copyOfArray.findIndex((object) => {
            return object.product_id === item.id;
          });
          copyOfArray[indexOfObjectToModifyQuantity] = {
            ...copyOfArray[indexOfObjectToModifyQuantity],
            quantity: copyOfArray[indexOfObjectToModifyQuantity].quantity + 1,
          };
          return [...copyOfArray];
        } else {
          // add it with 1 quantity
          return [...prev, newItem];
        }
      });
    } else {
      // basket contains elements from other shops
      alert(
        "you cant add items from different shops, complete your order first or delete items in the basket"
      );
    }
  }

  function checkIfBasketContainElementFromOtherShops(): boolean {
    if (!shoppingBasket.length) return false; // basket empty
    if (shoppingBasket[0].shopId !== parseInt(shopId || shoppingBasket[0].shopId)) return true;
    //shopId || shoppingBasket[0].shopId so if the first one is undefined dont block the code
    return false;
  }

  const address = shopData ? shopData.address.address : 0;
  const long = shopData ? shopData.address.long : 0;
  const lat = shopData ? shopData.address.lat : 0;
  const name = shopData ? shopData.name : "";

  const d = new Date();

  let styleSpanOfCurrentSchedule = isShopOpenNow()
    ? { backgroundColor: "#42c966", color: "white" }
    : { backgroundColor: "#424dc9", color: "white" };

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
        let dayOfWeek = daysOfWeek[i as keyof typeof daysOfWeek] as keyof typeof group.days;

        if (group.days[dayOfWeek]) {
          let day = daysOfWeek[
            i as keyof typeof daysOfWeek
          ] as keyof typeof ScheduleOfEveryDayConst;
          const copyOfGroupSchedule = [];
          for (let item of group.schedule) {
            copyOfGroupSchedule.push({ ...item }); // copy and not take the same memory reference
          }
          ScheduleOfEveryDayConst[day] = [...copyOfGroupSchedule];
        }
      }
    }
    const currentDay: string = getCurrenDayAsString();

    let currentDaySchedule =
      ScheduleOfEveryDayConst[currentDay as keyof typeof ScheduleOfEveryDayConst];
    if (isShopOpenNow()) {
      //green background somewhere

      let index = -1;
      let startingIndex = 0;
      currentDaySchedule.forEach((item) => {
        index++;
        if (checkIfItsCurrentScheduleActiveTime(item) || item.fulltime) {
          startingIndex = index;
          item.currentOrNextOne = true;
        } else {
          item.currentOrNextOne = false;
        }
      });
      let tempUpcomingSchedule = [];
      for (let i = startingIndex; i < currentDaySchedule.length; i++) {
        tempUpcomingSchedule.push(currentDaySchedule[i]);
      }

      setUpcomingSessions({
        // for checkout Page
        day: "today",
        schedule: [...tempUpcomingSchedule],
      });
    } else {
      // shop is closed now // blue background somewhere
      let dayIndex = d.getDay();
      const arrayOfUpcomingSessionsOfaDay: scheduleObjectType[] = [];

      for (let counter = 0; counter < 8; counter++) {
        let day = daysOfWeek[dayIndex as keyof typeof daysOfWeek]; // current day
        //day index is actual day index corresponding to day position in the week;
        // counter just to ensure a full week loop
        let scheduleOfDay = ScheduleOfEveryDayConst[day as keyof typeof ScheduleOfEveryDayConst];
        let dayFound = false;

        if (scheduleOfDay.length) {
          //only if the day has opened sessions
          if (counter === 0) {
            // current day
            // find the next session

            let previousSessionsOfTodayCounter = -1; // for setUpcomingSessions
            // for adding to basket

            for (let singleSession of scheduleOfDay) {
              if (checkIfItWillOpenInThisSessionOfToday(singleSession)) {
                dayFound = true;
                const singleSessionCopy = { ...singleSession };
                arrayOfUpcomingSessionsOfaDay.push(singleSessionCopy);
              } else previousSessionsOfTodayCounter++; // for setUpcomingSessions
            }

            // previousSessionsOfTodayCounter: count how many session already gone today
            // so we dont give them as an option when ordering
            let index = 0;
            // index : will ignore the first sessions
            let nextSchedulesOfToday: scheduleObjectType[] = [];
            if (dayFound) {
              for (let singleSession of scheduleOfDay) {
                if (index > previousSessionsOfTodayCounter) {
                  //add the upcoming sessions only
                  //if time now 10 and there is session 8-9 of today
                  //dont add it
                  nextSchedulesOfToday.push(singleSession);
                }
                index++;
              }

              setUpcomingSessions({
                day: "today",
                schedule: [...nextSchedulesOfToday],
              });
            } else {
              setUpcomingSessions({
                day: "today",
                schedule: [...currentDaySchedule],
              });
            }
          } else {
            //upcoming days
            //find the first session of the next DAY THAT THE SHOP IS OPENED AT
            for (let singleSession of scheduleOfDay) {
              if (singleSession) {
                setUpcomingSessions({
                  day: day,
                  schedule: [...currentDaySchedule],
                });
                dayFound = true;
                const daySessionCopy = [...scheduleOfDay];
                arrayOfUpcomingSessionsOfaDay.push(...daySessionCopy);

                break;
              }
            }
          }
          if (dayFound) break;
        }
        dayIndex = dayIndex < 6 ? dayIndex + 1 : 0; //check the first day of the next week..
      }
      //find the minimum startH : first session

      let orderTempArrayOfStartH = [];
      if (arrayOfUpcomingSessionsOfaDay.length) {
        orderTempArrayOfStartH = arrayOfUpcomingSessionsOfaDay.map((item) => item.startH);
        //console.log("not ordered", orderTempArrayOfStartH);
        orderTempArrayOfStartH.sort((a, b) => {
          if (a > b) return 1;
          if (a < b) return -1;
          return 0;
        });
        upcomingDaySessions = orderTempArrayOfStartH.map(
          (item) =>
            arrayOfUpcomingSessionsOfaDay[
              arrayOfUpcomingSessionsOfaDay.findIndex((x) => x.startH === item)
            ]
        );

        //if (returnUpcomingScheduleArrayInsted) return upcomingDaySessions;

        // lets make the next schedule sttus true :
        let nextStartH = orderTempArrayOfStartH[0];

        let scheduleToChange = getScheduleToChange(
          dayIndex,
          nextStartH,
          daysOfWeek,
          ScheduleOfEveryDayConst
        );
        scheduleToChange.currentOrNextOne = true; // done

        //console.log("upcoming sessions", upcomingDaySessions);

        //associate the day to his schedule

        setUpcomingSessions((prev) => {
          return { ...prev, schedule: upcomingDaySessions };
        });
      }
    }

    return ScheduleOfEveryDayConst;
  }

  function getScheduleToChange(
    dayIndex: number,
    nextStartH: number,
    daysOfWeek: daysOfWeekType,
    ScheduleOfEveryDayConst: ScheduleOfEveryDayType
  ): scheduleObjectType {
    let day = daysOfWeek[dayIndex as keyof typeof daysOfWeek]; //
    let scheduleOfDay = ScheduleOfEveryDayConst[day as keyof typeof ScheduleOfEveryDayConst];

    let found = scheduleOfDay.filter((item: scheduleObjectType) => item.startH === nextStartH);
    // array of single item
    return found[0];
  }

  function checkIfItWillOpenInThisSessionOfToday(singleSession: any): boolean {
    const hoursNow = d.getHours();
    const minutesNow = d.getMinutes();
    if (hoursNow < singleSession.endH) return true;
    if (hoursNow === singleSession.endH && minutesNow <= singleSession.endM) return true;
    return false;
  }

  function checkIfItsCurrentScheduleActiveTime(singleSession: any): boolean {
    const hoursNow = d.getHours();
    const minutesNow = d.getMinutes();
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
    return false;
  }

  const scheduleOfEveryDay = useMemo(() => getScheduleOfShop(), [shopData]);

  //socket

  useEffect(() => {
    if (loginStatus.isLoggedIn && loginStatus.privilege === "admin") {
      console.log("admin");
      socket.emit("shop-admin-is-online", parseInt(shopId || "0"));
    }
  }, [loginStatus.isLoggedIn]);

  useEffect(() => {
    getShopData();
  }, []);

  return (
    <div>
      <AllOrdersPromptManager socket={socket} shopId={shopId} />

      {loginStatus.privilege === "admin" && (
        <AutoAcceptedOrdersManager socket={socket} shopId={shopId} />
      )}

      <h1>welcome to ooredoo {name} shop</h1>
      <p>
        {"our shop is now "}
        {isShopOpenNow() ? (
          <span style={{ color: "#02992a", fontWeight: "bold" }}>Opened</span>
        ) : (
          <span style={{ color: "#b80000", fontWeight: "bold" }}>Closed</span>
        )}
      </p>

      <ScheduleTable
        scheduleOfEveryDay={scheduleOfEveryDay}
        styleSpanOfCurrentSchedule={styleSpanOfCurrentSchedule}
      />

      <PaymentMethods shopData={shopData} />

      <ProductMenu handleAddToCard={handleAddToCard} />

      <div className="shop-div-double-items-flex-container">
        {/*  <iframe
            id="gmap_canvas"
            src={`https://maps.google.com/maps?q=${lat},${long}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
            frameBorder={0}
            scrolling="no"
            marginHeight={0}
            marginWidth={0}
          /> */}

        <div className="div-card-text">
          <h4>About us</h4>
          <p>
            {" "}
            we are a small local shop in {name}, founded in 2013, we offer professional services ,
            guaranteed products and refund
            <br />
            possibilities. contacts : +216 93111251 <br /> owner : hammadi azaiez
            <br />
            address : {address}
          </p>
        </div>
      </div>
    </div>
  );
}
