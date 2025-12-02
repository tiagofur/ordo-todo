'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { notify } from '@/lib/notify';
import { usePushNotifications } from '@/data/hooks/use-push-notifications.hook';
import { Bell, CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';

export default function TestNotificationsPage() {
  const { 
    isSupported, 
    permission, 
    requestPermission, 
    sendNotification, 
    sendBackgroundNotification 
  } = usePushNotifications();

  const handleRequestPermission = async () => {
    const granted = await requestPermission();
    if (granted) {
      notify.success('Permission granted', 'You can now receive push notifications');
    } else {
      notify.error('Permission denied', 'Please enable notifications in your browser settings');
    }
  };

  const testInAppSuccess = () => {
    notify.success('Task Completed', 'Project "Website Redesign" has been updated successfully.', {
      action: {
        label: 'Undo',
        onClick: () => console.log('Undo clicked')
      }
    });
  };

  const testInAppError = () => {
    notify.error('Connection Failed', 'Could not connect to the server. Please check your internet connection.');
  };

  const testInAppWarning = () => {
    notify.warning('Storage Full', 'You are running out of storage space. Please upgrade your plan.', {
      action: {
        label: 'Upgrade',
        onClick: () => console.log('Upgrade clicked')
      }
    });
  };

  const testInAppInfo = () => {
    notify.info('New Feature', 'Check out the new AI assistant in the sidebar!');
  };

  const testSystemNotification = () => {
    sendNotification({
      title: 'System Notification',
      body: 'This is a native browser notification. It works even if the app is not focused.',
      icon: '/icons/icon-192.png',
      tag: 'test-notification'
    });
  };

  const testBackgroundNotification = () => {
    // This simulates a push from server by calling showNotification directly on SW registration
    // In reality, this would come from the backend via Push API
    sendBackgroundNotification({
      title: 'Background Notification',
      body: 'This notification simulates a push message received in the background.',
      icon: '/icons/icon-192.png',
      tag: 'background-test',
      data: {
        url: '/test-notifications'
      }
    });
    
    notify.info('Background Notification Sent', 'Check your system notification center (wait 5s to see it if you minimize now)');
  };

  return (
    <div className="container mx-auto py-10 max-w-4xl space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-primary/10 rounded-full">
          <Bell className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Notification System Test</h1>
          <p className="text-muted-foreground">Test both In-App and System (Push) notifications</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* In-App Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-500" />
              In-App Notifications
            </CardTitle>
            <CardDescription>
              New colorful and prominent toast notifications for active users.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={testInAppSuccess} 
              className="w-full justify-start gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <CheckCircle2 className="w-4 h-4" />
              Test Success Toast
            </Button>
            <Button 
              onClick={testInAppError} 
              variant="destructive"
              className="w-full justify-start gap-2"
            >
              <XCircle className="w-4 h-4" />
              Test Error Toast
            </Button>
            <Button 
              onClick={testInAppWarning} 
              className="w-full justify-start gap-2 bg-amber-500 hover:bg-amber-600 text-white"
            >
              <AlertTriangle className="w-4 h-4" />
              Test Warning Toast
            </Button>
            <Button 
              onClick={testInAppInfo} 
              className="w-full justify-start gap-2 bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Info className="w-4 h-4" />
              Test Info Toast
            </Button>
          </CardContent>
        </Card>

        {/* System Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-purple-500" />
              System Push Notifications
            </CardTitle>
            <CardDescription>
              Native notifications that work even when the browser is minimized.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg text-sm mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Status:</span>
                <span className={isSupported ? "text-green-500" : "text-red-500"}>
                  {isSupported ? "Supported" : "Not Supported"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Permission:</span>
                <span className={permission === 'granted' ? "text-green-500" : "text-amber-500"}>
                  {permission}
                </span>
              </div>
            </div>

            {permission !== 'granted' && (
              <Button onClick={handleRequestPermission} className="w-full">
                Request Permission
              </Button>
            )}

            <Button 
              onClick={testSystemNotification} 
              variant="outline" 
              className="w-full justify-start gap-2"
              disabled={permission !== 'granted'}
            >
              <Bell className="w-4 h-4" />
              Test Local Notification
            </Button>

            <Button 
              onClick={testBackgroundNotification} 
              variant="outline" 
              className="w-full justify-start gap-2"
              disabled={permission !== 'granted'}
            >
              <Bell className="w-4 h-4" />
              Test Service Worker Notification
            </Button>
            
            <p className="text-xs text-muted-foreground mt-2">
              * For "Service Worker Notification", try minimizing the browser immediately after clicking.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
