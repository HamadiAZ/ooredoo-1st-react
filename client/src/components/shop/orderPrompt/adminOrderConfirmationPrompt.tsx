import React from "react";

export default function AdminOrderConfirmationPrompt({
  handleAcceptOrder,
  orderConfirmationPromptData,
  handleDeclineOrder,
  orderStatus,
  promptCountDown,
  autoAcceptSetting,
}: any): JSX.Element {
  return (
    <div id="shop-admin-single-order-confirmation-prompt">
      <h4 style={{ margin: "0.2rem auto" }}>New Order</h4>
      <hr style={{ width: "99.5%" }} />
      <table style={{ margin: "0.5rem 0" }}>
        <thead>
          <tr>
            <td>pickup date</td>
            <td>user name</td>
            <td>details</td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{orderConfirmationPromptData?.deliveryTime}</td>
            <td>{orderConfirmationPromptData?.userName}</td>
            <td>
              <button className="btn btn-small" style={{ margin: "0 auto" }}>
                view
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div className="prompt-two-buttons-container">
        <button
          className="btn btn-small"
          onClick={handleDeclineOrder}
          style={{ width: "fit-content" }}
        >
          decline{" "}
          {orderStatus === "not-ordered" && !autoAcceptSetting && "(" + promptCountDown + ")"}
        </button>
        <button className="btn btn-small buy" onClick={handleAcceptOrder}>
          accept {orderStatus === "not-ordered" && autoAcceptSetting && "(" + promptCountDown + ")"}
        </button>
      </div>
      <div>
        <h2 style={{ margin: "0 auto" }}>{orderStatus != "not-ordered" && orderStatus}</h2>
      </div>
    </div>
  );
}
