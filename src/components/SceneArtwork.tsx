import { useEffect, useRef, useState } from 'react';
import { ImageOff } from 'lucide-react';
import type { AmbientEffect, ArtworkHotspot } from '../data/story';
import { playArtworkSound } from '../utils/morse';

interface SceneArtworkProps {
  src: string;
  alt: string;
  ambientEffect?: AmbientEffect;
  hotspots?: ArtworkHotspot[];
  muted?: boolean;
  onPlayMorse?: () => void;
  fillHeight?: boolean;
}

interface FluidParticle {
  id: number;
  x: number;
  y: number;
  kind: 'ripple' | 'spark' | 'steam';
}

const SWAMP_FIREFLIES = [
  { left: '14%', top: '34%', delay: '0s', cls: 'animate-firefly-a' },
  { left: '24%', top: '52%', delay: '1.1s', cls: 'animate-firefly-b' },
  { left: '36%', top: '28%', delay: '0.6s', cls: 'animate-firefly-a' },
  { left: '54%', top: '30%', delay: '1.9s', cls: 'animate-firefly-b' },
  { left: '68%', top: '46%', delay: '0.3s', cls: 'animate-firefly-a' },
  { left: '78%', top: '34%', delay: '1.5s', cls: 'animate-firefly-b' },
  { left: '86%', top: '58%', delay: '2.2s', cls: 'animate-firefly-a' },
  { left: '19%', top: '68%', delay: '2.7s', cls: 'animate-firefly-b' },
];

const FOG_STARS = [
  { left: '42%', top: '12%', delay: '0s' },
  { left: '56%', top: '10%', delay: '0.8s' },
  { left: '66%', top: '18%', delay: '1.6s' },
  { left: '22%', top: '15%', delay: '2.1s' },
];

const HEARTH_EMBERS = [
  { left: '13%', top: '60%', delay: '0s' },
  { left: '17%', top: '56%', delay: '0.9s' },
  { left: '20%', top: '62%', delay: '1.7s' },
];

