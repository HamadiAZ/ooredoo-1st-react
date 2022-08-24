import React, { useEffect, useState } from "react";
import { orderToDb } from "../../../types/types";
import AdminOrderConfirmationPrompt from "./adminOrderConfirmationPrompt";
import SinglePromptManager from "./singlePromptManager";
let startPromptCountDown: boolean = false;

export default function AllOrdersPromptManager({ socket }: any) {
  return (
    <>
      <SinglePromptManager socket={socket} />
    </>
  );
}
