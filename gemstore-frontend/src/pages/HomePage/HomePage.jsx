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
  const [notificationApi, setNotificationApi] = useState(null);

  const notificationProps = useMemo(() => {
    if (!notificationApi) return {};
    return {
      onNotificationRead: notificationApi.onNotificationRead,
      onNewNotification: notificationApi.onNewNotification,
    };
  }, [notificationApi]);

  // Handle clicking on a seller in the feed
  const handleSellerClick = (sellerId) => {
    // Check if clicking on own profile
    if (sellerId === currentUser?.id) {
      setActiveTab("profile");
      setViewingUserId(null);
    } else {
      setActiveTab("publicProfile");
      setViewingUserId(sellerId);
    }
  };

  // Handle back from public profile
  const handleBackFromPublicProfile = () => {
    setActiveTab("feed");
    setViewingUserId(null);
  };

  const mainRootClass =
    "main-root" +
    (activeTab === "profile" || activeTab === "publicProfile"
      ? " main-root--profile"
      : "");

  return (
    <div className={mainRootClass}>
      <Sidebar
        activeTab={activeTab}
        onChangeTab={(tab, api) => {
          setActiveTab(tab);
          setViewingUserId(null);
          if (api) setNotificationApi(api);
        }}
        currentUser={currentUser}
        onLogout={onLogout}
      />

      <main className="main-content">
        {activeTab !== "profile" && activeTab !== "publicProfile" && (
          <Topbar activeTab={activeTab} />
        )}

        {activeTab === "feed" && (
          <FeedSection onSellerClick={handleSellerClick} />
        )}
        
        {activeTab === "sell" && <SellFormSection />}
        
        {activeTab === "messages" && <MessagesSection />}
        
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
            onUserClick={handleSellerClick}  // ✅ ADDED THIS
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
      </main>

      {activeTab !== "profile" && activeTab !== "publicProfile" && (
        <Rightbar>
          <PriceEstimatorForm />
        </Rightbar>
      )}
    </div>
  );
}

export default HomePage;