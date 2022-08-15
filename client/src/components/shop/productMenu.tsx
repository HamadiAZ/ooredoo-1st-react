import { useState, useEffect, useMemo } from "react";

import Menu from "./menu";

import { products } from "../../const/const";
import {
  ProductsDataArrayType,
  menuObjectType,
  singleProductObjectType,
} from "../../types/types";

export default function ProductMenu({
  handleAddToCard,
}: {
  handleAddToCard: (item: singleProductObjectType) => void;
}) {
  const [data, setData] = useState<ProductsDataArrayType>(products);

  const [selectedMenu, setSelectedMenu] = useState<string>("");
  /*if menu is clicked : 
  i5arrej liste des toutes les products and those whose are related to the click:  scroll by id
  
  else : i5arrej les categories lkbar 
  */

  function handleNavigatorClick(
    event: React.MouseEvent<HTMLAnchorElement>,
    item: menuObjectType
  ) {
    const foundIndex = data.findIndex(
      (el) => el.signification === item.signification
    );
    let dataCpy = [...data];
    const itemToAppend = data[foundIndex];
    dataCpy.splice(foundIndex, 1);
    dataCpy.unshift(itemToAppend);
    setSelectedMenu(item.signification);
    setData(dataCpy);
  }

  useEffect(() => {
    setData(products);
  }, []);

  const InitialDataClone = useMemo(() => data, []);

  return (
    <>
      <ul id="shop-product-families-navigator-container">
        {InitialDataClone.map((item: menuObjectType) => {
          return (
            <a
              key={item.signification}
              href="#shop-product-families-navigator-container"
              onClick={(event) => handleNavigatorClick(event, item)}
            >
              <li
                key={item.signification}
                className={
                  selectedMenu && selectedMenu === item.signification
                    ? "li-selected"
                    : "li-not-selected"
                }
              >
                {item.signification}
              </li>
            </a>
          );
        })}
      </ul>
      <div className="shop-main-menu-container">
        {selectedMenu ? (
          <Menu MenusArray={data} handleAddToCard={handleAddToCard} />
        ) : (
          <Menu
            MenusArray={data /*a modifier*/}
            handleAddToCard={handleAddToCard}
          />
        )}
      </div>
    </>
  );
}
