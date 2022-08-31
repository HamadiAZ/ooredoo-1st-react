import React, { useState, useReducer, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { ShopDataInit, daysOfWeek } from "../../const/const";

import OrderTableFilled from "./orderTableFilled";
import AuthContext from "../context/authContext";
import { generateSelector } from "./timeSelector";
import {
  SelectorType,
  basketProductType,
  scheduleCheckoutObjectType,
  Selector,
  ShopObjectType,
  orderToDb,
  LoggedInState,
} from "../../types/types";

//     parameters  /////////////////////////////////////////////
// admin confirmation wait time in seconds
const adminConfirmationTimeOut: number = 60;

// redirecting after order confirmation
const redirectingTimeout: number = 20;

////////////////////////////////////////////////////////////////

const initCountdown = redirectingTimeout + adminConfirmationTimeOut;

const initialState: SelectorType = {
  inputTimeSelector: "init",
  inputMdpSelector: "cash",
  inputMdvSelector: "surplace",
  inputAddrSelector: "--",
};
let startCounting: boolean = false;
let orderContentToDb: orderToDb;
let OfflineOrder: boolean = false;
let uploadToDbForUseEffect: boolean = false;
let adminsOnline: boolean = false;
let uploaderToDbConfirmationInfo: string = "";

export const socket = io("http://localhost:5000");

type PropsType = {
  globalPath: string;
  shoppingBasket: basketProductType[];
  setShoppingBasket: React.Dispatch<React.SetStateAction<basketProductType[]>>;
};

export default function CheckOut({
  shoppingBasket,
  setShoppingBasket,
  globalPath,
}: PropsType): JSX.Element {
  const basketCounter = shoppingBasket.length;

  const { loginStatus }: { loginStatus: LoggedInState; getLoginStatus: () => Promise<void> } =
    useContext(AuthContext);

  const [finalCountdown, setFinalCountdown] = useState<number>(initCountdown);
  const [orderStatus, setOrderStatus] = useState<string>("not-ordered");
  const [shopData, setShopData] = useState<ShopObjectType>(ShopDataInit);
  const [selectorState, dispatch] = useReducer(reducer, initialState);
  const [orderId, setOrderId] = useState<string>("");

  const navigate = useNavigate();
  const shopId = useParams().shop_id;
  const newSelectorArray: scheduleCheckoutObjectType[] = generateSelector(
    shoppingBasket,
    basketCounter
  );
  let dataBody: orderToDb = getLatesOrderData();

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

  function reducer(selectorState: SelectorType, action: any): SelectorType {
    switch (action.type) {
      case Selector.time:
        return { ...selectorState, inputTimeSelector: action.payload };
      case Selector.mdp:
        return { ...selectorState, inputMdpSelector: action.payload };
      case Selector.mdv:
        return { ...selectorState, inputMdvSelector: action.payload };
      case Selector.addr:
        return { ...selectorState, inputAddrSelector: action.payload };
      default:
        return selectorState;
    }
  }

  function correctDBPickingUpDate(inputTimeSelector: string): string {
    let todayIndex: number = new Date().getDay();
    const today = daysOfWeek[todayIndex as keyof typeof daysOfWeek];
    let timePart: string = inputTimeSelector.slice(inputTimeSelector.indexOf("|") || 3);
    let dayPart: string = inputTimeSelector.slice(0, inputTimeSelector.indexOf("|") || 3);
    if (dayPart.length > 4) {
      return today + timePart;
    }
    return dayPart + timePart;
  }

  async function sendOrderToDb(orderStatus: string = "", changeOrderStatus: boolean = true) {
    orderContentToDb.status = orderStatus || "pending confirmation";
    try {
      const res = await fetch(globalPath + "/api/order/newOrder", {
        method: "POST",
        body: JSON.stringify(orderContentToDb),
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const reply = await res.json();
      uploaderToDbConfirmationInfo = `order id : ${reply[0].order_id} has been confirmed ,
      delivery time : ${reply[0].delivery_time}
     order full date: ${reply[0].created_at}
     `;
      changeOrderStatus &&
        setOrderStatus(`order id : ${reply[0].order_id} has been confirmed ,
          delivery time : ${reply[0].delivery_time}
         order full date: ${reply[0].created_at}
         `);
    } catch (error) {
      console.log(error);
    }
  }

  function listenToAdminSockets(): void {
    socket.on(
      "admins-availability",
      (onlineAdmins: string[], acceptOrderIfNoOnlineAdmin: boolean) => {
        //console.log("admins-availability :", onlineAdmins);
        adminsOnline = !!onlineAdmins.length;
        console.log("offline order", acceptOrderIfNoOnlineAdmin);
        if (onlineAdmins.length || acceptOrderIfNoOnlineAdmin) {
          OfflineOrder = acceptOrderIfNoOnlineAdmin;
        }
      }
    );
    socket.on("order-id-for-client", (orderIdFromBackend: string) => {
      setOrderId(orderIdFromBackend);
    });
    socket.on("order-confirmation-to-user", (isAccepted: boolean) => {
      const acceptedOrDeclinedAlready = orderStatus === "accepted" || orderStatus === "declined";
      let isOrdered = orderStatus !== "not-ordered";
      const orderCanceledAlready: boolean =
        orderStatus === "order canceled successfully by your request";
      // accept or decline one single time
      if (
        acceptedOrDeclinedAlready === false &&
        orderCanceledAlready === false &&
        isOrdered === true
      ) {
        console.log("i went to status ", isAccepted);
        setFinalCountdown(redirectingTimeout - 1);
        if (isAccepted === true) {
          uploadToDbForUseEffect = true;
          setShoppingBasket([]); // empty basket only if accepted
          setOrderStatus("accepted");
        } else {
          setOrderStatus("declined");
        }
      }
    });
  }

  function getLatesOrderData(): orderToDb {
    return {
      shopId: parseInt(shopId || "0"),
      userId: loginStatus.id,
      userName: loginStatus.username || "none",
      mdp: selectorState.inputMdpSelector,
      mdv: selectorState.inputMdvSelector,
      deliveryTime: correctDBPickingUpDate(selectorState.inputTimeSelector),
      deliveryAddr: selectorState.inputAddrSelector,
      status: "processing",
      content: shoppingBasket.map((item) => {
        let copy: any = { ...item };
        delete copy.shopUpcomingSessions;
        return copy;
      }),
    };
  }

  function CancelOrderAfterConfirmation(): void {
    socket.emit("from-client--cancel-order-after-sent", orderId, shopId);
    setOrderStatus("order canceled successfully by your request");
    setFinalCountdown(redirectingTimeout);
  }

  async function handleOrder(): Promise<void> {
    dataBody = getLatesOrderData();
    orderContentToDb = dataBody;
    console.log("when ordering", dataBody);
    startCounting = true;
    if (adminsOnline) {
      setFinalCountdown(initCountdown);
      const sendTimeInSeconds = Math.round(Date.now() / 1000);
      socket.emit("checkout-prompt-from-client", dataBody, sendTimeInSeconds);
      setOrderStatus("waiting for admin confirmation");
      return;
    }

    if (!adminsOnline && OfflineOrder) {
      await sendOrderToDb("pending confirmation");
      setFinalCountdown(redirectingTimeout);
      setOrderStatus((prev) => prev + "\n no admin were online , your order was Auto-completed");
      setShoppingBasket([]);
      return;
    }
    if (!adminsOnline && !OfflineOrder) {
      setFinalCountdown(redirectingTimeout);
      setOrderStatus("Sorry , no admin is online to handle your Order , try again later");
      return;
    }
  }

  useEffect(() => {
    socket.emit("from-client--req-admins-array", shopId);
  }, [shoppingBasket]);

  useEffect(() => {
    if (uploadToDbForUseEffect === true) sendOrderToDb("accepted", false);
    uploadToDbForUseEffect = false;
  }, [uploadToDbForUseEffect]);

  useEffect(() => {
    if (shoppingBasket.length !== 0) {
      getShopData(shoppingBasket[0].shopId);
    }
    if (newSelectorArray.length !== 0) {
      // arr variable: just to make the next payload line clear
      let arr = newSelectorArray;
      dispatch({
        type: Selector.time,
        payload: `${arr[0].day} | ${arr[0].hours} : ${arr[0].minutes}`,
      });
    }
  }, []);

  useEffect(() => {
    socket.connect();
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    listenToAdminSockets();
  }, [, orderStatus]);

  function manageOrderStatesAfterConfirmation() {
    console.log(orderStatus);
    const waitingAdmin = orderStatus === "waiting for admin confirmation";
    const acceptedOrDeclined = orderStatus === "accepted" || orderStatus === "declined";
    let ordered = orderStatus !== "not-ordered";
    if (ordered && waitingAdmin && finalCountdown <= redirectingTimeout && !acceptedOrDeclined) {
      // SWITCHING FROM WAITING ADMIN TIME TO REDIRECTING when admins are online
      //will be executed one single time cuz status will change here
      console.log("everything is here");
      if (!OfflineOrder) setOrderStatus("admin didn't respond , order canceled");
      if (OfflineOrder) {
        // he waited but order still considered offline order ! auto completed
        sendOrderToDb("pending confirmation");
        setOrderStatus(
          (prev) => prev + "\n order AUTO COMPLETED , admin didn't respond , shop is probably busy"
        );
        setShoppingBasket([]);
      }
    }
  }

  useEffect(() => {
    let interval: any;
    if (startCounting) {
      interval = setInterval(() => {
        manageOrderStatesAfterConfirmation();
        // redirecting
        if (finalCountdown < 1) navigate(-1);
        if (finalCountdown < 0) {
          // counter -1 : backup method ! navigate(-1) wont work if the checkout is opened in new window/tab
          navigate(/*i need to fix this /1:storeId/ to be dynamic*/ "/1/shops/" + shopId);
        }
        //
        setFinalCountdown((seconds: number) => seconds - 1);
      }, 1000);
    }
    if (finalCountdown < 0) clearInterval(interval);
    return () => clearInterval(interval);
  }, [startCounting, finalCountdown]);

  // conditions
  let isOrdered = orderStatus !== "not-ordered";
  const isBasketEmpty = basketCounter <= 0;

  return (
    <main id="checkout-main-root-container">
      {/*  not ordered yet and there are items => table Order details are shown if client logged in */}
      {isOrdered === false && isBasketEmpty === false && <TableOrderDetailsOrLogin />}
      {/*  not ordered yet and there are no items => empty card */}
      {isOrdered === false && isBasketEmpty === true && <h1>empty card</h1>}
      {/* ordered */}
      {isOrdered === true && finalCountdown > redirectingTimeout && <WaitingAdminConfirmation />}
      {isOrdered === true && finalCountdown <= redirectingTimeout && <RedirectingAfterCountdown />}
    </main>
  );

  function WaitingAdminConfirmation(): JSX.Element {
    return (
      <div>
        <h1>waiting for admin confirmation</h1>
        <h3>
          otherwise,order will be {OfflineOrder ? "auto-completed" : "canceled"} in{" "}
          {finalCountdown - redirectingTimeout}
        </h3>
        <h3>don't close this page or order will be canceled</h3>
        <button onClick={CancelOrderAfterConfirmation}>cancel order</button>
      </div>
    );
  }

  function RedirectingAfterCountdown(): JSX.Element {
    return (
      <div>
        {orderStatus === "accepted" && (
          <>
            <h1>order accepted by admin</h1>
            <h3>{!!uploaderToDbConfirmationInfo && uploaderToDbConfirmationInfo}</h3>
          </>
        )}
        {orderStatus === "declined" && "Order declined by admin, shop is probably busy"}
        {orderStatus !== "declined" && orderStatus !== "accepted" && <h3>{orderStatus}</h3>}
        <p onClick={() => navigate(-1)} className="link">
          you will go back to shop in {finalCountdown}
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

  function TableOrderDetailsOrLogin(): JSX.Element {
    return loginStatus.isLoggedIn ? (
      <OrderTableFilled
        setShoppingBasket={setShoppingBasket}
        dispatch={dispatch}
        newSelectorArray={newSelectorArray}
        selectorState={selectorState}
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
