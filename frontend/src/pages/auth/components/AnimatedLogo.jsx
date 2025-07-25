import React from "react";

const AnimatedLogo = () => (
  <div className="flex items-center justify-center h-[350px] w-[350px]">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="320"
      height="320"
      viewBox="0 0 32 32"
      fill="none"
      className="animate-pulse"
    >
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF5722">
            <animate attributeName="offset" values="0;1;0" dur="2s" repeatCount="indefinite" />
          </stop>
          <stop offset="1" stopColor="#FF8A65">
            <animate attributeName="offset" values="1;0;1" dur="2s" repeatCount="indefinite" />
          </stop>
        </linearGradient>
      </defs>
      {/* Terminal/code window shape */}
      <rect x="4" y="5" width="24" height="22" rx="3" fill="#0E185F" stroke="url(#logoGrad)" strokeWidth="2"/>
      {/* Terminal header dots */}
      <circle cx="8" cy="9" r="1.5" fill="#FF5722"/>
      <circle cx="12" cy="9" r="1.5" fill="#FF8A65"/>
      <circle cx="16" cy="9" r="1.5" fill="#E8FFC2"/>
      {/* Code lines with theme colors */}
      <rect x="7" y="13" width="3" height="1.5" rx="0.5" fill="#FF5722"/>
      <rect x="11" y="13" width="2" height="1.5" rx="0.5" fill="#FF8A65"/>
      <rect x="14" y="13" width="4" height="1.5" rx="0.5" fill="#E8FFC2"/>
      <rect x="7" y="16" width="2" height="1.5" rx="0.5" fill="#FF8A65"/>
      <rect x="10" y="16" width="1" height="1.5" rx="0.5" fill="#FF5722"/>
      <rect x="12" y="16" width="6" height="1.5" rx="0.5" fill="#E8FFC2"/>
      <rect x="7" y="19" width="3" height="1.5" rx="0.5" fill="#E8FFC2"/>
      <rect x="11" y="19" width="1" height="1.5" rx="0.5" fill="#FF5722"/>
      <rect x="13" y="19" width="4" height="1.5" rx="0.5" fill="#FF8A65"/>
      <rect x="7" y="22" width="2" height="1.5" rx="0.5" fill="#FF5722"/>
      <rect x="19" y="22" width="1" height="1.5" fill="#ffffff"/>
    </svg>
  </div>
);

export default AnimatedLogo; 