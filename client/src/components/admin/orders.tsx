import { useEffect, useState } from "react";
import Prompt from "./prompt";

import { MdDelete } from "react-icons/md";
import { orderFromDb } from "../../types/types";

export default function Orders({ globalPath }: { globalPath: string }) {
  const [orders, setOrders] = useState<orderFromDb[]>([]);
  const [promptState, setPromptState] = useState<{ show: boolean; order: any }>({
    show: false,
    order: {},
  });

  async function getOrders(): Promise<void> {
    try {
      let res = await fetch(globalPath + "/api/admin/getOrders", {
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      let data: orderFromDb[] = await res.json();
      console.log(data);

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
      const res = await fetch(globalPath + "/api/admin/DeleteOrder/" + item.order_id, {
        method: "PUT",
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

  useEffect(() => {
    getOrders();
  }, []);

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
