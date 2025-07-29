'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Mic, MicOff, Video, VideoOff, Phone } from 'lucide-react';

interface VideoCallProps {
  roomName: string;
  userName: string;
  onClose: () => void;
  isOpen: boolean;
}

export default function VideoCall({ roomName, userName, onClose, isOpen }: VideoCallProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const apiRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      if (apiRef.current) {
        apiRef.current.dispose();
        apiRef.current = null;
      }
      return;
    }

    // Reset state
    setIsLoading(true);
    setError(null);

    // Initialize after a short delay
    const timer = setTimeout(() => {
      initializeJitsi();
    }, 100);

    return () => {
      clearTimeout(timer);
      if (apiRef.current) {
        apiRef.current.dispose();
        apiRef.current = null;
      }
    };
  }, [isOpen]);

  const initializeJitsi = () => {
    try {
      console.log('Initializing Jitsi...');
      
      if (typeof window === 'undefined') return;

      // Check if JitsiMeetExternalAPI is available
      if ((window as any).JitsiMeetExternalAPI) {
        console.log('JitsiMeetExternalAPI already available');
        createJitsiInstance();
      } else {
        console.log('Loading Jitsi script...');
        const script = document.createElement('script');
        script.src = 'https://meet.jit.si/external_api.js';
        script.async = true;
        script.onload = () => {
          console.log('Jitsi script loaded successfully');
          createJitsiInstance();
        };
        script.onerror = () => {
          console.error('Failed to load Jitsi script');
          setError('Failed to load video call service');
        };
        document.head.appendChild(script);
      }
    } catch (err) {
      console.error('Error initializing Jitsi:', err);
      setError('Failed to initialize video call');
    }
  };

  const createJitsiInstance = () => {
    try {
      if (!isOpen || !containerRef.current) {
        console.log('Component not ready for Jitsi initialization');
        return;
      }

      console.log('Creating Jitsi instance...', { roomName, userName });

      const domain = 'meet.jit.si';
      const options = {
        roomName: roomName,
        width: '100%',
        height: '100%',
        parentNode: containerRef.current,
        userInfo: {
          displayName: userName,
        },
        configOverwrite: {
          startWithAudioMuted: isMuted,
          startWithVideoMuted: isVideoOff,
          prejoinPageEnabled: false,
          disableDeepLinking: true,
          enableClosePage: false,
          enableWelcomePage: false,
          enableLobbyChat: false,
          enableKnocking: false,
          enablePrejoinPage: false,
          lobby: {
            enabled: false
          },
          guestDialOutEnabled: false,
          p2p: {
            enabled: true
          },
          startVideoOnly: false,
          startAudioOnly: false,
          maxFullResolutionParticipants: 2,
          filmstrip: {
            visible: true
          },
          toolbarButtons: [
            'microphone', 'camera', 'hangup', 'chat', 'fullscreen'
          ],
          prejoinConfig: {
            enabled: false
          },
          waitingScreen: {
            enabled: false
          },
          authentication: {
            enabled: false
          },
          guestDialOut: false,
          approvalDialog: {
            enabled: false
          },
          waitingForModerator: false,
          immediateJoin: true,
          autoJoin: true,
          autoKnock: false,
          autoKnockApproval: false,
          prejoinPage: {
            enabled: false
          },
          videoQuality: {
            preferredCodec: 'VP8'
          }
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
            'fodeviceselection', 'hangup', 'chat', 'recording',
            'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
            'videoquality', 'filmstrip', 'feedback', 'stats', 'shortcuts',
            'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone', 'security'
          ],
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          SHOW_POWERED_BY: false,
          SHOW_PROMOTIONAL_CLOSE_PAGE: false,
          SHOW_BRAND_WATERMARK: false,
          SHOW_WATERMARK: false,
          TOOLBAR_ALWAYS_VISIBLE: true,
          AUTHENTICATION_ENABLE: false,
          GUEST_DIALOUT_ENABLED: false,
          SHOW_WAITING_SCREEN: false,
          LOBBY_ENABLED: false,
          IMMEDIATE_JOIN: true,
          AUTO_JOIN: true,
          SHOW_PREJOIN_PAGE: false,
          SHOW_LOBBY_PAGE: false,
        },
      };

      const api = new (window as any).JitsiMeetExternalAPI(domain, options);
      apiRef.current = api;

      api.addEventListeners({
        readyToClose: () => {
          console.log('Jitsi: readyToClose');
          onClose();
        },
        videoConferenceJoined: () => {
          console.log('Jitsi: videoConferenceJoined');
          setIsLoading(false);
        },
        videoConferenceLeft: () => {
          console.log('Jitsi: videoConferenceLeft');
          onClose();
        },
        audioMuteStatusChanged: (muted: boolean) => {
          setIsMuted(muted);
        },
        videoMuteStatusChanged: (muted: boolean) => {
          setIsVideoOff(muted);
        },
        conferenceJoined: () => {
          console.log('Jitsi: conferenceJoined');
          setIsLoading(false);
        },
        conferenceLeft: () => {
          console.log('Jitsi: conferenceLeft');
          onClose();
        },
        lobbyJoined: () => {
          console.log('Jitsi: lobbyJoined - auto-approving');
          setTimeout(() => {
            if (apiRef.current) {
              try {
                apiRef.current.executeCommand('approveParticipant', '*');
                apiRef.current.executeCommand('joinConference');
              } catch (err) {
                console.log('Could not auto-approve from lobby:', err);
              }
            }
          }, 500);
        },
        authenticationRequired: () => {
          console.log('Jitsi: authenticationRequired - bypassing');
          setTimeout(() => {
            if (apiRef.current) {
              try {
                apiRef.current.executeCommand('joinConference');
              } catch (err) {
                console.log('Could not bypass authentication:', err);
              }
            }
          }, 500);
        },
        waitingForModerator: () => {
          console.log('Jitsi: waitingForModerator - auto-approving');
          setTimeout(() => {
            if (apiRef.current) {
              try {
                apiRef.current.executeCommand('approveParticipant', '*');
                apiRef.current.executeCommand('joinConference');
              } catch (err) {
                console.log('Could not auto-approve:', err);
              }
            }
          }, 500);
        },
      });

      // Set a timeout to force loading to false
      setTimeout(() => {
        if (isLoading) {
          console.log('Forcing loading to false after timeout');
          setIsLoading(false);
        }
      }, 10000);

    } catch (err) {
      console.error('Error creating Jitsi instance:', err);
      setError('Failed to start video call');
    }
  };

  const toggleMute = () => {
    if (apiRef.current) {
      apiRef.current.executeCommand('toggleAudio');
    }
  };

  const toggleVideo = () => {
    if (apiRef.current) {
      apiRef.current.executeCommand('toggleVideo');
    }
  };

  const hangUp = () => {
    if (apiRef.current) {
      apiRef.current.executeCommand('hangup');
    }
    onClose();
  };

  if (!isOpen) return null;

  if (error) {
    return (
      <motion.div
        className="video-call-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="video-call-container">
          <div className="video-call-header">
            <div className="call-info">
              <h3>Video Call Error</h3>
              <p>{error}</p>
            </div>
            <button className="close-btn" onClick={onClose}>
              <X size={24} />
            </button>
          </div>
          <div className="video-call-content">
            <div className="error-state">
              <p>Unable to start video call. Please try again.</p>
              <button className="btn btn-primary" onClick={initializeJitsi}>
                Retry
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="video-call-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="video-call-container">
        <div className="video-call-header">
          <div className="call-info">
            <h3>Video Call</h3>
            <p>Room: {roomName}</p>
            <div className="call-status">
              <span className={`status-indicator ${isLoading ? 'loading' : 'connected'}`}>
                {isLoading ? 'Connecting...' : 'Connected'}
              </span>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="video-call-content">
          {isLoading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Joining call...</p>
            </div>
          ) : (
            <div ref={containerRef} className="jitsi-container"></div>
          )}
        </div>

        <div className="video-call-controls">
          <button
            className={`control-btn ${isMuted ? 'active' : ''}`}
            onClick={toggleMute}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          <button
            className={`control-btn ${isVideoOff ? 'active' : ''}`}
            onClick={toggleVideo}
            title={isVideoOff ? 'Turn on video' : 'Turn off video'}
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