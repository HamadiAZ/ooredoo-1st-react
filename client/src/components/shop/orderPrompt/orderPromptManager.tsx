import React, { useEffect, useState } from "react";
import { orderToDb } from "../../../types/types";
import AdminOrderConfirmationPrompt from "./adminOrderConfirmationPrompt";
let startPromptCountDown: boolean = false;
export default function OrderPromptManager({ socket }: any) {
  const [showOrderConfirmationPrompt, setShowOrderConfirmationPrompt] = useState<boolean>(false);
  const [promptCountDown, setPromptCountDown] = useState<number>(57);
  const [orderStatus, setOrderStatus] = useState<string>("not-ordered");
  const [orderConfirmationPromptData, setOrderConfirmationPromptData] = useState<orderToDb>();
  const [lastClientOrderedId, setLastClientOrderedId] = useState<string>("");

  function togglePrompt(clientId: string, data: orderToDb) {
    setLastClientOrderedId(clientId);
    setShowOrderConfirmationPrompt(true);
    setOrderConfirmationPromptData(data);
    startPromptCountDown = true;
  }

  function handleDeclineOrder(): void {
    if (orderStatus === "accepted") return;
    //if already accepted : this button wont do anything
    setPromptCountDown(57);
    startPromptCountDown = false;
    socket.emit("order-confirmation", false, lastClientOrderedId);
    setOrderStatus("declined");
    setTimeout(() => {
      setShowOrderConfirmationPrompt(false);
      setOrderStatus("not-ordered");
    }, 4000);
  }
  function handleAcceptOrder(): void {
    if (orderStatus === "declined") return;
    //if already declined : this button wont do anything
    setPromptCountDown(57);
    startPromptCountDown = false;
    socket.emit("order-confirmation", true, lastClientOrderedId);
    setOrderStatus("accepted");
    setTimeout(() => {
      setShowOrderConfirmationPrompt(false);
      setOrderStatus("not-ordered");
    }, 4000);
  }
  useEffect(() => {
    let interval: any;
    if (startPromptCountDown) {
      interval = setInterval(() => {
        setPromptCountDown((seconds: number) => seconds - 1);
      }, 1000);

      if (promptCountDown < 0 && orderStatus !== "accepted") {
        clearInterval(interval);
        handleDeclineOrder();
      }
    }
    return () => clearInterval(interval);
  }, [startPromptCountDown, promptCountDown]);

  useEffect(() => {
    socket.on("new-order", (adminId: string, socketId: string, data: any) => {
      //console.log(" new order");
      //console.log(adminId, socketId, data);
      togglePrompt(socketId, data);
    });
  }, []);

  return (
    <>
      {showOrderConfirmationPrompt && (
        <AdminOrderConfirmationPrompt
          handleAcceptOrder={handleAcceptOrder}
          orderConfirmationPromptData={orderConfirmationPromptData}
          handleDeclineOrder={handleDeclineOrder}
          orderStatus={orderStatus}
          promptCountDown={promptCountDown}
        />
      )}
    </>
  );
}
