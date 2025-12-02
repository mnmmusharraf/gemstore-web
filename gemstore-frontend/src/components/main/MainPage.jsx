import React, { useState } from 'react';
import "../../styles/MainPage.css";
import ProfilePage from './ProfilePage';
import {
  FiHome,
  FiSearch,
  FiCompass,
  FiSend,
  FiPlusSquare,
  FiUser,
} from 'react-icons/fi';

function MainPage({ currentUser, onLogout }) {
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'sell' | 'messages' | 'report' | 'profile'

  const mainRootClass =
    'main-root' + (activeTab === 'profile' ? ' main-root--profile' : '');

  return (
    <div className={mainRootClass}>
      {/* Left Sidebar */}
      <aside className="main-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo-circle">G</div>
          <div className="sidebar-logo-text">
            <div className="sidebar-logo-main">Gemstore</div>
            <div className="sidebar-logo-sub">Marketplace</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={
              'sidebar-nav-item' +
              (activeTab === 'feed' ? ' sidebar-nav-item-active' : '')
            }
            onClick={() => setActiveTab('feed')}
          >
            <FiHome className="sidebar-icon" />
            <span>Explore</span>
          </button>

          <button
            className={
              'sidebar-nav-item' +
              (activeTab === 'sell' ? ' sidebar-nav-item-active' : '')
            }
            onClick={() => setActiveTab('sell')}
          >
            <FiPlusSquare className="sidebar-icon" />
            <span>List Gemstone</span>
          </button>

          <button
            className={
              'sidebar-nav-item' +
              (activeTab === 'messages' ? ' sidebar-nav-item-active' : '')
            }
            onClick={() => setActiveTab('messages')}
          >
            <FiSend className="sidebar-icon" />
            <span>Messages</span>
          </button>

          <button
            className={
              'sidebar-nav-item' +
              (activeTab === 'report' ? ' sidebar-nav-item-active' : '')
            }
            onClick={() => setActiveTab('report')}
          >
            <FiCompass className="sidebar-icon" />
            <span>Report</span>
          </button>

          <button
            className={
              'sidebar-nav-item' +
              (activeTab === 'profile' ? ' sidebar-nav-item-active' : '')
            }
            onClick={() => setActiveTab('profile')}
          >
            <FiUser className="sidebar-icon" />
            <span>Profile</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          {currentUser && (
            <div className="sidebar-user">
              <div className="sidebar-avatar">
                {currentUser.displayName
                  ? currentUser.displayName.charAt(0).toUpperCase()
                  : currentUser.username.charAt(0).toUpperCase()}
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

      {/* Main Content */}
      <main className="main-content">
        {activeTab !== 'profile' && (
          <header className="main-topbar">
            <h2 className="main-topbar-title">
              {activeTab === 'feed' && 'Explore Gemstones'}
              {activeTab === 'sell' && 'List Your Gemstone'}
              {activeTab === 'messages' && 'Messages'}
              {activeTab === 'report' && 'Safety & Reports'}
            </h2>
            <div className="main-search-box">
              <FiSearch className="main-search-icon" />
              <input
                className="main-search-input"
                placeholder="Search gems by type, color, origin, seller..."
              />
            </div>
          </header>
        )}

        {activeTab === 'feed' && <FeedSection />}
        {activeTab === 'sell' && <SellFormSection />}
        {activeTab === 'messages' && <MessagesSection />}
        {activeTab === 'report' && <ReportSection />}
        {activeTab === 'profile' && (
          <ProfilePage
            currentUser={currentUser}
            onBack={() => setActiveTab('feed')}
          />
        )}
      </main>

      {/* Right Sidebar */}
      {activeTab !== 'profile' && (
        <aside className="main-rightbar">
          <div className="right-card">
            <h3 className="right-card-title">Smart Price Estimator</h3>
            <p className="right-card-text">
              Get instant guidance for your gemstone listing price.
            </p>

            <PriceEstimatorForm />
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
      )}
    </div>
  );
}

/* --- FEED SECTION --- */

function FeedSection() {
  const gems = [
    {
      id: 1,
      title: 'Natural Emerald Oval Cut',
      seller: 'aurora_gems',
      image:
        'https://images.pexels.com/photos/13333131/pexels-photo-13333131.jpeg?auto=compress&cs=tinysrgb&w=600',
      price: '$1,200',
      location: 'Colombia',
      carat: '2.1 ct',
    },
    {
      id: 2,
      title: 'Royal Blue Sapphire',
      seller: 'bluecore_stones',
      image:
        'https://images.pexels.com/photos/3651148/pexels-photo-3651148.jpeg?auto=compress&cs=tinysrgb&w=600',
      price: '$3,450',
      location: 'Sri Lanka',
      carat: '3.0 ct',
    },
  ];

  return (
    <div className="feed-container">
      {gems.map((gem) => (
        <article key={gem.id} className="feed-card">
          <header className="feed-card-header">
            <div className="feed-avatar">
              {gem.seller.charAt(0).toUpperCase()}
            </div>
            <div className="feed-header-text">
              <div className="feed-seller-name">{gem.seller}</div>
              <div className="feed-seller-meta">
                {gem.location} • {gem.carat}
              </div>
            </div>
          </header>

          <div className="feed-image-wrapper">
            <img className="feed-image" src={gem.image} alt={gem.title} />
          </div>

          <div className="feed-card-body">
            <div className="feed-price">{gem.price}</div>
            <div className="feed-title">{gem.title}</div>
            <div className="feed-actions">
              <button className="feed-action-btn">Like</button>
              <button className="feed-action-btn">Message</button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

/* --- SELL SECTION --- */

function SellFormSection() {
  return (
    <div className="panel-card">
      <form className="sell-form">
        <div className="form-row">
          <div className="form-field">
            <label>Gemstone Type</label>
            <input placeholder="e.g. Emerald, Ruby, Sapphire" />
          </div>
          <div className="form-field">
            <label>Carat Weight</label>
            <input placeholder="e.g. 1.5" />
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label>Color</label>
            <input placeholder="e.g. Vivid Green" />
          </div>
          <div className="form-field">
            <label>Clarity</label>
            <input placeholder="e.g. VS1, Eye-clean" />
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label>Origin</label>
            <input placeholder="e.g. Colombia, Sri Lanka" />
          </div>
          <div className="form-field">
            <label>Asking Price (USD)</label>
            <input placeholder="e.g. 2500" />
          </div>
        </div>

        <div className="form-field">
          <label>Description</label>
          <textarea
            rows={3}
            placeholder="Describe the gemstone, its certification, and any other important details."
          />
        </div>

        <div className="form-field">
          <label>Photos</label>
          <div className="upload-box">
            <span>Drag & drop images here or click to browse</span>
          </div>
        </div>

        <button type="button" className="primary-btn">
          Preview Listing
        </button>
      </form>
    </div>
  );
}

/* --- PRICE ESTIMATOR (RIGHTBAR) --- */

function PriceEstimatorForm() {
  return (
    <form className="estimator-form">
      <div className="form-field">
        <label>Gemstone Type</label>
        <input placeholder="e.g. Ruby" />
      </div>
      <div className="form-field">
        <label>Carat Weight</label>
        <input placeholder="e.g. 2.0" />
      </div>
      <div className="form-field">
        <label>Quality (Color / Clarity)</label>
        <input placeholder="e.g. Vivid Red, VS" />
      </div>
      <button type="button" className="secondary-btn">
        Estimate Price
      </button>

      <div className="estimator-result">
        <span className="estimator-label">Estimated Range</span>
        <span className="estimator-value">$1,800 – $2,200</span>
        <span className="estimator-sub">Based on recent similar listings</span>
      </div>
    </form>
  );
}

/* --- MESSAGES SECTION --- */

function MessagesSection() {
  const conversations = [
    {
      id: 1,
      name: 'aurora_gems',
      lastMessage: 'Is the emerald still available?',
      time: '2h',
    },
    {
      id: 2,
      name: 'bluecore_stones',
      lastMessage: 'Can you share certification details?',
      time: '1d',
    },
  ];

  return (
    <div className="messages-layout">
      <div className="messages-sidebar">
        <div className="messages-header">Inbox</div>
        {conversations.map((c) => (
          <button key={c.id} className="messages-item">
            <div className="messages-avatar">{c.name.charAt(0).toUpperCase()}</div>
            <div className="messages-text">
              <div className="messages-name">{c.name}</div>
              <div className="messages-preview">{c.lastMessage}</div>
            </div>
            <div className="messages-time">{c.time}</div>
          </button>
        ))}
      </div>

      <div className="messages-main">
        <div className="messages-main-header">
          <div className="messages-main-name">Select a conversation</div>
          <div className="messages-main-sub">
            Start messaging buyers and sellers securely.
          </div>
        </div>
        <div className="messages-main-empty">
          <p>No conversation selected.</p>
          <p>Choose a chat from the left to start messaging.</p>
        </div>
      </div>
    </div>
  );
}

/* --- REPORT SECTION --- */

function ReportSection() {
  return (
    <div className="panel-card">
      <h3 className="panel-title">Report a Listing or User</h3>
      <p className="panel-subtitle">
        Help keep Gemstore safe. Your report is confidential and reviewed by our team.
      </p>

      <form className="report-form">
        <div className="form-field">
          <label>What are you reporting?</label>
          <select defaultValue="">
            <option value="" disabled>
              Select an option
            </option>
            <option value="fraud">Suspicious / fraudulent activity</option>
            <option value="fake">Fake or misrepresented gemstone</option>
            <option value="abuse">Harassment or abusive behavior</option>
            <option value="other">Other safety concern</option>
          </select>
        </div>

        <div className="form-field">
          <label>Listing URL or Username (optional)</label>
          <input placeholder="@username or link to listing" />
        </div>

        <div className="form-field">
          <label>Details</label>
          <textarea
            rows={4}
            placeholder="Describe what happened. Include any important details that will help us review."
          />
        </div>

        <button type="button" className="primary-btn">
          Submit Report
        </button>
      </form>
    </div>
  );
}

export default MainPage;