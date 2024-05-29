import React, { useEffect, useState, useContext } from "react";
import { auth, firestore } from "../firebase";
import { useNavigate } from "react-router-dom";
import { collection, doc, setDoc, getDoc } from "firebase/firestore";
import GlobalContext from "../GlobalContext";
import { Decimal } from "decimal.js";

function SellCrypto() {
  const user = auth.currentUser;
  const { globalVariable, globalSelectedVariable, globalVariablePrice } =
    useContext(GlobalContext);
  const { transactionActive, setTransactionActive } = useContext(GlobalContext);
  const [amount, setAmount] = useState(0);
  const [balanceUser, setBalanceUser] = useState(0);
  const [balanceCurrentUsd, setBalanceCurrentUsd] = useState(0);
  const { balanceRefresh, setBalanceRefresh } = useContext(GlobalContext);
  const navigate = useNavigate();

  const balanceUserGet = async () => {
    if (!user) {
      console.error("User is not authenticated");
      return;
    }
    try {
      const db = collection(firestore, "user");
      const docRef = doc(db, user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const { balance } = docSnap.data();
        setBalanceUser(balance[globalVariable]);
        setBalanceCurrentUsd(balance["USD"]);
      } else {
        console.error("No such document!");
      }
    } catch (error) {
      console.error("Error fetching document:", error);
    }
  };

  useEffect(() => {
    if (!globalSelectedVariable) {
      navigate("/");
    } else {
      balanceUserGet();
    }
  }, [globalSelectedVariable, navigate, amount, balanceRefresh]);

  const handleSell = async () => {
    if (!user) {
      console.error("User is not authenticated");
      return;
    }
    try {
      const db = collection(firestore, "user");
      const docRef = doc(db, user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const { balance } = docSnap.data();
        const balanceCryptoName = Object.keys(balance);

        const balanceUSD = balance["USD"];
        const balanceVarPrev = balance[globalVariable];

        const balanceCash =
          balanceUSD + parseFloat(amount) * globalVariablePrice;
        const balanceCryptoValue = balanceVarPrev - parseFloat(amount);

        if (
          balanceCryptoName.includes(globalVariable) &&
          balanceVarPrev >= parseFloat(amount)
        ) {
          await setDoc(
            docRef,
            {
              balance: {
                ["USD"]: parseFloat(balanceCash.toFixed(4)),
                [globalVariable]: parseFloat(balanceCryptoValue.toFixed(4)),
              },
            },
            { merge: true }
          );
          setAmount(0);
          setBalanceRefresh(!balanceRefresh);
        } else {
          console.error("Insufficient balance or invalid cryptocurrency");
        }
      } else {
        console.error("No such document!");
      }
    } catch (error) {
      console.error("Error updating document:", error);
    }
  };

  return (
    <div className="sell-panel">
      <div className="sell-panel-items">
        <p>
          {"Account Balance: " +
            (balanceUser === undefined ? 0 : balanceUser) +
            " " +
            globalVariable}
        </p>
        <input
          type="number"
          placeholder={balanceUser}
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          min={0}
          max={balanceUser}
        />
        <div className="sell-panel-mid">
          <button
            onClick={() =>
              setAmount(balanceUser === undefined ? 0 : balanceUser)
            }
          >
            MAX
          </button>
        </div>
        {/* <input type="button" value={amount * globalVariablePrice} readOnly />*/}
      </div>
      <button
        className="sell-btn-panel"
        onClick={() => {
          handleSell();
          setTransactionActive(!transactionActive);
        }}
      >
        SELL
      </button>
    </div>
  );
}

export default SellCrypto;
