import React, { useContext } from "react";
import { FiMail } from "react-icons/fi";
import { RiLockPasswordLine } from "react-icons/ri";
import { Link } from "react-router-dom";
import { globalPath } from "../../const/const";
import { authenticationStateENUM, LoggedInState } from "../../types/types";
import AuthContext from "../context/authContext";

export default function LoginForm({
  checkInput,
  state,
  dispatch,
  pageStatus,
  setViewInscriptionPage,
  setPageStatus,
}: any) {
  const { getLoginStatus }: { loginStatus: LoggedInState; getLoginStatus: () => Promise<void> } =
    useContext(AuthContext);

  async function handleLogin(e: React.MouseEvent): Promise<void> {
    e.preventDefault();
    if (!checkInput()) {
      console.log("invalid input");
      return;
    }
    let user = {
      email: state.emailLogin,
      password: state.passwordLogin,
    };
    let res = await fetch(globalPath + "/api/auth/login", {
      method: "POST",
      body: JSON.stringify(user),
      credentials: "include",
      mode: "cors",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    let reply: any = await res.json();
    console.log("login :", reply);
    if (reply?.username?.length) {
      setPageStatus(`login successful +${reply.username}`);
      setTimeout(() => {
        setViewInscriptionPage(false);
        setPageStatus(``);
        // empty the last message of confirmation
        dispatch({ type: authenticationStateENUM.emailLogin, payload: "" });
        dispatch({ type: authenticationStateENUM.passwordLogin, payload: "" });
        getLoginStatus();
      }, 2000);
    } else {
      setPageStatus(`LogFailed`);
    }
  }

  return (
    <form id="side-bar-connection-container">
      {/* LOGIN PAGE */}

      <p>E-mail</p>
      <div style={{ display: "flex" }}>
        <FiMail id="FiMail" className={checkInput() ? "auth-icons-green" : "auth-icons-red"} />
        <input
          type="email"
          placeholder="your password"
          value={state[authenticationStateENUM.emailLogin]}
          onChange={(e: any) => {
            dispatch({ type: authenticationStateENUM.emailLogin, payload: e.target.value });
            dispatch({ type: authenticationStateENUM.emailReg, payload: "" });
          }}
        />
      </div>

      <hr />

      <p>Password</p>
      <div style={{ display: "flex" }}>
        <RiLockPasswordLine
          id="FiMail"
          className={checkInput() ? "auth-icons-green" : "auth-icons-red"}
        />
        <input
          type="password"
          placeholder="your password"
          value={state[authenticationStateENUM.passwordLogin]}
          onChange={(e: any) => {
            dispatch({ type: authenticationStateENUM.passwordLogin, payload: e.target.value });
            dispatch({ type: authenticationStateENUM.emailReg, payload: "" });
          }}
        />
      </div>

      <hr />

      <Link to="/forgotPassword">
        <p style={{ marginLeft: "40%" }}>Password forgotten</p>
      </Link>
      {pageStatus === "LogFailed" && <p style={{ color: "red" }}>Login failed</p>}
      {pageStatus?.length > 15 && <p style={{ color: "green" }}>{pageStatus}</p>}
      <button type="submit" onClick={handleLogin}>
        CONNECTION
      </button>

      <p>Or</p>

      <p
        style={{
          textDecoration: "underline",
          fontSize: "1.4rem",
          margin: "0",
        }}
        onClick={() => setViewInscriptionPage(true)}
      >
        Inscription
      </p>
    </form>
  );
}
