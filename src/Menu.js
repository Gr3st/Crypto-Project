import { useEffect, useState, useContext } from "react";
import { auth } from "./firebase";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
// import Login from "./pages/login";
// import Logout from "./pages/logout";
import App from "./App";
import Transactions from "./pages/transactions";
// import FavouriteCMP from "./pages/favourite";
import BuyCrypto from "./pages/buyCrypto";
import SellCrypto from "./pages/sellCrypto";
import Profile from "./Profile";
import GlobalContext from "./GlobalContext";

function Menu() {
  const [user, setUser] = useState(null);
  const [active, setActive] = useState(false);
  const { globalVariable, setGlobalVariable } = useContext(GlobalContext);
  const { globalSelectedVariable, setGlobalSelectedVariable } =
    useContext(GlobalContext);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);
  const toggleActive = () => {
    // Tutaj możesz umieścić kod do wykonania po kliknięciu w link

    setGlobalVariable("");
    setGlobalSelectedVariable(false);
  };

  return (
    <Router>
      <div className="Menu">
        {/* <div className="Menu-Panel">
          <Link to="/" onClick={toggleActive}>
            Home
          </Link> 
        </div> */}
        {/* <Transactions /> */}
        {/* <App /> */}
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/buy" element={<BuyCrypto />} />
          <Route path="/sell" element={<SellCrypto />} />
          {/* You might want to uncomment the line below if you have a route for FavouriteCMP */}
          {/* <Route path="/favourite" element={<FavouriteCMP />} /> */}
        </Routes>
      </div>
    </Router>
  );
}

export default Menu;
