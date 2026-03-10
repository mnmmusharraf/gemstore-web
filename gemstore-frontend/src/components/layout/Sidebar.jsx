import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  FiHome,
  FiPlusSquare,
  FiSend,
  FiCompass,
  FiUser,
  FiUsers,
  FiBell,
  FiLogOut,
  FiDollarSign,
} from "react-icons/fi";

import { API_BASE_URL, getAuthHeaders } from "../../api/config";
import {
  connectNotificationSocket,
  disconnectNotificationSocket,
} from "../../api/notificationSocket";

import logo from "../../assets/gemstore-logo.svg";   

import "./Sidebar.css";
import "./SidebarFooter.css";

const navItems = [
  { key: "feed", icon: FiHome, label: "Explore" },
  { key: "sell", icon: FiPlusSquare, label: "List Gemstone" },
  { key: "estimator", icon: FiDollarSign, label: "Price Estimator" },
  { key: "notifications", icon: FiBell, label: "Notifications" },
  { key: "messages", icon: FiSend, label: "Messages" },
  { key: "report", icon: FiCompass, label: "Report" },
  { key: "people", icon: FiUsers, label: "People" },
  { key: "profile", icon: FiUser, label: "Profile" },
];

function Sidebar({ activeTab, onChangeTab, currentUser, onLogout }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [requestsCount, setRequestsCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  const onNewNotificationRef = useRef(null);
  const [avatarBroken, setAvatarBroken] = useState(false);

  const avatarKey = useMemo(() => {
    const id = currentUser?.id ?? "no-user";
    const url = currentUser?.avatarUrl ?? "no-avatar";
    return `${id}:${url}`;
  }, [currentUser?.id, currentUser?.avatarUrl]);

  /* ================= SOCKET ================= */

  useEffect(() => {
    if (!currentUser?.id) return;

    connectNotificationSocket((payload) => {
      if (!payload?.isRead) {
        setUnreadCount((prev) => prev + 1);
      }
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

        const msgRes = await fetch(
          `${API_BASE_URL}/api/v1/messages/unread-count`,
          { headers: getAuthHeaders() }
        );

        if (msgRes.ok) {
          const data = await msgRes.json();
          setUnreadMessagesCount(data.data?.count || 0);
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

  const handleMessagesRead = () => {
    setUnreadMessagesCount(0);
  };

  const totalNotificationBadge = unreadCount + requestsCount;

  const initial =
    (currentUser?.displayName || currentUser?.username || "U")[0]?.toUpperCase();

  /* ================= RENDER ================= */

  return (
    <aside className="main-sidebar">

      {/* ===== HEADER ===== */}
      <div className="sidebar-header">

        {/* ⭐ Logo replaced here */}
        <div className="sidebar-logo-circle">
          <img
            src={logo}
            alt="GemStore Logo"
            className="sidebar-logo-img"
          />
        </div>

        <div className="sidebar-logo-text">
          <div className="sidebar-logo-main">Gemstore</div>
          <div className="sidebar-logo-sub">Marketplace</div>
        </div>
      </div>

      {/* ===== NAVIGATION ===== */}

      <nav className="sidebar-nav">
        {navItems.map(({ key, icon, label }) => (
          <button
            key={key}
            className={
              "sidebar-nav-item" +
              (activeTab === key ? " sidebar-nav-item-active" : "") +
              (key === "estimator" ? " sidebar-nav-item-highlight" : "")
            }
            onClick={() =>
              onChangeTab(key, {
                onNotificationRead: handleNotificationRead,
                onMessagesRead: handleMessagesRead,
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
                  {totalNotificationBadge > 99
                    ? "99+"
                    : totalNotificationBadge}
                </span>
              )}

              {key === "messages" && unreadMessagesCount > 0 && (
                <span className="sidebar-badge sidebar-badge-messages">
                  {unreadMessagesCount > 99
                    ? "99+"
                    : unreadMessagesCount}
                </span>
              )}

              {key === "estimator" && (
                <span className="sidebar-ai-badge">AI</span>
              )}
            </span>

            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* ===== FOOTER ===== */}

      <div className="sidebar-footer">
        {currentUser && (
          <div className="sidebar-footer-row">

            <button
              type="button"
              className="sidebar-user-btn"
              onClick={() => onChangeTab("profile")}
              title="Open profile"
            >
              <div className="sidebar-avatar">
                {currentUser.avatarUrl && !avatarBroken ? (
                  <img
                    key={avatarKey}
                    src={currentUser.avatarUrl}
                    alt={currentUser.username}
                    className="sidebar-avatar-img"
                    onLoad={() => setAvatarBroken(false)}
                    onError={() => setAvatarBroken(true)}
                  />
                ) : (
                  <span className="sidebar-avatar-fallback">
                    {initial}
                  </span>
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
        )}
      </div>

    </aside>
  );
}

export default Sidebar;