import React from "react";

export const StatsCard: React.FC = () => (
  <div className="sketch-card bg-yellow-50 dark:bg-yellow-900/10 transform -rotate-2">
    <h3 className="font-bold text-xl mb-2 border-b-2 border-border pb-1 inline-block">
      Stats
    </h3>
    <div className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">Processing</p>
        <p className="text-2xl font-bold text-primary">Local</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Privacy</p>
        <p className="text-2xl font-bold text-green-600">100%</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Cost</p>
        <p className="text-2xl font-bold text-secondary-foreground decoration-wavy underline decoration-secondary">
          Free
        </p>
      </div>
    </div>
  </div>
);
