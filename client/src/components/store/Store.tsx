import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Item from "./item";
import "../../styles/store.css";

import { ShopObjectJSONType } from "../../types/types";
import SearchBox from "../searchBox";
//icons
import Gallery from "./gallery";
//main

export default function Store({globalPath}: {globalPath: string}): JSX.Element {
  // vars & states

  const [shops, setShops] = useState<ShopObjectJSONType[]>([]);

  let store_id: number = parseInt(useParams().storeId || "");
  const storePath = globalPath + "/stores/" + store_id;



  async function getAllShops() {
    try {
      const response = await fetch(
        `http://localhost:5000/api/getShops/${store_id}`
      );
      let data: ShopObjectJSONType[] = await response.json();
      //console.log(data);
      setShops(data);
    } catch (error: any) {
      console.error(error.message);
    }
  }
  const [input, setInput] = useState({ address: "sfax" });
  const [suggestionState, setSuggestionState] = useState<boolean>(false);
  const [suggestionDataArray, setSuggestionDataArray] = useState([]);
  const [selectedItem, setSelectedItem] = useState({
    latitude: 34.74056,
    longitude: 10.76028,
    name: "Sfax",
    label: "Sfax, Tunisia",
  });
  useEffect(() => {}, []);

  async function handleSearchClick(toggleTheMenuOn: boolean = true) {
    const res = await fetch(
      `http://api.positionstack.com/v1/forward?access_key=a18d5f41712ab974a5fb1382721fd92b&query=${input.address}`
    );
    const mapPage = await res.json();
    console.log(mapPage.data);
    setSuggestionState(toggleTheMenuOn);
    setSuggestionDataArray(mapPage.data);
  }

  function handleItemClick(item: any) {
    // item men l map array  : from API
    setSuggestionState(false);
    setInput({ address: item.label });
    setSelectedItem(item);
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
        {shops.map((item: any): any => {
          return (
            <Item
              key={item.id}
              data={item}
              storePath={storePath}
              selectedItem={selectedItem}
            />
          );
        })}
      </div>
    </main>
  );
}
