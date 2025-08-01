'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { X, Mic, MicOff, Video, VideoOff, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

// Dynamically import AgoraRTC to avoid SSR issues
let AgoraRTC: any = null;
let isAgoraLoading = false;

const loadAgoraRTC = async () => {
  if (AgoraRTC) return AgoraRTC;
  if (isAgoraLoading) {
    // Wait for existing load to complete
    while (isAgoraLoading) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return AgoraRTC;
  }
  
  isAgoraLoading = true;
  try {
    const module = await import('agora-rtc-sdk-ng');
    AgoraRTC = module.default;
    return AgoraRTC;
  } catch (error) {
    console.error('Failed to load AgoraRTC:', error);
    throw error;
  } finally {
    isAgoraLoading = false;
}
};

const APP_ID = '80fbff9acfca4b2f9bba5a2387eaa29c';
const CHANNEL = 'testroom';
const TOKEN = null; // or your temporary token

// Generate unique channel name based on room name
const getChannelName = (roomName: string) => {
  return `channel-${roomName.replace(/[^a-zA-Z0-9]/g, '')}`;
};

interface VideoCallProps {
  roomName: string;
  userName: string;
  onClose: () => void;
  isOpen: boolean;
}

export default function VideoCall({ roomName, userName, onClose, isOpen }: VideoCallProps) {
  // Generate unique UID based on user and room to avoid conflicts
  const uniqueUID = useMemo(() => {
    // Use both roomName and userName to generate unique UID
    const combinedString = roomName + userName;
    const hash = combinedString.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const uid = Math.abs(hash) % 100000;
    console.log('Generated UID:', { roomName, userName, uid });
    return uid;
  }, [roomName, userName]);
  
  const [joined, setJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'info' | 'success' | 'error'} | null>(null);
  const [remoteUser, setRemoteUser] = useState<any>(null);
  const [remoteUserMuted, setRemoteUserMuted] = useState(false);
  const [remoteUserVideoOff, setRemoteUserVideoOff] = useState(false);

  const clientRef = useRef<any>(null);
  const localTrackRef = useRef<any[]>([]);
  const localRef = useRef<HTMLDivElement>(null);
  const remoteRef = useRef<HTMLDivElement>(null);
  const initTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioQualityIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Ensure video containers are ready
  useEffect(() => {
    if (isOpen) {
      console.log('Video containers on mount:', { local: localRef.current, remote: remoteRef.current });
      
      // Force a re-render to ensure containers are available
      const timer = setTimeout(() => {
        console.log('Video containers after delay:', { local: localRef.current, remote: remoteRef.current });
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Add beforeunload warning when in a call
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (joined) {
        e.preventDefault();
        e.returnValue = 'You are currently in a video call. Are you sure you want to leave?';
        return 'You are currently in a video call. Are you sure you want to leave?';
      }
    };

    if (joined) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [joined]);

  // Handle remote video styling for mobile compatibility
  useEffect(() => {
    if (remoteRef.current && remoteUser) {
      const videoElements = remoteRef.current.querySelectorAll('video');
      videoElements.forEach((video: HTMLVideoElement) => {
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.objectFit = 'cover';
        video.style.objectPosition = 'center';
        video.style.borderRadius = '0';
      });
    }
  }, [remoteUser]);

  // Cleanup function
  const cleanup = () => {
    console.log('Cleaning up video call...');
    
    if (initTimeoutRef.current) {
      clearTimeout(initTimeoutRef.current);
      initTimeoutRef.current = null;
    }
    
    // Clear any audio quality monitoring intervals
    if (audioQualityIntervalRef.current) {
      clearInterval(audioQualityIntervalRef.current);
      audioQualityIntervalRef.current = null;
    }
    
    if (clientRef.current) {
      console.log('Leaving Agora channel...');
      clientRef.current.leave();
      clientRef.current = null;
    }
    
    if (localTrackRef.current.length) {
      console.log('Stopping and closing local tracks...');
      localTrackRef.current.forEach(track => {
        if (track && typeof track.stop === 'function') {
          track.stop();
        }
        if (track && typeof track.close === 'function') {
          track.close();
        }
      });
      localTrackRef.current = [];
    }
    
    setJoined(false);
    setIsInitializing(false);
    setRemoteUser(null);
  };

  // Initialize video call
  useEffect(() => {
    if (!isOpen) {
      cleanup();
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

  const init = async () => {
    try {
        // Load AgoraRTC if not already loaded
        const agora = await loadAgoraRTC();
        if (!isMounted) return;

        setIsInitializing(true);
        
        // Create client with optimized settings
        const client = agora.createClient({ 
          mode: 'rtc', 
          codec: 'vp8',
          // Add audio processing settings
          audioProcessing: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
        clientRef.current = client;

      const channelName = getChannelName(roomName);
        // Let Agora assign UID automatically to avoid conflicts
        const uid = 0; // Agora will assign a unique UID
        
        console.log('Joining channel with:', {
          roomName,
          channelName,
          uid,
          appId: APP_ID
        });

        // Join channel with retry logic
        let joinAttempts = 0;
        const maxJoinAttempts = 3;
        
        while (joinAttempts < maxJoinAttempts && isMounted) {
          try {
                    const actualUid = await client.join(APP_ID, channelName, TOKEN, uid);
        console.log('Successfully joined channel with UID:', actualUid);
        break;
          } catch (err: any) {
            joinAttempts++;
            console.warn(`Join attempt ${joinAttempts} failed:`, err);
            
            if (joinAttempts >= maxJoinAttempts) {
              throw new Error(`Failed to join channel after ${maxJoinAttempts} attempts: ${err.message}`);
            }
            
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }

      if (!isMounted) return;

        // Create tracks with proper audio configuration
        const [micTrack, camTrack] = await agora.createMicrophoneAndCameraTracks(
          {
            // Audio configuration to prevent bitrate issues
            encoderConfig: 'music_standard',
            sampleRate: 48000,
            bitrate: 64,
            stereo: false
          },
          {
            // Video configuration
            encoderConfig: '1080p_1',
            bitrateMin: 600,
            bitrateMax: 2000
          }
        );
      if (!isMounted) {
        micTrack.close();
        camTrack.close();
        return;
      }

        console.log('Created tracks:', { micTrack, camTrack });
        
        // Ensure tracks are enabled
        micTrack.setEnabled(true);
        camTrack.setEnabled(true);
        
        console.log('Track states after enabling:', {
          micTrack: { enabled: micTrack.enabled, muted: micTrack.muted },
          camTrack: { enabled: camTrack.enabled, muted: camTrack.muted }
        });
        
        // Monitor audio quality and adjust if needed
        const monitorAudioQuality = () => {
          if (micTrack && micTrack.getStats) {
            try {
              const stats = micTrack.getStats();
              console.log('Audio track stats:', stats);
              // You can add logic here to adjust audio settings based on stats
            } catch (err: any) {
              console.warn('Could not get audio stats:', err);
            }
          }
        };
        
        // Monitor audio quality every 10 seconds
        audioQualityIntervalRef.current = setInterval(monitorAudioQuality, 10000);

      localTrackRef.current = [micTrack, camTrack];

        // Don't play local audio track to avoid echo
        // micTrack.play(); // Commented out to prevent echo

        // Wait for DOM to be ready and play video track
        const playVideoTrack = () => {
          if (!isMounted) return;
          
        if (localRef.current) {
            try {
              // Clear the container first
              localRef.current.innerHTML = '';
              camTrack.play(localRef.current);
              console.log('Local video track played successfully');
            } catch (err) {
              console.error('Failed to play local video track:', err);
            }
          } else {
            console.warn('Local video container not ready, retrying...');
            initTimeoutRef.current = setTimeout(playVideoTrack, 500);
          }
        };

        // Also set up a function to handle remote video
        const playRemoteVideo = (videoTrack: any, user: any) => {
          console.log('playRemoteVideo called with:', { videoTrack, user, remoteRef: remoteRef.current });
          
          const tryPlayVideo = () => {
            if (remoteRef.current) {
              try {
                // Clear the container first
                remoteRef.current.innerHTML = '';
                console.log('Playing video track in container:', remoteRef.current);
                
                videoTrack.play(remoteRef.current);
                console.log('Remote video track played successfully');
                setRemoteUser(user);
                
                // Apply mobile-friendly styling after video is added
                setTimeout(() => {
                  const videoElements = remoteRef.current?.querySelectorAll('video');
                  videoElements?.forEach((video: HTMLVideoElement) => {
                    video.style.width = '100%';
                    video.style.height = '100%';
                    video.style.objectFit = 'cover';
                    video.style.objectPosition = 'center';
                    video.style.borderRadius = '0';
                  });
                }, 100);
              } catch (err) {
                console.error('Failed to play remote video track:', err);
                // Retry after a short delay
                setTimeout(tryPlayVideo, 500);
              }
            } else {
              console.warn('Remote video container not ready, retrying...');
              setTimeout(tryPlayVideo, 500);
            }
          };
          
          tryPlayVideo();
        };

        // Start playing video after a short delay to ensure DOM is ready
        console.log('Video containers:', { local: localRef.current, remote: remoteRef.current });
        
        // Wait for DOM to be fully ready
        const waitForContainers = () => {
          if (localRef.current && remoteRef.current) {
            console.log('Video containers ready, playing video');
            playVideoTrack();
          } else {
            console.log('Waiting for video containers...', { local: localRef.current, remote: remoteRef.current });
            initTimeoutRef.current = setTimeout(waitForContainers, 100);
          }
        };
        
        initTimeoutRef.current = setTimeout(waitForContainers, 100);

        if (!isMounted) return;

      setJoined(true);
        setIsLoading(false);

        // Set up event listeners
        client.on('user-joined', (user: any) => {
          console.log('User joined:', user);
          console.log('Current remote users:', client.remoteUsers);
          console.log('My UID:', uid, 'Remote user UID:', user.uid);
          setNotification({
            message: `${user.uid} joined the call`,
            type: 'success'
          });
          // Clear notification after 3 seconds
          setTimeout(() => setNotification(null), 3000);
        });

      client.on('user-published', async (user: any, mediaType: string) => {
          console.log('User published:', user, 'mediaType:', mediaType);
          try {
        await client.subscribe(user, mediaType);
            console.log('Subscribed to user:', user, 'mediaType:', mediaType);
            
            if (mediaType === 'video') {
              console.log('Playing remote video track');
              console.log('Video track details:', user.videoTrack);
              playRemoteVideo(user.videoTrack, user);
        }
        if (mediaType === 'audio') {
              console.log('Playing remote audio track');
              // Only play remote audio, not local audio to avoid echo
              if (user.uid !== uid) {
          user.audioTrack?.play();
              }
            }
          } catch (err) {
            console.error('Error handling user-published:', err);
          }
        });

        client.on('user-unpublished', (user: any, mediaType: string) => {
          console.log('User unpublished:', user, 'mediaType:', mediaType);
          if (mediaType === 'video' && remoteRef.current) {
            console.log('Clearing remote video container');
            remoteRef.current.innerHTML = '';
            setRemoteUser(null);
          }
        });

        client.on('user-left', (user: any) => {
          console.log('User left:', user);
          setRemoteUser(null);
          setRemoteUserMuted(false);
          setRemoteUserVideoOff(false);
        if (remoteRef.current) {
          remoteRef.current.innerHTML = '';
        }
          setNotification({
            message: `${user.uid} left the call`,
            type: 'info'
          });
          // Clear notification after 3 seconds
          setTimeout(() => setNotification(null), 3000);
        });

        // Handle connection state changes
        client.on('connection-state-change', (curState: string, prevState: string) => {
          console.log('Connection state changed:', { prevState, curState });
          if (curState === 'DISCONNECTED') {
            setNotification({
              message: 'Connection lost. Please refresh to reconnect.',
              type: 'error'
            });
          }
        });

        // Handle audio bitrate warnings
        client.on('exception', (exception: any) => {
          console.log('Agora exception:', exception);
          if (exception.code === 2003) {
            console.warn('Audio bitrate too low, this is normal for low bandwidth connections');
            // Don't show notification for this as it's usually not critical
          }
        });

        // Handle remote user state changes
        client.on('user-info-updated', (uid: number, msg: string) => {
          console.log('User info updated:', { uid, msg });
          // This event is triggered when user state changes
        });

        // Handle remote user mute/unmute
        client.on('user-mute-audio', (uid: number, muted: boolean) => {
          console.log('Remote user audio mute changed:', { uid, muted });
          if (remoteUser && remoteUser.uid === uid) {
            setRemoteUserMuted(muted);
            setNotification({
              message: `${uid} ${muted ? 'muted' : 'unmuted'} their microphone`,
              type: 'info'
            });
            setTimeout(() => setNotification(null), 2000);
          }
        });

        // Handle remote user video on/off
        client.on('user-mute-video', (uid: number, muted: boolean) => {
          console.log('Remote user video mute changed:', { uid, muted });
          if (remoteUser && remoteUser.uid === uid) {
            setRemoteUserVideoOff(muted);
            setNotification({
              message: `${uid} ${muted ? 'turned off' : 'turned on'} their video`,
              type: 'info'
            });
            setTimeout(() => setNotification(null), 2000);
          }
        });

        // Log when we successfully publish our tracks
        console.log('Publishing tracks:', [micTrack, camTrack]);
        console.log('Track details:', {
          micTrack: { enabled: micTrack.enabled, muted: micTrack.muted },
          camTrack: { enabled: camTrack.enabled, muted: camTrack.muted }
        });
        await client.publish([micTrack, camTrack]);
        console.log('Successfully published tracks');

        // Check for existing users in the channel
        const users = client.remoteUsers;
        console.log('Existing users in channel:', users);
        if (users.length > 0) {
          console.log('Found existing users, subscribing to their tracks...');
          for (const user of users) {
            if (user.hasVideo) {
              console.log('Subscribing to existing user video:', user);
              await client.subscribe(user, 'video');
              playRemoteVideo(user.videoTrack, user);
            }
            if (user.hasAudio) {
              console.log('Subscribing to existing user audio:', user);
              await client.subscribe(user, 'audio');
              // Only play remote audio, not local audio to avoid echo
              if (user.uid !== uid) {
                user.audioTrack?.play();
              }
            }
          }
        }

      } catch (err: any) {
        console.error('Agora initialization error:', err);
        if (isMounted) {
          setError(err.message || 'Failed to start video call');
          setIsLoading(false);
        }
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
    }
  };

  init();

  return () => {
    isMounted = false;
      cleanup();
    };
  }, [isOpen, roomName, uniqueUID]);

  const toggleMute = () => {
    try {
    if (localTrackRef.current[0]) {
        const newMutedState = !isMuted;
        console.log('Toggling mic:', { current: isMuted, new: newMutedState });
        localTrackRef.current[0].setEnabled(!newMutedState); // Enable when not muted
        setIsMuted(newMutedState);
        
        // Show notification
        setNotification({
          message: newMutedState ? 'Microphone muted' : 'Microphone unmuted',
          type: 'info'
        });
        setTimeout(() => setNotification(null), 2000);
      } else {
        console.warn('Mic track not available');
      }
    } catch (err) {
      console.error('Error toggling mic:', err);
    }
  };

  const toggleVideo = () => {
    try {
    if (localTrackRef.current[1]) {
        const newVideoState = !isVideoOff;
        console.log('Toggling video:', { current: isVideoOff, new: newVideoState });
        localTrackRef.current[1].setEnabled(!newVideoState); // Enable when not off
        setIsVideoOff(newVideoState);
        
        // Show notification
        setNotification({
          message: newVideoState ? 'Video turned off' : 'Video turned on',
          type: 'info'
        });
        setTimeout(() => setNotification(null), 2000);
      } else {
        console.warn('Video track not available');
      }
    } catch (err) {
      console.error('Error toggling video:', err);
    }
  };

  const hangUp = () => {
    cleanup();
    onClose();
  };

  if (!isOpen) return null;

  if (isLoading || isInitializing) {
    return (
      <motion.div className="video-call-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div className="video-call-container">
          <div className="video-call-header">
            <div className="call-info">
              <h3>Video Call</h3>
              <p>{isInitializing ? 'Connecting to room...' : 'Loading video call service...'}</p>
            </div>
            <button className="close-btn" onClick={onClose}><X size={24} /></button>
          </div>
          <div className="video-call-content">
            <div className="loading-state">
              <div className="spinner"></div>
              <p>{isInitializing ? 'Joining video call...' : 'Initializing video call...'}</p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div className="video-call-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div className="video-call-container">
          <div className="video-call-header">
            <div className="call-info">
              <h3>Video Call Error</h3>
              <p>{error}</p>
            </div>
            <button className="close-btn" onClick={onClose}><X size={24} /></button>
          </div>
          <div className="video-call-content">
            <div className="error-state">
              <p>Unable to start video call. Please try again.</p>
              <button className="btn btn-primary" onClick={hangUp}>Close</button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div className="video-call-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {/* Notification */}
      {notification && (
        <motion.div 
          className={`notification ${notification.type}`}
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: notification.type === 'success' ? '#10b981' : notification.type === 'error' ? '#ef4444' : '#3b82f6',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          {notification.message}
        </motion.div>
      )}
      
      <div className="video-call-container">
        <div className="video-call-header">
          <div className="call-info">
            <h3>Video Call</h3>
            <p>Room: {roomName}</p>
            <div className="call-status">
              <span className={`status-indicator ${joined ? 'connected' : 'loading'}`}>
                {joined ? 'Connected' : 'Connecting...'}
              </span>
            </div>
          </div>
          <button className="close-btn" onClick={hangUp}><X size={24} /></button>
        </div>

        <div className="video-call-content">
          <div style={{ display: 'flex', gap: 16 }}>
            <div
              ref={localRef}
              className="video-container local-video"
              style={{ 
                border: '2px solid #6366f1', 
                minHeight: 300, 
                flex: 1, 
                background: '#000',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ 
                position: 'absolute', 
                top: 10,
                left: 10, 
                background: 'rgba(0,0,0,0.7)', 
                color: 'white', 
                padding: '4px 8px', 
                borderRadius: '4px',
                fontSize: '12px'
              }}>
                You
              </div>
              
              {/* Status indicators */}
              <div style={{
                position: 'absolute',
                top: 10,
                right: 10,
                display: 'flex',
                gap: '4px'
              }}>
                {isVideoOff && (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.9)',
                    color: 'white',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px'
                  }}>
                    <VideoOff size={12} />
                    Video Off
                  </div>
                )}
              </div>
              
              {/* Small muted indicator at top */}
              {isMuted && (
                <div style={{
                  position: 'absolute',
                  top: 10,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(239, 68, 68, 0.9)',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  zIndex: 10
                }}>
                  <MicOff size={12} />
                  MUTED
                </div>
              )}
            </div>
            <div
              ref={remoteRef}
              className="video-container remote-video"
              style={{ 
                border: '2px solid #10b981', 
                minHeight: 300, 
                flex: 1, 
                background: '#111',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >

              {!remoteUser ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#666',
                  textAlign: 'center'
                }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: '#333',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px'
                  }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="m23 21-2-2m0-13a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"></path>
                    </svg>
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>
                    Waiting for participant...
                  </div>
                  <div style={{ fontSize: '14px', color: '#888' }}>
                    Share this room name with others to join
                  </div>
                </div>
              ) : (
                <div style={{ 
                  position: 'absolute', 
                  top: 10, 
                  left: 10, 
                  background: 'rgba(0,0,0,0.7)', 
                  color: 'white', 
                  padding: '4px 8px', 
                  borderRadius: '4px',
                  fontSize: '12px'
                }}>
                  {remoteUser.uid}
                </div>
              )}
              
              {/* Remote user status indicators */}
              {(remoteUserMuted || remoteUserVideoOff) && (
                <div style={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  display: 'flex',
                  gap: '4px'
                }}>
                  {remoteUserMuted && (
                    <div style={{
                      background: 'rgba(239, 68, 68, 0.9)',
                      color: 'white',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px'
                    }}>
                      <MicOff size={12} />
                      Muted
                    </div>
                  )}
                  {remoteUserVideoOff && (
                    <div style={{
                      background: 'rgba(239, 68, 68, 0.9)',
                      color: 'white',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px'
                    }}>
                      <VideoOff size={12} />
                      Video Off
                    </div>
                  )}
                </div>
              )}
              
              {/* Large muted indicator for remote user */}
              {remoteUserMuted && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: 'rgba(239, 68, 68, 0.95)',
                  color: 'white',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  zIndex: 10
                }}>
                  <MicOff size={24} />
                  REMOTE USER MUTED
                </div>
              )}
            </div>
            </div>
        </div>

        <div className="video-call-controls">
          <button 
            className={`control-btn ${isMuted ? 'active muted' : ''}`} 
            onClick={toggleMute} 
            title={isMuted ? 'Unmute' : 'Mute'}
            style={{
              background: isMuted ? '#ef4444' : undefined,
              color: isMuted ? 'white' : undefined,
              border: isMuted ? '2px solid #dc2626' : undefined,
              boxShadow: isMuted ? '0 0 10px rgba(239, 68, 68, 0.5)' : undefined
            }}
          >
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
            {isMuted && (
              <span style={{
                fontSize: '10px',
                marginTop: '2px',
                fontWeight: 'bold'
              }}>
                MUTED
              </span>
            )}
          </button>

          <button 
            className={`control-btn ${isVideoOff ? 'active' : ''}`} 
            onClick={toggleVideo} 
            title={isVideoOff ? 'Turn on video' : 'Turn off video'}
            style={{
              background: isVideoOff ? '#ef4444' : undefined,
              color: isVideoOff ? 'white' : undefined,
              border: isVideoOff ? '2px solid #dc2626' : undefined
            }}
          >
            {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
          </button>

          <button className="control-btn hangup" onClick={hangUp} title="Hang up">
            <Phone size={20} />
          </button>
        </div>
      </div>
    </motion.div>
  );
} 
