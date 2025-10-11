
import { AccessToken, TrackSource } from 'livekit-server-sdk';

export async function createLiveKitToken(roomName: string, identity: string) {
  try {
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    console.log('[LiveKit] Creating token with:', {
      roomName,
      identity,
      hasApiKey: !!apiKey,
      hasApiSecret: !!apiSecret,
      apiKeyLength: apiKey?.length,
      apiSecretLength: apiSecret?.length,
    });

    if (!apiKey || !apiSecret) {
      throw new Error('LiveKit credentials not configured. Please check LIVEKIT_API_KEY and LIVEKIT_API_SECRET in .env');
    }

    const token = new AccessToken(apiKey, apiSecret, {
      identity,
      ttl: '24h',
    });

    token.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      canPublishSources: [
        TrackSource.CAMERA,
        TrackSource.MICROPHONE,
        TrackSource.SCREEN_SHARE,
        TrackSource.SCREEN_SHARE_AUDIO,
      ],
    });

    const jwt = await token.toJwt();
    console.log('[LiveKit] Token generated successfully');
    return jwt;
  } catch (error: any) {
    console.error('[LiveKit] Token generation failed:', {
      message: error?.message,
      stack: error?.stack,
    });
    throw error;
  }
}
