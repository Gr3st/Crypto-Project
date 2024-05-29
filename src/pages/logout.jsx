import { useEffect, useState } from "react";
import { auth, provider } from "../firebase";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";

function Logout() {
  const navigate = useNavigate();
  const handle = async () => {
    await signOut(auth);
    window.location.reload();
    navigate("/App");
  };
  return (
    <div className="Menu-SignOut">
      <button onClick={handle}>
        {/* <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAsUlEQVR4nM2VPQqDMBiGH0c9gi7iqrNX6NajtLs39BB1EsUDOFsKCUhJkxj9qi+8kCXvA8n3AycoAwqLk9DgGuiAxeEeiLeGR57hSyggXQXcHE8UE6B8BficD1d+ZUADtEApBWjVvQmoJACVCrdCfgEyR0Vp34HZBjEBnp59YfL4Xc4mwGMHYPAB6AYspJ7oL598iTJtpBvNS+KAdMO4TkIhogtHr8yXJAAl1/zZFX643s+diHzujVJcAAAAAElFTkSuQmCC" /> */}
        Sing Out
      </button>
    </div>
  );
}

export default Logout;
