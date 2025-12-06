import React, { useState } from "react";
import "../styles/HomePage.css";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import Rightbar from "../components/layout/Rightbar";
import FeedSection from "../components/feed/FeedSection";
import SellFormSection from "../components/sell/SellFormSection";
import MessagesSection from "../components/messages/MessagesSection";
import ReportSection from "../components/report/ReportSection";
import PriceEstimatorForm from "../components/estimator/PriceEstimatorForm";
import ProfilePage from "../components/profile/ProfilePage";

function HomePage({ currentUser, onLogout }) {
  const [activeTab, setActiveTab] = useState("feed"); // 'feed' | 'sell' | 'messages' | 'report' | 'profile'

  const mainRootClass =
    "main-root" + (activeTab === "profile" ? " main-root--profile" : "");

  return (
    <div className={mainRootClass}>
      <Sidebar
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        currentUser={currentUser}
        onLogout={onLogout}
      />

      <main className="main-content">
        {activeTab !== "profile" && (
          <Topbar activeTab={activeTab} />
        )}

        {activeTab === "feed" && <FeedSection />}
        {activeTab === "sell" && <SellFormSection />}
        {activeTab === "messages" && <MessagesSection />}
        {activeTab === "report" && <ReportSection />}
        {activeTab === "profile" && (
          <ProfilePage
            currentUser={currentUser}
            onBack={() => setActiveTab("feed")}
          />
        )}
      </main>

      {activeTab !== "profile" && (
        <Rightbar>
          <PriceEstimatorForm />
        </Rightbar>
      )}
    </div>
  );
}

export default HomePage;