import React, { useEffect, useState } from "react";
//import uuid from "react-uuid";

import { orderToDb } from "../../../types/types";
import AdminOrderConfirmationPrompt from "./adminOrderConfirmationPrompt";
import SinglePromptManager from "./singlePromptManager";
let startPromptCountDown: boolean = false;

export default function AllOrdersPromptManager({ socket }: any) {
  // handleHidePrompt();

  const [promptArrayState, setPromptArrayState] = useState<JSX.Element[]>([]);
  useEffect(() => {
    socket.on("new-order", (adminId: string, socketId: string, data: any) => {
      setPromptArrayState((prev) => [
        ...prev,
        <SinglePromptManager key={socketId} socket={socket} socketId={socketId} data={data} />,
      ]);
    });
  }, []);
  if (promptArrayState.length > 0)
    return <div id="shop-admin-order-confirmation-prompt">{promptArrayState}</div>;
  return <> </>;
}
