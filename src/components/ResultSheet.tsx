"use client";

import { useEffect, useState } from "react";
import BottomSheet from "./BottomSheet";
import { ACHIEVEMENTS, getAchievementProgress } from "@/lib/gameHistory";
import { Trophy } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  time: number;
  rank: number | null;
  crosswordTitle: string;
}

function fmt(s: number) {
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
}

export default function ResultSheet({
  open,
  onClose,
  time,
  rank,
  crosswordTitle,
}: Props) {
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [showAchievements, setShowAchievements] = useState(false);

  useEffect(() => {
    if (open) {
      setProgress(getAchievementProgress());
      setTimeout(() => setShowAchievements(true), 600);
    } else {
      setShowAchievements(false);
    }
  }, [open]);

  const newAchievements = ACHIEVEMENTS.filter(
    (a) => progress[a.id] >= a.maxProgress
  );

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="space-y-5">
        <div className="text-center pt-2">
          <div className="text-4xl mb-2">🎉</div>
          <h3 className="text-xl font-semibold">решено!</h3>
          <p className="text-gray-400 text-sm mt-1">{crosswordTitle}</p>
        </div>

        <div className="flex gap-3">
          <div className="flex-1 bg-gray-50 rounded-xl p-3.5 text-center">
            <div className="text-2xl font-bold tabular-nums">{fmt(time)}</div>
            <div className="text-[11px] text-gray-400 uppercase tracking-wider mt-1">
              время
            </div>
          </div>
          {rank && (
            <div className="flex-1 bg-gray-50 rounded-xl p-3.5 text-center">
              <div className="text-2xl font-bold">#{rank}</div>
              <div className="text-[11px] text-gray-400 uppercase tracking-wider mt-1">
                место
              </div>
            </div>
          )}
        </div>

        {showAchievements && newAchievements.length > 0 && (
          <div className="space-y-2 animate-fade-in">
            <div className="flex items-center gap-1.5 text-xs text-gray-400 uppercase tracking-wider font-semibold">
              <Trophy size={12} />
              <span>ачивки</span>
            </div>
            {newAchievements.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-3 bg-amber-50 rounded-xl px-3.5 py-3 border border-amber-100"
              >
                <span className="text-xl">{a.icon}</span>
                <div>
                  <div className="text-sm font-medium">{a.title}</div>
                  <div className="text-xs text-gray-400">{a.description}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: "красвордс",
                  text: `Решил "${crosswordTitle}" за ${fmt(time)}!`,
                });
              }
            }}
            className="flex-1 bg-gray-100 text-gray-700 rounded-xl py-3.5 font-medium text-sm min-h-[44px] active:scale-[0.98] transition-transform"
          >
            поделиться
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-indigo-600 text-white rounded-xl py-3.5 font-medium text-sm min-h-[44px] active:scale-[0.98] transition-transform"
          >
            на главную
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}
