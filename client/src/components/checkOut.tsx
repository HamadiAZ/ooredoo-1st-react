import React, { useState, useReducer } from "react";
import { MdDelete } from "react-icons/md";

import {
  SelectorType,
  basketProductType,
  scheduleObjectType,
  scheduleCheckoutObjectType,
  Selector,
} from "../types/types";

const userName = "hammadi azaiez";
const mdpChosen = "cash";
const mdvChosen = "surplace";
const deliverTimeChosen = "10:10";
const addressChosen = "";

const initialState: SelectorType = {
  inputTimeSelector: "10:10",
  inputMdpSelector: "cash",
  inputMdvSelector: "surplace",
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

  const [orderStatus, setOrderStatus] = useState<string>("not-ordered");

  const [inputTimeSelector, setInputTimeSelector] = useState<string>("10:10");

  //onClick={() => dispatch({type: 'decrement'})}

  function reducer(state: SelectorType, action: any): SelectorType {
    switch (action.type) {
      case Selector.time:
        return { ...state, inputTimeSelector: action.payload };
      case Selector.mdp:
        return { ...state, inputMdpSelector: action.payload };
      case Selector.mdv:
        return { ...state, inputMdvSelector: action.payload };
      default:
        return state;
    }
  }
  const [state, dispatch] = useReducer(reducer, initialState);

  function handleDeleteItem(item: basketProductType): void {
    setShoppingBasket((prev: basketProductType[]) => {
      let newArray: basketProductType[] = [...prev];
      newArray = newArray.filter((product) => item.name !== product.name);
      return newArray;
    });
  }

  async function handleOrder(): Promise<void> {
    const dataBody = {
      shopId: 1,
      userId: 1,
      userName: userName,
      mdp: mdpChosen,
      mdv: mdvChosen,
      deliveryTime: deliverTimeChosen,
      deliveryAddr: addressChosen,
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

  const newSelectorArray: scheduleCheckoutObjectType[] = generateSelector(shoppingBasket);

  function generateSelector(shoppingBasket: basketProductType[]): scheduleCheckoutObjectType[] {
    const selectorArray: scheduleCheckoutObjectType[] = [];
    if (basketCounter) {
      const { shopUpcomingSessions } = shoppingBasket[0];
      const { day } = shopUpcomingSessions;
      for (const schedule of shopUpcomingSessions.schedule) {
        let newItems: scheduleCheckoutObjectType[] = getArraysOf15Minutes(schedule, day);
        selectorArray.push(...newItems);
      }
    }
    return selectorArray;
  }

  function getArraysOf15Minutes(schedule: scheduleObjectType, day: string): any[] {
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

  return (
    <main id="checkout-main-root-container">
      {basketCounter > 0 ? (
        <table>
          <thead>
            <tr style={{ fontWeight: "bold" }}>
              <td>name</td>
              <td>category</td>
              <td>marque</td>
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
                  {newSelectorArray.map((item: any) => {
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
                <p>select picking method :</p>
              </td>
              <td>
                <select name="select" value={state[Selector.mdv]} onChange={handleInputMdvSelector}>
                  {}
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
                <select name="select" value={state[Selector.mdp]} onChange={handleInputMdpSelector}>
                  {}
                </select>
              </td>
            </tr>
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
        <>{orderStatus === "not-ordered" ? <h1>empty card</h1> : <h3>{orderStatus}</h3>}</>
      )}
    </main>
  );
}
