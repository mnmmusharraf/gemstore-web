import React, { useState } from 'react';

const ProfilePostsGrid = ({ postsCount, posts = [] }) => {
  const [activeTab, setActiveTab] = useState('posts');

  return (
    <div className="profile-content">
      <div className="profile-tabs">
        <button
          className={`profile-tab ${activeTab === 'posts' ? 'profile-tab-active' : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          <span className="profile-tab-icon">📷</span> Posts
        </button>
        <button
          className={`profile-tab ${activeTab === 'saved' ? 'profile-tab-active' : ''}`}
          onClick={() => setActiveTab('saved')}
        >
          <span className="profile-tab-icon">🔖</span> Saved
        </button>
      </div>

      <div className="profile-posts-grid">
        {activeTab === 'posts' && (
          <>
            {postsCount === 0 ? (
              <EmptyPosts />
            ) : (
              posts.map((post) => (
                <PostTile key={post.id} post={post} />
              ))
            )}
          </>
        )}

        {activeTab === 'saved' && (
          <div className="profile-no-posts">
            <div className="profile-no-posts-icon">🔖</div>
            <span>No saved posts yet</span>
            <p>Save posts to see them here. </p>
          </div>
        )}
      </div>
    </div>
  );
};

const EmptyPosts = () => (
  <div className="profile-no-posts">
    <div className="profile-no-posts-icon">💎</div>
    <span>No posts yet</span>
    <p>When you list gemstones, they will appear here. </p>
  </div>
);

const PostTile = ({ post }) => (
  <div className="profile-post-tile">
    {post.imageUrl ?  (
      <img src={post.imageUrl} alt={post.title} className="profile-post-img" />
    ) : (
      <span className="profile-post-placeholder">Post {post.id}</span>
    )}
  </div>
);

export default ProfilePostsGrid;