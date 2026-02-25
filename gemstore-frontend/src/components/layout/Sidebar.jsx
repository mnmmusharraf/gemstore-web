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
  FiDollarSign,  // ✅ ADD THIS - for estimator icon
} from "react-icons/fi";
import { API_BASE_URL, getAuthHeaders } from "../../api/config";
import "./Sidebar.css";
import {
  connectNotificationSocket,
  disconnectNotificationSocket,
} from "../../api/notificationSocket";
import "./SidebarFooter.css";

const navItems = [
  { key: "feed", icon: FiHome, label: "Explore" },
  { key: "sell", icon: FiPlusSquare, label: "List Gemstone" },
  { key: "estimator", icon: FiDollarSign, label: "Price Estimator" },  // ✅ ADD THIS
  { key: "notifications", icon: FiBell, label: "Notifications" },
  { key: "messages", icon: FiSend, label: "Messages" },
  { key: "report", icon: FiCompass, label: "Report" },
  { key: "people", icon: FiUsers, label: "People" },
  { key: "profile", icon: FiUser, label: "Profile" },
];

function Sidebar({ activeTab, onChangeTab, currentUser, onLogout }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [requestsCount, setRequestsCount] = useState(0);

  // store callback safely
  const onNewNotificationRef = useRef(null);

  // only used when image fails (to switch to fallback)
  const [avatarBroken, setAvatarBroken] = useState(false);

  // changes when user/avatar changes (no effect needed)
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

  const initial =
    (currentUser?.displayName || currentUser?.username || "U")[0]?.toUpperCase();

  /* ================= RENDER ================= */
  return (
    <aside className="main-sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo-circle">G</div>
        <div className="sidebar-logo-text">
          <div className="sidebar-logo-main">Gemstore</div>
          <div className="sidebar-logo-sub">Marketplace</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map(({ key, icon, label }) => (
          <button
            key={key}
            className={
              "sidebar-nav-item" +
              (activeTab === key ? " sidebar-nav-item-active" : "") +
              (key === "estimator" ? " sidebar-nav-item-highlight" : "")  // ✅ Optional highlight
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
              {/* ✅ Optional: Add "AI" badge for estimator */}
              {key === "estimator" && (
                <span className="sidebar-ai-badge">AI</span>
              )}
            </span>
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* Footer */}
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