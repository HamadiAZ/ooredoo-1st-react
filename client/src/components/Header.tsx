import { useState } from "react";
import { BsList } from "react-icons/bs";
import { Link } from "react-router-dom";
import SideMenu from "../components/sideMenu";

let headerImage = require("../images/header.jpg");

export default function Header(): JSX.Element {
  const [isMenuShown, setisMenuShown] = useState(false);

  function HandleListClick(): void {
    setisMenuShown((): boolean => !isMenuShown);
  }

  return (
    <>
      <header>
        <Link to="/">
          <img src={headerImage} />
        </Link>
        <BsList id="BsList" onClick={HandleListClick} />
      </header>

      {isMenuShown && <SideMenu CloseWindow={HandleListClick} />}
    </>
  );
}
