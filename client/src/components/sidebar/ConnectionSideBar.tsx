import React from "react";
import { Link } from "react-router-dom";
// icons
import { FiMail } from "react-icons/fi";
import { RiLockPasswordLine } from "react-icons/ri";

export default function ConnectionSideBar(props: any) {
  return (
    <div>
      {/* the actual side bar */}

      <form id="side-bar-connection-container">
        <p>E-mail</p>
        <div style={{ display: "flex" }}>
          <FiMail id="FiMail" />
          <input type="email" placeholder="Donner votre email" />
        </div>
        <hr />
        <p>Password</p>
        <div style={{ display: "flex" }}>
          <RiLockPasswordLine id="FiMail" />
          <input type="email" placeholder="Donner votre email" />
        </div>
        <hr />
        <Link to="/forgotPassword">
          <p style={{ marginLeft: "40%" }}>Mot de Passe oublié?</p>
        </Link>
        <button type="submit"> CONNEXION</button>
        <p>OU</p>
        <p
          style={{
            textDecoration: "underline",
            fontSize: "1.4rem",
            margin: "0",
          }}
        >
          Inscription
        </p>
      </form>
      <hr />
      <p style={{ textAlign: "left" }}>En continuant, vous acceptez nos :</p>
      <ul id="conditionsGeneraleList">
        <li
          onClick={() => {
            props.setOpenedPage("conditions1");
          }}
        >
          Conditions Générales d'Utilisation
        </li>
        <li
          onClick={() => {
            props.setOpenedPage("conditions2");
          }}
        >
          Conditions Générales de Vente
        </li>
      </ul>
      <p
        style={{
          fontSize: "1.2rem",
          color: "#5d5d5d",
          fontWeight: "light",
          textDecoration: "underline",
        }}
      >
        Mention Légales
      </p>
    </div>
  );
}
