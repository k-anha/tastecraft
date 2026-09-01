import React from 'react';
import { DatabaseLoader } from './DatabaseLoader';

export const LoadingFallback = ({ message = "Loading TasteCraft...", subtitle = "Fetching content from database" }) => {
  return (
    <div className="flex-1 min-h-[60vh] flex items-center justify-center p-8">
      <DatabaseLoader message={message} subtitle={subtitle} />
    </div>
  );
};
