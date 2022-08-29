import { ShopObjectType } from "../../types/types";

//icons

import { IoTicketOutline } from "react-icons/io5";
import { BsCash } from "react-icons/bs";
import { AiFillEdit, AiOutlineCreditCard } from "react-icons/ai";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { BiPackage } from "react-icons/bi";
import { TbTruckDelivery } from "react-icons/tb";

export default function paymentMethods({ shopData }: { shopData: ShopObjectType }) {
  return (
    <div className="shop-payment-methods-flex-container">
      <div className="shop-single-payment-methods-flex-container">
        <p>Payment methods :</p>
        <div style={{ display: "flex" }}>
          {shopData.mdp.cc && (
            <AiOutlineCreditCard className="payment-methods-icons" title="Credit card payment" />
          )}
          {shopData.mdp.cash && <BsCash className="payment-methods-icons" title="Cash payment" />}
          {shopData.mdp.voucher && (
            <IoTicketOutline className="payment-methods-icons" title="bon dachat" />
          )}
          {shopData.mdp.check && (
            <AiFillEdit className="payment-methods-icons" title="payment cheque" />
          )}
        </div>
      </div>
      <div className="shop-single-payment-methods-flex-container">
        <p>Pickup options :</p>
        <div style={{ display: "flex" }}>
          {shopData.mdv.surplace && (
            <AiOutlineShoppingCart className="payment-methods-icons" title="service surplace" />
          )}
          {shopData.mdv.delivery && (
            <TbTruckDelivery className="payment-methods-icons" title="livraison" />
          )}
          {shopData.mdv.export && (
            <BiPackage className="payment-methods-icons" title="packaging " />
          )}
        </div>
      </div>
      <div></div>
    </div>
  );
}
