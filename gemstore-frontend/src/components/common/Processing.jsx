import React from "react";

export default function Processing({text = "Processing..."}) {
  return (
    <div 
      style={{
        display: "flex", 
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        gap: "20px",
      }}
    >
      {/* Logo placeholder */}
      <div 
        style={{
          fontSize: "32px",
          fontWeight: "bold",
          color: "#3897f0",
        }}
      >
        Gemstore
      </div>
      
      {/* Spinner */}
      <div
        style={{
          border: "4px solid #f3f3f3",
          borderTop: "4px solid #3897f0",
          borderRadius: "50%",
          width: "40px",
          height: "40px", 
          animation: "spin 1s linear infinite",
        }}
      />
      <div>{text}</div>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg);}
          100% { transform: rotate(360deg);}
        }
      `}</style>
    </div>
  );
}