import { useEffect, useState } from "react";
import { orderFromDb, orderFromDbJsFormat } from "../../../types/types";
import Orders from "./orders";

export default function AutoAcceptedOrdersManager({ socket, shopId }: any) {
  const [viewAcceptedOrdersManager, setViewAcceptedOrdersManager] = useState<boolean>(false);

  const [orders, setOrders] = useState<orderFromDb[]>([]);

  useEffect(() => {
    getOrders();
  }, []);

  function getOrders(): void {
    socket.on("here-are-your-pending-orders-admin", (shopOrders: orderFromDb[]) => {
      if (shopOrders.length) {
        console.log(shopOrders);
        setOrders(shopOrders);
      }
      // if (orders) setOrders(orders);
    });
  }
  console.log(orders);
  if (!orders.length) return <></>;
  else
    return (
      <div>
        <div
          className="shop-warning-auto-accepted-orders-container"
          onClick={() => setViewAcceptedOrdersManager((prev) => !prev)}
        >
          <p>WARNING : You have auto completed orders to Check</p>

          <p>click Here to View</p>
        </div>
        {viewAcceptedOrdersManager && (
          <Orders shopId={shopId} socket={socket} orders={orders} setOrders={setOrders} />
        )}
        {viewAcceptedOrdersManager && (
          <div
            className="btn"
            style={{ margin: "0 auto" }}
            onClick={() => setViewAcceptedOrdersManager(false)}
          >
            Hide orders
          </div>
        )}
      </div>
    );
}
