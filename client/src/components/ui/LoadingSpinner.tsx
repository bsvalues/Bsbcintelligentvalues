import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
}

const LoadingSpinner = ({ size = 24, className = "" }: LoadingSpinnerProps) => {
  return (
    <div className={`flex items-center justify-center w-full py-8 ${className}`}>
      <Loader2 className="animate-spin" size={size} />
      <span className="sr-only">Loading</span>
    </div>
  );
};

export default LoadingSpinner;