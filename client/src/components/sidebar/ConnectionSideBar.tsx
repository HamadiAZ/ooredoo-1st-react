import { Link } from "react-router-dom";
import React, { Reducer, useEffect, useReducer, useState, useContext } from "react";

import { authenticationStateENUM, authenticationStateType, LoggedInState } from "../../types/types";

import { globalPath } from "../../const/const";
import AuthContext from "../context/authContext";

// icons
import { FiMail } from "react-icons/fi";
import { RiLockPasswordLine } from "react-icons/ri";
import { BsFillPersonFill } from "react-icons/bs";

const initialState: authenticationStateType = {
  emailLogin: "",
  passwordLogin: "",

  usernameReg: "",
  nameReg: "",
  emailReg: "",
  passwordReg: "",
};

export default function ConnectionSideBar(props: any): JSX.Element {
  const [pageStatus, setPageStatus] = useState<string>("");

  const [state, dispatch] = useReducer<Reducer<authenticationStateType, any>>(
    reducer,
    initialState
  );

  const {
    loginStatus,
    getLoginStatus,
  }: { loginStatus: LoggedInState; getLoginStatus: () => Promise<void> } = useContext(AuthContext);

  function reducer(state: authenticationStateType, action: any): authenticationStateType {
    switch (action.type) {
      case authenticationStateENUM.emailLogin:
        return { ...state, [authenticationStateENUM.emailLogin]: action.payload };
      case authenticationStateENUM.passwordLogin:
        return { ...state, [authenticationStateENUM.passwordLogin]: action.payload };

      case authenticationStateENUM.emailReg:
        return { ...state, [authenticationStateENUM.emailReg]: action.payload };
      case authenticationStateENUM.passwordReg:
        return { ...state, [authenticationStateENUM.passwordReg]: action.payload };
      case authenticationStateENUM.nameReg:
        return { ...state, [authenticationStateENUM.nameReg]: action.payload };
      case authenticationStateENUM.usernameReg:
        return { ...state, [authenticationStateENUM.usernameReg]: action.payload };

      default:
        return state;
    }
  }

  function checkIsMailValid(email: string) {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  }

  function checkInput(): boolean {
    if (state.emailLogin === "") {
      // trying to register
      if (!checkIsMailValid(state.emailReg)) return false;
      if (state.passwordReg.length < 3) return false;
      if (state.usernameReg.length < 3) return false;
      if (state.nameReg.length < 2) return false;
      return true;
    } else if (state.emailReg === "") {
      // trying to login
      if (!checkIsMailValid(state.emailLogin)) return false;
      if (state.passwordLogin.length < 3) return false;
      return true;
    }
    return false;
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

  async function handleLogOut(): Promise<void> {
    try {
      await fetch(globalPath + "/api/auth/logout", {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      getLoginStatus();
    } catch (error) {
      console.log(error);
    }
  }
  const [viewInscriptionPage, setViewInscriptionPage] = useState<boolean>(false);

  /*  dispatch({ type: Selector.mdp, payload: event.target.value }); */

  useEffect(() => {
    // i did this one to fix a bug
    // when you correctly fill 1 page then switch to the other
    // it stills green and the submit function will do the prev function
    viewInscriptionPage
      ? dispatch({ type: authenticationStateENUM.emailLogin, payload: "" })
      : dispatch({ type: authenticationStateENUM.emailReg, payload: "" });
  }, [viewInscriptionPage]);

  return (
    <div>
      {/* the actual side bar */}
      {loginStatus.isLoggedIn ? (
        loginStatus.privilege === "admin" ? (
          <div id="side-bar-connection-container">
            {/* admin is logged in */}
            <p>welcome {loginStatus.name}</p>
            <p>you are logged in as ADMIN</p>
            <Link to="/admin/orders">
              <button>view orders</button>
            </Link>
            <Link to="/admin/addShop">
              <button>add Shop</button>
            </Link>
          </div>
        ) : (
          <div id="side-bar-connection-container">
            {/* client is logged in */}
            <p>welcome {loginStatus.name}</p>
            <p>you are logged in as client</p>
            <button type="submit">your orders</button>
          </div>
        )
      ) : viewInscriptionPage ? (
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
      ) : (
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
      )}
      <hr />
      {loginStatus.isLoggedIn ? (
        <div id="side-bar-connection-container">
          <button type="submit" onClick={handleLogOut}>
            Log Out
          </button>
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
