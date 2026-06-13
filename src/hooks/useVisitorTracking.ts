import { useEffect, useState } from 'react';

interface VisitorData {
  isFirstVisit: boolean;
  visitCount: number;
  lastVisit: string | null;
  greetingShown: boolean;
}

export const useVisitorTracking = () => {
  const [visitorData, setVisitorData] = useState<VisitorData>({
    isFirstVisit: false,
    visitCount: 0,
    lastVisit: null,
    greetingShown: false,
  });

  useEffect(() => {
    const isFirstVisit = !localStorage.getItem('panya_has_visited');
    const visitCount = parseInt(localStorage.getItem('panya_visit_count') || '0', 10);
    const lastVisit = localStorage.getItem('panya_last_visit');
    const greetingShown = localStorage.getItem('panya_greeting_shown') === 'true';

    setVisitorData({
      isFirstVisit,
      visitCount,
      lastVisit,
      greetingShown,
    });

    // Update visit tracking
    if (!isFirstVisit) {
      const newVisitCount = visitCount + 1;
      localStorage.setItem('panya_visit_count', newVisitCount.toString());
      localStorage.setItem('panya_last_visit', new Date().toISOString());
    } else {
      localStorage.setItem('panya_has_visited', 'true');
      localStorage.setItem('panya_visit_count', '1');
      localStorage.setItem('panya_last_visit', new Date().toISOString());
    }

    // Mark greeting as shown
    localStorage.setItem('panya_greeting_shown', 'true');
  }, []);

  return visitorData;
};

export const getGreetingMessage = (visitorData: VisitorData): string => {
  if (visitorData.isFirstVisit) {
    return "Namaste! 🙏 Welcome to Panya Global Relocation - your trusted partner for seamless moves since 2010!";
  }

  const lastVisit = visitorData.lastVisit ? new Date(visitorData.lastVisit) : null;
  const now = new Date();
  const timeDiff = lastVisit ? now.getTime() - lastVisit.getTime() : 0;
  const daysDiff = timeDiff / (1000 * 3600 * 24);

  if (daysDiff < 1) {
    return "Namaste! 🙏 Welcome back! We're delighted to see you again today!";
  } else if (daysDiff < 7) {
    return `Namaste! 🙏 Welcome back! It's been ${Math.floor(daysDiff)} days since your last visit. How can we help you today?`;
  } else if (daysDiff < 30) {
    return `Namaste! 🙏 Welcome back! It's been ${Math.floor(daysDiff)} days since your last visit. We've missed you!`;
  } else {
    return `Namaste! 🙏 Welcome back! It's been ${Math.floor(daysDiff)} days since your last visit. We're excited to assist you with your relocation needs!`;
  }
};