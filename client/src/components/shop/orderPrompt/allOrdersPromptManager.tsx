import { useContext, useEffect, useState } from "react";

import { orderToDb } from "../../../types/types";
import AuthContext from "../../context/authContext";
import SinglePromptManager from "./singlePromptManager";

export default function AllOrdersPromptManager({ socket, shopId }: any) {
  const [promptArrayState, setPromptArrayState] = useState<JSX.Element[]>([]);

  function handleHidePrompt(orderId: string): void {
    setPromptArrayState((prev) => {
      return prev.filter((singlePrompt) => singlePrompt.key != orderId);
    });
  }

  const { loginStatus } = useContext(AuthContext);

  useEffect(() => {
    socket.on(
      "new-order-to-shop-admins",
      (
        adminId: string,
        socketId: string,
        data: orderToDb,
        orderId: string,
        autoAcceptSetting: boolean,
        sendTimeInSeconds: number
      ) => {
        console.log("client send time ", sendTimeInSeconds);
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
            autoAcceptSetting={autoAcceptSetting}
            sendTimeInSeconds={sendTimeInSeconds}
          />,
        ]);
      }
    );

    socket.on("cancel-pending-order-admin", (orderId: string, clientId: string) => {
      console.log("cancel", orderId);
      setPromptArrayState((prev) => {
        const newFiltered = prev.filter((prompt) => prompt.key != orderId);
        return newFiltered;
      });
    });
  }, []);

  if (promptArrayState.length > 0 && loginStatus.isLoggedIn && loginStatus.privilege === "admin")
    return <div id="shop-admin-order-confirmation-prompt">{promptArrayState}</div>;

  return <> </>;
}
