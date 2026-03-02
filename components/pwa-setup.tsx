'use client';

import { useEffect } from 'react';
import { useServiceWorker } from '@/hooks/use-service-worker';

export default function PWASetup() {
  useServiceWorker();

  useEffect(() => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Request geolocation permission
    if ('geolocation' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'prompt') {
          // Only request if not yet requested
          navigator.geolocation.getCurrentPosition(() => {
            // Just requesting permission
          }, () => {
            // User denied, that's ok
          });
        }
      });
    }
  }, []);

  return null;
}
