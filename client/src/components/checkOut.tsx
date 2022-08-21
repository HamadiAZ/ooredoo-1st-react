import React, { useState, useReducer, useEffect, useContext } from "react";
import { MdDelete } from "react-icons/md";
import { useNavigate, useParams } from "react-router-dom";

import { ShopDataInit, daysOfWeek } from "../const/const";

import {
  SelectorType,
  basketProductType,
  scheduleObjectType,
  scheduleCheckoutObjectType,
  Selector,
  ShopObjectJSONType,
  orderToDb,
  LoggedInState,
} from "../types/types";
import AuthContext from "./context/authContext";

let startCountingToRedirect: boolean = false;

const initialState: SelectorType = {
  inputTimeSelector: "init",
  inputMdpSelector: "cash",
  inputMdvSelector: "surplace",
  inputAddrSelector: "--",
};

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

  const [counter, setCounter] = useState<number>(10);
  const [orderStatus, setOrderStatus] = useState<string>("not-ordered");
  const [shopData, setShopData] = useState<ShopObjectJSONType>(ShopDataInit);
  const [state, dispatch] = useReducer(reducer, initialState);

  const shopId = useParams().shop_id;

  const newSelectorArray: scheduleCheckoutObjectType[] = generateSelector(shoppingBasket);

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

  function handleDeleteItem(item: basketProductType): void {
    setShoppingBasket((prev: basketProductType[]) => {
      let newArray: basketProductType[] = [...prev];
      newArray = newArray.filter((product) => item.name !== product.name);
      return newArray;
    });
  }

  function correctDBPickingUpDate(inputTimeSelector: string): string {
    let todayIndex: number = new Date().getDay();
    const today = daysOfWeek[todayIndex as keyof typeof daysOfWeek];
    let timePart: string = inputTimeSelector.slice(inputTimeSelector.indexOf("|") || 3);
    let dayPart: string = inputTimeSelector.slice(0, inputTimeSelector.indexOf("|") || 3);
    if (dayPart.length > 4) {
      console.log("yes corrected");
      return today + timePart;
    }
    return dayPart + timePart;
  }

  async function handleOrder(): Promise<void> {
    const dataBody: orderToDb = {
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
      //console.log(reply);
      startCountingToRedirect = true;
      setOrderStatus(`order id : ${reply[0].order_id} has been confirmed , delivery time : ${reply[0].delivery_time}
      order full date: ${reply[0].created_at}`);
      setShoppingBasket([]);
    } catch (error) {
      console.log(error);
    }
  }

  function handleQuantityChange(
    event: React.ChangeEvent<HTMLInputElement>,
    item: basketProductType
  ): void {
    setShoppingBasket((prev: basketProductType[]) => {
      let newArray: basketProductType[] = [...prev];
      for (const product of newArray) {
        if (product.name === item.name) {
          product.quantity = parseInt(event.target.value);
        }
      }
      return newArray;
    });
  }

  function handleAddressInput(event: React.ChangeEvent<HTMLInputElement>): void {
    dispatch({ type: Selector.addr, payload: event.target.value });
  }

  function handleInputTimeSelector(event: React.ChangeEvent<HTMLSelectElement>): void {
    dispatch({ type: Selector.time, payload: event.target.value });
  }
  function handleInputMdvSelector(event: React.ChangeEvent<HTMLSelectElement>): void {
    dispatch({ type: Selector.mdv, payload: event.target.value });
  }
  function handleInputMdpSelector(event: React.ChangeEvent<HTMLSelectElement>): void {
    dispatch({ type: Selector.mdp, payload: event.target.value });
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
      console.log(shopUpcomingSessions);
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

  useEffect(() => {
    if (shoppingBasket.length) getShopData(shoppingBasket[0].shopId);

    if (newSelectorArray.length) {
      let arr = newSelectorArray;
      dispatch({
        type: Selector.time,
        payload: `${arr[0].day} | ${arr[0].hours} : ${arr[0].minutes}`,
      });
    }
  }, []);

  const navigate = useNavigate();
  useEffect(() => {
    let interval: any;
    if (startCountingToRedirect) {
      interval = setInterval(() => {
        if (counter < 1) {
          navigate(-1);
        }
        if (counter < 0) {
          // counter -1 : backup method !
          // navigate(-1) wont work if the checkout is opened in new window/tab
          // i still need to fix this store id
          navigate(/*i need to fix this /1:storeId/ to be dynamic*/ "/1/shops/" + shopId);
        }

        setCounter((seconds: number) => seconds - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [startCountingToRedirect, counter]);

  return (
    <main id="checkout-main-root-container">
      {/* login 
      card has items => if logged => [can view] ELSE [prompt logging page and hide checkout]
      card empty => if ordered already => [view confirmation] ELSE  [INIT VALUE : <h1>empty card </h1>]
      */}
      {basketCounter > 0 ? (
        loginStatus.isLoggedIn ? (
          <table>
            <thead>
              <tr style={{ fontWeight: "bold" }}>
                <td>name</td>
                <td>category</td>
                <td style={{ width: "8rem" }}>marque</td>
                <td>quantity</td>
                <td>price</td>
                <td>total</td>
                <td>delete</td>
              </tr>
            </thead>
            <tbody>
              {shoppingBasket.map((item: basketProductType) => {
                return (
                  <tr key={item.name}>
                    <td>{item.name}</td>
                    <td>{item.category}</td>
                    <td>{item.manufacture}</td>
                    <td>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(event) => handleQuantityChange(event, item)}
                      ></input>
                    </td>
                    <td>{item.price}</td>
                    <td style={{ fontWeight: "bold" }}>{item.quantity * item.price}</td>
                    <td>
                      <MdDelete
                        onClick={() => handleDeleteItem(item)}
                        className="basket-delete-icon"
                      />
                    </td>
                  </tr>
                );
              })}
              <tr>
                <td>
                  <hr />
                </td>
                <td>
                  <hr />
                </td>
                <td>
                  <hr />
                </td>
                <td>
                  <hr />
                </td>
              </tr>
            </tbody>

            <tfoot>
              <tr style={{ fontWeight: "bold" }}>
                <td></td>
                <td></td>
                <td>TOTAL </td>
                <td>
                  {shoppingBasket.reduce(
                    (accumulator: number, value: basketProductType) =>
                      accumulator + value.quantity * value.price,
                    0
                  )}
                </td>
                <td>
                  <p>select picking time :</p>
                </td>
                <td>
                  <select
                    name="select"
                    value={state[Selector.time]}
                    onChange={handleInputTimeSelector}
                  >
                    {newSelectorArray.map((item: scheduleCheckoutObjectType) => {
                      return (
                        <option
                          key={item.hours + ":" + item.minutes}
                          value={item.hours + ":" + item.minutes}
                        >
                          {item.day + " | " + item.hours + ":" + item.minutes}
                        </option>
                      );
                    })}
                  </select>
                </td>
              </tr>
              <tr style={{ fontWeight: "bold" }}>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td>
                  <p>select payment method :</p>
                </td>
                <td>
                  <select
                    name="select"
                    value={state[Selector.mdp]}
                    onChange={handleInputMdpSelector}
                  >
                    {Object.keys(shopData.mdp).map((item: string) => {
                      if (shopData.mdp[item as keyof typeof shopData.mdp] === true) {
                        return (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        );
                      }
                    })}
                  </select>
                </td>
              </tr>
              <tr style={{ fontWeight: "bold" }}>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td>
                  <p>select picking method :</p>
                </td>
                <td>
                  <select
                    name="select"
                    value={state[Selector.mdv]}
                    onChange={handleInputMdvSelector}
                  >
                    {Object.keys(shopData.mdv).map((item: string) => {
                      if (shopData.mdv[item as keyof typeof shopData.mdv] === true) {
                        return (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        );
                      }
                    })}
                  </select>
                </td>
              </tr>
              {state.inputMdvSelector == "delivery" && (
                <tr style={{ fontWeight: "bold" }}>
                  <td></td>
                  <td></td>
                  <td>
                    <p>write your address :</p>
                  </td>
                  <td colSpan={3}>
                    <input
                      id="checkout-delivery-address-input"
                      name="input"
                      value={state[Selector.addr]}
                      onChange={handleAddressInput}
                    ></input>
                  </td>
                  <td></td>
                </tr>
              )}

              <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td>
                  {basketCounter > 0 ? (
                    <div className="btn btn-small buy" onClick={handleOrder}>
                      Order
                    </div>
                  ) : (
                    <div className="btn btn-small warning">Checkout</div>
                  )}
                </td>
              </tr>
            </tfoot>
          </table>
        ) : (
          <h1>Please Login or Register from the Menu on top right</h1>
        )
      ) : (
        <>
          {orderStatus === "not-ordered" ? (
            <h1>empty card</h1>
          ) : (
            <div>
              <h3>{orderStatus}</h3>
              <p onClick={() => navigate(-1)} className="link">
                you will go back to shop in {counter}
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
          )}
        </>
      )}
    </main>
  );
}
