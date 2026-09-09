'use client';

export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="aurexa-logo-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="#8B5CF6" />
            <stop offset="1" stopColor="#3B82F6" />
          </linearGradient>
        </defs>
        <rect width="32" height="32" rx="10" fill="url(#aurexa-logo-grad)" />
        <path
          d="M16 7L23 24H19.5L16 14.5L12.5 24H9L16 7Z"
          fill="white"
          fillOpacity="0.95"
        />
        <path d="M13 20H19V22.5H13V20Z" fill="white" fillOpacity="0.95" />
      </svg>
      <div className="flex flex-col leading-none">
        <span className="font-heading text-[15px] font-bold tracking-tight text-white">
          AUREXA <span className="text-[#8B5CF6]">AI</span>
        </span>
      </div>
    </div>
  );
}
