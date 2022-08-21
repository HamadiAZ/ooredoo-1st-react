import React, { useContext } from "react";
import { useState } from "react";
import ConnectionSideBar from "../sidebar/ConnectionSideBar";
import { Conditions1, Conditions2 } from "../sidebar/ConditionSideBar";

// icons
import { BsList } from "react-icons/bs";
import { IoIosArrowBack } from "react-icons/io";
import AuthContext from "../context/authContext";

export default function SideMenu(props: any): JSX.Element {
  const [openedPage, setOpenedPage] = useState("connection");

  const loginStatus = useContext(AuthContext);

  function handleClick() {
    openedPage == "connection" ? props.CloseWindow() : setOpenedPage("connection");
  }
  let page = {
    title: "Connexion",
    content: <ConnectionSideBar setOpenedPage={setOpenedPage} />,
  };
  switch (openedPage) {
    case "conditions1":
      page = {
        title: "Conditions Générales d’Utilisation (CGU)",
        content: <Conditions1 setOpenedPage={setOpenedPage} />,
      };
      break;
    case "conditions2":
      page = {
        title: "Conditions Générales de vente (CGV)",
        content: <Conditions2 setOpenedPage={setOpenedPage} />,
      };
      break;

    default:
      page = {
        title: loginStatus.loginStatus.isLoggedIn ? "manage" : "Connexion",
        content: <ConnectionSideBar setOpenedPage={setOpenedPage} />,
      };
      break;
  }
  return (
    <div id="side-menu">
      <div id="side-menu--left-side" onClick={props.CloseWindow}>
        {/* the rest of the page : click to close*/}
      </div>

      <div id="side-menu--right-side">
        <div id="side-menu--right-side--header">
          <IoIosArrowBack
            id="BsList"
            onClick={openedPage == "connection" ? props.CloseWindow : handleClick}
          />
          <h4>{page.title}</h4>
          <BsList id="BsList" onClick={props.CloseWindow} />
        </div>
        <hr />
        {page.content}
      </div>
    </div>
  );
}
