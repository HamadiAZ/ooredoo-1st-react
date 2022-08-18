import { Link } from "react-router-dom";
// icons
import { FiMail } from "react-icons/fi";
import { RiLockPasswordLine } from "react-icons/ri";

export default function ConnectionSideBar(props: any): JSX.Element {
  return (
    <div>
      {/* the actual side bar */}

      <form id="side-bar-connection-container">
        <p>E-mail</p>
        <div style={{ display: "flex" }}>
          <FiMail id="FiMail" />
          <input type="email" placeholder="your password" />
        </div>
        <hr />
        <p>Password</p>
        <div style={{ display: "flex" }}>
          <RiLockPasswordLine id="FiMail" />
          <input type="email" placeholder="your email" />
        </div>
        <hr />
        <Link to="/forgotPassword">
          <p style={{ marginLeft: "40%" }}>Password forgotten</p>
        </Link>
        <button type="submit"> CONNECTION</button>
        <p>Or</p>
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
      <p style={{ textAlign: "left" }}>while continuing , you agree to :</p>
      <ul id="conditionsGeneraleList">
        <li
          onClick={(): void => {
            props.setOpenedPage("conditions1");
          }}
        >
          General usage conditions
        </li>
        <li
          onClick={(): void => {
            props.setOpenedPage("conditions2");
          }}
        >
          General selling conditions
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
        Legal Mentions
      </p>
    </div>
  );
}
