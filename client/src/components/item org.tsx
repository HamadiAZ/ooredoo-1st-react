import React from "react";
import { IoTicketOutline } from "react-icons/io5";
import { BsCash } from "react-icons/bs";
import { AiFillEdit, AiOutlineCreditCard } from "react-icons/ai";

export default function Item(props: any): JSX.Element {
  return (
    <div id="item-root-inItem-div">
      <img src="https://www.commande-pizzatime.com/CESARWEB_WEB//repimage/83bbc4350c114000b0e2d6c4ff204215/2/PromoWeb.webp" />
      <div id="item-name-isopen-div">
        <p>PIZZA TIME</p>
        <p>OUVERT</p>
      </div>
      <div id="item-address-distance-div">
        <p>address</p>
        <p>distance</p>
      </div>
      <div>
        <IoTicketOutline className="payment-methods-icons" />
        <AiOutlineCreditCard className="payment-methods-icons" />
        <AiFillEdit className="payment-methods-icons" />
        <BsCash className="payment-methods-icons" />
      </div>
    </div>
  );
}
