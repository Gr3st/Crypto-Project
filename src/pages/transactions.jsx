import { useEffect, useState, useContext } from "react";
import { auth, firestore } from "../firebase";
import "../App.css";
import { collection, doc, setDoc, getDocs, getDoc } from "firebase/firestore";
import GlobalContext from "../GlobalContext";
import Profile from "../Profile";

function Transactions() {
  const [random, setRandom] = useState("");
  const user = auth.currentUser;
  const [cash, setCash] = useState(0);
  const [unitPrice, setUnitPrice] = useState(0);
  const [userId, setUserId] = useState("");
  const [code, setCode] = useState("");
  const [userCryptos, setUserCryptos] = useState([]);
  const [currentUserCryptos, setCurrentUserCryptos] = useState([]);
  const { globalMenuActiveBtn, setGlobalMenuActiveBtn } =
    useContext(GlobalContext);
  const { transactionActive, setTransactionActive } = useContext(GlobalContext);
  const [selectedOption, setSelectedOption] = useState("");
  const [offerCrypto, setOfferCrypto] = useState("");
  const [connected, setConnected] = useState(false);
  const [btnActive, setBtnActive] = useState(false);
  const [btnActiveOffer, setBtnActiveOffer] = useState(false);
  const [requests, setRequests] = useState([]);
  const { globalTheme, setGlobalTheme } = useContext(GlobalContext);

  useEffect(() => {
    randomToDatabase();
  }, [random]);

  useEffect(() => {
    fetchRequests();
  }, [connected, requests, []]);

  const randomNumber = () => {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    const charactersLength = characters.length;
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    setRandom(result);
  };

  const randomToDatabase = async () => {
    try {
      const db = firestore;
      const userRef = doc(db, "user", user.uid);
      await setDoc(userRef, { randomCode: random }, { merge: true });
      console.log("Random code updated successfully!");
    } catch (error) {
      console.error("Error updating random code:", error);
    }
  };

  const checkCodeMatch = async () => {
    try {
      const db = collection(firestore, "user");
      const querySnapshot = await getDocs(db);
      const docRefUserGet = doc(db, user.uid);
      const currentUserSnap = await getDoc(docRefUserGet);
      if (currentUserSnap.exists()) {
        setCurrentUserCryptos(Object.keys(currentUserSnap.data().balance));
      }
      querySnapshot.forEach(async (doc) => {
        if (code === doc.data().randomCode && code !== "") {
          setUserCryptos(Object.keys(doc.data().balance));
          if (user.uid !== doc.id) {
            setConnected(true);
            setUserId(doc.id);
          }
        }
      });
    } catch (error) {
      console.error("Error checking code match:", error);
    }
  };

  const validateTransactionRequest = async () => {
    try {
      const db = firestore;
      const userRef = doc(db, "user", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userBalance = userSnap.data().balance;
        if (userBalance[offerCrypto] >= parseFloat(cash)) {
          return true;
        } else {
          console.error("Insufficient balance for transaction.");
          return false;
        }
      }
    } catch (error) {
      console.error("Error validating transaction request:", error);
      return false;
    }
  };

  const sendTransactionRequest = async () => {
    const isValid = await validateTransactionRequest();
    if (!isValid) {
      return;
    }

    try {
      const db = firestore;
      const userRef = doc(db, "user", userId);
      const userSnap = await getDoc(userRef);

      let existingRequests = [];
      if (userSnap.exists() && userSnap.data().requests) {
        existingRequests = userSnap.data().requests;
      }

      const isDuplicate = existingRequests.some(
        (req) =>
          req.from === user.uid &&
          req.amount === parseFloat(cash) &&
          req.crypto === selectedOption &&
          req.offerCrypto === offerCrypto &&
          req.unitPrice === parseFloat(unitPrice) &&
          req.status === "pending"
      );

      if (isDuplicate) {
        console.log("Identical transaction request already exists.");
        return;
      }

      const newRequest = {
        from: user.uid,
        img: user.photoURL,
        amount: parseFloat(cash),
        crypto: selectedOption,
        offerCrypto: offerCrypto,
        unitPrice: parseFloat(unitPrice),
        status: "pending",
      };

      await setDoc(
        userRef,
        {
          requests: [...existingRequests, newRequest],
        },
        { merge: true }
      );

      // const userSenderRef = doc(db, "user", user.uid);
      // const userSenderSnap = await getDoc(userSenderRef);
      // const senderBalance =
      //   userSenderSnap.data().balance[offerCrypto] - parseFloat(cash);
      // await setDoc(
      //   userSenderRef,
      //   {
      //     balance: {
      //       [offerCrypto]: senderBalance,
      //     },
      //   },
      //   { merge: true }
      // );

      console.log("Transaction request sent!");
    } catch (error) {
      console.error("Error sending transaction request:", error);
    }
  };

  const fetchRequests = async () => {
    try {
      const db = collection(firestore, "user");
      const docRefUserGet = doc(db, user.uid);
      const docSnap = await getDoc(docRefUserGet);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        if (userData.requests) {
          setRequests(
            userData.requests.filter((req) => req.status === "pending")
          );
        }
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };
  const approveRequest = async (request) => {
    try {
      const db = firestore;
      const docRefUserSend = doc(db, "user", request.from);
      const docRefUserGet = doc(db, "user", user.uid);

      const docS = await getDoc(docRefUserSend);
      const docG = await getDoc(docRefUserGet);

      if (!docS.exists() || !docG.exists()) {
        console.error("User document does not exist.");
        return;
      }

      const senderBalance = docS.data().balance;
      const receiverBalance = docG.data().balance;

      if (
        senderBalance[request.offerCrypto] >= request.amount &&
        receiverBalance[request.crypto] >= request.unitPrice
      ) {
        const newSenderBalance = {
          ...senderBalance,
          [request.offerCrypto]:
            senderBalance[request.offerCrypto] - request.amount,
          [request.crypto]:
            (senderBalance[request.crypto] || 0) + request.unitPrice,
        };

        const newReceiverBalance = {
          ...receiverBalance,
          [request.crypto]: receiverBalance[request.crypto] - request.unitPrice,
          [request.offerCrypto]:
            (receiverBalance[request.offerCrypto] || 0) + request.amount,
        };

        // Remove the approved request from both users' requests lists
        const updatedRequestsSender = docS
          .data()
          .requests.filter(
            (req) =>
              req.from !== request.from ||
              req.amount !== request.amount ||
              req.crypto !== request.crypto ||
              req.offerCrypto !== request.offerCrypto ||
              req.unitPrice !== request.unitPrice
          );

        const updatedRequestsReceiver = docG
          .data()
          .requests.filter(
            (req) =>
              req.from !== request.from ||
              req.amount !== request.amount ||
              req.crypto !== request.crypto ||
              req.offerCrypto !== request.offerCrypto ||
              req.unitPrice !== request.unitPrice
          );

        // Update balances and requests for the sender
        await setDoc(
          docRefUserSend,
          { balance: newSenderBalance, requests: updatedRequestsSender },
          { merge: true }
        );

        // Update balances and requests for the receiver
        await setDoc(
          docRefUserGet,
          { balance: newReceiverBalance, requests: updatedRequestsReceiver },
          { merge: true }
        );

        setConnected(false);
        console.log("Transaction approved and balances updated!");
      } else {
        console.log("Insufficient balance for transaction.");
      }
    } catch (error) {
      console.error("Error approving request:", error);
    }
  };
  useEffect(() => {
    // Update theme attribute on theme change
    setGlobalTheme(localStorage.getItem("theme"));
  }, [globalTheme, []]);

  const cancelRequest = async (request) => {
    try {
      const db = firestore;
      const docRefUserGet = doc(db, "user", user.uid);
      const docRefUserSend = doc(db, "user", request.from);

      const docSnap = await getDoc(docRefUserGet);
      if (docSnap.exists()) {
        const updatedRequests = docSnap
          .data()
          .requests.filter(
            (req) =>
              req.from !== request.from ||
              req.amount !== request.amount ||
              req.crypto !== request.crypto ||
              req.offerCrypto !== request.offerCrypto ||
              req.unitPrice !== request.unitPrice
          );

        await setDoc(
          docRefUserGet,
          { requests: updatedRequests },
          { merge: true }
        );
        setConnected(false);

        // const senderSnap = await getDoc(docRefUserSend);
        // if (senderSnap.exists()) {
        //   const lockedBalance =
        //     parseFloat(senderSnap.data().balance[request.offerCrypto]) +
        //     request.amount;

        //   await setDoc(
        //     docRefUserSend,
        //     {
        //       balance: {
        //         [request.offerCrypto]: Number(lockedBalance),
        //       },
        //     },
        //     { merge: true }
        //   );
        //   setConnected(false);
        //   console.log("Transaction request canceled and funds unlocked!");
        // } else {
        //   console.error("Sender document does not exist");
        // }
      } else {
        console.error("User document does not exist");
      }
    } catch (error) {
      console.error("Error canceling request:", error);
    }
  };

  return (
    <div className="App">
      <Profile />
      <div className="banner-app">
        <div className="all-menu-btn">
          <button
            onClick={() => {
              setGlobalMenuActiveBtn(!globalMenuActiveBtn);
            }}
            className="btn-menu-img-transaction"
          >
            {globalTheme !== "dark" ? (
              <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAPElEQVR4nO3WsQkAMAwDQe2/dALuXIVUBnMHGkDdJwBAOUuWNUcAAOBpulplfGQ8AAC/pvNbxkfGA0CaC2n/KuSsP4fKAAAAAElFTkSuQmCC" />
            ) : (
              <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAL0lEQVR4nO3BQREAMBADofVvOpXQ/w1QAEDtiHZEAADwtSPaEQEAwNeOaEcEANQDM6arjUtOdLsAAAAASUVORK5CYII=" />
            )}
          </button>
        </div>
        <div className="trading-dashboard-h2">
          <h2>Trading Dashboard</h2>
        </div>
      </div>
      <div className="menu-transactions">
        <input
          type="button"
          onClick={randomNumber}
          value={random ? "Code: " + random : "Click to generate code!"}
        />
        <input
          type="text"
          placeholder="your code..."
          onChange={(event) => setCode(event.target.value)}
        />
        {connected && (
          <>
            <div
              className="select-box"
              onClick={() => {
                setBtnActive(!btnActive);
                setBtnActiveOffer(false);
              }}
            >
              {!btnActive && (
                <div className="select-btn">
                  <span className="Btn-text">
                    {offerCrypto ? offerCrypto : "Select crypto you want"}
                  </span>
                </div>
              )}
              <ul className={btnActive ? "ul-active" : "ul-deactive"}>
                {currentUserCryptos.map((option, index) => (
                  <li
                    className="option"
                    key={index}
                    value={option}
                    onClick={(event) => setOfferCrypto(event.target.innerHTML)}
                  >
                    {option}
                  </li>
                ))}
              </ul>
            </div>
            <div
              className="select-box"
              onClick={() => {
                setBtnActiveOffer(!btnActiveOffer);
                setBtnActive(false);
              }}
            >
              {!btnActiveOffer && (
                <div className="select-btn">
                  <span className="Btn-text">
                    {selectedOption ? selectedOption : "Select your option"}
                  </span>
                </div>
              )}
              <ul className={btnActiveOffer ? "ul-active" : "ul-deactive"}>
                {userCryptos.map((option, index) => (
                  <li
                    className="option"
                    key={index}
                    value={option}
                    onClick={(event) =>
                      setSelectedOption(event.target.innerHTML)
                    }
                  >
                    {option}
                  </li>
                ))}
              </ul>
            </div>
            <div className="transaction-amount">
              <input
                type="number"
                placeholder="Amount to send..."
                onChange={(event) => setCash(event.target.value)}
              />
              {offerCrypto}
            </div>
            <div className="transaction-unit-price">
              <input
                type="number"
                placeholder="Amount to get..."
                onChange={(event) => setUnitPrice(event.target.value)}
              />
              {selectedOption}
            </div>
          </>
        )}
        <button
          onClick={() => {
            checkCodeMatch();
            setTransactionActive(!transactionActive);
            sendTransactionRequest();
          }}
        >
          {connected ? "SEND REQUEST" : "CONNECT"}
        </button>
        <div className="transaction-request-list">
          {requests.map((request, index) => (
            <div className="request" key={index}>
              <div className="request-info">
                <img src={request.img} alt="User" />
                <div className="request-info-text">
                  <p>
                    <span className="tb">Amount:</span> {request.amount}
                  </p>
                  <p>
                    <span className="tb">Offer Crypto:</span>{" "}
                    {request.offerCrypto}
                  </p>

                  <p>
                    <span className="tb">Amount:</span> {request.unitPrice}
                  </p>
                  <p>
                    <span className="tb">Get Crypto:</span> {request.crypto}
                  </p>
                </div>
              </div>
              <div className="request-btn">
                <button onClick={() => approveRequest(request)}>Approve</button>
                <button onClick={() => cancelRequest(request)}>Cancel</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Transactions;
