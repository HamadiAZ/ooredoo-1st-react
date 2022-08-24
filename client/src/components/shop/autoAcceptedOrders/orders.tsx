import { useEffect, useState } from "react";
import Prompt from "./prompt";

import { MdDelete } from "react-icons/md";
import { orderFromDbJsFormat } from "../../../types/types";
import { globalPath } from "../../../const/const";

export default function Orders({
  shopId,
  socket,
  orders,
}: {
  shopId: number;
  socket: any;
  orders: [string, orderFromDbJsFormat][];
}) {
  const [promptState, setPromptState] = useState<{
    show: boolean;
    order: any;
  }>({
    show: false,
    order: {},
  });

  function handleContentView(item: orderFromDbJsFormat): void {
    setPromptState({ show: true, order: item });
  }

  async function handleDeleteItem(orderId: string): Promise<void> {
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
      //setOrders(orders.filter((prevItem: typeof orders[0]) => prevItem.orderId !== item.order_id));
      console.log(reply, "deleted");
    } catch (error) {
      console.log(error);
    }
  }

  //getOrders();

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
              <th>pick up date</th>
              <th>delivery address</th>
              <th>content</th>
              <th>delete</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((item: [string, orderFromDbJsFormat]) => {
              return (
                <tr key={item[1].orderId}>
                  <td>{item[1].orderId}</td>
                  <td>{item[1].shopId} </td>
                  <td>{item[1].userId}</td>
                  <td>{item[1].userName}</td>
                  <td>{item[1].mdp}</td>
                  <td>{item[1].mdv}</td>
                  <td>{item[1].deliveryTime} </td>
                  <td>{item[1].deliveryAddr}</td>
                  <td>
                    <p
                      className="btn buy btn-small"
                      style={{ minWidth: "7rem" }}
                      onClick={() => handleContentView(item[1])}
                    >
                      View Content
                    </p>
                  </td>
                  <td>
                    <MdDelete
                      onClick={() => handleDeleteItem(item[0])}
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
