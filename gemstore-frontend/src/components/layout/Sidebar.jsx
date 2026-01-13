import React, { useState, useEffect, useRef } from "react";
import {
  FiHome,
  FiPlusSquare,
  FiSend,
  FiCompass,
  FiUser,
  FiBell,
} from "react-icons/fi";
import { API_BASE_URL, getAuthHeaders } from "../../api/config";
import "./Sidebar.css";
import {
  connectNotificationSocket,
  disconnectNotificationSocket,
} from "../../api/notificationSocket";

const navItems = [
  { key: "feed", icon: FiHome, label: "Explore" },
  { key: "sell", icon: FiPlusSquare, label: "List Gemstone" },
  { key: "notifications", icon: FiBell, label: "Notifications" },
  { key: "messages", icon: FiSend, label: "Messages" },
  { key: "report", icon: FiCompass, label: "Report" },
  { key: "profile", icon: FiUser, label: "Profile" },
];

function Sidebar({ activeTab, onChangeTab, currentUser, onLogout }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [requestsCount, setRequestsCount] = useState(0);

  // ✅ store callback safely
  const onNewNotificationRef = useRef(null);

  /* ================= SOCKET ================= */

  useEffect(() => {
    if (!currentUser?.id) return;

    connectNotificationSocket((payload) => {
      if (!payload?.isRead) {
        setUnreadCount((prev) => prev + 1);
      }

      // ✅ safe callback execution
      onNewNotificationRef.current?.(payload);
    });

    return () => disconnectNotificationSocket();
  }, [currentUser?.id]);

  /* ================= FETCH COUNTS ================= */

  useEffect(() => {
    if (!currentUser?.id) return;

    const fetchCounts = async () => {
      try {
        const notifRes = await fetch(
          `${API_BASE_URL}/api/v1/notifications/unread-count`,
          { headers: getAuthHeaders() }
        );

        if (notifRes.ok) {
          const data = await notifRes.json();
          setUnreadCount(data.data?.count || 0);
        }

        const reqRes = await fetch(
          `${API_BASE_URL}/api/v1/users/follow-requests/count`,
          { headers: getAuthHeaders() }
        );

        if (reqRes.ok) {
          const data = await reqRes.json();
          setRequestsCount(data.data?.count || 0);
        }
      } catch (err) {
        console.error("Failed to fetch counts:", err);
      }
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, [currentUser?.id]);

  /* ================= CALLBACKS ================= */

  const handleNotificationRead = (count = 1) => {
    setUnreadCount((prev) => Math.max(prev - count, 0));
  };

  const totalNotificationBadge = unreadCount + requestsCount;

  /* ================= RENDER ================= */

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
            onClick={() =>
              onChangeTab(key, {
                onNotificationRead: handleNotificationRead,
                onNewNotification: (cb) => {
                  onNewNotificationRef.current = cb;
                },
              })
            }
          >
            <span className="sidebar-icon-wrapper">
              {React.createElement(icon, { className: "sidebar-icon" })}
              {key === "notifications" && totalNotificationBadge > 0 && (
                <span className="sidebar-badge">
                  {totalNotificationBadge > 99 ? "99+" : totalNotificationBadge}
                </span>
              )}
            </span>
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        {currentUser && (
          <div
            className="sidebar-user"
            onClick={() => onChangeTab("profile")}
          >
            <div className="sidebar-avatar">
              {currentUser.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt={currentUser.username} />
              ) : (
                currentUser.username?.[0]?.toUpperCase()
              )}
            </div>
            <div>
              <div>{currentUser.displayName || currentUser.username}</div>
              <div>@{currentUser.username}</div>
            </div>
          </div>
        )}
        <button onClick={onLogout}>Logout</button>
      </div>
    </aside>
  );
}

export default Sidebar;