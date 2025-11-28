import React from "react";
import { Check, AlertCircle } from "lucide-react";

interface StatusMessageProps {
  isDone: boolean;
  error: string | null;
}

export const StatusMessage: React.FC<StatusMessageProps> = ({
  isDone,
  error,
}) => {
  if (!isDone && !error) return null;

  if (isDone) {
    return (
      <div className="p-4 bg-green-100 dark:bg-green-900/20 sketch-border border-green-600 text-green-800 dark:text-green-300 flex items-center gap-3 transform -rotate-1">
        <Check className="w-6 h-6" />
        <div>
          <p className="font-bold text-lg">All Done!</p>
          <p className="text-sm">Your file is ready.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-red-100 dark:bg-red-900/20 sketch-border border-red-600 text-red-800 dark:text-red-300 flex items-start gap-3 transform rotate-1">
      <AlertCircle className="w-6 h-6" />
      <div>
        <p className="font-bold text-lg">Oops!</p>
        <p className="text-sm">{error}</p>
      </div>
    </div>
  );
};
