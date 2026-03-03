import React, { useMemo, useState } from "react";
import "./HomePage.css";
import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";
import Rightbar from "../../components/layout/Rightbar";
import FeedSection from "../../components/feed/FeedSection";
import SellFormSection from "../../components/listing/SellFormSection";
import MessagesSection from "../../components/messages/MessagesSection";
import ReportSection from "../../components/report/ReportSection";
import PriceEstimatorForm from "../../components/estimator/PriceEstimatorForm";
import ProfilePage from "../ProfilePage/ProfilePage";
import PublicProfilePage from "../PublicProfilePage/PublicProfilePage";
import NotificationsSection from "../../components/notifications/NotificationsSection";
import PeopleSection from "../../components/people/PeopleSection";

function HomePage({ currentUser, onLogout }) {
  const [activeTab, setActiveTab] = useState("feed");
  const [viewingUserId, setViewingUserId] = useState(null);
  const [tabCallbacks, setTabCallbacks] = useState(null);
  const [inquiryData, setInquiryData] = useState(null);  // ✅ NEW

  const notificationProps = useMemo(() => {
    if (!tabCallbacks) return {};
    return {
      onNotificationRead: tabCallbacks.onNotificationRead,
      onNewNotification: tabCallbacks.onNewNotification,
    };
  }, [tabCallbacks]);

  const handleSellerClick = (sellerId) => {
    if (sellerId === currentUser?.id) {
      setActiveTab("profile");
      setViewingUserId(null);
    } else {
      setActiveTab("publicProfile");
      setViewingUserId(sellerId);
    }
  };

  const handleBackFromPublicProfile = () => {
    setActiveTab("feed");
    setViewingUserId(null);
  };

  const handleCreateListingFromEstimate = (estimateData) => {
    setActiveTab("sell");
    console.log("Create listing with estimate:", estimateData);
  };

  // ✅ NEW: Handle inquiry from FeedCard
  const handleInquire = (data) => {
    console.log("Starting inquiry:", data);
    setInquiryData(data);
    setActiveTab("messages");
  };

  // ✅ NEW: Clear inquiry data after it's handled
  const handleInquiryHandled = () => {
    setInquiryData(null);
  };

  const mainRootClass =
    "main-root" +
    (activeTab === "profile" || activeTab === "publicProfile"
      ? " main-root--profile"
      : "");

  const showRightbar = !["profile", "publicProfile", "messages"].includes(activeTab);

  return (
    <div className={mainRootClass}>
      <Sidebar
        activeTab={activeTab}
        onChangeTab={(tab, api) => {
          setActiveTab(tab);
          setViewingUserId(null);
          if (api) setTabCallbacks(api);
        }}
        currentUser={currentUser}
        onLogout={onLogout}
      />

      <main className="main-content">
        {activeTab !== "profile" && activeTab !== "publicProfile" && (
          <Topbar activeTab={activeTab} />
        )}

        {activeTab === "feed" && (
          <FeedSection 
            onSellerClick={handleSellerClick}
            onInquire={handleInquire}  // ✅ Pass handler
          />
        )}

        {activeTab === "sell" && <SellFormSection />}

        {activeTab === "messages" && (
          <MessagesSection 
            onMessagesRead={tabCallbacks?.onMessagesRead}
            onUserClick={handleSellerClick}
            inquiryData={inquiryData}  // ✅ Pass inquiry data
            onInquiryHandled={handleInquiryHandled}  // ✅ Clear callback
          />
        )}

        {activeTab === "report" && <ReportSection />}

        {activeTab === "people" && (
          <PeopleSection
            currentUser={currentUser}
            onUserClick={handleSellerClick}
          />
        )}

        {activeTab === "profile" && (
          <ProfilePage
            currentUser={currentUser}
            onBack={() => setActiveTab("feed")}
            onProfileUpdate={(updatedUser) => {
              console.log("Profile updated:", updatedUser);
            }}
            onUserClick={handleSellerClick}
          />
        )}

        {activeTab === "publicProfile" && viewingUserId && (
          <PublicProfilePage
            currentUser={currentUser}
            userId={viewingUserId}
            onBack={handleBackFromPublicProfile}
          />
        )}

        {activeTab === "notifications" && (
          <NotificationsSection
            currentUser={currentUser}
            onUserClick={handleSellerClick}
            {...notificationProps}
          />
        )}

        {activeTab === "estimator" && (
          <section className="estimator-page">
            <div className="estimator-page-header">
              <h1 className="estimator-page-title">
                <span className="title-icon">💎</span>
                AI Price Estimator
              </h1>
              <p className="estimator-page-subtitle">
                Get instant, AI-powered price estimates for your precious gemstones
              </p>
            </div>
            <div className="estimator-page-content">
              <PriceEstimatorForm 
                onCreateListing={handleCreateListingFromEstimate}
                fullPage={true}
              />
            </div>
          </section>
        )}
      </main>

      {showRightbar && (
        <Rightbar>
          <div className="rightbar-estimator">
            <div className="rightbar-section-header">
              <h3 className="rightbar-section-title">
                <span className="section-icon">✨</span>
                Quick Price Estimate
              </h3>
              <button 
                className="expand-btn"
                onClick={() => setActiveTab("estimator")}
                title="Open full estimator"
              >
                ↗
              </button>
            </div>
            <PriceEstimatorForm 
              compact={true}
              onCreateListing={handleCreateListingFromEstimate}
            />
          </div>
        </Rightbar>
      )}
    </div>
  );
}

export default HomePage;