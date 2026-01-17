import React, { useEffect, useMemo, useState } from "react";
import "./PeopleSection.css";
import { getAllUsers, getFollowStatus, toggleFollow } from "../../api/peopleService";

export default function PeopleSection({ currentUser, onUserClick }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState({});
  const [statusMap, setStatusMap] = useState({});
  const [filter, setFilter] = useState("suggestions"); // "suggestions" | "pending" only

  // Filter users based on selected tab
  const visibleUsers = useMemo(() => {
    const me = currentUser?.id;
    const filtered = users.filter((u) => u?.id && u.id !== me);

    if (filter === "suggestions") {
      // Show only users NOT being followed (NONE status)
      return filtered.filter((u) => {
        const status = statusMap[u.id] || "NONE";
        return status === "NONE";
      });
    }

    if (filter === "pending") {
      // Show only pending requests
      return filtered.filter((u) => {
        const status = statusMap[u.id];
        return status === "PENDING";
      });
    }

    return filtered;
  }, [users, currentUser?.id, statusMap, filter]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const list = await getAllUsers();
        setUsers(Array.isArray(list) ? list : []);

        // Load follow statuses for each user
        if (currentUser?.id && Array.isArray(list)) {
          const pairs = await Promise.all(
            list
              .filter((u) => u?.id && u.id !== currentUser.id)
              .slice(0, 50)
              .map(async (u) => {
                try {
                  const res = await getFollowStatus(u.id);
                  return [u.id, res.data?.status || "NONE"];
                } catch {
                  return [u.id, "NONE"];
                }
              })
          );

          const next = {};
          for (const [id, st] of pairs) next[id] = st;
          setStatusMap(next);
        }
      } catch (e) {
        console.error(e);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [currentUser?.id]);

  const labelFor = (userId) => {
    const st = statusMap[userId] || "NONE";
    if (st === "ACTIVE") return "Following";
    if (st === "PENDING") return "Requested";
    return "Follow";
  };

  const classFor = (userId) => {
    const st = statusMap[userId] || "NONE";
    if (st === "ACTIVE") return "people-follow-btn following";
    if (st === "PENDING") return "people-follow-btn pending";
    return "people-follow-btn";
  };

  const handleToggle = async (userId) => {
    if (!currentUser?.id) return;

    setBusy((p) => ({ ...p, [userId]: true }));

    const prev = statusMap[userId] || "NONE";
    const optimistic =
      prev === "ACTIVE" ? "NONE" : prev === "PENDING" ? "NONE" : "ACTIVE";
    setStatusMap((m) => ({ ...m, [userId]: optimistic }));

    try {
      const res = await toggleFollow(userId);
      const isFollowing = Boolean(res.data?.isFollowing);
      const isPending = Boolean(res.data?.isPending);

      const finalStatus = isFollowing
        ? isPending
          ? "PENDING"
          : "ACTIVE"
        : "NONE";
      setStatusMap((m) => ({ ...m, [userId]: finalStatus }));
    } catch (e) {
      console.error(e);
      setStatusMap((m) => ({ ...m, [userId]: prev }));
    } finally {
      setBusy((p) => {
        const n = { ...p };
        delete n[userId];
        return n;
      });
    }
  };

  // Count for each category (only suggestions and pending now)
  const counts = useMemo(() => {
    const me = currentUser?.id;
    const filtered = users.filter((u) => u?.id && u.id !== me);

    return {
      suggestions: filtered.filter((u) => (statusMap[u.id] || "NONE") === "NONE").length,
      pending: filtered.filter((u) => statusMap[u.id] === "PENDING").length,
    };
  }, [users, currentUser?.id, statusMap]);

  if (loading) {
    return (
      <div className="people-root">
        <div className="people-loading">
          <div className="people-spinner" />
          <span>Finding people...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="people-root">
      <div className="people-header">
        <h2>People</h2>
        <p>Discover and connect with gem enthusiasts</p>
      </div>

      {/* Filter Tabs - Only Suggestions and Pending */}
      <div className="people-tabs">
        <button
          className={`people-tab ${filter === "suggestions" ? "active" : ""}`}
          onClick={() => setFilter("suggestions")}
        >
          Suggestions
          {counts.suggestions > 0 && (
            <span className="people-tab-count">{counts.suggestions}</span>
          )}
        </button>
        {counts.pending > 0 && (
          <button
            className={`people-tab ${filter === "pending" ? "active" : ""}`}
            onClick={() => setFilter("pending")}
          >
            Pending
            <span className="people-tab-count">{counts.pending}</span>
          </button>
        )}
      </div>

      {/* User List */}
      {visibleUsers.length === 0 ? (
        <EmptyState filter={filter} />
      ) : (
        <div className="people-list">
          {visibleUsers.map((u) => (
            <div key={u.id} className="people-row">
              <button
                className="people-user"
                onClick={() => onUserClick?.(u.id)}
                type="button"
              >
                <div className="people-avatar">
                  {u.avatarUrl ? (
                    <img src={u.avatarUrl} alt={u.username} />
                  ) : (
                    <span className="people-avatar-fallback">
                      {(u.username || "U")[0]?.toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="people-info">
                  <div className="people-username">{u.username}</div>
                  {u.displayName && (
                    <div className="people-name">{u.displayName}</div>
                  )}
                  {u.bio && (
                    <div className="people-bio">
                      {u.bio.slice(0, 50)}
                      {u.bio.length > 50 ? '...' : ''}
                    </div>
                  )}
                </div>
              </button>

              <button
                type="button"
                className={classFor(u.id)}
                onClick={() => handleToggle(u.id)}
                disabled={Boolean(busy[u.id])}
              >
                {busy[u.id] ? (
                  <span className="btn-spinner" />
                ) : (
                  labelFor(u.id)
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* Empty State Component */
const EmptyState = ({ filter }) => {
  const content = {
    suggestions: {
      icon: "👥",
      title: "No suggestions",
      message: "You're following everyone! Check back later for new users.",
    },
    pending: {
      icon: "⏳",
      title: "No pending requests",
      message: "Your follow requests will appear here.",
    },
  };

  const { icon, title, message } = content[filter] || content.suggestions;

  return (
    <div className="people-empty">
      <span className="people-empty-icon">{icon}</span>
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  );
};