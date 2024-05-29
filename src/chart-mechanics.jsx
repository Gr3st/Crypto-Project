import {
  collection,
  doc,
  setDoc,
  getDocs,
  updateDoc,
  getDoc,
  where,
  query,
} from "firebase/firestore";
import { firestore } from "./firebase";
import { auth } from "./firebase";
import React, { useEffect, useState, useContext } from "react";
import GlobalContext from "./GlobalContext";

export const upDCH = (setGlobalChartState, price, date1h, date24h, date7d) => {
  const time7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleString(
    "default",
    { day: "numeric", month: "short" }
  );
  const time24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleString(
    "default",
    { day: "numeric", month: "short" }
  );
  const time1h = new Date();
  // Czas sprzed godziny
  // 3600000 milisekund = 1 godzina
  // Create a new array with updated data
  const totalPrice1h = price * (1 + date1h / 100);
  const totalPrice24h = price * (1 + date24h / 100);
  const totalPrice7d = price * (1 + date7d / 100);
  setGlobalChartState([
    { name: `${time7d}`, procent: totalPrice7d },
    { name: `${time24h}`, procent: totalPrice24h },
    {
      name: `${
        time1h.getHours().toString().padStart(2, "0") +
        ":" +
        time1h.getMinutes().toString().padStart(2, "0")
      }`,
      procent: totalPrice1h,
    },
  ]);
};
