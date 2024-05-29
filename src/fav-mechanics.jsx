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
import { useState } from "react";

export const getFav = async (symbol) => {
  const user = auth.currentUser;

  const dbG = collection(firestore, "user");
  const docRef = doc(dbG, user?.uid);
  const docSnapshot = await getDoc(docRef);
  if (docSnapshot.exists()) {
    const userData = docSnapshot.data();
    // Check if userData.favourite exists and is an object
    if (
      userData &&
      userData.favourite &&
      typeof userData.favourite === "object"
    ) {
      return Object.values(userData.favourite).some(
        (value) => value === symbol
      );
    } else {
      console.error("userData.favourite is not an object or is undefined/null");
      return false;
    }
  } else {
    console.log("Document does not exist.");
    return false;
  }
};

export const Favourite = async (symbol) => {
  const user = auth.currentUser;
  if (!user) {
    console.error("User not signed in.");
    return;
  } else {
    const db = collection(firestore, "user");
    const docRef = doc(db, user.uid);
    const docSnap = await getDoc(docRef);

    try {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (!data.favourite || !data.favourite.includes(symbol)) {
          await updateDoc(docRef, {
            favourite: [...(data.favourite || []), symbol],
          });
          console.log("Symbol added to favourites.");
        } else {
          const updatedSymbols = data.favourite.filter((sym) => sym !== symbol);
          await updateDoc(docRef, { favourite: updatedSymbols });
          console.log("Symbol already exists in favourites.");
        }
      } else {
        await setDoc(docRef, { favourite: [symbol] });
        console.log("Favourites document created.");
      }
    } catch (error) {
      console.error("Error adding symbol:", error);
    }
  }
};
