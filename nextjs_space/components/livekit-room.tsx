
'use client';

import { useEffect, useState } from 'react';
import '@livekit/components-styles';

interface LiveKitRoomProps {
  roomName: string;
  token: string;
  onConnected?: () => void;
  onDisconnected?: () => void;
}

export function LiveKitRoom({ roomName, token, onConnected, onDisconnected }: LiveKitRoomProps) {
  const [mounted, setMounted] = useState(false);
  const [LiveKitComponents, setLiveKitComponents] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    
    // Dynamically import LiveKit components only on client
    import('@livekit/components-react')
      .then((mod) => {
        setLiveKitComponents({
          LiveKitRoom: mod.LiveKitRoom,
          VideoConference: mod.VideoConference,
          RoomAudioRenderer: mod.RoomAudioRenderer,
        });
      })
      .catch((err) => {
        console.error('Failed to load LiveKit components:', err);
        setError('Failed to load video components. Please refresh the page.');
      });
  }, []);

  if (!mounted || !LiveKitComponents) {
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

  const { LiveKitRoom: LiveKitRoomComponent, VideoConference, RoomAudioRenderer } = LiveKitComponents;

  return (
    <div className="flex-1 flex flex-col">
      <LiveKitRoomComponent
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL || 'wss://ai-vc-tutor-709uinga.livekit.cloud'}
        token={token}
        connect={true}
        video={true}
        audio={true}
        onConnected={onConnected}
        onDisconnected={onDisconnected}
        className="flex-1 lk-room"
      >
        <VideoConference />
        <RoomAudioRenderer />
      </LiveKitRoomComponent>
    </div>
  );
}
