import { useEffect, useState } from "react";

export default function Orders({ globalPath }: { globalPath: string }) {
  const [orders, setOrders] = useState<any>([]);

  async function getOrders(): Promise<void> {
    try {
      let res = await fetch(globalPath + "/api/admin/getOrders/");
      let data: any = await res.json();
      setOrders(data);
    } catch (error) {
      console.error(error);
    }
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
            <th>name</th>
            <th> number of shop</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((item: any) => {
            return (
              <tr key={item.order_id}>
                <td>{item.shop_id}</td>
                <td>{item.user_id}</td>
                <td>{item.mdp}</td>
                <td>{item.mdv}</td>
                <td>{item.created_at}</td>
                <td>{item.delivery_addr}</td>
                <td>{item.user_name}</td>
                <td>{item.delivery_time /* content */}</td>
                <td>{item.delivery_time}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </main>
  );
}
