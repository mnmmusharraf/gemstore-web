import React from "react";
import { FiSearch } from "react-icons/fi";
import "./Topbar.css";

const titles = {
  feed: "Explore Gemstones",
  sell: "List Your Gemstone",
  messages: "Messages",
  report: "Safety & Reports",
};

function Topbar({ activeTab }) {
  return (
    <header className="main-topbar">
      <h2 className="main-topbar-title">{titles[activeTab]}</h2>
      <div className="main-search-box">
        <FiSearch className="main-search-icon" />
        <input
          className="main-search-input"
          placeholder="Search gems by type, color, origin, seller..."
        />
      </div>
    </header>
  );
}

export default Topbar;