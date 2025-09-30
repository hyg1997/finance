"use client";

import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface DashboardErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Dashboard Error
          </CardTitle>
          <CardDescription className="text-gray-600">
            We couldn&apos;t load your dashboard. This might be a temporary
            issue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === "development" && (
            <div className="rounded-md bg-red-50 p-3">
              <p className="text-sm font-medium text-red-800">Error Details:</p>
              <p className="mt-1 text-xs text-red-700 font-mono break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="mt-1 text-xs text-red-600">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Button onClick={reset} className="w-full" variant="default">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button
              onClick={() => (window.location.href = "/")}
              variant="outline"
              className="w-full"
            >
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
