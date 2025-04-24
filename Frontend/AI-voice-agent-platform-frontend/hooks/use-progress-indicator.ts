'use client';

import { useState, useEffect } from 'react';

/**
 * Custom hook to manage progress indicator visibility across pages
 * This uses localStorage to persist the state across page navigation
 */
export function useProgressIndicator() {
  const [showProgressIndicator, setShowProgressIndicator] = useState(true);
  
  // On initial load, check localStorage to see if we've already shown the progress indicator
  useEffect(() => {
    const hasSeenProgressIndicator = localStorage.getItem('hasSeenRefineProgressBar') === 'true';
    setShowProgressIndicator(!hasSeenProgressIndicator);
  }, []);
  
  // Function to hide the progress indicator and update localStorage
  const hideProgressIndicator = () => {
    setShowProgressIndicator(false);
    localStorage.setItem('hasSeenRefineProgressBar', 'true');
  };
  
  // Function to manually show the progress indicator again
  const showProgressIndicatorManually = () => {
    setShowProgressIndicator(true);
    localStorage.removeItem('hasSeenRefineProgressBar');
  };
  
  // Function to reset the progress indicator when creating a new assistant
  const resetProgressIndicator = () => {
    localStorage.removeItem('hasSeenRefineProgressBar');
    setShowProgressIndicator(true);
  };
  
  // Function to automatically hide the progress indicator after a delay
  const setupAutoHide = (delayMs = 5000) => {
    if (showProgressIndicator) {
      const timer = setTimeout(() => {
        hideProgressIndicator();
      }, delayMs);
      
      return () => clearTimeout(timer);
    }
  };
  
  return {
    showProgressIndicator,
    hideProgressIndicator,
    showProgressIndicatorManually,
    resetProgressIndicator, // New function to reset state
    setupAutoHide,
  };
}