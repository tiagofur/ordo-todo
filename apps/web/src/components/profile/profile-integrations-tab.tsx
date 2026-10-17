"use client";

import React, { useState, useEffect } from "react";
import { Link2, Calendar, Loader2, Check, Copy, ExternalLink } from "lucide-react";
import { apiClient, type UserIntegration } from "@/lib/api-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Button,
  Badge,
} from "@ordo-todo/ui";
import { INTEGRATIONS } from "./profile-types";

interface ProfileIntegrationsTabProps {
  addSuccess: (message: string) => void;
  addError: (message: string) => void;
}

export function ProfileIntegrationsTab({
  addSuccess,
  addError,
}: ProfileIntegrationsTabProps) {
  const [integrationsList, setIntegrationsList] = useState<UserIntegration[]>([]);
  const [isLoadingIntegrations, setIsLoadingIntegrations] = useState(false);
  const [integrationActionPending, setIntegrationActionPending] = useState<string | null>(null);
  const [calendarFeed, setCalendarFeed] = useState<{
    token: string;
    feedUrl: string;
    webcalUrl: string;
  } | null>(null);
  const [isLoadingCalendarFeed, setIsLoadingCalendarFeed] = useState(false);
  const [hasCopiedFeedUrl, setHasCopiedFeedUrl] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoadingIntegrations(true);
    apiClient
      .getIntegrations()
      .then((data) => {
        if (isMounted && Array.isArray(data)) {
          setIntegrationsList(data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setIsLoadingIntegrations(false);
      });

    setIsLoadingCalendarFeed(true);
    apiClient
      .getCalendarFeedToken()
      .then((data) => {
        if (isMounted && data?.feedUrl) {
          setCalendarFeed(data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setIsLoadingCalendarFeed(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggleIntegration = async (provider: string) => {
    setIntegrationActionPending(provider);
    try {
      const isConnected = integrationsList.some((item) => item.provider === provider);
      if (isConnected) {
        await apiClient.disconnectIntegration(provider);
        setIntegrationsList((prev) => prev.filter((item) => item.provider !== provider));
        addSuccess(`${provider.replace("_", " ")} disconnected successfully`);
      } else {
        await apiClient.connectIntegration(provider);
        setIntegrationsList((prev) => [
          ...prev,
          {
            id: `int-${Date.now()}`,
            provider: provider as UserIntegration["provider"],
            isActive: true,
            providerEmail: null,
            lastSyncAt: null,
          },
        ]);
        addSuccess(`${provider.replace("_", " ")} connected successfully`);
      }
    } catch {
      addError("Failed to update integration status");
    } finally {
      setIntegrationActionPending(null);
    }
  };

  const handleCopyFeedUrl = () => {
    if (!calendarFeed?.feedUrl) return;
    navigator.clipboard.writeText(calendarFeed.feedUrl);
    setHasCopiedFeedUrl(true);
    addSuccess("Calendar subscription URL copied to clipboard");
    setTimeout(() => setHasCopiedFeedUrl(false), 2500);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Connected Services
          </CardTitle>
          <CardDescription>
            Connect third-party apps and calendar synchronization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {INTEGRATIONS.map((integration) => {
            const isConnected = integrationsList.some((item) => item.provider === integration.id);
            const isPending = integrationActionPending === integration.id;

            return (
              <div
                key={integration.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    <integration.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{integration.name}</p>
                      {isConnected && (
                        <Badge
                          variant="secondary"
                          className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs"
                        >
                          Connected
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{integration.description}</p>
                  </div>
                </div>
                {integration.available ? (
                  <Button
                    variant={isConnected ? "outline" : "default"}
                    disabled={isPending || isLoadingIntegrations}
                    onClick={() => handleToggleIntegration(integration.id)}
                  >
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {isConnected ? "Disconnect" : "Connect"}
                  </Button>
                ) : (
                  <Badge variant="outline">Coming Soon</Badge>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Live iCal Feed Subscription Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Live Calendar Subscription (iCal / .ics)
          </CardTitle>
          <CardDescription>
            Subscribe directly in Apple Calendar, Google Calendar, or Microsoft Outlook with live
            automatic sync.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Add your scheduled tasks, time blocks, and deadlines to your favorite calendar
            application. Events update automatically whenever you change dates in Ordo.
          </p>

          <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
            <div className="relative flex-1">
              <Input
                readOnly
                value={
                  calendarFeed?.feedUrl ||
                  (isLoadingCalendarFeed ? "Generating secure calendar feed URL..." : "")
                }
                className="font-mono text-xs pr-10 bg-muted/50"
              />
            </div>
            <Button
              variant="outline"
              className="shrink-0"
              onClick={handleCopyFeedUrl}
              disabled={!calendarFeed?.feedUrl}
            >
              {hasCopiedFeedUrl ? (
                <>
                  <Check className="h-4 w-4 mr-2 text-emerald-500" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy URL
                </>
              )}
            </Button>
            {calendarFeed?.webcalUrl && (
              <Button className="shrink-0" asChild>
                <a href={calendarFeed.webcalUrl}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Subscribe in Calendar App
                </a>
              </Button>
            )}
          </div>

          <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground">How to subscribe:</p>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>
                <strong>Apple Calendar:</strong> Click &quot;Subscribe in Calendar App&quot; or go
                to File &gt; New Calendar Subscription and paste the URL.
              </li>
              <li>
                <strong>Google Calendar:</strong> In the web interface, click &quot;+&quot; next to
                &quot;Other calendars&quot; &gt; &quot;From URL&quot; and paste the copied URL.
              </li>
              <li>
                <strong>Microsoft Outlook:</strong> Select Add Calendar &gt; Subscribe from web,
                and paste the URL.
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
