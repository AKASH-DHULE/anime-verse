import { useRouter } from 'next/router';
import { Play, Info } from 'lucide-react';
import useFeaturedAnime from '../hooks/useFeaturedAnime';

export default function Hero() {
  const router = useRouter();
  const { data: featured, isLoading } = useFeaturedAnime();

  const handleWatchNow = () => {
    if (featured?.mal_id) {
      router.push(`/anime/${featured.mal_id}`);
    }
  };

  const handleTrailer = () => {
    if (featured?.trailer?.url) {
      window.open(featured.trailer.url, '_blank');
    }
  };

  // CRITICAL: Extract image URL safely with optional chaining
  // Jikan API structure: anime.images?.jpg?.large_image_url or anime.images?.jpg?.image_url
  const imageUrl = featured?.images?.jpg?.large_image_url || featured?.images?.jpg?.image_url || '';
  const score = featured?.score ?? 0;

  // DEBUG: Log image URL to verify it's loading correctly
  if (imageUrl) {
    // Image URL is valid - will render
  } else {
    // No image URL available - will show black background
  }

  return (
    <section 
      className="relative w-full overflow-hidden"
      style={{
        // CRITICAL: Hero must have explicit height for background to display
        height: '100vh',
        maxHeight: '700px',
        minHeight: '400px',
        backgroundColor: '#000'
      }}>
      
      {/* 
        BACKGROUND LAYER: CSS background-image
        Applied directly to section for maximum compatibility
        backgroundAttachment: 'fixed' creates parallax effect
        backgroundSize: 'cover' ensures image fills container
      */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          // CRITICAL: Only apply backgroundImage if URL exists
          backgroundImage: imageUrl ? `url('${imageUrl}')` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          zIndex: -2
        }}
        aria-label="Hero background image"
      />

      {/* 
        OVERLAY LAYER: Gradient overlays for text readability
        Multiple overlays ensure text is readable regardless of image content
        Left gradient is darker where text content is located
        Bottom gradient adds additional depth
      */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(to right, rgba(0,0,0,0.95), rgba(0,0,0,0.7), rgba(0,0,0,0.2))',
          zIndex: -1
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
          zIndex: -1
        }}
      />

      {/* LOADING STATE: Spinner while fetching data */}
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10
          }}>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                border: '4px solid rgba(168, 85, 247, 0.3)',
                borderTop: '4px solid rgb(168, 85, 247)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
              }}
            />
            <p style={{ color: '#9ca3af' }}>Loading featured anime...</p>
          </div>
        </div>
      )}

      {/* CONTENT LAYER: Text and buttons displayed over background and overlays */}
      {!isLoading && featured && (
        <div
          style={{
            position: 'relative',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '48px 24px',
            zIndex: 5,
            animation: 'fadeIn 0.6s ease-out'
          }}>
          <div style={{ maxWidth: '42rem' }}>
            {/* Title */}
            <div style={{ marginBottom: '24px' }}>
              <h1
                style={{
                  fontSize: 'clamp(32px, 10vw, 60px)',
                  fontWeight: 900,
                  letterSpacing: '-0.025em',
                  color: '#fff',
                  textShadow: '0 10px 25px rgba(0,0,0,0.5)',
                  margin: 0,
                  marginBottom: '16px',
                  animation: 'slideUp 0.7s ease-out 0.2s both'
                }}>
                {featured.title}
              </h1>

              {/* Meta Information */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px' }}>⭐</span>
                  <span style={{ fontWeight: '600', color: '#fff' }}>{score.toFixed(1)}</span>
                </div>
                {featured.year && (
                  <>
                    <span style={{ color: '#6b7280' }}>•</span>
                    <span style={{ color: '#d1d5db' }}>{featured.year}</span>
                  </>
                )}
                {featured.status && (
                  <>
                    <span style={{ color: '#6b7280' }}>•</span>
                    <span style={{ color: '#d1d5db' }}>{featured.status}</span>
                  </>
                )}
              </div>
            </div>

            {/* Synopsis */}
            {featured.synopsis && (
              <p
                style={{
                  color: '#e5e7eb',
                  fontSize: '16px',
                  lineHeight: '1.5',
                  marginBottom: '24px',
                  maxWidth: '40rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  textShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}>
                {featured.synopsis}
              </p>
            )}

            {/* Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
              <button
                onClick={handleWatchNow}
                style={{
                  padding: '12px 32px',
                  backgroundColor: 'rgb(168, 85, 247)',
                  color: '#fff',
                  fontWeight: 700,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 10px 15px rgba(0,0,0,0.3)',
                  transition: 'all 0.3s',
                  fontSize: '16px'
                }}
                onMouseOver={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgb(147, 51, 234)';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)';
                }}
                onMouseOut={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgb(168, 85, 247)';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                }}>
                <Play size={20} fill="#fff" />
                <span>Watch Now</span>
              </button>

              <button
                onClick={handleTrailer}
                disabled={!featured.trailer?.url}
                style={{
                  padding: '12px 32px',
                  backgroundColor: 'transparent',
                  color: '#fff',
                  fontWeight: 700,
                  borderRadius: '8px',
                  border: '2px solid #fff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: featured.trailer?.url ? 'pointer' : 'not-allowed',
                  opacity: featured.trailer?.url ? 1 : 0.5,
                  transition: 'all 0.3s',
                  fontSize: '16px'
                }}
                onMouseOver={(e) => {
                  if (featured.trailer?.url) {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255,255,255,0.1)';
                    (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)';
                  }
                }}
                onMouseOut={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                }}>
                <Info size={20} />
                <span>Trailer</span>
              </button>
            </div>

            {/* Genre Tags */}
            {featured.genres && featured.genres.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {featured.genres.slice(0, 4).map((genre) => (
                  <span
                    key={genre.mal_id}
                    style={{
                      padding: '4px 12px',
                      fontSize: '12px',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      color: '#d1d5db',
                      borderRadius: '9999px',
                      border: '1px solid rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(4px)'
                    }}>
                    {genre.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* FALLBACK: Shown when loading is complete but no featured anime available */}
      {!isLoading && !featured && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 5
          }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '36px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>DISCOVER ANIME</h1>
            <p style={{ color: '#d1d5db' }}>Explore the best anime series, track watch orders, and build your ultimate watchlist.</p>
          </div>
        </div>
      )}

      {/* Inline keyframe animations */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}
