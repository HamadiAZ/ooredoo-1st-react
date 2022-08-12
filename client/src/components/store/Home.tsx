import { useState, useEffect, EffectCallback } from "react";
import { BiCurrentLocation } from "react-icons/bi";
import Item from "../home/item";
import { StoreObjectJSONType } from "../../types/types";

import "./home.css";

export default function Home(): JSX.Element {
  async function getAllStores(): Promise<void> {
    try {
      const response = await fetch("http://localhost:5000/getStores");
      let data: StoreObjectJSONType[] = await response.json();
      console.log(data);
      setStores(data);
    } catch (error: any) {
      console.error(error.message);
    }
  }

  const [stores, setStores] = useState<StoreObjectJSONType[]>([]);

  useEffect(() => {
    getAllStores();
  }, []);

  return (
    <main>
      <img
        id="home-main-image"
        src="https://www.ooredoo.com/wp-content/uploads/2016/06/who-we-are-english-1-1.jpg"
      />
      <div id="middle-location-search-container">
        <h1>Nos magasins à proximité</h1>
        <div>
          <input placeholder="ecriver votre adresse" />
          <BiCurrentLocation id="search-location-icon" />
        </div>
      </div>

      <div id="item-root-inMain-container">
        {/*         data.map((item): void => {
          <Item data={item} />;
        }) */}
        {stores.map((item: any) => {
          return <Item key={item.id} data={item} />;
        })}
      </div>
    </main>
  );
}
