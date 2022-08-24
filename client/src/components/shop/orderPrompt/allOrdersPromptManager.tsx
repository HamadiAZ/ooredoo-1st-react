import React, { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";

import { orderToDb } from "../../../types/types";
import SinglePromptManager from "./singlePromptManager";

export default function AllOrdersPromptManager({ socket }: any) {
  function handleHidePrompt(orderId: string): void {
    setPromptArrayState((prev) => {
      return prev.filter((singlePrompt) => singlePrompt.key != orderId);
    });
  }

  const [promptArrayState, setPromptArrayState] = useState<JSX.Element[]>([]);
  useEffect(() => {
    socket.on("new-order", (adminId: string, socketId: string, data: orderToDb) => {
      const newOrderId = uuid();
      setPromptArrayState((prev) => [
        ...prev,
        <SinglePromptManager
          key={newOrderId}
          orderId={newOrderId}
          socket={socket}
          socketId={socketId}
          data={data}
          handleHidePrompt={handleHidePrompt}
        />,
      ]);
    });
  }, []);
  if (promptArrayState.length > 0)
    return <div id="shop-admin-order-confirmation-prompt">{promptArrayState}</div>;
  return <> </>;
}
