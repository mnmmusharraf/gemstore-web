import React from "react";
import {
  FiHome,
  FiSearch,
  FiCompass,
  FiSend,
  FiPlusSquare,
  FiUser,
} from "react-icons/fi";
import "../../styles/Sidebar.css";

const navItems = [
  { key: "feed", icon: FiHome, label: "Explore" },
  { key: "sell", icon: FiPlusSquare, label: "List Gemstone" },
  { key: "messages", icon: FiSend, label: "Messages" },
  { key: "report", icon: FiCompass, label: "Report" },
  { key: "profile", icon: FiUser, label: "Profile" },
];

function Sidebar({ activeTab, onChangeTab, currentUser, onLogout }) {
  return (
    <aside className="main-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo-circle">G</div>
        <div className="sidebar-logo-text">
          <div className="sidebar-logo-main">Gemstore</div>
          <div className="sidebar-logo-sub">Marketplace</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(({ key, icon, label }) => (
          <button
            key={key}
            className={
              "sidebar-nav-item" +
              (activeTab === key ? " sidebar-nav-item-active" : "")
            }
            onClick={() => onChangeTab(key)}
          >
            {React.createElement(icon, { className: "sidebar-icon" })}
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        {currentUser && (
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {(currentUser.displayName || currentUser.username || "G")
                .charAt(0)
                .toUpperCase()}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">
                {currentUser.displayName || currentUser.username}
              </div>
              <div className="sidebar-user-handle">@{currentUser.username}</div>
            </div>
          </div>
        )}
        <button className="sidebar-logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;