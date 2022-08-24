import { useEffect, useState } from "react";

import { orderToDb } from "../../../types/types";
import SinglePromptManager from "./singlePromptManager";

export default function AllOrdersPromptManager({ socket, shopId }: any) {
  //
  const [promptArrayState, setPromptArrayState] = useState<JSX.Element[]>([]);

  function handleHidePrompt(orderId: string): void {
    setPromptArrayState((prev) => {
      return prev.filter((singlePrompt) => singlePrompt.key != orderId);
    });
  }

  useEffect(() => {
    socket.on(
      "new-order-to-shop-admins",
      (adminId: string, socketId: string, data: orderToDb, orderId: string) => {
        setPromptArrayState((prev) => [
          ...prev,
          <SinglePromptManager
            key={orderId}
            shopId={shopId}
            orderId={orderId}
            socket={socket}
            socketId={socketId}
            data={data}
            handleHidePrompt={handleHidePrompt}
          />,
        ]);
      }
    );

    socket.on("cancel-pending-order-admin", (orderId: string, clientId: string) => {
      //console.log("cancel-pending-order-admin", orderId);
      setPromptArrayState((prev) => {
        const prevArrayLength = prev.length;

        const newFiltered = prev.filter((prompt) => prompt.key != orderId);

        if (newFiltered.length < prevArrayLength) {
          // order canceled on admin side!

          socket.emit("pending-order-canceling-confirmation", orderId, clientId);
        }

        return newFiltered;
      });
    });
  }, []);
  if (promptArrayState.length > 0)
    return <div id="shop-admin-order-confirmation-prompt">{promptArrayState}</div>;
  return <> </>;
}
