import React from "react";
import "../../styles/Rightbar.css";

function Rightbar({ children }) {
  return (
    <aside className="main-rightbar">
      <div className="right-card">
        <h3 className="right-card-title">Smart Price Estimator</h3>
        <p className="right-card-text">
          Get instant guidance for your gemstone listing price.
        </p>
        {children}
      </div>

      <div className="right-card">
        <h3 className="right-card-title">Trending Searches</h3>
        <div className="right-tags">
          <button className="right-tag">Emerald</button>
          <button className="right-tag">Ruby</button>
          <button className="right-tag">Sapphire</button>
          <button className="right-tag">Opal</button>
        </div>
      </div>
    </aside>
  );
}

export default Rightbar;