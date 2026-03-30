'use client';

import { ReactNode } from 'react';

interface IPhoneFrameProps {
  children: ReactNode;
}

export function IPhoneFrame({ children }: IPhoneFrameProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050505] p-8">
      {/* iPhone 15 Pro outer frame */}
      <div className="relative flex-shrink-0">
        {/* Side buttons — left */}
        {/* Silent switch */}
        <div className="absolute -left-[3px] top-[100px] h-[28px] w-[3px] rounded-l-sm bg-[#2A2A2A]" />
        {/* Volume up */}
        <div className="absolute -left-[3px] top-[148px] h-[44px] w-[3px] rounded-l-sm bg-[#2A2A2A]" />
        {/* Volume down */}
        <div className="absolute -left-[3px] top-[200px] h-[44px] w-[3px] rounded-l-sm bg-[#2A2A2A]" />
        {/* Side button — right (power) */}
        <div className="absolute -right-[3px] top-[168px] h-[64px] w-[3px] rounded-r-sm bg-[#2A2A2A]" />

        {/* Phone body */}
        <div
          className="relative overflow-hidden rounded-[55px] border-[6px] border-[#1A1A1A] bg-black shadow-[0_0_60px_rgba(0,0,0,0.8),0_0_120px_rgba(0,0,0,0.4)]"
          style={{ width: 430, height: 932 }}
        >
          {/* Titanium edge highlight */}
          <div className="pointer-events-none absolute inset-0 rounded-[49px] ring-1 ring-inset ring-white/[0.08]" />

          {/* Dynamic Island */}
          <div className="absolute left-1/2 top-[12px] z-20 -translate-x-1/2">
            <div className="flex h-[37px] w-[126px] items-center justify-center rounded-full bg-black">
              {/* Camera lens */}
              <div className="absolute right-[22px] h-[12px] w-[12px] rounded-full bg-[#0C0C14] ring-1 ring-[#1A1A2E]/60">
                <div className="absolute left-1/2 top-1/2 h-[4px] w-[4px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1A1A3A]">
                  <div className="absolute left-[0.5px] top-[0.5px] h-[1.5px] w-[1.5px] rounded-full bg-[#2A2A5A]/40" />
                </div>
              </div>
            </div>
          </div>

          {/* Screen viewport */}
          <div
            className="iphone-viewport absolute inset-0 overflow-y-auto overflow-x-hidden rounded-[49px]"
            style={{ width: 418, height: 920 }}
          >
            {children}
          </div>

          {/* Home indicator */}
          <div className="pointer-events-none absolute bottom-[8px] left-1/2 z-20 -translate-x-1/2">
            <div className="h-[5px] w-[134px] rounded-full bg-white/20" />
          </div>
        </div>
      </div>
    </div>
  );
}
