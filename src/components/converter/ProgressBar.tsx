import React from "react";

interface ProgressBarProps {
  progress: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  if (progress <= 0) return null;
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm font-bold">
        <span className="text-muted-foreground">Converting...</span>
        <span>{progress}%</span>
      </div>
      <div className="h-4 bg-muted rounded-full overflow-hidden border-2 border-border">
        <div
          className="h-full bg-primary transition-all duration-300 relative progress-pattern"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
