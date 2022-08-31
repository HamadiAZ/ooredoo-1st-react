import { useState, useEffect, useMemo } from "react";

import Menu from "./menu";

import { products } from "../../const/const";
import { ProductsDataArrayType, menuObjectType, singleProductObjectType } from "../../types/types";

type propsType = {
  handleAddToCard: (item: singleProductObjectType) => void;
};

export default function ProductMenu({ handleAddToCard }: propsType) {
  //function body
  const [data, setData] = useState<ProductsDataArrayType>(products);

  const [selectedMenu, setSelectedMenu] = useState<string>("");

  function handleNavigatorClick(item: menuObjectType) {
    if (item.category === selectedMenu) {
      setSelectedMenu(""); // to go back to categories view
    } else {
      const foundIndex = data.findIndex((el) => el.category === item.category);
      let dataCpy = [...data];
      const itemToAppend = data[foundIndex];
      dataCpy.splice(foundIndex, 1);
      dataCpy.unshift(itemToAppend);
      setSelectedMenu(item.category);
      setData(dataCpy);
    }
  }

  useEffect(() => {
    setData(products);
  }, []);

  const InitialDataClone = useMemo(() => data, []);
  // so it doesn't re Sort like the data array

  return (
    <>
      <ul id="shop-product-families-navigator-container">
        {InitialDataClone.map((item: menuObjectType) => {
          return (
            <a
              key={item.category}
              href="#shop-product-families-navigator-container"
              onClick={() => handleNavigatorClick(item)}
            >
              <li
                key={item.category}
                className={
                  selectedMenu && selectedMenu === item.category ? "li-selected" : "li-not-selected"
                }
              >
                {item.category}
              </li>
            </a>
          );
        })}
      </ul>
      <div className="shop-main-menu-container">
        {
          <Menu
            MenusArray={data}
            handleAddToCard={handleAddToCard}
            selectedMenu={selectedMenu}
            handleNavigatorClick={handleNavigatorClick}
          />
        }
      </div>
    </>
  );
}
