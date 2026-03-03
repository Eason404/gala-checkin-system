
import React, { useEffect, useState } from 'react';
import { getRecentReservations } from '../../services/dataService';
import { Reservation } from '../../types';
import { Zap } from 'lucide-react';

export const LiveTicker: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [displayText, setDisplayText] = useState('');

  // 1. Fetch Data Once on Mount
  useEffect(() => {
    const fetchData = async () => {
      const recents = await getRecentReservations(10);
      if (recents.length > 0) {
        setReservations(recents);
        // Start showing after a short delay
        setTimeout(() => setIsVisible(true), 2000);
      }
    };
    fetchData();
  }, []);

  // 2. Logic to Format and Cycle
  useEffect(() => {
    if (reservations.length === 0) return;

    const formatNotification = (res: Reservation) => {
      // Anonymize Name: "John Doe" -> "J.D"
      const parts = res.contactName.trim().split(/\s+/);
      const initials = parts.length >= 2
        ? `${parts[0][0].toUpperCase()}.${parts[parts.length - 1][0].toUpperCase()}.`
        : `${parts[0][0].toUpperCase()}.`;

      // Time Ago
      const now = Date.now();
      const diffMs = now - res.createdTime;
      const diffMins = Math.floor(diffMs / 60000);

      let timeStr = "";
      if (diffMins < 1) timeStr = "刚刚预约 (just reserved)";
      else if (diffMins < 60) timeStr = `${diffMins} 分钟前预约 (reserved ${diffMins} mins ago)`;
      else if (diffMins < 120) timeStr = `1 小时前预约 (reserved 1 hour ago)`;
      else timeStr = "今天已预约 (reserved today)";

      return `${initials} ${timeStr}`;
    };

    const updateTicker = () => {
      setIsVisible(false); // Hide first

      setTimeout(() => {
        // Change text while hidden
        setCurrentIndex((prev) => {
          const next = (prev + 1) % reservations.length;
          setDisplayText(formatNotification(reservations[next]));
          return next;
        });
        setIsVisible(true); // Show again
      }, 500); // Wait for fade out
    };

    // Initialize first text if empty
    if (!displayText) {
      setDisplayText(formatNotification(reservations[0]));
    }

    const interval = setInterval(updateTicker, 5000); // Change every 5 seconds
    return () => clearInterval(interval);

  }, [reservations, displayText]);

  if (reservations.length === 0) return null;

  return (
    <div className={`fixed bottom-24 sm:bottom-6 left-6 z-[40] transition-all duration-500 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
      <div className="bg-white/90 backdrop-blur-md border border-white/40 shadow-xl pl-2 pr-4 py-2 rounded-full flex items-center gap-3">
        <div className="bg-gradient-to-br from-cny-red to-orange-500 w-6 h-6 rounded-full flex items-center justify-center shrink-0 animate-pulse">
          <Zap className="w-3 h-3 text-white fill-white" />
        </div>
        <span className="text-xs font-bold text-gray-800 tracking-wide whitespace-nowrap">
          {displayText}
        </span>
      </div>
    </div>
  );
};
