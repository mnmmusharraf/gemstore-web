import React, { useMemo, useState, useCallback } from "react";
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
import ListingEditPage from "../ListingEditPage/ListingEditPage";
import NotificationsSection from "../../components/notifications/NotificationsSection";
import PeopleSection from "../../components/people/PeopleSection";
import ShareToChatModal from "../../components/messages/ShareToChatModal";
import messageService from "../../api/messageService";
import { useLookups } from "../../hooks/useLookups";
import { toast } from "sonner";

function HomePage({ currentUser, onLogout }) {
  const [activeTab, setActiveTab] = useState("feed");
  const [viewingUserId, setViewingUserId] = useState(null);
  const [tabCallbacks, setTabCallbacks] = useState(null);
  const [inquiryData, setInquiryData] = useState(null);
  const [shareData, setShareData] = useState(null);
  const [editingListingId, setEditingListingId] = useState(null);

  // Search state
  const [searchFilters, setSearchFilters] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch lookups for filter dropdowns
  const { lookups } = useLookups();

  const notificationProps = useMemo(() => {
    if (!tabCallbacks) return {};
    return {
      onNotificationRead: tabCallbacks.onNotificationRead,
      onNewNotification: tabCallbacks.onNewNotification,
    };
  }, [tabCallbacks]);

  // ===============================
  // SEARCH
  // ===============================

  const handleSearch = useCallback((filters, query) => {
    setSearchFilters(filters);
    setSearchQuery(query || "");
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchFilters(null);
    setSearchQuery("");
  }, []);

  // ===============================
  // NAVIGATION
  // ===============================

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

  const handleEditListing = (listing) => {
    console.log("Editing listing:", listing);
    setEditingListingId(listing.id);
    setActiveTab("editListing");
  };

  const handleBackFromEditListing = () => {
    setEditingListingId(null);
    setActiveTab("profile");
  };

  // ===============================
  // DIRECT MESSAGE FROM PROFILE
  // ===============================

  const handleMessageFromProfile = (data) => {
    console.log("Starting message from profile:", data);
    setInquiryData({
      sellerId: data.recipientId,
      sellerName: data.recipientName,
      sellerAvatar: data.recipientAvatar,
      listing: null,
      isDirectMessage: true,
    });
    setActiveTab("messages");
  };

  // ===============================
  // ESTIMATOR
  // ===============================

  const handleCreateListingFromEstimate = (estimateData) => {
    setActiveTab("sell");
    console.log("Create listing with estimate:", estimateData);
  };

  // ===============================
  // INQUIRY FROM FEED
  // ===============================

  const handleInquire = (data) => {
    console.log("Starting inquiry:", data);
    setInquiryData(data);
    setActiveTab("messages");
  };

  const handleInquiryHandled = () => {
    setInquiryData(null);
  };

  // ===============================
  // SHARE TO CHAT
  // ===============================

  const handleShareToChat = (data) => {
    console.log("Opening share modal:", data);
    setShareData(data);
  };

  const handleShareSend = async (conversations, listing, customMessage) => {
    console.log("Sharing listing to:", conversations.map((c) => c.partnerDisplayName));

    const shareText = customMessage?.trim() || "Check out this listing! 👀";
    const listingData = {
      id: listing.id,
      title: listing.title,
      price: listing.price,
      currency: listing.currency,
      formattedPrice: listing.formattedPrice,
      imageUrl: listing.imageUrl,
      gemstoneType: listing.gemstoneType,
    };
    const embeddedContent = `[LISTING:${JSON.stringify(listingData)}]${shareText}`;

    try {
      const sendPromises = conversations.map((conv) =>
        messageService.sendMessage(conv.partnerId, embeddedContent, "LISTING", listing.id)
      );
      await Promise.all(sendPromises);
      toast.success(
        `Shared to ${conversations.length} ${conversations.length === 1 ? "person" : "people"}!`
      );
    } catch (error) {
      console.error("Failed to share:", error);
      toast.error("Failed to share. Please try again.");
    }
  };

  const handleCloseShareModal = () => {
    setShareData(null);
  };

  // ===============================
  // UI HELPERS
  // ===============================

  const mainRootClass =
    "main-root" +
    (activeTab === "profile" || activeTab === "publicProfile" || activeTab === "editListing"
      ? " main-root--profile"
      : "");

  const showRightbar = !["profile", "publicProfile", "messages", "editListing"].includes(activeTab);
  const showTopbar = !["profile", "publicProfile", "editListing"].includes(activeTab);

  // ===============================
  // RENDER
  // ===============================

  return (
    <div className={mainRootClass}>
      <Sidebar
        activeTab={activeTab}
        onChangeTab={(tab, api) => {
          setActiveTab(tab);
          setViewingUserId(null);
          setEditingListingId(null);
          if (tab !== "feed") {
            // Clear search when navigating away from feed
            setSearchFilters(null);
            setSearchQuery("");
          }
          if (api) setTabCallbacks(api);
        }}
        currentUser={currentUser}
        onLogout={onLogout}
      />

      <main className="main-content">
        {showTopbar && (
          <Topbar
            activeTab={activeTab}
            onSearch={handleSearch}
            onClearSearch={handleClearSearch}
            lookups={lookups}
          />
        )}

        {activeTab === "feed" && (
          <FeedSection
            onSellerClick={handleSellerClick}
            onInquire={handleInquire}
            onShareToChat={handleShareToChat}
            searchFilters={searchFilters}
            searchQuery={searchQuery}
          />
        )}

        {activeTab === "sell" && <SellFormSection />}

        {activeTab === "messages" && (
          <MessagesSection
            onMessagesRead={tabCallbacks?.onMessagesRead}
            onUserClick={handleSellerClick}
            inquiryData={inquiryData}
            onInquiryHandled={handleInquiryHandled}
          />
        )}

        {activeTab === "report" && <ReportSection />}

        {activeTab === "people" && (
          <PeopleSection currentUser={currentUser} onUserClick={handleSellerClick} />
        )}

        {activeTab === "profile" && (
          <ProfilePage
            currentUser={currentUser}
            onBack={() => setActiveTab("feed")}
            onProfileUpdate={(updatedUser) => {
              console.log("Profile updated:", updatedUser);
            }}
            onUserClick={handleSellerClick}
            onEditListing={handleEditListing}
          />
        )}

        {activeTab === "publicProfile" && viewingUserId && (
          <PublicProfilePage
            currentUser={currentUser}
            userId={viewingUserId}
            onBack={handleBackFromPublicProfile}
            onMessage={handleMessageFromProfile}
          />
        )}

        {activeTab === "editListing" && editingListingId && (
          <ListingEditPage
            currentUser={currentUser}
            listingId={editingListingId}
            onBack={handleBackFromEditListing}
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
              <h1 className="estimator-page-title">💎 AI Price Estimator</h1>
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
              <h3 className="rightbar-section-title">✨ Quick Price Estimate</h3>
              <button
                className="expand-btn"
                onClick={() => setActiveTab("estimator")}
                title="Open full estimator"
              >
                ↗
              </button>
            </div>
            <PriceEstimatorForm compact={true} onCreateListing={handleCreateListingFromEstimate} />
          </div>
        </Rightbar>
      )}

      {shareData && (
        <ShareToChatModal
          listing={shareData.listing}
          onClose={handleCloseShareModal}
          onShare={handleShareSend}
        />
      )}
    </div>
  );
}

export default HomePage;