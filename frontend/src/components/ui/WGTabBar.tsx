// src/components/ui/WGTabBar.tsx
import React from "react";

export interface WGTabItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
}

interface WGTabBarProps {
  items: WGTabItem[];
  activeKey: string;
  onChange: (key: string) => void;
}

export const WGTabBar: React.FC<WGTabBarProps> = ({
  items,
  activeKey,
  onChange,
}) => {
  return (
    <div className="border-b border-gray-200 bg-white/70 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-thin py-2">
          {items.map((item) => {
            const isActive = item.key === activeKey;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onChange(item.key)}
                className={[
                  "relative flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all whitespace-nowrap",
                  isActive
                    ? "bg-gray-900 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100",
                ].join(" ")}
              >
                {item.icon && <span className="text-base">{item.icon}</span>}
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute inset-x-4 -bottom-1 h-0.5 rounded-full bg-gray-900" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
