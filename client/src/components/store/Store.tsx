import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Item from "./item";
import "../../styles/store.css";

import { ShopObjectType, ShopObjectWithDistanceIncluded } from "../../types/types";
import SearchBox from "../searchBox";
//icons
import Gallery from "./gallery";
//main

export default function Store({ globalPath }: { globalPath: string }): JSX.Element {
  // vars & states
  type shopId = number;
  const distancesForEveryShop: { [key: shopId]: number } = {};

  const [shops, setShops] = useState<ShopObjectWithDistanceIncluded[]>([]);

  let store_id: number = parseInt(useParams().storeId || "");
  const storePath = globalPath + "/stores/" + store_id;

  async function getAllShops() {
    try {
      const response = await fetch(globalPath + `/api/surf/getShops/${store_id}`);
      let data: ShopObjectType[] = await response.json();
      const shops: ShopObjectWithDistanceIncluded[] = data.map((item) => {
        return { ...item, distance: 0 };
      });
      setShops(shops);
    } catch (error: any) {
      console.error(error.message);
    }
  }
  const [input, setInput] = useState({ address: "sfax" });
  const [suggestionState, setSuggestionState] = useState<boolean>(false);
  const [suggestionDataArray, setSuggestionDataArray] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState({
    latitude: 34.74056,
    longitude: 10.76028,
    name: "Sfax",
    label: "Sfax, Tunisia",
  });

  async function handleSearchClick(toggleTheMenuOn: boolean = true) {
    const res = await fetch(
      `http://api.positionstack.com/v1/forward?access_key=a18d5f41712ab974a5fb1382721fd92b&query=${input.address}`
    );
    const mapPage = await res.json();
    setSuggestionState(toggleTheMenuOn);
    setSuggestionDataArray(mapPage.data);
  }

  function handleItemClick(item: any) {
    // item men l map array  : from API
    setSuggestionState(false);
    setInput({ address: item.label });
    setSelectedLocation(item);
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    setInput({ address: event.target.value });
  }

  useEffect(() => {
    getAllShops();
  }, []);

  return (
    <main onClick={() => setSuggestionState(false)}>
      <Gallery storePath={storePath} store_id={store_id} />

      {shops.length > 0 ? (
        <>
          <div id="store-location-search-container">
            <h1>Nos magasins à proximité</h1>
            <div>
              <SearchBox
                input={input}
                handleInputChange={handleInputChange}
                handleSearchClick={handleSearchClick}
                suggestionState={suggestionState}
                suggestionDataArray={suggestionDataArray}
                handleItemClick={handleItemClick}
              />
            </div>
          </div>

          <div id="store-item-root-inMain-container">
            {shops.map((item: ShopObjectWithDistanceIncluded): any => {
              return (
                <Item
                  numberOfShops={shops.length}
                  shops={shops}
                  key={item.id}
                  data={item}
                  storePath={storePath}
                  selectedLocation={selectedLocation}
                  setShops={setShops}
                  distancesForEveryShop={distancesForEveryShop}
                />
              );
            })}
          </div>
        </>
      ) : (
        <h2 style={{ margin: "15vh 0 " }}>
          no shops were added for this store , wait for our new shops soon
        </h2>
      )}
    </main>
  );
}
