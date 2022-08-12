import { BrowserRouter as Router, Link, Route, Routes } from "react-router-dom";
import "./styles/App.css";
import Home from "./components/home/Home";
import ForgotPassword from "./components/forgotPassword";
import Header from "./components/Header";
import Store from "./components/store/Store";
import Footer from "./components/Footer";
import AddShop from "./components/admin/addShop";
import Admin from "./components/admin/admin";
import Shop from "./components/shop/shop";

const globalPath = "http://localhost:5000";

export default function App(): JSX.Element {
  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/forgotPassword" element={<ForgotPassword />} />
          <Route path="/stores/:storeId" element={<Store />} />

          <Route
            path="/:storeId/shops/:shopId"
            element={<Shop globalPath={globalPath} />}
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
