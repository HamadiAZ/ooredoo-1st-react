import React, { useContext } from "react";

import { authenticationStateENUM, authenticationStateType, LoggedInState } from "../../types/types";

import { BsFillPersonFill } from "react-icons/bs";
import { FiMail } from "react-icons/fi";
import { RiLockPasswordLine } from "react-icons/ri";
import { globalPath } from "../../const/const";
import AuthContext from "../context/authContext";

export default function Inscription({
  checkInput,
  state,
  dispatch,
  pageStatus,
  setPageStatus,
  setViewInscriptionPage,
}: any) {
  const { getLoginStatus }: { loginStatus: LoggedInState; getLoginStatus: () => Promise<void> } =
    useContext(AuthContext);

  async function handleRegister(e: React.MouseEvent): Promise<void> {
    e.preventDefault();
    if (!checkInput()) {
      console.log("invalid input");
      return;
    }
    let newUser = {
      name: state.nameReg,
      username: state.usernameReg,
      email: state.emailReg,
      password: state.passwordReg,
    };
    let emailNotInDB = !(await checkIsMailAlreadyRegistered(state.emailReg));
    if (emailNotInDB) {
      let res = await fetch(globalPath + "/api/auth/reg", {
        method: "POST",
        body: JSON.stringify(newUser),
        headers: {
          "Content-Type": "application/json",
        },
      });
      let reply = await res.json();

      console.log(reply);
      if (reply?.username?.length) {
        clearInputs();
        setPageStatus(`registration successful +${reply.username}`);
        setTimeout(() => {
          setViewInscriptionPage(false);
          setPageStatus(``);
          getLoginStatus();
          // empty the last message of confirmation
        }, 3000);
      } else {
        setPageStatus(`regFails`);
      }
    } else {
      console.log("email already exist");
      setPageStatus(`regFails`);
    }
  }
  async function checkIsMailAlreadyRegistered(emailToSearch: string): Promise<boolean> {
    try {
      let res = await fetch(globalPath + "/api/auth/getMail" + emailToSearch);
      let data: any = await res.json();
      const { email } = data;
      //console.log(email);
      if (email) return true;
      return false;
    } catch (error) {
      console.error(error);
      return true;
    }
  }

  function clearInputs(): void {
    dispatch({ type: authenticationStateENUM.emailReg, payload: "" });
    dispatch({ type: authenticationStateENUM.nameReg, payload: "" });
    dispatch({ type: authenticationStateENUM.passwordReg, payload: "" });
    dispatch({ type: authenticationStateENUM.usernameReg, payload: "" });
  }

  return (
    <form id="side-bar-connection-container">
      {/* REGISTER PAGE*/}

      <p>E-mail</p>
      <div style={{ display: "flex" }}>
        <FiMail id="FiMail" className={checkInput() ? "auth-icons-green" : "auth-icons-red"} />
        <input
          type="email"
          placeholder="your email"
          value={state[authenticationStateENUM.emailReg]}
          onChange={(e: any) => {
            dispatch({ type: authenticationStateENUM.emailReg, payload: e.target.value });
            dispatch({ type: authenticationStateENUM.emailLogin, payload: "" });
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
          value={state[authenticationStateENUM.passwordReg]}
          onChange={(e: any) => {
            dispatch({ type: authenticationStateENUM.passwordReg, payload: e.target.value });
            dispatch({ type: authenticationStateENUM.emailLogin, payload: "" });
          }}
        />
      </div>
      <hr />
      <p>Personal info</p>
      <div style={{ display: "flex" }}>
        <BsFillPersonFill
          id="FiMail"
          className={checkInput() ? "auth-icons-green" : "auth-icons-red"}
        />
        <input
          type="text"
          placeholder="your full name"
          value={state[authenticationStateENUM.nameReg]}
          onChange={(e: any) => {
            dispatch({ type: authenticationStateENUM.nameReg, payload: e.target.value });
            dispatch({ type: authenticationStateENUM.emailLogin, payload: "" });
          }}
        />
      </div>
      <hr />
      <br />
      <div style={{ display: "flex" }}>
        <BsFillPersonFill
          id="FiMail"
          className={checkInput() ? "auth-icons-green" : "auth-icons-red"}
        />
        <input
          type="text"
          placeholder="your username"
          value={state[authenticationStateENUM.usernameReg]}
          onChange={(e: any) => {
            dispatch({ type: authenticationStateENUM.usernameReg, payload: e.target.value });
            dispatch({ type: authenticationStateENUM.emailLogin, payload: "" });
          }}
        />
      </div>
      <hr />
      {pageStatus === "regFails" && <p style={{ color: "red" }}>Registration failed</p>}
      {pageStatus?.length > 15 && <p style={{ color: "green" }}>{pageStatus}</p>}
      <button
        type="submit"
        onClick={handleRegister}
        style={{
          cursor: "pointer",
        }}
      >
        Register
      </button>
      <p>Or</p>
      <button
        style={{
          fontSize: "1.1rem",
          margin: "0",
          padding: "1rem",
          cursor: "pointer",
        }}
        onClick={() => setViewInscriptionPage(false)}
      >
        {" "}
        go back to Connection
      </button>
    </form>
  );
}
