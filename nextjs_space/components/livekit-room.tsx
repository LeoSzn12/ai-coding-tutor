
'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Video, VideoOff, Mic, MicOff, Monitor, MonitorOff } from 'lucide-react';

// Dynamically import LiveKit components to avoid SSR issues
const LiveKitRoomComponent = dynamic(
  () => import('@livekit/components-react').then((mod) => mod.LiveKitRoom),
  { ssr: false }
);

const VideoConference = dynamic(
  () => import('@livekit/components-react').then((mod) => mod.VideoConference),
  { ssr: false }
);

interface LiveKitRoomProps {
  roomName: string;
  token: string;
  onConnected?: () => void;
  onDisconnected?: () => void;
}

export function LiveKitRoom({ roomName, token, onConnected, onDisconnected }: LiveKitRoomProps) {
  const [mounted, setMounted] = useState(false);

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

  return (
    <div className="flex-1 flex flex-col">
      <LiveKitRoomComponent
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL || 'wss://ai-vc-tutor-709uinga.livekit.cloud'}
        token={token}
        connectOptions={{ autoSubscribe: true }}
        onConnected={onConnected}
        onDisconnected={onDisconnected}
        className="flex-1"
      >
        <VideoConference />
      </LiveKitRoomComponent>
    </div>
  );
}
