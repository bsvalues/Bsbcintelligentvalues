import * as React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

/**
 * Component to test the toast notification system
 */
export const ToastTest: React.FC = () => {
  const showDefaultToast = () => {
    toast({
      title: "Default Toast",
      description: "This is a default toast notification",
    });
  };

  const showSuccessToast = () => {
    toast({
      title: "Success!",
      description: "This operation was completed successfully",
      variant: "success",
    });
  };

  const showErrorToast = () => {
    toast({
      title: "Error",
      description: "Something went wrong. Please try again.",
      variant: "destructive",
    });
  };

  return (
    <div className="p-4 border rounded-md bg-card">
      <h3 className="text-lg font-medium mb-4">Toast Notification Test</h3>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button onClick={showDefaultToast} variant="outline">
          Show Default Toast
        </Button>
        <Button onClick={showSuccessToast} variant="outline" className="bg-green-100">
          Show Success Toast
        </Button>
        <Button onClick={showErrorToast} variant="outline" className="bg-red-100">
          Show Error Toast
        </Button>
      </div>
    </div>
  );
};

export default ToastTest;