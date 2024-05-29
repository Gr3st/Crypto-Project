import React, { useEffect, useState, useContext } from "react";
import { auth, firestore } from "../firebase";
import { useNavigate } from "react-router-dom";
import { collection, doc, setDoc, getDoc } from "firebase/firestore";
import GlobalContext from "../GlobalContext";
import Decimal from "decimal.js";

function BuyCrypto() {
  const user = auth.currentUser;
  const { globalVariable, globalSelectedVariable, globalVariablePrice } =
    useContext(GlobalContext);
  const [amount, setAmount] = useState(0);
  const [balanceUser, setBalanceUser] = useState(0);
  const [balanceCurrentUsd, setBalanceCurrentUsd] = useState(0);
  const { transactionActive, setTransactionActive } = useContext(GlobalContext);
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

  const handleBuy = async () => {
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

        const balanceCash = balanceUSD - parseFloat(amount);
        const balanceCryptoValue = parseFloat(amount) / globalVariablePrice;

        if (
          balanceCryptoName.includes(globalVariable) &&
          balanceUSD >= parseFloat(amount)
        ) {
          await setDoc(
            docRef,
            {
              balance: {
                ["USD"]: parseFloat(balanceCash.toFixed(4)),
                [globalVariable]:
                  balanceVarPrev + parseFloat(balanceCryptoValue.toFixed(4)),
              },
            },
            { merge: true }
          );
          setAmount(0);
        } else if (
          !balanceCryptoName.includes(globalVariable) &&
          balanceUSD >= parseFloat(amount)
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
        }
        setBalanceRefresh(!balanceRefresh);
      } else {
        console.error("No such document!");
      }
    } catch (error) {
      console.error("Error updating document:", error);
    }
  };

  return (
    <div className="buy-panel">
      <div className="buy-panel-items">
        <p>{"Account Balance: " + balanceCurrentUsd + " USD"}</p>
        <input
          type="number"
          placeholder="amount..."
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          max={balanceCurrentUsd}
          min={0}
        />
        <div className="buy-panel-mid">
          <button onClick={() => setAmount(balanceCurrentUsd)}>MAX</button>
        </div>
        {/* <input type="button" value={amount / globalVariablePrice} readOnly /> */}
      </div>
      <button
        className="buy-btn-panel"
        onClick={() => {
          handleBuy();
          setTransactionActive(!transactionActive);
        }}
      >
        BUY
      </button>
    </div>
  );
}

export default BuyCrypto;
