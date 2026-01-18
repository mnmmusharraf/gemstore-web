import { useState, useEffect, useCallback, useRef } from 'react';
import { API_BASE_URL, getAuthHeaders, handleResponse } from '../api/config';

const useFollowList = ({
  type,
  userId,
  currentUserId,
  onCountChange,
}) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [followStatus, setFollowStatus] = useState({});
  const [busy, setBusy] = useState({});

  const isFollowers = type === 'followers';

  // Use ref for callback to avoid dependency issues
  const onCountChangeRef = useRef(onCountChange);
  onCountChangeRef.current = onCountChange;

  /* ================= FETCH USERS ================= */
  const fetchUsers = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError('');

    try {
      const endpoint = isFollowers
        ? `${API_BASE_URL}/api/v1/users/${userId}/followers`
        : `${API_BASE_URL}/api/v1/users/${userId}/following`;

      const res = await fetch(endpoint, { headers: getAuthHeaders() });
      const result = await handleResponse(res);

      let list = result.data?.content || result.data || result || [];
      if (! Array.isArray(list)) list = [];

      setUsers(list);

      // Report the actual count after fetch
      const countType = isFollowers ? 'followers' : 'following';
      onCountChangeRef.current?.(countType, list.length);

      /* Fetch follow status for each user */
      if (currentUserId && list.length) {
        const statuses = {};

        await Promise.allSettled(
          list.slice(0, 50).map(async (u) => {
            if (u.id === currentUserId) return;
            try {
              const r = await fetch(
                `${API_BASE_URL}/api/v1/users/${u.id}/follow/status`,
                { headers: getAuthHeaders() }
              );
              const d = await handleResponse(r);
              statuses[u.id] = d.data?.status || 'NONE';
            } catch {
              statuses[u.id] = 'NONE';
            }
          })
        );

        setFollowStatus(statuses);
      }
    } catch (e) {
      console.error(e);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [userId, isFollowers, currentUserId]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  /* ================= TOGGLE FOLLOW ================= */
  const toggleFollow = async (targetUserId) => {
    if (!currentUserId || targetUserId === currentUserId) return;

    setBusy((b) => ({ ...b, [targetUserId]:  true }));
    const prev = followStatus[targetUserId] || 'NONE';

    // Optimistic update
    setFollowStatus((m) => ({
      ...m,
      [targetUserId]: prev === 'ACTIVE' ? 'NONE' : 'PENDING',
    }));

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/v1/users/${targetUserId}/follow/toggle`,
        { method: 'POST', headers: getAuthHeaders() }
      );
      const data = await handleResponse(res);

      const isNowFollowing = data. data?.isFollowing;
      const isPending = data.data?. isPending;

      const finalStatus = isNowFollowing
        ? isPending ?  'PENDING' : 'ACTIVE'
        : 'NONE';

      setFollowStatus((m) => ({ ...m, [targetUserId]: finalStatus }));

      // If unfollowed from "Following" list, remove from list
      if (!isFollowers && finalStatus === 'NONE') {
        setUsers((prevUsers) => {
          const newList = prevUsers.filter((x) => x.id !== targetUserId);
          // Report new count
          onCountChangeRef. current?.('following', newList. length);
          return newList;
        });
      }

    } catch {
      setFollowStatus((m) => ({ ...m, [targetUserId]: prev }));
    } finally {
      setBusy((b) => {
        const n = { ...b };
        delete n[targetUserId];
        return n;
      });
    }
  };

  /* ================= REMOVE FOLLOWER ================= */
  const removeFollower = async (followerId) => {
    if (userId !== currentUserId) return;

    setBusy((b) => ({ ...b, [followerId]: true }));

    try {
      await fetch(
        `${API_BASE_URL}/api/v1/users/followers/${followerId}/remove`,
        { method: 'DELETE', headers: getAuthHeaders() }
      );

      setUsers((prevUsers) => {
        const newList = prevUsers.filter((x) => x.id !== followerId);
        // Report new count
        onCountChangeRef.current?.('followers', newList.length);
        return newList;
      });

    } catch (e) {
      console.error('Failed to remove follower:', e);
    } finally {
      setBusy((b) => {
        const n = { ... b };
        delete n[followerId];
        return n;
      });
    }
  };

  return {
    users,
    loading,
    error,
    followStatus,
    busy,
    isFollowers,
    fetchUsers,
    toggleFollow,
    removeFollower,
  };
};

export default useFollowList;