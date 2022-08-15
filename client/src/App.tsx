import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useState } from "react";


import Home from "./components/home/Home";
import ForgotPassword from "./components/forgotPassword";
import Header from "./components/Header";
import Store from "./components/store/Store";
import Footer from "./components/Footer";
import AddShop from "./components/admin/addShop";
import Admin from "./components/admin/admin";
import Shop from "./components/shop/shop";

import "./styles/App.css";

const globalPath = "http://localhost:5000";

export default function App(): JSX.Element {
  const [shoppingBasket, setShoppingBasket] = useState<any[]>([]);
  return (
    <Router>
      <div className="App">
        <Header shoppingBasket={shoppingBasket} setShoppingBasket={setShoppingBasket} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/forgotPassword" element={<ForgotPassword />} />
          <Route path="/stores/:storeId" element={ <Store globalPath={globalPath}/> } />
          <Route
            path="/:storeId/shops/:shopId"
            element={<Shop globalPath={globalPath} shoppingBasket={shoppingBasket} setShoppingBasket={setShoppingBasket} />}
          />

          <Route
            path="/admin/addShop"
            element={<AddShop globalPath={globalPath} />}
          />

          <Route path="/admin" element={<Admin globalPath={globalPath} />} />
        </Routes>

        <Footer />
      </div>
    </Router>
  );
}
