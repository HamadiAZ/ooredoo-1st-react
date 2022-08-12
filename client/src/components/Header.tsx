import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { TextSpan } from "typescript";
import { BsList } from "react-icons/bs";
import { Link } from "react-router-dom";
import SideMenu from "../components/sideMenu";

let menuIcon = require("../images/list.svg");
let headerImage = require("../images/header.jpg");

export default function Header(): JSX.Element {
  const [isMenuShown, setisMenuShown] = useState(false);

  function HandleListClick(): void {
    setisMenuShown((prev: boolean): boolean => !isMenuShown);
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
