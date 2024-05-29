import React, { useEffect, useState, useContext } from "react";
import "./App.css";
import { BrowserRouter as Router, Link, Routes, Route } from "react-router-dom";
import axios from "axios";
// favourite ------------------------------------
import { getFav, Favourite } from "./fav-mechanics";
import FavouriteCMP from "./pages/favourite";
// recharts -------------------------------------
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
//firebase auth ---------------------------------
import { auth } from "./firebase";
import GlobalContext from "./GlobalContext";
import BuyCrypto from "./pages/buyCrypto";
import SellCrypto from "./pages/sellCrypto";
// import { useAuthState } from 'react-firebase-hooks/auth';
// import Chart from 'react-apexcharts';
import Profile from "./Profile";
import { upDCH } from "./chart-mechanics";

function App() {
  // const [data, setData] = useState([]);
  const [fav, setFav] = useState(false);
  const [sortBy, setSortBy] = useState({ field: "", ascending: true });
  const [symbolsExistence, setSymbolsExistence] = useState({});
  const [activeBTN, setActiveBTN] = useState("");
  const { globalVariable, setGlobalVariable } = useContext(GlobalContext);
  const { globalVariablePrice, setGlobalVariablePrice } =
    useContext(GlobalContext);
  const { globalSelectedVariable, setGlobalSelectedVariable } =
    useContext(GlobalContext);
  const { globalMenuActiveBtn, setGlobalMenuActiveBtn } =
    useContext(GlobalContext);
  const { globalTheme, setGlobalTheme } = useContext(GlobalContext);
  const { globalAllData, setGlobalAllData } = useContext(GlobalContext);
  const { globalChartState, setGlobalChartState } = useContext(GlobalContext);
  const [scrolled, setScrolled] = useState(false);
  // const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  // useEffect(() => {
  //   // Function to handle storage changes
  //   const handleStorageChange = (event) => {
  //     if (event.key === "theme") {
  //       setTheme(event.newValue || "light");
  //     }
  //   };
  //   handleStorageChange
  //   // Set initial theme
  //   document.documentElement.setAttribute("data-theme", theme);

  //   // Add event listener for storage changes
  //   window.addEventListener("storage", handleStorageChange);

  //   // Clean up event listener on component unmount
  //   return () => {
  //     window.removeEventListener("storage", handleStorageChange);
  //   };
  // }, [theme]);

  useEffect(() => {
    // Update theme attribute on theme change
    setGlobalTheme(localStorage.getItem("theme"));
  }, [globalTheme, []]);

  useEffect(() => {
    axios
      .get("https://api.coinlore.net/api/tickers/")
      .then((response) => setGlobalAllData(response.data.data))
      .catch((error) => console.error("Error fetching data:", error));
    const handleScroll = () => setScrolled(window.scrollY > 120);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchSymbolsExistence = async () => {
      //after selected
      const favr = await getFav(globalVariable);
      setFav(favr);
      //before selected
      const symbolsExistenceMap = {};
      await Promise.all(
        globalAllData.map(async (item) => {
          const exists = await getFav(item.symbol);
          symbolsExistenceMap[item.symbol] = exists;
        })
      );

      setSymbolsExistence(symbolsExistenceMap);
      // setSymbolsExistence(favr);
    };

    user && fetchSymbolsExistence();
  }, [globalVariable, globalAllData, fav, globalSelectedVariable, user]);

  const setFavourite = (symbol) => {
    Favourite(symbol);
    setFav(!fav);
  };
  // sorting system
  const handleSort = (field) => {
    setSortBy((prevSort) => ({
      field,
      ascending: prevSort.field === field ? !prevSort.ascending : true,
    }));
  };

  const sortedData = [...globalAllData].sort((a, b) => {
    if (sortBy.field === "rank") {
      return sortBy.ascending ? a.rank - b.rank : b.rank - a.rank;
    } else if (sortBy.field === "price") {
      return sortBy.ascending
        ? a.price_usd - b.price_usd
        : b.price_usd - a.price_usd;
    } else if (sortBy.field === "name") {
      return sortBy.ascending
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else if (sortBy.field === "priceCh24H") {
      return sortBy.ascending
        ? a.percent_change_24h - b.percent_change_24h
        : b.percent_change_24h - a.percent_change_24h;
    } else if (sortBy.field === "priceCh7D") {
      return sortBy.ascending
        ? a.percent_change_7d - b.percent_change_7d
        : b.percent_change_7d - a.percent_change_7d;
    }
    // Default sorting by rank if no criteria selected
    return a.rank - b.rank;
  });

  const CustomTick = ({ x, y, payload }) => {
    const isCustomTick = payload.index === 0;
    const dx = isCustomTick ? 50 : 0; // Ustawiamy przesunięcie tylko dla pierwszego ticka
    return (
      <text
        x={x + dx}
        y={y}
        dy={16}
        textAnchor="middle"
        fill={
          globalTheme && globalTheme === "light"
            ? "#666666"
            : "rgba(167,139,250,0.5)"
        }
      >
        {payload.value}
      </text>
    );
  };
  const handleImageError = (event) => {
    event.target.src = "https://img.icons8.com/nolan/64/bitcoin.png";
    event.target.onError = null;
  };

  return (
    <div className="App">
      {/* <div className="App-btn-active">
        {!globalMenuActiveBtn && (
          <button
            className="activeBTN"
            onClick={() => setGlobalMenuActiveBtn(true)}
          >
            <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAPElEQVR4nO3WsQkAMAwDQe2/dALuXIVUBnMHGkDdJwBAOUuWNUcAAOBpulplfGQ8AAC/pvNbxkfGA0CaC2n/KuSsP4fKAAAAAElFTkSuQmCC" />
          </button>
        )}
        
      </div> */}
      <Profile />
      <div
        className="all-container-menu"
        id={globalSelectedVariable && "active"}
      >
        <div className="banner-app">
          <div class="all-menu-btn">
            <button
              onClick={() => {
                setGlobalMenuActiveBtn(!globalMenuActiveBtn);
              }}
              className="btn-menu-img"
            >
              {globalTheme !== "dark" ? (
                <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAPElEQVR4nO3WsQkAMAwDQe2/dALuXIVUBnMHGkDdJwBAOUuWNUcAAOBpulplfGQ8AAC/pvNbxkfGA0CaC2n/KuSsP4fKAAAAAElFTkSuQmCC" />
              ) : (
                <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAL0lEQVR4nO3BQREAMBADofVvOpXQ/w1QAEDtiHZEAADwtSPaEQEAwNeOaEcEANQDM6arjUtOdLsAAAAASUVORK5CYII=" />
              )}
            </button>
          </div>
          <h1>Crypto Dashboard</h1>
          <div className="src">
            <img src="data:image/png;base64,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" />

            <input
              type="text"
              value={globalVariable}
              onChange={(event) => {
                setGlobalVariable(event.target.value);
                setGlobalSelectedVariable(false);
              }}
              placeholder="Search for crypto..."
            />
          </div>
        </div>
        <div
          className="title"
          style={
            scrolled
              ? {
                  boxShadow:
                    globalTheme !== "dark"
                      ? "0 2px 4px rgba(229, 231, 235, 1)"
                      : "0 2px 4px rgba(31, 41, 55, 1)",
                  background:
                    globalTheme !== "dark"
                      ? "rgba(243, 244, 246, 1)"
                      : "#374151",
                  position: "fixed",
                  ...(window.innerWidth >= 1700
                    ? { maxWidth: "1400px" }
                    : window.innerWidth < 1700 && window.innerWidth > 531
                    ? { width: "calc(100% - 40px)" }
                    : {
                        padding: "10px 0px 10px 0px",
                        width: "96%",
                      }),
                  borderRadius: "0px",
                }
              : {}
          } /*style={scrolled ? { backgroundColor: "#0D1217", color: "white",width: "100%"} : {}}*/
        >
          <div className="title-fav"></div>
          <div className="title-rank" onClick={() => handleSort("rank")}>
            #
          </div>
          <div className="title-coin" onClick={() => handleSort("name")}>
            Coin
          </div>
          <div className="title-price" onClick={() => handleSort("price")}>
            Price
          </div>
          <div className="title-buy"></div>
          <div
            className="title-price24h"
            onClick={() => handleSort("priceCh24H")}
          >
            24H
          </div>
          <div
            className="title-price7D"
            onClick={() => handleSort("priceCh7D")}
          >
            7D
          </div>
          {/* {scrolled&&<span className="title-border-line"/>} */}
        </div>

        {sortedData
          .filter((item) =>
            globalSelectedVariable
              ? item.symbol === globalVariable.toUpperCase()
              : item.symbol.includes(globalVariable.toUpperCase()) ||
                item.name.includes(globalVariable)
          )
          .map((item) => (
            <div
              key={item.symbol}
              className={
                globalSelectedVariable
                  ? "main-panel-items-active"
                  : "main-panel-items"
              }
            >
              <div className="main-panel-rank-numer">{item?.rank}</div>
              {
                <div
                  className="main-panel-favourite"
                  onClick={() => {
                    setFavourite(item.symbol);
                  }}
                >
                  {/* <img
                    width="16"
                    height="16"
                    src={
                      symbolsExistence[item.symbol]
                        ? "https://img.icons8.com/windows/16/000000/star--v1.png" 
                        : (globalSelectedVariable ? "https://img.icons8.com/metro/16/000000/star.png": "https://img.icons8.com/metro/16/star.png")
                    }
                    alt="star"
                  /> */}
                  {/* {
                    if(symbolsExistence[item.symbol]){
                      <img width="16" height="16" src="https://img.icons8.com/fluency/16/star--v1.png" alt="star--v1"/>
                    }
                    else if(globalSelectedVariable && theme === "dark"){
                      <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA40lEQVR4nLXQvUoDURAF4IUs/oBgkS5Y2aUJSEprX8cX0DYKWmhlJQQUERstRRtN54OEgMHSSoRPLhkxmM2NRjxwYDk/M3e2KP4T2Ej8y4CzxHnLDbwEG/MM2McRjrH301KJNWxiiPXgMLTklVWlUwzwhj6e0BnLdELrR2YQnfIzsIJ7XGMp88IFXOIRq9/NRVzhYcL8WnKHGyxP21DDBboVXje82qwfeYidCn0XB9lyAnrYQhO3wWZovSIHoxNecY5nbAfTd9KSN/0EtPCOE9TH9HpoyWvlBrRzgVjQzp7xW3wAXwU9rYrZLOQAAAAASUVORK5CYII=" width={16} height={16}/>
                    }
                    else if(){

                    }
                  } */}

                  {symbolsExistence[item.symbol] ? (
                    <img
                      width="16"
                      height="16"
                      src="https://img.icons8.com/fluency/16/star--v1.png"
                      alt="star--v1"
                    />
                  ) : globalTheme === "dark" ? (
                    <img
                      src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA40lEQVR4nLXQvUoDURAF4IUs/oBgkS5Y2aUJSEprX8cX0DYKWmhlJQQUERstRRtN54OEgMHSSoRPLhkxmM2NRjxwYDk/M3e2KP4T2Ej8y4CzxHnLDbwEG/MM2McRjrH301KJNWxiiPXgMLTklVWlUwzwhj6e0BnLdELrR2YQnfIzsIJ7XGMp88IFXOIRq9/NRVzhYcL8WnKHGyxP21DDBboVXje82qwfeYidCn0XB9lyAnrYQhO3wWZovSIHoxNecY5nbAfTd9KSN/0EtPCOE9TH9HpoyWvlBrRzgVjQzp7xW3wAXwU9rYrZLOQAAAAASUVORK5CYII="
                      width={16}
                      height={16}
                    />
                  ) : (
                    <img
                      width="16"
                      height="16"
                      src="https://img.icons8.com/windows/16/000000/star.png"
                      alt="star"
                    />
                  )}
                </div>
              }
              <div
                className="main-panel-symbol"
                onClick={() => {
                  setGlobalVariable(item?.symbol);
                  setGlobalVariablePrice(item?.price_usd);
                  setGlobalSelectedVariable(true);
                  upDCH(
                    setGlobalChartState,
                    item.price_usd,
                    item?.percent_change_1h,
                    item?.percent_change_24h,
                    item?.percent_change_7d
                  );
                }}
              >
                <span className="main-panel-symbol-text">
                  <img
                    src={`https://assets.coincap.io/assets/icons/${item?.symbol.toLowerCase()}@2x.png`}
                    width={32}
                    height={32}
                    alt="a"
                    onError={handleImageError}
                  />
                  {item?.name + " " + item?.symbol}
                </span>
              </div>
              <div className="main-panel-itemBuy">
                <button
                  onClick={() => {
                    setGlobalVariable(item?.symbol);
                    setGlobalVariablePrice(item?.price_usd);
                    setGlobalSelectedVariable(true);

                    upDCH(
                      setGlobalChartState,
                      item.price_usd,
                      item?.percent_change_1h,
                      item?.percent_change_24h,
                      item?.percent_change_7d
                    );
                  }}
                >
                  BUY / SELL
                </button>
              </div>
              <div className="main-panel-itemPriceUsd">
                {"$" + item?.price_usd}
              </div>
              <div className="main-panel-itemPriceCh24H">
                {item?.percent_change_24h}
              </div>
              <div className="main-panel-itemPriceCh7D">
                {item?.percent_change_7d}
              </div>
              <span className="main-title-24h">24H</span>
              <span className="main-title-7d">7D</span>

              {globalSelectedVariable && (
                <div className="main-panel-chart">
                  <ResponsiveContainer width="98%" height={300}>
                    <LineChart
                      width={window.innerWidth / 1.5}
                      height={window.innerWidth / 6}
                      data={globalChartState}
                    >
                      {/* <defs>
                        <linearGradient
                          id="colorview"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#2451B7"
                            stopOpacity={0.4}
                          />
                          <stop
                            offset="75%"
                            stopColor="#2451B7"
                            stopOpacity={0.05}
                          />
                        </linearGradient>
                      </defs> */}

                      <Line
                        dataKey="procent"
                        type={"monotone"}
                        stroke={
                          globalTheme && globalTheme === "light"
                            ? "#3b82f6"
                            : "#8A4FFF"
                        }
                        strokeWidth={2}
                        fill="url(#colorview)"
                      />

                      <XAxis
                        dataKey="name"
                        stroke={
                          globalTheme && globalTheme === "light"
                            ? "#666666"
                            : "rgba(167,139,250,0.5)"
                        }
                        axisLine={false}
                        tickLine={false}
                        tick={<CustomTick />}
                      />

                      <YAxis
                        dataKey="procent"
                        axisLine={false}
                        tickLine={false}
                        tickCount={6}
                        tickFormatter={(number) => `$${number}`}
                        type="number"
                        domain={["dataMin", "auto"]}
                        stroke={
                          globalTheme && globalTheme === "light"
                            ? "#666666"
                            : "rgba(167,139,250,0.5)"
                        }
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <CartesianGrid
                        opacity={0.2}
                        stroke={
                          globalTheme && globalTheme === "light"
                            ? "black"
                            : "black"
                        }
                        vertical={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
              {globalSelectedVariable && <BuyCrypto />}
              {globalSelectedVariable && <SellCrypto />}
            </div>
          ))}

        <Routes>
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;

function CustomTooltip({ active, payload, label }) {
  if (active) {
    return (
      <div className="tooltip">
        <p>{payload[0].payload.name}</p>
        {payload[0].value.toString().startsWith("0")
          ? payload[0].value
          : payload[0].value.toFixed(2)}
      </div>
    );
  }
}
