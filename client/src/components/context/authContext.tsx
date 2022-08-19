import React, { createContext, useEffect, useState } from "react";
import { globalPath } from "../../const/const";
import { LoggedInState } from "../../types/types";

const AuthContext = createContext({
  loginStatus: { isLoggedIn: false, privilege: "user", name: "", username: "" },
  getLoginStatus: async (): Promise<void> => {},
});
export default AuthContext;

export function AuthContextProvider(props: any) {
  const [loginStatus, setLoginStatus] = useState<LoggedInState>({
    isLoggedIn: false,
    privilege: "user",
    name: "",
    username: "",
  });

  async function getLoginStatus(): Promise<void> {
    try {
      const res = await fetch(globalPath + "/api/auth/loginStatus", {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      const data: LoggedInState = await res.json();
      //console.log(data);
      if (data.isLoggedIn) {
        if (data?.privilege === "admin")
          return setLoginStatus({
            isLoggedIn: true,
            privilege: "admin",
            name: data.name,
            username: data.username,
          });
        return setLoginStatus({
          isLoggedIn: true,
          privilege: "user",
          name: data.name,
          username: data.username,
        });
      }
      setLoginStatus({
        isLoggedIn: false,
        privilege: "user",
        name: "",
        username: "",
      });
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getLoginStatus();
  }, []);

  //console.log(loginStatus);
  return (
    <AuthContext.Provider value={{ loginStatus, getLoginStatus }}>
      {/* so our App will be as children here , every component will se these values
       */}
      {props.children}
    </AuthContext.Provider>
  );
}
