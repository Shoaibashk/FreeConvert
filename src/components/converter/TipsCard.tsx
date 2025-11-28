import React from "react";

export const TipsCard: React.FC = () => (
  <div className="sketch-card bg-blue-50 dark:bg-blue-900/10 transform rotate-1">
    <h3 className="font-bold text-lg mb-2">Quick Tips</h3>
    <ul className="list-disc list-inside space-y-2 text-sm">
      <li>Drag & drop works best</li>
      <li>MP4 is most compatible</li>
      <li>No internet needed!</li>
    </ul>
  </div>
);
