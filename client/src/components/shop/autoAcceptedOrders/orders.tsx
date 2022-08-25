import React, { useEffect, useState } from "react";
import Prompt from "./prompt";

import { MdDelete } from "react-icons/md";
import { orderFromDb, orderToDb } from "../../../types/types";
import { globalPath } from "../../../const/const";
import { IoCloudDoneOutline } from "react-icons/io5";
import { AiOutlineCloseCircle } from "react-icons/ai";

export default function Orders({
  shopId,
  socket,
  orders,
  setOrders,
}: {
  shopId: number;
  socket: any;
  orders: orderFromDb[];
  setOrders: React.Dispatch<React.SetStateAction<typeof orders>>;
}) {
  const [promptState, setPromptState] = useState<{
    show: boolean;
    order: any;
  }>({
    show: false,
    order: {},
  });

  function handleContentView(item: orderFromDb): void {
    setPromptState({ show: true, order: item });
  }

  async function handleDeleteItem(orderId: number): Promise<void> {
    try {
      const res = await fetch(globalPath + "/api/admin/DeleteOrder/" + orderId, {
        method: "PUT",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      const reply = await res.json();
      setOrders(orders.filter((prevItem: orderFromDb) => prevItem.order_id != orderId));
      console.log(reply, "deleted");
    } catch (error) {
      console.log(error);
    }
  }

  async function handleModifyOrder(orderId: number, orderStatus: string): Promise<void> {
    try {
      const res = await fetch(globalPath + "/api/admin/ModifyOrder", {
        method: "PUT",
        body: JSON.stringify({ orderId, orderStatus }),
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      await res.json();
      setOrders(orders.filter((prevItem: orderFromDb) => prevItem.order_id != orderId));
    } catch (error) {
      console.log(JSON.stringify(error));
    }
  }

  //getOrders();
  console.log(orders);
  return (
    <main id="shop-admin-pending-orders-container">
      {orders.length ? (
        <table>
          <thead>
            <tr>
              <th>id</th>
              <th>id shop</th>
              <th>user id </th>
              <th>name</th>
              <th>paiement</th>
              <th>md vente</th>
              <th>status</th>
              <th>pick up date</th>
              <th>delivery address</th>
              <th>content</th>
              <th>finish</th>
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

                  <td
                    style={{
                      display: "flex",

                      alignItems: "center",
                      height: "3rem",
                    }}
                  >
                    <IoCloudDoneOutline
                      onClick={() => handleModifyOrder(item.order_id, "accepted")}
                      className="basket-delete-icon"
                      title="Accept"
                    />
                    <AiOutlineCloseCircle
                      title="Decline"
                      onClick={() => handleModifyOrder(item.order_id, "declined")}
                      className="basket-delete-icon"
                    />
                  </td>
                  <td>
                    <MdDelete
                      onClick={() => handleDeleteItem(item.order_id)}
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
