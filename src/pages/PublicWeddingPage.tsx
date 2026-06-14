import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Wedding } from '../types';
import WeddingPageView from '../components/WeddingPageView';
import { Heart } from 'lucide-react';
import supabase from '../utils/supabase';

export default function PublicWeddingPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchWedding = async () => {
      try {
        const { data, error: dbError } = await supabase
          .from('weddings')
          .select('*')
          .eq('slug', slug)
          .eq('is_published', true)
          .single();

        if (dbError || !data) throw new Error('Not found');

        setWedding({
          id: data.id,
          slug: data.slug,
          user_id: data.user_id,
          is_published: data.is_published,
          brideName: data.bride_name,
          groomName: data.groom_name,
          date: data.date,
          time: data.time,
          venueName: data.venue_name,
          venueAddress: data.venue_address,
          venueMapsUrl: data.venue_maps_url,
          tagline: data.tagline,
          loveStory: data.love_story,
          theme: data.theme,
          fontStyle: data.font_style,
          musicId: data.music_id,
          showCountdown: data.show_countdown,
          rsvpDeadline: data.rsvp_deadline,
          heroImage: data.hero_image,
        });
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchWedding();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <Heart className="w-12 h-12 text-neutral-200 animate-pulse" />
      </div>
    );
  }

  if (error || !wedding) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 p-4 text-center">
        <h1 className="text-4xl font-bold mb-4">Wedding Not Found</h1>
        <p className="text-neutral-500 mb-8">The page you're looking for doesn't exist or has been removed.</p>
        <button
          onClick={() => navigate('/')}
          className="px-8 py-3 bg-black text-white rounded-full font-bold"
        >
          Go Home
        </button>
      </div>
    );
  }

  return <WeddingPageView wedding={wedding} />;
}
