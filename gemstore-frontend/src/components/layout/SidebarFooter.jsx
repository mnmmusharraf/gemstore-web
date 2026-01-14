import React, { useState } from "react";
import { FiLogOut } from "react-icons/fi";

function SidebarFooter({ currentUser, onChangeTab, onLogout }) {
  const [imgError, setImgError] = useState(false);

  if (!currentUser) return null;

  const initial =
    (currentUser.displayName || currentUser.username || "U")[0].toUpperCase();

  return (
    <div className="sidebar-footer">
      <div className="sidebar-footer-row">
        {/* Profile button */}
        <button
          type="button"
          className="sidebar-user-btn"
          onClick={() => onChangeTab("profile")}
          title="Open profile"
        >
          <div className="sidebar-avatar">
            {currentUser.avatarUrl && !imgError ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.username}
                className="sidebar-avatar-img"
                onError={() => setImgError(true)}
              />
            ) : (
              <span className="sidebar-avatar-fallback">{initial}</span>
            )}
          </div>

          <div className="sidebar-user-info">
            <div className="sidebar-user-name">
              {currentUser.displayName || currentUser.username}
            </div>
            <div className="sidebar-user-handle">
              @{currentUser.username}
            </div>
          </div>
        </button>

        {/* Logout */}
        <button
          type="button"
          className="sidebar-logout-icon-btn"
          onClick={onLogout}
          title="Logout"
          aria-label="Logout"
        >
          <FiLogOut />
        </button>
      </div>
    </div>
  );
}

export default SidebarFooter;
