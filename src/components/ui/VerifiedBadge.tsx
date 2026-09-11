import React from 'react';

interface VerifiedBadgeProps {
  className?: string;
  size?: number;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({ className = '', size = 16 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block text-[#3B82F6] ${className}`}
      aria-label="Verified Creator"
    >
      <title>Verified Creator</title>
      <circle cx="12" cy="12" r="10" fill="#3B82F6" />
      <path
        d="M8.5 12.5L10.5 14.5L15.5 9.5"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
