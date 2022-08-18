import { useEffect, useState } from "react";
import Prompt from "./prompt";

export default function Orders({ globalPath }: { globalPath: string }) {
  const [orders, setOrders] = useState<any>([]);
  const [promptState, setPromptState] = useState<{ show: boolean; order: any }>({
    show: false,
    order: {},
  });

  async function getOrders(): Promise<void> {
    try {
      let res = await fetch(globalPath + "/api/admin/getOrders/");
      let data: any = await res.json();
      setOrders(data);
    } catch (error) {
      console.error(error);
    }
  }

  function handleContentView(item: any): void {
    setPromptState({ show: true, order: item });
  }

  useEffect(() => {
    getOrders();
  }, []);

  console.log(orders);
  return (
    <main id="admin-page--main-container">
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
          </tr>
        </thead>

        <tbody>
          {orders.map((item: any) => {
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
              </tr>
            );
          })}
        </tbody>
      </table>
      {promptState.show && <Prompt promptState={promptState} setPromptState={setPromptState} />}
    </main>
  );
}
