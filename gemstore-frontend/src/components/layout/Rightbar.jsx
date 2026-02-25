import React from "react";
import "./Rightbar.css";

function Rightbar({ children }) {
  return (
    <aside className="rightbar">
      <div className="rightbar-content">
        {children}
      </div>
    </aside>
  );
}

export default Rightbar;