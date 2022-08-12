import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { IoTicketOutline } from "react-icons/io5";
import { BsCash } from "react-icons/bs";
import { AiFillEdit, AiOutlineCreditCard } from "react-icons/ai";
import { AiOutlineShoppingCart } from "react-icons/ai";

import { BiPackage } from "react-icons/bi";
import { TbTruckDelivery } from "react-icons/tb";
export default function Item({
  data,
  storePath,
  selectedItem,
}: any): JSX.Element {
  const [distance, setDistance] = useState(0);

  const options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-RapidAPI-Key": "85ca2c7300msh8ac55003079c1aep19f161jsnbd239aabbf19",
      "X-RapidAPI-Host": "distance-calculator.p.rapidapi.com",
    },
  };

  let isOpen: boolean = true;
  let shopAddress = data.address || {
    long: 0,
    alt: 0,
    adress: null,
  };

  useEffect(() => {
    getDistance(
      selectedItem.latitude,
      selectedItem.longitude,
      shopAddress.lat,
      shopAddress.long
    );
  }, [selectedItem]);

  async function getDistance(
    lat1: number,
    long1: number,
    lat2: number,
    long2: number
  ) {
    /*     try {
      let res = await fetch(
        `https://distance-calculator.p.rapidapi.com/distance/simple?lat_1=${lat1}&long_1=%20${long1}&lat_2=${lat2}&long_2=${long2}&decimal_places=2`,
        options
      );
      let APIdata = await res.json();
      setDistance(APIdata.distance);
      console.log(APIdata.distance);
    } catch (error) {
      console.error(error);
    } */
  }

  /*   0:
  endH: 10
  endM: 0
  fulltime: true
  index: 0
  startH: 8
  startM: 0
  [[Prototype]]: Object
  1:
  endH: 17
  endM: 0
  index: 1
  startH: 13 */
  const d = new Date();
  function getCurrenDayAsString(): string {
    const dayNumber: number = d.getDay();
    const daysOfWeek: any = {
      0: "san",
      1: "mon",
      2: "tue",
      3: "wed",
      4: "thu",
      5: "fri",
      6: "sat",
    };
    return daysOfWeek[dayNumber];
  }
  function isShopOpen(): boolean {
    const hoursNow = d.getHours();
    const minutesNow = d.getMinutes();
    const currentDay = getCurrenDayAsString();
    const { schedule } = data;

    for (let group of schedule) {
      if (group.days[currentDay]) {
        let isOpen: boolean = false;
        for (let singleSession of group.schedule) {
          if (singleSession.startH < hoursNow && hoursNow < singleSession.endH)
            return true;
          if (
            // time is 9:10 // session 9:20 =>9:30
            singleSession.startH === hoursNow &&
            hoursNow < singleSession.endH &&
            singleSession.startM > minutesNow
          )
            return false;
          if (
            // time is 9:10 // session 8:20 =>9:30
            singleSession.startH < hoursNow &&
            hoursNow == singleSession.endH &&
            singleSession.endM > minutesNow
          )
            return true;
          if (
            // time is 8:30 // session 8:20 =>9:30
            singleSession.startH == hoursNow &&
            hoursNow < singleSession.endH &&
            singleSession.startM < minutesNow
          )
            return true;
          if (
            // time 15:45 // session 15:10=>15:40
            singleSession.startH <= hoursNow &&
            hoursNow === singleSession.endH &&
            singleSession.endM < minutesNow
          )
            return false;
          if (
            // time 15:45 // session 15:10=>15:40
            singleSession.startH === hoursNow &&
            hoursNow === singleSession.endH &&
            singleSession.endM > minutesNow &&
            singleSession.startM < minutesNow
          )
            return true;
        }
      }
    }
    return false;
  }

  return (
    <Link to={`/${data.store_id || 0}/shops/${data.id || 0}`}>
      <div id="store-item-root-inItem-div">
        <div id="store-item-list-in-store--image-container">
          <img
            id="store-item-list-in-store--image"
            src={storePath + "/shops/inStoreItemImage.jpg"}
          />
        </div>
        <div id="store-item-name-isopen-div">
          <p>{data.name || null + " shop"}</p>
          <p>{isShopOpen() ? "OUVERT" : "FERME"}</p>
        </div>
        <div id="store-item-address-distance-div">
          <p>{shopAddress.address}</p>
          <p>{distance + " km"}</p>
        </div>
        <div>
          {data.mdp.cc && (
            <AiOutlineCreditCard
              className="payment-methods-icons"
              title="Credit card payment"
            />
          )}
          {data.mdp.cash && (
            <BsCash className="payment-methods-icons" title="Cash payment" />
          )}
          {data.mdp.voucher && (
            <IoTicketOutline
              className="payment-methods-icons"
              title="bon dachat"
            />
          )}
          {data.mdp.check && (
            <AiFillEdit
              className="payment-methods-icons"
              title="payment cheque"
            />
          )}
        </div>
        <div>
          {data.mdv.surplace && (
            <AiOutlineShoppingCart
              className="payment-methods-icons"
              title="service surplace"
            />
          )}
          {data.mdv.delivery && (
            <TbTruckDelivery
              className="payment-methods-icons"
              title="livraison"
            />
          )}
          {data.mdv.export && (
            <BiPackage className="payment-methods-icons" title="packaging " />
          )}
        </div>
      </div>
    </Link>
  );
}
