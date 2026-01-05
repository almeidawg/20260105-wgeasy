// src/components/ui/ImpersonationBar.tsx
// Barra que indica quando um admin está acessando como outro usuário

import { Shield, X, User } from "lucide-react";
import { Button } from "./button";

interface ImpersonationBarProps {
  userName: string;
  userType?: string;
  onExit: () => void;
}

export default function ImpersonationBar({ userName, userType, onExit }: ImpersonationBarProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1">
            <Shield className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">Modo CEO</span>
          </div>

          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span className="font-medium">
              Acessando como: <strong>{userName}</strong>
            </span>
            {userType && (
              <span className="bg-white/20 rounded px-2 py-0.5 text-xs uppercase">
                {userType}
              </span>
            )}
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onExit}
          className="text-white hover:bg-white/20 hover:text-white"
        >
          <X className="w-4 h-4 mr-1" />
          Sair do modo master
        </Button>
      </div>
    </div>
  );
}
