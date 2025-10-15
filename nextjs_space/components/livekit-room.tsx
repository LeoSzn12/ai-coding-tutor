
'use client';

import { useEffect, useState } from 'react';
import { LiveKitRoom as LiveKitRoomComponent, VideoConference, RoomAudioRenderer } from '@livekit/components-react';
import '@livekit/components-styles';

interface LiveKitRoomProps {
  roomName: string;
  token: string;
  onConnected?: () => void;
  onDisconnected?: () => void;
}

export function LiveKitRoom({ roomName, token, onConnected, onDisconnected }: LiveKitRoomProps) {
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-pulse bg-gray-300 h-64 w-full rounded-lg mb-4" />
          <p className="text-gray-500">Loading video conference...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center p-8">
          <div className="text-red-500 mb-4">⚠️ {error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || 'wss://ai-vc-tutor-709uinga.livekit.cloud';

  return (
    <div className="flex-1 flex flex-col">
      <LiveKitRoomComponent
        serverUrl={serverUrl}
        token={token}
        connect={true}
        onConnected={() => {
          console.log('[LiveKit] Connected to room:', roomName);
          setIsConnected(true);
          onConnected?.();
        }}
        onDisconnected={() => {
          console.log('[LiveKit] Disconnected from room:', roomName);
          setIsConnected(false);
          onDisconnected?.();
        }}
        onError={(error) => {
          console.error('[LiveKit] Room error:', error);
          setError(`Video conference error: ${error.message}`);
        }}
        className="flex-1 lk-room"
      >
        <VideoConference />
        <RoomAudioRenderer />
      </LiveKitRoomComponent>
    </div>
  );
}
