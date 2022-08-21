import { useState } from "react";
import { BsList } from "react-icons/bs";
import { Link } from "react-router-dom";
import SideMenu from "./sideMenu";
import Basket from "./basket";

import { basketProductType } from "../../types/types";

import { AiOutlineShoppingCart } from "react-icons/ai";

let headerImage = require("../../images/header.jpg");

export default function Header({
  shoppingBasket,
  setShoppingBasket,
}: {
  shoppingBasket: basketProductType[];
  setShoppingBasket: React.Dispatch<React.SetStateAction<basketProductType[]>>;
}): JSX.Element {
  //states & const
  const [isMenuShown, setIsMenuShown] = useState<boolean>(false);
  const [isBasketShown, setIsBasketShown] = useState<boolean>(false);
  const basketCounter = shoppingBasket.length;

  function HandleListClick(): void {
    setIsMenuShown((): boolean => !isMenuShown);
  }
  function HandleBasketClick(): void {
    setIsBasketShown((): boolean => !isBasketShown);
  }

  return (
    <>
      <header>
        <Link to="/">
          <img src={headerImage} />
        </Link>

        <div id="header-card-and-menu-container">
          <div id="shopping-card-absolute-div">
            <AiOutlineShoppingCart id="BsList" onClick={HandleBasketClick} />
            {isBasketShown ? (
              <Basket
                setIsBasketShown={setIsBasketShown}
                shoppingBasket={shoppingBasket}
                setShoppingBasket={setShoppingBasket}
              />
            ) : (
              <p id="shopping-card-counter">{basketCounter}</p>
            )}
          </div>
          <BsList id="BsList" onClick={HandleListClick} />
        </div>
      </header>

      {isMenuShown && <SideMenu CloseWindow={HandleListClick} />}
    </>
  );
}