export function SceneArtwork({
  src,
  alt,
  ambientEffect = 'swamp',
  hotspots = [],
  muted = false,
  onPlayMorse,
  fillHeight = false,
}: SceneArtworkProps) {
  const [hasError, setHasError] = useState(false);
  const [lanternBoost, setLanternBoost] = useState(false);
  const [popping, setPopping] = useState(false);
  const [pointer, setPointer] = useState<{ x: number; y: number; active: boolean }>({
    x: 50,
    y: 50,
    active: false,
  });
  const [particles, setParticles] = useState<FluidParticle[]>([]);
  const particleCounter = useRef(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setHasError(false);
    setLanternBoost(false);
    setParticles([]);
  }, [src]);

  const triggerBounce = () => {
    setPopping(false);
    window.requestAnimationFrame(() => {
      setPopping(true);
    });
    window.setTimeout(() => setPopping(false), 400);
  };

  const spawnFluidParticles = (x: number, y: number, kind: FluidParticle['kind']) => {
    const id = ++particleCounter.current;
    setParticles((prev) => [...prev.slice(-8), { id, x, y, kind }]);
    window.setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== id));
    }, 750);
  };

  const handleSurfaceClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

    triggerBounce();

    // Seamlessly match nearest character/object region without visible pins
    let matched: ArtworkHotspot | null = null;
    let bestDist = 17; // generous invisible hit radius in percent
    for (const spot of hotspots) {
      const dist = Math.hypot(spot.xPercent - x, spot.yPercent - y);
      if (dist < bestDist) {
        bestDist = dist;
        matched = spot;
      }
    }

    if (matched) {
      spawnFluidParticles(
        x,
        y,
        matched.sound === 'porridge' ? 'steam' : 'spark'
      );
      if (matched.action === 'toggle_lantern') {
        setLanternBoost((b) => !b);
      }
      if (matched.action === 'play_morse' && onPlayMorse) {
        onPlayMorse();
      } else {
        playArtworkSound(matched.sound, muted);
      }
      return;
    }

    spawnFluidParticles(
      x,
      y,
      ambientEffect === 'warm' ? 'steam' : 'ripple'
    );

    if (ambientEffect === 'fog') {
      playArtworkSound('mist', muted);
    } else if (ambientEffect === 'warm') {
      playArtworkSound('fire', muted);
    } else {
      playArtworkSound('water', muted);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setPointer({ x, y, active: true });
  };

  const parallaxX = pointer.active ? (pointer.x - 50) * -0.09 : 0;
  const parallaxY = pointer.active ? (pointer.y - 50) * -0.09 : 0;

  return (
    <div
      className={`overflow-hidden rounded-xl border border-[#2d4036] bg-[#17241e] ${
        fillHeight ? 'h-full' : ''
      }`}
    >
      <div
        ref={containerRef}
        onClick={handleSurfaceClick}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setPointer((p) => ({ ...p, active: false }))}
        aria-label={alt}
        className={`relative w-full cursor-pointer select-none overflow-hidden bg-[#15201b] ${
          fillHeight ? 'h-full min-h-[280px]' : 'aspect-video'
        } ${popping ? 'animate-cartoon-pop' : ''}`}
      >
        {/* Continuous living camera drift + fluid pointer parallax */}
        <div
          className="h-full w-full transition-transform duration-300 ease-out"
          style={{
            transform: `translate3d(${parallaxX}px, ${parallaxY}px, 0)`,
          }}
        >
          {!hasError ? (
            <img
              src={src}
              alt={alt}
              referrerPolicy="no-referrer"
              onError={() => setHasError(true)}
              style={{
                filter: lanternBoost ? 'brightness(1.12) saturate(1.1)' : undefined,
              }}
              className="animate-camera-float h-full w-full object-cover transition-[filter] duration-300"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#1b2b23] to-[#121c17] p-6 text-center text-[#9db3a5]">
              <ImageOff className="h-7 w-7 text-amber-400/80" aria-hidden="true" />
              <p className="max-w-md text-sm">{alt}</p>
            </div>
          )}
        </div>

        {/* Fluid pointer-following light halo */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            opacity: pointer.active || lanternBoost ? 1 : 0.4,
            background: `radial-gradient(circle 220px at ${pointer.x}% ${pointer.y}%, ${
              ambientEffect === 'fog'
                ? 'rgba(186, 210, 255, 0.20)'
                : 'rgba(255, 212, 122, 0.24)'
            }, transparent 72%)`,
          }}
        />

        {/* Ambient Animated Scene Layers */}
        {ambientEffect === 'swamp' && (
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="animate-mist-drift absolute inset-x-0 bottom-[18%] h-14 rounded-full bg-gradient-to-r from-transparent via-teal-100/15 to-transparent blur-md" />
            <div className="animate-mist-reverse absolute inset-x-0 bottom-[30%] h-10 rounded-full bg-gradient-to-r from-transparent via-emerald-100/12 to-transparent blur-md" />
            <span
              style={{ left: '22%', top: '74%' }}
              className="animate-water-ripple absolute h-10 w-16 rounded-full border border-teal-200/35"
            />
            <span
              style={{ left: '72%', top: '69%', animationDelay: '2s' }}
              className="animate-water-ripple absolute h-8 w-14 rounded-full border border-teal-200/35"
            />
            <div
              style={{ left: '36%', top: '52%' }}
              className="animate-lantern-pulse absolute h-36 w-36 rounded-full bg-amber-300/20 blur-xl"
            />
            {SWAMP_FIREFLIES.map((pos, idx) => (
              <span
                key={idx}
                style={{ left: pos.left, top: pos.top, animationDelay: pos.delay }}
                className={`${pos.cls} absolute h-2 w-2 rounded-full bg-amber-200 shadow-[0_0_10px_3px_rgba(252,211,77,0.75)]`}
              />
            ))}
          </div>
        )}

        {ambientEffect === 'fog' && (
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            {FOG_STARS.map((s, idx) => (
              <span
                key={idx}
                style={{ left: s.left, top: s.top, animationDelay: s.delay }}
                className="animate-star-twinkle absolute h-1.5 w-1.5 rounded-full bg-sky-100 shadow-[0_0_8px_2px_rgba(224,242,254,0.8)]"
              />
            ))}
            <div className="animate-mist-drift absolute -left-8 right-0 top-[34%] h-20 rounded-full bg-gradient-to-r from-transparent via-indigo-200/22 to-transparent blur-lg" />
            <div className="animate-mist-reverse absolute left-0 -right-8 bottom-[22%] h-24 rounded-full bg-gradient-to-r from-transparent via-sky-200/20 to-transparent blur-lg" />
          </div>
        )}

        {ambientEffect === 'cold' && (
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div
              style={{ left: '57%', top: '54%' }}
              className="animate-lantern-pulse absolute h-32 w-32 rounded-full bg-amber-300/22 blur-xl"
            />
            <div className="animate-mist-drift absolute left-[35%] top-[55%] h-10 w-36 rounded-full bg-sky-100/12 blur-md" />
          </div>
        )}

        {ambientEffect === 'warm' && (
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div
              style={{ left: '16%', top: '58%' }}
              className="animate-lantern-pulse absolute h-40 w-40 rounded-full bg-orange-400/25 blur-xl"
            />
            {HEARTH_EMBERS.map((e, idx) => (
              <span
                key={idx}
                style={{ left: e.left, top: e.top, animationDelay: e.delay }}
                className="animate-ember-rise absolute h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_6px_2px_rgba(251,191,36,0.8)]"
              />
            ))}
            <span
              style={{ left: '46%', top: '61%', animationDelay: '0s' }}
              className="animate-steam absolute h-9 w-4 rounded-full bg-amber-50/55 blur-[3px]"
            />
            <span
              style={{ left: '49%', top: '60%', animationDelay: '1.3s' }}
              className="animate-steam absolute h-8 w-3.5 rounded-full bg-amber-50/50 blur-[3px]"
            />
            <span
              style={{ left: '66%', top: '64%', animationDelay: '0.6s' }}
              className="animate-steam absolute h-9 w-4 rounded-full bg-amber-50/55 blur-[3px]"
            />
            <span
              style={{ left: '78%', top: '65%', animationDelay: '1.8s' }}
              className="animate-steam absolute h-7 w-3 rounded-full bg-amber-50/45 blur-[3px]"
            />
          </div>
        )}

        {/* Fluid click feedback particles (no pins, no text boxes) */}
        {particles.map((p) => (
          <span
            key={p.id}
            aria-hidden="true"
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
            className={`animate-click-burst pointer-events-none absolute rounded-full ${
              p.kind === 'spark'
                ? 'h-10 w-10 border-2 border-amber-200/95 shadow-[0_0_14px_rgba(252,211,77,0.8)]'
                : p.kind === 'steam'
                  ? 'h-9 w-9 bg-amber-50/40 blur-[4px]'
                  : 'h-9 w-9 border-2 border-teal-200/80'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
