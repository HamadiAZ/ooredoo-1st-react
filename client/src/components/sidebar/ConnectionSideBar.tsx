import { Link } from "react-router-dom";
import React, { Reducer, useEffect, useReducer, useState, useContext } from "react";

import Inscription from "./inscription";

import { authenticationStateENUM, authenticationStateType, LoggedInState } from "../../types/types";
import { globalPath } from "../../const/const";
import AuthContext from "../context/authContext";

// icons
import { FiMail } from "react-icons/fi";
import { RiLockPasswordLine } from "react-icons/ri";
import LoginForm from "./loginForm";

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
      {/* the actual side bar 
      
      the logic is : 
      logged in ?
      if yes :  ADMIN ? => admin side bar : => user side bar 
      if no : viewInscriptionPage ? => inscription side bar : =>login side bar
      */}

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
            <Link to="/client/orders">
              <button>view orders</button>
            </Link>
          </div>
        )
      ) : viewInscriptionPage ? (
        <Inscription
          checkInput={checkInput}
          state={state}
          dispatch={dispatch}
          pageStatus={pageStatus}
          setPageStatus={setPageStatus}
          setViewInscriptionPage={setViewInscriptionPage}
        />
      ) : (
        <LoginForm
          checkInput={checkInput}
          state={state}
          dispatch={dispatch}
          pageStatus={pageStatus}
          setPageStatus={setPageStatus}
          setViewInscriptionPage={setViewInscriptionPage}
        />
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
