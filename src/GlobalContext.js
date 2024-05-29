// GlobalContext.js

import { createContext, useState } from "react";

const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
  const [globalVariable, setGlobalVariable] = useState("");
  const [globalSelectedVariable, setGlobalSelectedVariable] = useState("");
  const [globalVariablePrice, setGlobalVariablePrice] = useState(0);
  const [globalMenuActiveBtn, setGlobalMenuActiveBtn] = useState(false);
  const [transactionActive, setTransactionActive] = useState(false);
  const [globalAllData, setGlobalAllData] = useState([]);
  const [globalChartState, setGlobalChartState] = useState({});
  const [balanceRefresh, setBalanceRefresh] = useState(false);
  const [globalTheme, setGlobalTheme] = useState("");

  return (
    <GlobalContext.Provider
      value={{
        globalVariable,
        setGlobalVariable,
        globalSelectedVariable,
        setGlobalSelectedVariable,
        globalVariablePrice,
        setGlobalVariablePrice,
        globalMenuActiveBtn,
        setGlobalMenuActiveBtn,
        transactionActive,
        setTransactionActive,
        globalAllData,
        setGlobalAllData,
        globalChartState,
        setGlobalChartState,
        balanceRefresh,
        setBalanceRefresh,
        globalTheme,
        setGlobalTheme,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalContext;
