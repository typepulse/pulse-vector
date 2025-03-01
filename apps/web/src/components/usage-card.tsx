"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";

export function UsageCard() {
  const supabase = createClient();

  const [apiCallUsage, setApiCallUsage] = useState(0);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUsageData() {
      try {
        setIsLoading(true);

        // Fetch API usage for the current month
        const { count } = await supabase
          .from("api_usage_logs")
          .select("id", { count: "exact", head: true })
          .gte(
            "created_at",
            new Date(
              new Date().getFullYear(),
              new Date().getMonth(),
              1
            ).toISOString()
          );

        setApiCallUsage(count || 0);
      } catch (error) {
        console.error("Error fetching usage data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUsageData();
  }, [supabase]);

  return (
    <Card className="basis-full md:basis-1/2">
      <CardHeader>
        <CardTitle>Usage</CardTitle>
        <CardDescription>Your current usage</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium text-muted-foreground">
              API Calls (This Month)
            </div>
            <div className="font-medium">
              {isLoading ? "Loading..." : `${apiCallUsage}`}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
