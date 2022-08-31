import { useContext, useEffect, useState } from "react";
import Prompt from "./prompt";

import { MdDelete } from "react-icons/md";
import { LoggedInState, orderFromDb } from "../../types/types";

import { daysOfWeek, globalPath } from "../../const/const";
import AuthContext from "../context/authContext";

export default function Orders() {
  const [orders, setOrders] = useState<orderFromDb[]>([]);
  const [promptState, setPromptState] = useState<{ show: boolean; order: any }>({
    show: false,
    order: {},
  });

  const { loginStatus }: { loginStatus: LoggedInState; getLoginStatus: () => Promise<void> } =
    useContext(AuthContext);

  async function getOrders(): Promise<void> {
    try {
      let res = await fetch(globalPath + "/api/client/getOrders/" + loginStatus.id, {
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      let data: orderFromDb[] = await res.json();
      setOrders(data);
    } catch (error) {
      console.error(error);
    }
  }

  function handleContentView(item: orderFromDb): void {
    setPromptState({ show: true, order: item });
  }

  async function handleDeleteItem(item: orderFromDb): Promise<void> {
    try {
      const res = await fetch(globalPath + "/api/client/DeleteOrder/" + item.order_id, {
        method: "PUT",
        body: JSON.stringify({ client_id: loginStatus.id }),
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      const reply = await res.json();
      setOrders(orders.filter((prevItem: typeof orders[0]) => prevItem.order_id !== item.order_id));
      console.log(reply, "deleted");
    } catch (error) {
      console.log(error);
    }
  }

  async function autoCancelOldOrders(): Promise<void> {
    let ordersUpdated = false;
    // console.log(orders);
    let ordersCopy: orderFromDb[] = orders.map((order: orderFromDb) => {
      if (!checkOrderPickupTime(order) && order.status === "pending confirmation") {
        const orderCopy: orderFromDb = { ...order };
        orderCopy.status = "auto Canceled";
        ordersUpdated = true;
        return orderCopy;
      }
      return order;
    });

    //if there is a modification => update db also
    if (!ordersUpdated) return;
    const updatedOrders = ordersCopy.filter((order) => order.status === "auto Canceled");
    console.log(updatedOrders);
    updateDb(updatedOrders);
  }

  function checkOrderPickupTime(order: orderFromDb): boolean {
    const d = new Date();
    const todayIndex: number = d.getDay();
    const DateNow: any = {
      day: daysOfWeek[todayIndex as keyof typeof daysOfWeek],
      hoursNow: d.getHours(),
      minutesNow: d.getMinutes(),
    };
    const orderStringTime = order.delivery_time.slice(4).split(":");
    const orderDate = {
      orderDay: order.delivery_time.slice(0, 3),
      orderH: parseInt(orderStringTime[0]),
      orderM: parseInt(orderStringTime[1]),
    };
    if (DateNow.day !== orderDate.orderDay) return false;
    if (DateNow.hoursNow > orderDate.orderH) return false;
    if (DateNow.hoursNow == orderDate.orderH && DateNow.minutesNow > orderDate.orderM) return false;
    return true;
  }

  async function updateDb(orders: orderFromDb[]): Promise<void> {
    console.log("sent to db");
    try {
      let res = await fetch(globalPath + "/api/client/updateClientOrdersStatus/", {
        method: "PUT",
        body: JSON.stringify(orders),
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }); // db success , now update page with data from db again
      // infinite loop if there is an error in updating :D
      getOrders();
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    getOrders();
  }, []);

  useEffect(() => {
    autoCancelOldOrders();
  }, [orders.length]);

  return (
    <main id="admin-page--main-container">
      {orders.length ? (
        <table>
          <thead>
            <tr>
              <th>id</th>
              <th>id shop</th>
              <th>user id </th>
              <th>name</th>
              <th>date</th>
              <th>paiement</th>
              <th>md vente</th>
              <th>status</th>
              <th>pick up date</th>
              <th>delivery address</th>
              <th>content</th>
              <th>delete</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((item: orderFromDb) => {
              return (
                <tr key={item.order_id}>
                  <td>{item.order_id}</td>
                  <td>{item.shop_id} </td>
                  <td>{item.user_id}</td>
                  <td>{item.user_name}</td>
                  <td>{item.created_at}</td>
                  <td>{item.mdp}</td>
                  <td>{item.mdv}</td>
                  <td>{item.status}</td>
                  <td>{item.delivery_time} </td>
                  <td>{item.delivery_addr}</td>
                  <td>
                    <p
                      className="btn buy btn-small"
                      style={{ minWidth: "7rem" }}
                      onClick={() => handleContentView(item)}
                    >
                      View Content
                    </p>
                  </td>
                  <td>
                    <MdDelete
                      onClick={() => handleDeleteItem(item)}
                      className="basket-delete-icon"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <h1>order table is empty</h1>
      )}
      {promptState.show && <Prompt promptState={promptState} setPromptState={setPromptState} />}
    </main>
  );
}
function daysOfWeekType(daysOfWeekType: any) {
  throw new Error("Function not implemented.");
}
