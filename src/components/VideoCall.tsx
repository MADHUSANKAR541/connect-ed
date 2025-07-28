'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Mic, MicOff, Video, VideoOff, Phone, Settings, Users } from 'lucide-react';

interface VideoCallProps {
  roomName: string;
  userName: string;
  onClose: () => void;
  isOpen: boolean;
}

export default function VideoCall({ roomName, userName, onClose, isOpen }: VideoCallProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [participants, setParticipants] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      // Initialize Jitsi Meet
      const script = document.createElement('script');
      script.src = 'https://meet.jit.si/external_api.js';
      script.async = true;
      script.onload = initializeJitsi;
      document.head.appendChild(script);

      return () => {
        document.head.removeChild(script);
      };
    }
  }, [isOpen, roomName]);

  const initializeJitsi = () => {
    const domain = 'meet.jit.si';
    const options = {
      roomName: roomName,
      width: '100%',
      height: '100%',
      parentNode: document.querySelector('#jitsi-container'),
      userInfo: {
        displayName: userName,
      },
      configOverwrite: {
        startWithAudioMuted: isMuted,
        startWithVideoMuted: isVideoOff,
        prejoinPageEnabled: false,
        disableDeepLinking: true,
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
        TOOLBAR_WIDTH: 400,
        TOOLBAR_HEIGHT: 50,
        TOOLBAR_BUTTONS_WIDTH: 40,
        TOOLBAR_BUTTONS_HEIGHT: 40,
        TOOLBAR_BUTTONS_SPACING: 10,
        TOOLBAR_BUTTONS_BORDER_RADIUS: 5,
        TOOLBAR_BUTTONS_BACKGROUND_COLOR: 'rgba(0, 0, 0, 0.5)',
        TOOLBAR_BUTTONS_HOVER_BACKGROUND_COLOR: 'rgba(0, 0, 0, 0.7)',
        TOOLBAR_BUTTONS_ACTIVE_BACKGROUND_COLOR: 'rgba(0, 0, 0, 0.9)',
        TOOLBAR_BUTTONS_TEXT_COLOR: '#ffffff',
        TOOLBAR_BUTTONS_HOVER_TEXT_COLOR: '#ffffff',
        TOOLBAR_BUTTONS_ACTIVE_TEXT_COLOR: '#ffffff',
        TOOLBAR_BUTTONS_BORDER_COLOR: 'rgba(255, 255, 255, 0.2)',
        TOOLBAR_BUTTONS_HOVER_BORDER_COLOR: 'rgba(255, 255, 255, 0.4)',
        TOOLBAR_BUTTONS_ACTIVE_BORDER_COLOR: 'rgba(255, 255, 255, 0.6)',
      },
    };

    // @ts-ignore
    const api = new JitsiMeetExternalAPI(domain, options);

    api.addEventListeners({
      readyToClose: handleClose,
      participantLeft: handleParticipantLeft,
      participantJoined: handleParticipantJoined,
      videoConferenceJoined: handleVideoConferenceJoined,
      videoConferenceLeft: handleVideoConferenceLeft,
    });

    setIsLoading(false);
  };

  const handleClose = () => {
    onClose();
  };

  const handleParticipantLeft = () => {
    setParticipants(prev => Math.max(1, prev - 1));
  };

  const handleParticipantJoined = () => {
    setParticipants(prev => prev + 1);
  };

  const handleVideoConferenceJoined = () => {
    setIsLoading(false);
  };

  const handleVideoConferenceLeft = () => {
    onClose();
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // Jitsi API would be called here to actually mute/unmute
  };

  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff);
    // Jitsi API would be called here to actually turn video on/off
  };

  const hangUp = () => {
    onClose();
  };

  if (!isOpen) return null;

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
            <div className="participants-info">
              <Users size={16} />
              <span>{participants} participant{participants !== 1 ? 's' : ''}</span>
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
            <div id="jitsi-container" className="jitsi-container"></div>
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

          <button className="control-btn settings" title="Settings">
            <Settings size={20} />
          </button>

          <button className="control-btn hangup" onClick={hangUp} title="Hang up">
            <Phone size={20} />
          </button>
        </div>
      </div>
    </motion.div>
  );
} 