import { useEffect, useState } from "react";
import axios from "axios";
import { getFav, Favourite } from "../fav-mechanics";

function FavouriteCMP({ symbolsExistence }) {
  return (
    <div>
      {Object.keys(symbolsExistence)
        .filter((key) => symbolsExistence[key] === true)
        .map((key) => (
          <div key={key}>{key}</div>
        ))}
    </div>
  );
}

export default FavouriteCMP;
