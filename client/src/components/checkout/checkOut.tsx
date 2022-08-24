import React, { useState, useReducer, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { ShopDataInit, daysOfWeek } from "../../const/const";

import {
  SelectorType,
  basketProductType,
  scheduleObjectType,
  scheduleCheckoutObjectType,
  Selector,
  ShopObjectJSONType,
  orderToDb,
  LoggedInState,
} from "../../types/types";
import OrderTableFilled from "./orderTableFilled";
import AuthContext from "../context/authContext";

const initialState: SelectorType = {
  inputTimeSelector: "init",
  inputMdpSelector: "cash",
  inputMdvSelector: "surplace",
  inputAddrSelector: "--",
};
let startCountingToRedirect: boolean = false;
let startCountingToConfirm: boolean = false;

const socket = io("http://localhost:5000");

export default function CheckOut({
  shoppingBasket,
  setShoppingBasket,
  globalPath,
}: {
  globalPath: string;
  shoppingBasket: basketProductType[];
  setShoppingBasket: React.Dispatch<React.SetStateAction<basketProductType[]>>;
}) {
  const basketCounter = shoppingBasket?.length || 0;

  const { loginStatus }: { loginStatus: LoggedInState; getLoginStatus: () => Promise<void> } =
    useContext(AuthContext);

  const [countdownAfterCheckoutCounter, setCountdownAfterCheckoutCounter] = useState<number>(60);
  const [countdownToRedirect, setCountdownToRedirect] = useState<number>(10);
  const [orderStatus, setOrderStatus] = useState<string>("not-ordered");
  const [shopData, setShopData] = useState<ShopObjectJSONType>(ShopDataInit);
  const [state, dispatch] = useReducer(reducer, initialState);
  const [orderId, setOrderId] = useState<string>("");

  const navigate = useNavigate();
  const shopId = useParams().shop_id;
  const newSelectorArray: scheduleCheckoutObjectType[] = generateSelector(shoppingBasket);

  let dataBody: orderToDb = {
    shopId: parseInt(shopId || "0"),
    userId: 1,
    userName: loginStatus.username || "none",
    mdp: state.inputMdpSelector,
    mdv: state.inputMdvSelector,
    deliveryTime: correctDBPickingUpDate(state.inputTimeSelector),
    deliveryAddr: state.inputAddrSelector,
    content: shoppingBasket.map((item) => {
      let copy: any = { ...item };
      delete copy.shopUpcomingSessions;
      return copy;
    }),
  };

  async function getShopData(shopId: number): Promise<void> {
    try {
      let res = await fetch(globalPath + "/api/getShopData/" + shopId);
      let data: any = await res.json();
      data = data[0];
      setShopData(data);
    } catch (error) {
      console.error(error);
    }
  }

  function reducer(state: SelectorType, action: any): SelectorType {
    switch (action.type) {
      case Selector.time:
        return { ...state, inputTimeSelector: action.payload };
      case Selector.mdp:
        return { ...state, inputMdpSelector: action.payload };
      case Selector.mdv:
        return { ...state, inputMdvSelector: action.payload };
      case Selector.addr:
        return { ...state, inputAddrSelector: action.payload };
      default:
        return state;
    }
  }

  function correctDBPickingUpDate(inputTimeSelector: string): string {
    let todayIndex: number = new Date().getDay();
    const today = daysOfWeek[todayIndex as keyof typeof daysOfWeek];
    let timePart: string = inputTimeSelector.slice(inputTimeSelector.indexOf("|") || 3);
    let dayPart: string = inputTimeSelector.slice(0, inputTimeSelector.indexOf("|") || 3);
    if (dayPart.length > 4) {
      //console.log("yes corrected");
      return today + timePart;
    }
    return dayPart + timePart;
  }

  async function handleOrder(): Promise<void> {
    setCountdownAfterCheckoutCounter(60);
    setCountdownToRedirect(20);
    setOrderStatus("waiting for admin confirmation");
    startCountingToConfirm = true;
    dataBody = {
      shopId: shoppingBasket[0].shopId,
      userId: 1,
      userName: loginStatus.username || "none",
      mdp: state.inputMdpSelector,
      mdv: state.inputMdvSelector,
      deliveryTime: correctDBPickingUpDate(state.inputTimeSelector),
      deliveryAddr: state.inputAddrSelector,
      content: shoppingBasket.map((item) => {
        let copy: any = { ...item };
        delete copy.shopUpcomingSessions;
        return copy;
      }),
    };
    setShoppingBasket([]);
    socket.emit("checkout-prompt-from-client", dataBody);
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

  function checkIfTimeInSchedule(
    singleSession: scheduleObjectType,
    h: number = -1,
    m: number = -1
  ): boolean {
    const d = new Date();
    // if no time giver , it will compare it to current time
    const hoursNow = d.getHours();
    const minutesNow = d.getMinutes();

    const hoursToCompare = h === -1 ? hoursNow : h; // hours given as parameters
    const minutesToCompare = h === -1 ? minutesNow : m;

    if (singleSession) {
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
        // time is 8:30 // session 8:20 =>8:30
        singleSession.startH == hoursToCompare &&
        hoursToCompare === singleSession.endH &&
        singleSession.startM < minutesToCompare &&
        singleSession.endM <= minutesToCompare
      )
        return true;
      if (
        // time is 8:30 // session 7:20 =>8:30
        singleSession.startH < hoursToCompare &&
        hoursToCompare === singleSession.endH &&
        singleSession.endM >= minutesToCompare
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
        // time 15:45 // session 15:10=>15:48
        singleSession.startH === hoursToCompare &&
        hoursToCompare === singleSession.endH &&
        singleSession.endM > minutesToCompare &&
        singleSession.startM < minutesToCompare
      )
        return true;
    }
    return false;
  }

  function generateSelector(shoppingBasket: basketProductType[]): scheduleCheckoutObjectType[] {
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

  async function ConfirmOrder(interval: any): Promise<void> {
    setOrderStatus(""); // to avoid redoing this fn again ( i had double uploads to db)
    if (interval) clearInterval(interval);
    setCountdownAfterCheckoutCounter(-1);
    try {
      const res = await fetch(globalPath + "/api/order/newOrder", {
        method: "POST",
        body: JSON.stringify(dataBody),
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const reply = await res.json();
      setOrderStatus(`order id : ${reply[0].order_id} has been confirmed , delivery time : ${reply[0].delivery_time}
      order full date: ${reply[0].created_at}`);
    } catch (error) {
      console.log(error);
    }
  }

  function CancelOrder(interval: any): void {
    if (interval) clearInterval(interval);
    setCountdownAfterCheckoutCounter(-1);
    setOrderStatus("Order declined by admin, shop is probably busy");
  }

  async function listenToAdminOrderConfirmation(): Promise<void> {
    socket.on("admins-availability", (onlineAdmins: string[], orderId: string) => {
      //console.log("admins-availability :", onlineAdmins);
      if (onlineAdmins.length) {
        setOrderId(orderId);
      } else {
        CancelOrder(0);
        setOrderStatus("Sorry , no admin is online to handle your Order");
        startCountingToRedirect = true;
      }
    });

    socket.on("order-confirmation-to-user", (isAccepted: boolean, clientId) => {
      setOrderStatus(isAccepted ? "accepted" : "declined");
    });
  }

  function CancelOrderAfterConfirmation(): void {
    socket.emit("cancel-order-after-sent", orderId, shopId);
  }

  useEffect(() => {
    startCountingToRedirect = false;
    startCountingToConfirm = false;

    shoppingBasket.length && getShopData(shoppingBasket[0].shopId);

    if (newSelectorArray.length) {
      let arr = newSelectorArray;
      // just to make the next payload line clear
      dispatch({
        type: Selector.time,
        payload: `${arr[0].day} | ${arr[0].hours} : ${arr[0].minutes}`,
      });
    }
  }, []);
  console.log(orderStatus);
  socket.on("pending-order-canceling-confirmation-to-checkout", (canceledOrderId: string) => {
    console.log("compare", orderId, canceledOrderId);
    console.log("to ", canceledOrderId);
    if (orderId == canceledOrderId) {
      console.log("canceled");
      CancelOrder(0);
      setOrderStatus("order canceled successfully by your request");
      startCountingToRedirect = true;
    }
  });

  useEffect(() => {
    let interval: any;
    if (startCountingToConfirm) {
      interval = setInterval(() => {
        if (countdownAfterCheckoutCounter < 1) {
          //timeout waiting for admin response
          setCountdownToRedirect(10); // less redirect waiting time
          setOrderStatus("admin didn't respond , order canceled");
          startCountingToRedirect = true;
        }
        setCountdownAfterCheckoutCounter((seconds: number) => seconds - 1);
      }, 1000);
      listenToAdminOrderConfirmation();
      if (orderStatus === "declined") CancelOrder(interval);
      if (orderStatus === "accepted") ConfirmOrder(interval);
    }

    if (countdownAfterCheckoutCounter < 0) clearInterval(interval);
    return () => clearInterval(interval);
  }, [startCountingToConfirm, countdownAfterCheckoutCounter]);

  useEffect(() => {
    let interval: any;
    if (startCountingToRedirect) {
      interval = setInterval(() => {
        if (countdownToRedirect < 1) {
          navigate(-1);
        }
        if (countdownToRedirect < 0) {
          // counter -1 : backup method !
          // navigate(-1) wont work if the checkout is opened in new window/tab
          // i still need to fix this store id
          navigate(/*i need to fix this /1:storeId/ to be dynamic*/ "/1/shops/" + shopId);
        }

        setCountdownToRedirect((seconds: number) => seconds - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [startCountingToRedirect, countdownToRedirect, countdownAfterCheckoutCounter < 1]);

  return (
    <main id="checkout-main-root-container">
      {basketCounter > 0 && <IfLoggedINRender />}
      {basketCounter <= 0 && orderStatus === "not-ordered" && <h1>empty card</h1>}
      <OrderFilled />
    </main>
  );
  function OrderFilled(): JSX.Element {
    if (orderStatus == "not-ordered") return <></>; // nothing
    if (countdownAfterCheckoutCounter < 1) return <RedirectingAfterCountdown />;
    return (
      <div>
        <h1>waiting for admin confirmation</h1>
        <h3>otherwise,order will be canceled in {countdownAfterCheckoutCounter}</h3>
        <h3>don't close this page or order will be canceled</h3>
        <button onClick={CancelOrderAfterConfirmation}>cancel order</button>
      </div>
    );
  }

  function RedirectingAfterCountdown(): JSX.Element {
    return (
      <div>
        <h3>{orderStatus}</h3>
        <p onClick={() => navigate(-1)} className="link">
          you will go back to shop in {countdownToRedirect}
        </p>

        <p
          onClick={() =>
            navigate(/*i need to fix this /1:storeId/ to be dynamic*/ "/1/shops/" + shopId)
          }
          className="link"
        >
          Or Click Here!
        </p>
      </div>
    );
  }

  function IfLoggedINRender(): JSX.Element {
    return loginStatus.isLoggedIn ? (
      <OrderTableFilled
        setShoppingBasket={setShoppingBasket}
        dispatch={dispatch}
        newSelectorArray={newSelectorArray}
        state={state}
        shopData={shopData}
        basketCounter={basketCounter}
        handleOrder={handleOrder}
        shoppingBasket={shoppingBasket}
      />
    ) : (
      <h1>Please Login or Register from the Menu on top right</h1>
    );
  }
}
