import { useEffect, SetStateAction } from "react";
import { Link } from "react-router-dom";

import { daysOfWeek } from "../../const/const";
//icons
import { IoTicketOutline } from "react-icons/io5";
import { BsCash } from "react-icons/bs";
import { AiFillEdit, AiOutlineCreditCard } from "react-icons/ai";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { BiPackage } from "react-icons/bi";
import { TbTruckDelivery } from "react-icons/tb";
//types
import { ShopObjectWithDistanceIncluded } from "../../types/types";
import { isScheduleInTime } from "../functions/functions";
type selectedLocationType = {
  latitude: number;
  longitude: number;
  name: string;
  label: string;
};
type propsType = {
  numberOfShops: number;
  data: ShopObjectWithDistanceIncluded;
  storePath: string;
  selectedLocation: selectedLocationType;
  setShops: React.Dispatch<SetStateAction<ShopObjectWithDistanceIncluded[]>>;
  distancesForEveryShop: { [key: number]: number };
  shops: ShopObjectWithDistanceIncluded[];
};
export default function Item({
  numberOfShops,
  data,
  storePath,
  selectedLocation,
  setShops,
  distancesForEveryShop,
  shops,
}: propsType): JSX.Element {
  const options = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-RapidAPI-Key": process.env.REACT_APP_X_RapidAPI_Key || "",
      "X-RapidAPI-Host": "distance-calculator.p.rapidapi.com",
    },
  };

  let shopAddress = data.address || {
    long: 0,
    alt: 0,
    adress: null,
  };
  const d = new Date();

  async function getDistance( // i disabled it to save API usage
    lat1: number,
    long1: number,
    lat2: number,
    long2: number
  ): Promise<void> {
    try {
      // disabled API
      /* let res = await fetch(
        `https://distance-calculator.p.rapidapi.com/distance/simple?lat_1=${lat1}&long_1=%20${long1}&lat_2=${lat2}&long_2=${long2}&decimal_places=2`,
        options
      );
      let APIdata = await res.json();
      if (APIdata.distance === undefined) APIdata.distance = 0;
      distancesForEveryShop[data.id] = APIdata.distance; */
      distancesForEveryShop[data.id] = data.id; // enabled for test / save api purposes
      if (Object.keys(distancesForEveryShop).length >= numberOfShops) {
        // i did this to change the state one single time at the end
        // when every item has calculated its distance and set the value in the parent object : distancesForEveryShop
        // when the object has the same number of shops === all shops have registered their distance
        // then we editDistancesAfterApiCalls which sort the shops by distance and set shops state to rerender the parent 1 single time
        editDistancesAfterApiCalls();
        //console.log(distancesForEveryShop);
      }
    } catch (error) {
      console.error(error);
    }
  }

  function getCurrenDayAsString(): string {
    const dayNumber: number = d.getDay();
    return daysOfWeek[dayNumber as keyof typeof daysOfWeek];
  }

  function isShopOpen(): boolean {
    const currentDay = getCurrenDayAsString();
    const { schedule } = data;
    for (let group of schedule) {
      if (group.days[currentDay as keyof typeof group.days]) {
        for (let singleSession of group.schedule) {
          const res = isScheduleInTime(singleSession);
          if (res === true || res === false) return res;
        }
      }
    }
    return false;
  }

  function editDistancesAfterApiCalls() {
    const ShopArrayAfterDistanceEdit = shops.map((item: ShopObjectWithDistanceIncluded) => {
      let distance = 0;
      distance = distancesForEveryShop[item.id];
      return { ...item, distance: distance };
    });
    const SortedShopsByDistance = ShopArrayAfterDistanceEdit.sort(compareDistanceFn);
    //console.log("sorted", SortedShopsByDistance);
    setShops(SortedShopsByDistance);
    function compareDistanceFn(
      a: ShopObjectWithDistanceIncluded,
      b: ShopObjectWithDistanceIncluded
    ) {
      if (a.distance < b.distance) return -1;
      if (a.distance > b.distance) return 1;
      return 0;
    }
  }

  useEffect((): void => {
    getDistance(
      selectedLocation.latitude,
      selectedLocation.longitude,
      shopAddress.lat,
      shopAddress.long
    );
  }, [selectedLocation]);

  // console.log("shops ", shops);
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
          <p>{data.distance + " km"}</p>
        </div>
        <div>
          {data.mdp.cc && (
            <AiOutlineCreditCard className="payment-methods-icons" title="Credit card payment" />
          )}
          {data.mdp.cash && <BsCash className="payment-methods-icons" title="Cash payment" />}
          {data.mdp.voucher && (
            <IoTicketOutline className="payment-methods-icons" title="bon dachat" />
          )}
          {data.mdp.check && (
            <AiFillEdit className="payment-methods-icons" title="payment cheque" />
          )}
        </div>
        <div>
          {data.mdv.surplace && (
            <AiOutlineShoppingCart className="payment-methods-icons" title="service surplace" />
          )}
          {data.mdv.delivery && (
            <TbTruckDelivery className="payment-methods-icons" title="livraison" />
          )}
          {data.mdv.export && <BiPackage className="payment-methods-icons" title="packaging " />}
        </div>
      </div>
    </Link>
  );
}
