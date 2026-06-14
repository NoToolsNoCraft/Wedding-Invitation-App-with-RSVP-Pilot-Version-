import React, { useState, useRef, useEffect } from 'react';
import { Music, Volume2, VolumeX } from 'lucide-react';
import { MUSIC_TRACKS } from '../types';

interface MusicPlayerProps {
  musicId: string;
  className?: string;
}

export default function MusicPlayer({ musicId, className = "" }: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const track = MUSIC_TRACKS.find(t => t.id === musicId) || MUSIC_TRACKS[0];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = track.url;
      if (isPlaying) {
        audioRef.current.play().catch(e => console.log("Autoplay blocked", e));
      }
    }
  }, [musicId, track.url]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      <audio ref={audioRef} loop />
      <button
        onClick={togglePlay}
        className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        title={isPlaying ? "Pause Music" : "Play Music"}
      >
        {isPlaying ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
      </button>
    </div>
  );
}
