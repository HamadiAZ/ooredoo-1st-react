import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/index.css";
import App from "./App";
import { AuthContextProvider } from "./components/context/authContext";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <AuthContextProvider>
    <App />
  </AuthContextProvider>
);
