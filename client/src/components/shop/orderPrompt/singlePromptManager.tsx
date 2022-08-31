import React, { useEffect, useState } from "react";
import { orderToDb } from "../../../types/types";
import AdminOrderConfirmationPrompt from "./adminOrderConfirmationPrompt";
let startPromptCountDown: boolean = false;

export default function SinglePromptManager({
  shopId,
  socket,
  socketId,
  data,
  orderId,
  handleHidePrompt,
  autoAcceptSetting,
  sendTimeInSeconds,
}: {
  shopId: number;
  socket: any;
  socketId: string;
  data: orderToDb;
  orderId: string;
  handleHidePrompt: (arg: string) => void;
  autoAcceptSetting: boolean;
  sendTimeInSeconds: number;
}) {
  const [showOrderConfirmationPrompt, setShowOrderConfirmationPrompt] = useState<boolean>(false);
  const [promptCountDown, setPromptCountDown] = useState<number>(57);
  const [orderStatus, setOrderStatus] = useState<string>("not-ordered");
  const [orderConfirmationPromptData, setOrderConfirmationPromptData] = useState<orderToDb>();
  const [clientId, setClientId] = useState<string>("");

  function togglePrompt(clientId: string, data: orderToDb) {
    setClientId(clientId);
    setShowOrderConfirmationPrompt(true);
    setOrderConfirmationPromptData(data);
    const checkoutOrderTimeout = 59; //seconds when waiting for admin
    const timeNowInSec = Math.round(Date.now() / 1000);
    const countdownSecondsSynced = checkoutOrderTimeout - (timeNowInSec - sendTimeInSeconds);
    // if when the order was sent , sendTimeInSeconds is 10000100 seconds (from 1970)
    // received here late by 5 seconds , timeNowInSec is 10000105 sec
    // the countdown started with checkoutOrderTimeout : 59seconds
    // so when order is received here , countdown in checkout page is out of sync by 5 sec : 54seconds
    // we calculate the countdown to start with here by : 59 - (10000105-10000100) = 54seconds= countdownSecondsSynced
    setPromptCountDown(countdownSecondsSynced);
    //  setPromptCountDown(57); // old version
    startPromptCountDown = true;
  }

  function handleDeclineOrder(): void {
    if (orderStatus === "accepted") return;
    //if already accepted : this button wont do anything

    setPromptCountDown(57);
    startPromptCountDown = false;
    socket.emit("order-confirmation", false, clientId, orderId, shopId);
    setOrderStatus("declined");
    setTimeout(() => {
      handleHidePrompt(orderId);
      setShowOrderConfirmationPrompt(false);
      setOrderStatus("not-ordered");
    }, 4000);
  }

  function handleAcceptOrder(): void {
    if (orderStatus === "declined") return;
    //if already declined : this button wont do anything
    setPromptCountDown(57);
    startPromptCountDown = false;
    socket.emit("order-confirmation", true, clientId, orderId, shopId);
    setOrderStatus("accepted");
    setTimeout(() => {
      handleHidePrompt(orderId);
      setShowOrderConfirmationPrompt(false);
      setOrderStatus("not-ordered");
    }, 4000);
  }

  useEffect(() => {
    togglePrompt(socketId, data);
  }, []);

  useEffect(() => {
    let interval: any;
    if (startPromptCountDown) {
      interval = setInterval(() => {
        setPromptCountDown((seconds: number) => seconds - 1);
      }, 1000);

      if (promptCountDown < 0 && orderStatus !== "accepted" && orderStatus !== "declined") {
        clearInterval(interval);
        !autoAcceptSetting && setOrderStatus("auto declined");
        autoAcceptSetting && setOrderStatus("auto accepted");
        setTimeout(() => {
          handleHidePrompt(orderId);
          setShowOrderConfirmationPrompt(false);
          setOrderStatus("not-ordered");
        }, 4000);
      }
    }
    return () => clearInterval(interval);
  }, [startPromptCountDown, promptCountDown]);

  return (
    <>
      {showOrderConfirmationPrompt && (
        <AdminOrderConfirmationPrompt
          handleAcceptOrder={handleAcceptOrder}
          orderConfirmationPromptData={orderConfirmationPromptData}
          handleDeclineOrder={handleDeclineOrder}
          orderStatus={orderStatus}
          promptCountDown={promptCountDown}
          autoAcceptSetting={autoAcceptSetting}
        />
      )}
    </>
  );
}
