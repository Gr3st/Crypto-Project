import React, { useEffect, useState, useContext, useRef } from "react";

import { auth, firestore } from "./firebase";
import { useNavigate, Link } from "react-router-dom";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import GlobalContext from "./GlobalContext";
import Login from "./pages/login";
import Logout from "./pages/logout";
import axios from "axios";
import { upDCH } from "./chart-mechanics";

function Profile() {
  const [favourite, setFavourite] = useState([]);
  const [balanceGet, setBalanceGet] = useState([]);
  const [balanceGetValue, setBalanceGetValue] = useState({});
  const navigate = useNavigate();
  const { globalVariable, setGlobalVariable } = useContext(GlobalContext);
  const { globalSelectedVariable, setGlobalSelectedVariable } =
    useContext(GlobalContext);
  const { globalVariablePrice, setGlobalVariablePrice } =
    useContext(GlobalContext);
  const { globalMenuActiveBtn, setGlobalMenuActiveBtn } =
    useContext(GlobalContext);
  const { globalTheme, setGlobalTheme } = useContext(GlobalContext);
  const { globalAllData } = useContext(GlobalContext);
  const { globalChartState, setGlobalChartState } = useContext(GlobalContext);
  const profilePanelRef = useRef(null);
  const [act, setAct] = useState(false);

  const cleanUserData = async () => {
    const user = auth.currentUser;
    if (user) {
      const db = collection(firestore, "user");
      const docRef = doc(db, user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const { balance, ...rest } = data;

        // Usuń puste rekordy w balance
        const cleanedBalance = {};
        for (let key in balance) {
          if (balance[key] !== 0 || key === "USD") {
            cleanedBalance[key] = balance[key];
          }
        }
        // Zaktualizuj dokument
        await updateDoc(docRef, {
          balance: cleanedBalance,
          ...rest,
        });
      }
    }
  };
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        getUserData();
        getUserAccount();
        cleanUserData();
      } else {
        // Użytkownik jest wylogowany, możesz podjąć odpowiednie działania, np. przekierować go do strony logowania
      }
    });

    return () => unsubscribeAuth();
  }, []);
  useEffect(() => {
    globalAllData
      .filter((item) => item.symbol === globalVariable)
      .map((item) => setGlobalVariablePrice(item.price_usd)); // zapobiega rozwalaniu sie ceny podczas zmiany symbolu crypto
    const handleResize = () => {
      console.log(window.innerWidth);
      if (window.innerWidth >= 1700) {
        setGlobalMenuActiveBtn(true);
      }
    };
    // Funkcja do czyszczenia pustych rekordów w dokumencie użytkownika

    const handleResizeTabletPhone = (event) => {
      const windowWidth = window.innerWidth;
      if (windowWidth <= 1700) {
        if (
          profilePanelRef.current &&
          !profilePanelRef.current.contains(event.target)
        ) {
          setGlobalMenuActiveBtn(false);
        } else if (event.key === "Escape") {
          setGlobalMenuActiveBtn(false);
        }
      } else {
        setGlobalMenuActiveBtn(true);
      }
    };

    handleResize(); // Wywołaj po raz pierwszy, aby ustawić początkową wartość
    document.addEventListener("mousedown", handleResizeTabletPhone);
    document.addEventListener("keydown", handleResizeTabletPhone);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("mousedown", handleResizeTabletPhone);
      document.removeEventListener("keydown", handleResizeTabletPhone);
    };
  }, [globalVariable, globalAllData, globalMenuActiveBtn]);

  const getUserData = () => {
    const user = auth.currentUser;
    const db = collection(firestore, "user");
    const docRef = doc(db, user.uid);

    return onSnapshot(docRef, (snapshot) => {
      const userData = snapshot.data();
      const userFavourites = userData.favourite || [];
      setFavourite(userFavourites);
    });
  };

  const getUserAccount = () => {
    const user = auth.currentUser;
    const db = collection(firestore, "user");
    const docRef = doc(db, user.uid);

    return onSnapshot(docRef, (snapshot) => {
      const { balance } = snapshot.data();
      const balanceKeys = Object.keys(balance);
      setBalanceGet(balanceKeys);
      setBalanceGetValue(balance);
    });
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "auto", // Płynne przewijanie
    });
  };
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    setGlobalTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);
  const nav = () => {
    navigate("/");
  };

  return (
    <div
      className={globalMenuActiveBtn ? "Profile-Panel" : "Profile-Panel-Hide"}
      ref={profilePanelRef}
    >
      <div className="Profile-Panel-Menu">
        {/* <button
          className="panel-btn-menu"
          onClick={() => setGlobalMenuActiveBtn(false)}
        ></button> */}
        <div class="profile-menu-btn">
          <button onClick={toggleTheme} className="btn-dark-theme">
            {theme === "light" ? (
              <img
                src="https://img.icons8.com/ios-filled/50/do-not-disturb-2.png"
                alt="do-not-disturb-2"
              />
            ) : (
              <img
                src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAAB60lEQVR4nO2Zy04CMRRAG8MgGhOiAeNC/SRFQ/wlQf/C53cISxMVFoIPEtdujPhKNPGYhrqgGqCl0ylkTjKbGdp7D53ptHeESElJSRTgDDgXkw4KMemQigRGcCMCLAE5XyJABCyathtF4g1oAMW4RYAicAk8A3njhAd0PAtcqZyaJjJAHagZSjRVLBkzsk58hAAtYMVpgL8xruOIEbuMN4kBQ288AejIPmxvXRcyMvC7HhTIAjvACdAGXtXRVufktazWZhn4UH36kdD+xYJ2bhvoMJx7YEtrW3AxumMBzAB7mFOVbUUoAPvYUxEhQO92GpdS0hJZdb+PS0efALyiZiBXlJMUOXUocpSkyK1DkbbLxBaAhwHB6trvuw5FurZ52IjUAhGpORs9FfDGoUjLaXKGIscORQ6SFJma6TcC7ib+hSiRq9gxJb6BDREC2K18f9kVoUBvGV+1GIlK4st4IAPMa+dKIz4zckWwqbXNO6+YjLjVvQAe9V2dmgDKcu2kChQv6pAFhUN1rS9h9QJ88rrV1YoPUibjoM9IFeT8FB/iLNn4qJt5qzsRt4x8qFXd13joTb9Y0S8jY85ZJ/5P52vAl+cidgP4BFaNEx7S+brnzwo5GVOEgq1IcKQioTFNI1J3vsdOSUkRpvwAz8P+cGfgIkcAAAAASUVORK5CYII="
                width={28}
                height={28}
              />
            )}
          </button>
          <button
            className="btn-x"
            onClick={() => {
              setGlobalMenuActiveBtn(!globalMenuActiveBtn);
              scrollToTop();
            }}
          >
            {theme === "light" ? (
              <img
                src="data:image/png;base64,iV
            BORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAA
            AACXBIWXMAAAsTAAALEwEAmpwYAAABJUlEQVR4nO3YT0sCQRyH8
            YeuUu0KG/RHUG8efAceetFBJ6noEKUI6iG1wHolxcIYg6wi67
            Qzs3w/IHga92F09zeCiIiIiMg/6QEPwKXDNRvAHXBLhYbADzAH
            Lhysdwo8W2ueUJEMmJoPfj9yZ/KdeDRrfQNdKpYCY3MBC+DKQUQ
            HT46JsSO+fEYUxSwPjMkjnkKKsGNGVsw1u50BLyFGFMWsdsQEH7
            GR7Ik534poE7hkK+YmxoiNJjAxF/4BvJr3n0CLyCTAmwnIX+uYdqJ
            2Ic06fLWSgjtXdD/2dM/tN5pnSHrA0z3Y0aTMvBVsTFpiAg5mfHc9
            xnuNyaxT4qLkKbFhzv7eTocZMHN41PUWM6zLnw99E+Miwo65BwYO1xQR
            ERER4c8v6Th7MMbV15kAAAAASUVORK5CYII="
              />
            ) : (
              <img
                src="data:image/png;base64,iVBORw0KGgoAAAAN
            SUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpw
            YAAABMUlEQVR4nO2Yy0rDUBCGD27FS4UUvBTUnQvfwIUPLbiSVlyIVgR
            1Yb2A+iSfSKcY0saUOCHnhP9bZfWf+Zi0ZyYhCCGEEEII0QTAETAEth0
            zV4Ez4NQrc5lDL5jyBPQd8taAq1zmik+l1QdnwIMd/PyfzlgnRpb1BRz
            6VltdQA+4swImwI6DxEEz1TYoU5D4bE2iROZlGRmTuIxGoiAzzsnshhKAdeA6
            OokSmddFMtFLzAA2y2SAjYLEfogZ5mX2kpOYAWwB91b4G3Bjz+/AIKQE
            087c8stHMp3onAhdeLVY8M+V3I+dP+6SlO6QXtXtHu1oUmfeilaGGhNwNON
            7A2N8q7tIltsSJ3W2RJMZtrkdZsCj46rbjgwd+vhwbDJ9x8wfmXPgxCtT
            CCGEEEKIkOcbGkgGz7D0mYYAAAAASUVORK5CYII="
              />
            )}
          </button>
        </div>
        {auth.currentUser && (
          <div
            className="Profile-user"
            onClick={() => {
              setGlobalSelectedVariable("");
              setGlobalVariable("");
              setGlobalMenuActiveBtn(!globalMenuActiveBtn);
              scrollToTop();
            }}
          >
            <img src={auth.currentUser?.photoURL} alt="User" />
            {auth.currentUser?.displayName
              .toLowerCase()
              .replace(/(^|\s)\S/g, (char) => char.toUpperCase())}
          </div>
        )}
        {auth.currentUser && (
          <div className="Profile-Panel-Account">
            <h3>Balance</h3>
            {balanceGet
              .filter((res) => balanceGetValue[res] > 0)
              .sort((a, b) => balanceGetValue[b] - balanceGetValue[a])
              .map((res, index) => (
                <div
                  className="Panel-BTN"
                  key={index}
                  onClick={() => {
                    setGlobalVariable(res === "USD" ? globalVariable : res);
                    const selectedItem = globalAllData.find(
                      (item) => item.symbol === res
                    );
                    upDCH(
                      setGlobalChartState,
                      selectedItem?.price_usd,
                      selectedItem?.percent_change_1h,
                      selectedItem?.percent_change_24h,
                      selectedItem?.percent_change_7d
                    );
                    nav();
                    setGlobalMenuActiveBtn(!globalMenuActiveBtn);
                  }}
                >
                  {balanceGetValue[res]} {res}
                </div>
              ))}
          </div>
        )}

        <div className="Profile-home">
          {/* {theme === "light" ? (
            <img
              src="data:image/png;base64,iVBORw0KG
        goAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTA
        AALEwEAmpwYAAAB90lEQVR4nO2Yv0scQRTHP16iBIIBFQXBBAsRQZ
        GzsbS7gEIKwSKF4BXiX6CY0tLW0srSSuz8hWBhIbH0ByGEWIh2/ki
        CoqtnVhZHGB57Mvv7DucDA8fuvO97b/e9mZ0Di8WSFAPAIfBb/a4qJoA7
        wFXjHpimCngHLGiBy7EIvKdC6QD2RMA7aujX9tTcimIIuBCBzgN1wFtgVt
        z7CwxTAdSo2n7QgrsFxn3mjgLX2rz/KrEcGfEBWBZP9hjof8EmDxwJmxWggZTp
        An6IQLaAFgPbJmBd2P4CekmJr8CVKIU5VeumvAFmROndAMUE4/Ztxn/ASATNL
        8ClT/PXEjPNwKZw9BPojkG7EzgQ2ttAKzHRB5wIB0tAfVwOeNJaEj5OlO9I5MX
        6XgK+qeUzbmqUdknzdx6lub063NfEzoACyVNQvvSdO1RPFDWRPzHVuyk9ard+
        9j8WRkRfqydJnynN/2oYgVNN4BPp0y4aOjD6JpPF90pO8+/FEhh9ScsKN0oMN
        oEYcO0b4JX1wBCwCzg+B3pH3RtMOIbQxp/V2cA1GF6iJqSawK5h8N74XokJON
        p8vzNuozj4JxFDJGOT+UlolsUm4IN9A0GwJeSDLaEg2BLKuoScAJ8GruEum4R
        mWTZCOltLWbMsH9VfK6ZPzVGO2lLWtFgsVDGPMK2osGh7JHQAAAAASUVORK5CYII="
            />
          ) : (
            <img
              src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYA
        AABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAACBElEQVR4nO3Yz4tNYRzH8WP8SGkUo
        hRSJEWa2VjajTJloSwsFAv5C8gsLW0trSyt2MmQsrCQ2flRkliInd+RezFeOpwZT8/cO9
        177rnHmTzvunXrPM/n8/me832e8yPLEonEUMABPMbz/H+2lMBpfPOX7ziXNR2sxmXduYI
        1WRPBTjyIAt8rfiH5mB1Zk8Ak3kVBL2EVVuBCdOwjjjQh+LK8tzEbhGvhVIexx/ElGPez
        KGzkX4Vfi2vRmX2J/YvMGcOLaM51rKs7/G48iYLcwaYe5m7AzWjuM+yrK/wxfI5a4WLe6
        31oLMf5qPW+4uQwg3dajJ9wdADNw3jfYfGvrDr8RtyOjJ5iTwXau4o7dshdbK4q/DheRQ
        ZXMVqJQfbbY7TQDMk9xwcVHov29x+YyrfPqsJHW/JU4THH29KLO+9DPArE3mCilFh/vhO
        F1xwPS62JfEcIRD5U0e99eO8t7tZznCgjEu7VZ4aSdBFwNvC/UUbgdSCwLasZbA8XdBmB
        8CZT+/MKRgL/2TIC8wwl4bAzSAUMjnQFCv6bK+DPq+UM2hbSLo4damQBOFi8G/TCZBMLm
        NE795tYQDuYsuAdF+uD460mFjBPnZpZnWapgH5IV6ADqYX6IbVQB1IL9UOXB7JeaNWp
        RXcKmk2XadmV7C1+LTS61nLx01jS52aiUQiW9r8AhvTeS7acGUAAAAAAElFTkSuQmCC"
            />
          )} */}
          <Link
            to="/"
            onClick={() => {
              setGlobalSelectedVariable("");
              setGlobalVariable("");
              setGlobalMenuActiveBtn(!globalMenuActiveBtn);
              scrollToTop();
            }}
          >
            Home
          </Link>
        </div>
        <div className="Profile-transactions">
          {/* {theme === "light" ? (
            <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA20lEQVR4nO2ZMQoCMRBF3w2yaDuFV7ezF2zURhujrAraWXgUZSELFhZ2znzmQZpUefyZMCTgkwWwAgrB6YEXUKPLGPBoMoPUhMCYqsw5ZRwnMyUwpipzSRnvyVzbRuTV0xpHQiQiptD0pnANW0o4wRSGR1MY5y0lnGAKSQzcVR4ftsA6ukTyK0PMS2BOcInaGvBEYIlDk3gCMwJSVCRqSjigU0iiU5E4poQDOoUkPv/rIq+9ishOqrRkrt2RlPFKUSqzojC+j6SMV4pamdUmcyM4pb3+bf59kG+8AZoFPEUejb5qAAAAAElFTkSuQmCC" />
          ) : (
            <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAvUlEQVR4nO3XUQqCQBhF4X8LgUHtfyFRkpX0MgXWbk6IPij0pA/Nne63g8MMVyfCzMysQMARuAJVKGOI6CXpGGALPMaYDtiFKhyT98k8V10z4Ex+miUhNSWEZHi1kuQcM18uR/wMJZxED2jlIyZreZOOMDNbp5/AcQoPIR6Rxo/TJRQx/CYk6Xcz84iXIzI5iTewD0VAQ37qUkJOS0I2wF3+an2J0Vysf4jp1GOqyRy3oYwhpl20HmZmZpG/D2RG3N/5JqEJAAAAAElFTkSuQmCC" />
          )} */}
          <Link
            to="/transactions"
            onClick={() => {
              setGlobalMenuActiveBtn(!globalMenuActiveBtn);
              scrollToTop();
            }}
          >
            Transactions
          </Link>
        </div>
        {auth.currentUser && (
          <div className="Profile-Panel-Favourite">
            <h3>Favourite</h3>
            <div className="fav-panels">
              {favourite.map((res, index) => (
                <div
                  className="Panel-BTN"
                  key={index}
                  onClick={() => {
                    setGlobalVariable(res === "USD" ? globalVariable : res);
                    const selectedItem = globalAllData.find(
                      (item) => item.symbol === res
                    );
                    upDCH(
                      setGlobalChartState,
                      selectedItem?.price_usd,
                      selectedItem?.percent_change_1h,
                      selectedItem?.percent_change_24h,
                      selectedItem?.percent_change_7d
                    );
                    nav();
                    setGlobalMenuActiveBtn(!globalMenuActiveBtn);
                  }}
                >
                  {res}
                </div>
              ))}
            </div>
          </div>
        )}
        {auth.currentUser ? <Logout /> : <Login />}
      </div>
    </div>
  );
}

export default Profile;
