import { useCallback, useEffect, useState } from 'react';

export type PermissionState = 'prompt' | 'granted' | 'denied' | 'unknown';

export interface UseMicrophonePermissionReturn {
  state: PermissionState;
  request: () => Promise<void>;
}

export function useMicrophonePermission(): UseMicrophonePermissionReturn {
  const [state, setState] = useState<PermissionState>('unknown');

  useEffect(() => {
    // Check initial permission state
    if (!navigator.permissions) {
      setState('prompt'); // Assume prompt if Permissions API unavailable
      return;
    }

    navigator.permissions
      .query({ name: 'microphone' as PermissionName })
      .then((permissionStatus) => {
        setState(permissionStatus.state as PermissionState);

        // Listen for changes
        permissionStatus.onchange = () => {
          setState(permissionStatus.state as PermissionState);
        };
      })
      .catch(() => {
        setState('prompt'); // Fallback to prompt on error
      });
  }, []);

  const request = useCallback(async () => {
    try {
      console.log('[useMicrophonePermission] Requesting microphone access...');

      // Request access via getUserMedia
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Immediately stop all tracks - we just needed permission
      stream.getTracks().forEach((track) => track.stop());

      console.log('[useMicrophonePermission] Microphone access granted');
      setState('granted');
    } catch (err) {
      console.error('[useMicrophonePermission] Microphone access denied:', err);
      setState('denied');
      throw err;
    }
  }, []);

  return { state, request };
}
