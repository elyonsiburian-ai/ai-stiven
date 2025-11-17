
import React from 'react';

export const IconProps = {
  className: 'w-6 h-6',
};

export const MicIcon: React.FC<{ className?: string }> = ({ className = IconProps.className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
  </svg>
);

export const StopIcon: React.FC<{ className?: string }> = ({ className = IconProps.className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z" clipRule="evenodd" />
  </svg>
);

export const SendIcon: React.FC<{ className?: string }> = ({ className = IconProps.className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
  </svg>
);

export const BotIcon: React.FC<{ className?: string }> = ({ className = IconProps.className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" >
    <path fillRule="evenodd" d="M4.5 3.75a3 3 0 00-3 3v10.5a3 3 0 003 3h15a3 3 0 003-3V6.75a3 3 0 00-3-3h-15zm4.125 3.375a.75.75 0 000 1.5h6.75a.75.75 0 000-1.5h-6.75zm0 3.75a.75.75 0 000 1.5h6.75a.75.75 0 000-1.5h-6.75z" clipRule="evenodd" />
  </svg>
);

export const UserIcon: React.FC<{ className?: string }> = ({ className = IconProps.className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
  </svg>
);

export const GoogleIcon: React.FC<{ className?: string }> = ({ className = IconProps.className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
    <path fill="#4285F4" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path>
    <path fill="#34A853" d="m43.611 20.083l-1.341 7.334l-7.334 1.341l.001-8.675z"></path>
    <path fill="#FBBC05" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A7.999 7.999 0 0 1 24 36c-4.418 0-8-3.582-8-8h-8c0 6.627 5.373 12 12 12z"></p>
    <path fill="#EA4335" d="M43.611 20.083H24v8h11.303a12 12 0 0 1-4.062 6.573l6.19 5.238C42.023 35.591 44 30.134 44 24c0-1.341-.138-2.65-.389-3.917z"></path>
  </svg>
);

export const BoltIcon: React.FC<{ className?: string }> = ({ className = IconProps.className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M10.5 3.75a.75.75 0 01.75.75v5.25h3.75a.75.75 0 01.53 1.28l-7.5 7.5a.75.75 0 01-1.28-.53v-5.25H6a.75.75 0 01-.53-1.28l7.5-7.5a.75.75 0 01.53-.22z" clipRule="evenodd" />
  </svg>
);

export const NetworkIntelligenceIcon: React.FC<{ className?: string }> = ({ className = IconProps.className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1h-2v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
  </svg>
);

export const AudioSparkIcon: React.FC<{ className?: string }> = ({ className = IconProps.className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 3a9 9 0 0 0-9 9v.75a.75.75 0 0 0 1.5 0V12a7.5 7.5 0 0 1 15 0v.75a.75.75 0 0 0 1.5 0V12a9 9 0 0 0-9-9Z" />
    <path d="M12 14.25a3.75 3.75 0 0 0-3.75 3.75v.75h7.5v-.75A3.75 3.75 0 0 0 12 14.25Z" />
    <path fillRule="evenodd" d="M17.462 13.918a.75.75 0 0 1 .425 1.258l-2.071 1.381a.75.75 0 0 1-1.012-.213l-.92-1.38a.75.75 0 1 1 1.258-.838l.492.738 1.828-1.218a.75.75 0 0 1 .838.212Zm-10.924 0a.75.75 0 0 0-.838.212l-1.828 1.218-.492-.738a.75.75 0 1 0-1.258.838l.92 1.38a.75.75 0 0 0 1.012.213l2.07-1.381a.75.75 0 0 0-.424-1.258Z" clipRule="evenodd" />
  </svg>
);
