export interface User {
  id: string;
  email: string;
}

export interface Wedding {
  id?: string;
  slug?: string;
  user_id?: string;
  is_published?: boolean;
  brideName: string;
  groomName: string;
  date: string;
  time: string;
  venueName: string;
  venueAddress: string;
  venueMapsUrl: string;
  tagline: string;
  loveStory: string;
  theme: 'pastel' | 'gold' | 'dark-romantic' | 'modern-minimal';
  fontStyle: 'serif' | 'script' | 'sans';
  musicId: string;
  showCountdown: boolean;
  rsvpDeadline: string;
  heroImage: string;
}

export interface RSVP {
  id?: string;
  weddingId: string;
  name: string;
  status: 'attending' | 'declined';
  guests: number;
  message: string;
}

export const THEMES = {
  pastel: {
    bg: 'bg-[#FDF6F0]',
    text: 'text-[#5A4B41]',
    accent: 'bg-[#E8D5C4]',
    button: 'bg-[#D4A373] hover:bg-[#BC8A5F] text-white',
    card: 'bg-white/80 backdrop-blur-sm border-[#E8D5C4]',
    font: 'font-serif'
  },
  gold: {
    bg: 'bg-[#1A1A1A]',
    text: 'text-[#D4AF37]',
    accent: 'bg-[#D4AF37]/20',
    button: 'bg-[#D4AF37] hover:bg-[#B8962E] text-black',
    card: 'bg-black/60 backdrop-blur-sm border-[#D4AF37]/30',
    font: 'font-serif'
  },
  'dark-romantic': {
    bg: 'bg-[#2D1B2D]',
    text: 'text-[#E0C3E0]',
    accent: 'bg-[#4A2C4A]',
    button: 'bg-[#8E448E] hover:bg-[#703670] text-white',
    card: 'bg-[#3D263D]/80 backdrop-blur-sm border-[#8E448E]/20',
    font: 'font-serif'
  },
  'modern-minimal': {
    bg: 'bg-white',
    text: 'text-black',
    accent: 'bg-gray-100',
    button: 'bg-black hover:bg-gray-800 text-white',
    card: 'bg-white border-gray-200',
    font: 'font-sans'
  }
};

export const MUSIC_TRACKS = [
  { id: 'romantic-piano', name: 'Romantic Piano', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 'acoustic-guitar', name: 'Acoustic Love', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: 'classical-violin', name: 'Classical Strings', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
];
