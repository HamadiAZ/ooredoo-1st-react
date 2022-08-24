import React from "react";
import { Link } from "react-router-dom";

export default function AutoAcceptedOrdersManager({ socket, shopId }: any) {
  return (
    <Link to="/haha">
      <div className="shop-warning-auto-accepted-orders-container">
        <p>WARNING : You have auto completed orders to Check</p>

        <p>click Here to View</p>
      </div>
    </Link>
  );
}
