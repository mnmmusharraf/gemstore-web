import React from "react";
import "../../styles/FeedSection.css";

const gems = [
  {
    id: 1,
    title: "Natural Emerald Oval Cut",
    seller: "aurora_gems",
    image:
      "https://images.pexels.com/photos/13333131/pexels-photo-13333131.jpeg?auto=compress&cs=tinysrgb&w=600",
    price: "$1,200",
    location: "Colombia",
    carat: "2.1 ct",
  },
  {
    id: 2,
    title: "Royal Blue Sapphire",
    seller: "bluecore_stones",
    image:
      "https://images.pexels.com/photos/3651148/pexels-photo-3651148.jpeg?auto=compress&cs=tinysrgb&w=600",
    price: "$3,450",
    location: "Sri Lanka",
    carat: "3.0 ct",
  },
];

function FeedSection() {
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

export default FeedSection;