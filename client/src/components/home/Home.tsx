import { useState, useEffect } from "react";

import Item from "./item";
import { StoreObjectJSONType } from "../../types/types";

import "../../styles/home.css";

export default function Home(): JSX.Element {
  async function getAllStores() {
    try {
      const response = await fetch("http://localhost:5000/api/getStores");
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
        <h1>Choisissez votre pays</h1>
      </div>

      <div id="home-item-root-inMain-container">
        {stores.map((item: any) => {
          return <Item key={item.id} data={item} />;
        })}
      </div>
    </main>
  );
}
