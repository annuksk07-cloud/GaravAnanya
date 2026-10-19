import React, { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';

const ENVELOPE_ID = '1zaZ2nIJZOj2RrS4ImbTrolJtmqeLhxGJ';

// Envelope image URLs in strict requested order
const ENVELOPE_URLS = [
  `/envelope.jpg`,
  `https://lh3.googleusercontent.com/d/${ENVELOPE_ID}`,
  `https://drive.google.com/thumbnail?id=${ENVELOPE_ID}&sz=w2000`,
  `/api/envelope`,
];

// Event image Google Drive File IDs
const EVENT_IMAGE_IDS: Record<string, string> = {
  haldi: "1oCF-f0gs8iCfPHmCSEeSp-zjHP0ci7cr",
  mehendi: "1tNUk38ahyjUgFRpvb7V3YUbeAqraczpS",
  sangeet: "1pJcvMQlJoprGkXeUSi9I_DlVgf1HXhdL",
  vivah: "1bWLW2OK3WdV1eRnXyxgyYuGqG2OT_wIQ",
  reception: "12v6serJorFbbrvB_X7EiaQRj7Uc2hoIi"
};

// Returns candidate image sources for an event in strict order
function archSources(key: string): string[] {
  const id = EVENT_IMAGE_IDS[key];
  if (!id) return [];
  return [
    `https://lh3.googleusercontent.com/d/${id}`,
    `https://drive.google.com/thumbnail?id=${id}&sz=w1200`,
    `/api/drive-asset/${id}`,
    `https://drive.google.com/thumbnail?id=${id}&sz=w2000`,
    `https://drive.google.com/uc?export=view&id=${id}`,
    `/arch-${key}.jpg`
  ];
}

// Single source of truth for all invitation details
const INVITE = {
  groom: {
    first: "Aarav",
    full: "Aarav Sharma",
    parents: "Mr. & Mrs. Rajesh Sharma",
    about: "Aarav is an architect who believes every home should feel like a celebration. He loves old Hindi songs, long drives and his mother's kheer."
  },
  bride: {
    first: "Ananya",
    full: "Ananya Verma",
    parents: "Mr. & Mrs. Sunil Verma",
    about: "Ananya is a doctor with a gentle heart and a loud laugh. She loves monsoon evenings, classical dance and her grandmother's stories."
  },
  date: "2026-12-14",
  city: "Jaipur, Rajasthan",
  venue: {
    name: "Shree Vivah Mahal",
    address: "Civil Lines, Jaipur, Rajasthan 302006",
    airport: "Jaipur International Airport (JAI)",
    station: "Jaipur Junction (JP)"
  },
  events: [
    {
      key: "haldi",
      name: "Haldi",
      hindi: "हल्दी",
      date: "2026-12-12",
      time: "10:30 AM",
      venue: "Verma Niwas",
      address: "14 Gandhi Path, Vaishali Nagar, Jaipur",
      dress: "Yellow & marigold",
      note: "A morning of turmeric, laughter and blessings",
      schedule: [
        ["10:30 AM", "Guests arrive and tilak"],
        ["11:00 AM", "Haldi ceremony"],
        ["12:30 PM", "Brunch and folk songs"]
      ]
    },
    {
      key: "mehendi",
      name: "Mehendi",
      hindi: "मेहंदी",
      date: "2026-12-12",
      time: "4:00 PM",
      venue: "Verma Niwas",
      address: "14 Gandhi Path, Vaishali Nagar, Jaipur",
      dress: "Greens & pastels",
      note: "Henna, music and chai in the garden",
      schedule: [
        ["4:00 PM", "Henna artists begin"],
        ["5:30 PM", "Chai and snacks"],
        ["6:30 PM", "Mehendi games and music"]
      ]
    },
    {
      key: "sangeet",
      name: "Sangeet",
      hindi: "संगीत",
      date: "2026-12-13",
      time: "7:30 PM",
      venue: "Shree Vivah Mahal",
      address: "Civil Lines, Jaipur",
      dress: "Glamorous jewel tones",
      note: "An evening of songs, dance and family performances",
      schedule: [
        ["7:30 PM", "Welcome drinks"],
        ["8:00 PM", "Family performances"],
        ["9:30 PM", "Dinner and dance floor"]
      ]
    },
    {
      key: "vivah",
      name: "Vivah",
      hindi: "विवाह",
      date: "2026-12-14",
      time: "Baraat 6:30 PM · Pheras 9:00 PM",
      venue: "Shree Vivah Mahal",
      address: "Civil Lines, Jaipur",
      dress: "Traditional Indian",
      note: "The sacred seven pheras around the holy fire",
      schedule: [
        ["6:30 PM", "Baraat arrival"],
        ["7:45 PM", "Jaimala"],
        ["9:00 PM", "Pheras"]
      ]
    },
    {
      key: "reception",
      name: "Reception",
      hindi: "स्वागत समारोह",
      date: "2026-12-15",
      time: "7:30 PM",
      venue: "The Royal Lawns",
      address: "Tonk Road, Jaipur",
      dress: "Formal or Indo-western",
      note: "Dinner, music and blessings for the newlyweds",
      schedule: [
        ["7:30 PM", "Grand entry of the couple"],
        ["8:00 PM", "Dinner"],
        ["9:00 PM", "Blessings and photographs"]
      ]
    }
  ],
  rsvp: {
    whatsapp: "917827537021",
    deadline: "30 November 2026"
  },
  contacts: [
    { role: "Groom's family", name: "Rohan Sharma", phone: "+91 98765 43210" },
    { role: "Bride's family", name: "Aditya Verma", phone: "+91 98765 43211" }
  ],
  hashtag: "#AaravWedsAnanya",
  families: "the Sharma and Verma families",
  compliments: "Rajesh & Sunita Sharma · Sunil & Meena Verma · Rohan Sharma · Kavya Sharma · Aditya Verma"
};

// Helper: formats any date string into "WEEKDAY · DD MONTH YYYY"
function formatAnyDate(dateStr: string): string {
  try {
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const d = new Date(year, month, day);
        const weekdays = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
        const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
        const weekday = weekdays[d.getDay()] || 'MONDAY';
        const monthName = months[d.getMonth()] || 'DECEMBER';
        return `${weekday} · ${day} ${monthName} ${year}`;
      }
    }
  } catch (e) {
    console.warn('Error formatting date:', e);
  }
  return dateStr.toUpperCase();
}

// Helper: formats event date & time into "WEEKDAY · DD MONTH · TIME"
function getEventOneLiner(dateStr: string, timeStr: string): string {
  try {
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const d = new Date(year, month, day);
        const weekdays = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
        const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
        const weekday = weekdays[d.getDay()] || 'MONDAY';
        const monthName = months[d.getMonth()] || 'DECEMBER';
        return `${weekday} · ${day} ${monthName} · ${timeStr.toUpperCase()}`;
      }
    }
  } catch (e) {
    console.warn('Error formatting event one-liner:', e);
  }
  return `${dateStr.toUpperCase()} · ${timeStr.toUpperCase()}`;
}

// Names fit rule for wall text overlay
function getFittingNameFontSize(name: string, blockWidthPx: number): number {
  let fontSizeCqw = 15;
  if (!blockWidthPx || blockWidthPx <= 0) return 15;

  const maxAllowedPx = blockWidthPx * 0.70;
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const videoWidthPx = blockWidthPx / 0.74;
      while (fontSizeCqw > 5) {
        const fontPx = (fontSizeCqw / 100) * videoWidthPx;
        ctx.font = `${fontPx}px "Great Vibes", cursive`;
        const measured = ctx.measureText(name).width;
        if (measured <= maxAllowedPx) {
          break;
        }
        fontSizeCqw -= 0.5;
      }
    }
  } catch (e) {
    console.warn('Error computing name font size:', e);
  }
  return fontSizeCqw;
}

// Marigold Garland Divider (28px tall strip made with marigold blooms & leaves drawn in SVG)
function GarlandDivider() {
  return (
    <div className="w-full h-[28px] overflow-hidden flex items-center justify-center bg-transparent py-1 select-none pointer-events-none">
      <svg className="w-full h-[28px]" preserveAspectRatio="none" viewBox="0 0 1200 28">
        <path
          d="M0 14 Q 30 18 60 14 T 120 14 T 180 14 T 240 14 T 300 14 T 360 14 T 420 14 T 480 14 T 540 14 T 600 14 T 660 14 T 720 14 T 780 14 T 840 14 T 900 14 T 960 14 T 1020 14 T 1080 14 T 1140 14 T 1200 14"
          stroke="#2B1A12"
          strokeWidth="1.2"
          fill="none"
        />
        {Array.from({ length: 30 }).map((_, i) => {
          const x = i * 40 + 20;
          const isOrange = i % 2 === 0;
          return (
            <g key={i}>
              <path d={`M ${x - 10} 14 C ${x - 16} 8, ${x - 16} 20, ${x - 10} 14`} fill="#3F6B2A" />
              <path d={`M ${x + 10} 14 C ${x + 16} 8, ${x + 16} 20, ${x + 10} 14`} fill="#3F6B2A" />
              <circle cx={x} cy={14} r={isOrange ? 9 : 8} fill={isOrange ? "#E8891C" : "#F2B84B"} />
              <circle cx={x} cy={14} r={isOrange ? 6 : 5} fill={isOrange ? "#F2B84B" : "#E8891C"} />
              <circle cx={x} cy={14} r={3} fill="#C66208" />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// Reusable Diamond Divider component
function DiamondDivider({ color = 'var(--gold)' }: { color?: string }) {
  return (
    <div className="flex items-center justify-center gap-4 w-full max-w-[280px] my-3">
      <div className="h-[1px] flex-1" style={{ backgroundColor: color, opacity: 0.5 }} />
      <div className="w-[8px] h-[8px] rotate-45" style={{ backgroundColor: color }} />
      <div className="h-[1px] flex-1" style={{ backgroundColor: color, opacity: 0.5 }} />
    </div>
  );
}

// Decorative Artwork Google Drive File IDs (ONLY valid 8 assets)
// Decorative Artwork Google Drive File IDs (EXACT TABLE COPY-PASTED FROM SPEC)
// Decorative Artwork Google Drive File IDs (EXACT TABLE COPY-PASTED FROM SPEC)
const ASSET_IDS: Record<string, string> = {
  "asset-garland": "1r23RrZd2CB_GinUNzCIBKwEnTu4oQSDu",
  "asset-corner": "1-lzjMGZBgwvNcXDb3Q40mhQM3XqaCjxP",
  "asset-kalash": "1twK8wlGjx8Bhd2Qo7aZ23v_BXrqCn6Ti",
  "asset-diya": "1DsZ64qIqYcVNYzme8hdTLAzw5gVfFUDO",
  "asset-dholak": "1_imVDyv1GiPRdR6jppQHxSw2cCvHRw3l",
  "asset-thali": "1dD58PwsGFfSGdrDJXE5cEv0fMvrt45Fi",
  "asset-henna": "1ssL0JUtin-83aRIVg9bAhGnblZtmVC21",
  "asset-chandelier": "1THRJam8aYn9-WusAi_whoAK79vC8vXEC",
  "arch-couple": "1JmfM4Ha5h7Bzo58ziN08xytLxXqaw5sW",
  "arch-venue": "1x9Hsl-tIVh2aSLUS-hRPvq5oBUeZ9Paf"
};

const DEFAULT_DECOR_SIZES: Record<string, string> = {
  "asset-garland": "min(100%, 900px)",
  "asset-corner": "min(44vw, 320px)",
  "asset-kalash": "min(40vw, 240px)",
  "asset-diya": "min(24vw, 150px)",
  "asset-dholak": "min(78vw, 480px)",
  "asset-thali": "min(46vw, 380px)",
  "asset-henna": "min(70vw, 420px)",
  "asset-chandelier": "min(56vw, 360px)"
};

const DECOR_THRESHOLDS: Record<string, number> = {
  "asset-garland": 280,
  "asset-corner": 130,
  "asset-kalash": 110,
  "asset-diya": 70,
  "asset-thali": 160,
  "asset-henna": 240,
  "asset-dholak": 270,
  "asset-chandelier": 190
};

type AssetState = {
  status: 'pending' | 'loading' | 'success' | 'failed';
  workingSource: string | null;
  attempts: number;
  reason?: string;
};

// Global reactive asset store
const globalAssetStates: Record<string, AssetState> = {};
const assetListeners = new Set<() => void>();

function getDriveSourcesForId(id: string): string[] {
  return [
    `https://lh3.googleusercontent.com/d/${id}`,
    `https://drive.google.com/uc?export=view&id=${id}`,
    `https://drive.usercontent.google.com/download?id=${id}&export=view`,
    `https://drive.google.com/thumbnail?id=${id}&sz=w1600`
  ];
}

function notifyAssetListeners() {
  assetListeners.forEach((cb) => cb());
}

const PWA_IDS = {
  "icon": "15uUNmSET8F0ye6Skchhl1Er_PKZsmJUa",
  "preview": "1OtdbFTZBXfn0NLCikorJQHlL74MpYSuH"
};

function selfCheckPwaIds() {
  const spec = {
    "icon": "15uUNmSET8F0ye6Skchhl1Er_PKZsmJUa",
    "preview": "1OtdbFTZBXfn0NLCikorJQHlL74MpYSuH"
  };
  if (PWA_IDS.icon === spec.icon && PWA_IDS.preview === spec.preview) {
    console.log("ID OK");
  } else {
    console.log("ID MISMATCH");
  }
}

// Self-Check Function to compare IDs with expected values
function selfCheckAssetIds() {
  const expectedTable: Record<string, string> = {
    "asset-garland": "1r23RrZd2CB_GinUNzCIBKwEnTu4oQSDu",
    "asset-corner": "1-lzjMGZBgwvNcXDb3Q40mhQM3XqaCjxP",
    "asset-kalash": "1twK8wlGjx8Bhd2Qo7aZ23v_BXrqCn6Ti",
    "asset-diya": "1DsZ64qIqYcVNYzme8hdTLAzw5gVfFUDO",
    "asset-dholak": "1_imVDyv1GiPRdR6jppQHxSw2cCvHRw3l",
    "asset-thali": "1dD58PwsGFfSGdrDJXE5cEv0fMvrt45Fi",
    "asset-henna": "1ssL0JUtin-83aRIVg9bAhGnblZtmVC21",
    "asset-chandelier": "1THRJam8aYn9-WusAi_whoAK79vC8vXEC",
    "arch-couple": "1JmfM4Ha5h7Bzo58ziN08xytLxXqaw5sW",
    "arch-venue": "1x9Hsl-tIVh2aSLUS-hRPvq5oBUeZ9Paf"
  };

  Object.keys(expectedTable).forEach((name) => {
    const actual = ASSET_IDS[name];
    const expected = expectedTable[name];
    if (actual === expected) {
      console.log(`[ID OK] ${name}: ${actual}`);
    } else {
      console.error(`[ID MISMATCH] ${name}: actual="${actual}", expected="${expected}"`);
    }
  });
}

// Background Asset Preloader with 3 Passes (12 attempts max per asset, 500ms delay between passes)
async function preloadAsset(name: string, id: string) {
  if (globalAssetStates[name]?.status === 'success' || globalAssetStates[name]?.status === 'loading') {
    return;
  }

  globalAssetStates[name] = {
    status: 'loading',
    workingSource: null,
    attempts: 0
  };
  notifyAssetListeners();

  const sources = getDriveSourcesForId(id);
  let totalAttempts = 0;

  for (let pass = 1; pass <= 3; pass++) {
    if (pass > 1) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    for (const url of sources) {
      totalAttempts++;
      console.log(`[TRYING DECOR URL] ${name} (Pass ${pass}, Attempt ${totalAttempts}): ${url}`);
      globalAssetStates[name] = {
        ...globalAssetStates[name],
        attempts: totalAttempts
      };
      notifyAssetListeners();

      const success = await new Promise<boolean>((resolve) => {
        const img = new Image();
        let settled = false;
        const timer = setTimeout(() => {
          if (!settled) {
            settled = true;
            img.onload = null;
            img.onerror = null;
            resolve(false);
          }
        }, 4000);

        img.onload = () => {
          if (!settled) {
            settled = true;
            clearTimeout(timer);
            resolve(img.naturalWidth > 0);
          }
        };

        img.onerror = () => {
          if (!settled) {
            settled = true;
            clearTimeout(timer);
            resolve(false);
          }
        };

        img.src = url;
      });

      if (success) {
        globalAssetStates[name] = {
          status: 'success',
          workingSource: url,
          attempts: totalAttempts
        };
        console.log(`[DECOR LOADED SUCCESS] ${name} loaded via ${url}`);
        notifyAssetListeners();
        return;
      }
    }
  }

  // If all 3 passes (12 attempts) failed
  globalAssetStates[name] = {
    status: 'failed',
    workingSource: null,
    attempts: totalAttempts,
    reason: 'All 4 Google Drive sources failed.'
  };
  console.warn(`[PRELOAD FAILED] ${name} (12 attempts) - All 4 Google Drive sources failed.`);
  notifyAssetListeners();
}

function startAllAssetPreloading() {
  selfCheckPwaIds();
  selfCheckAssetIds();
  console.log(`[DECORATION SUMMARY] Preloading all ${Object.keys(ASSET_IDS).length} assets. Total planned decor count: 40`);
  Object.entries(ASSET_IDS).forEach(([name, id]) => {
    console.log(`  - ${name} (${id}): OK`);
    preloadAsset(name, id);
  });
}

function useAssetState(name: string): AssetState {
  const [, setTick] = useState(0);

  useEffect(() => {
    const listener = () => setTick((t) => t + 1);
    assetListeners.add(listener);
    return () => {
      assetListeners.delete(listener);
    };
  }, []);

  return globalAssetStates[name] || { status: 'pending', workingSource: null, attempts: 0 };
}

// Block-level decor band container for direct child flow
function DecorBand({
  children,
  className = '',
  style = {}
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
        gap: '3vw',
        width: '100%',
        margin: '3dvh 0',
        padding: 0,
        ...style
      }}
      className={`decor-band ${className}`}
    >
      {children}
    </div>
  );
}

// Single decoration component that applies explicit inline sizing and ambient animations
function Decor({
  name,
  size,
  className = '',
  flipX = false,
  flipY = false,
  scale = 1,
  style = {}
}: {
  name: string;
  size?: string;
  className?: string;
  flipX?: boolean;
  flipY?: boolean;
  scale?: number;
  style?: React.CSSProperties;
}) {
  const assetState = useAssetState(name);

  if (!ASSET_IDS[name] || assetState.status === 'failed' || !assetState.workingSource) {
    return null;
  }

  const effectiveSize = size || DEFAULT_DECOR_SIZES[name] || 'auto';

  const transforms: string[] = [];
  if (scale !== 1) transforms.push(`scale(${scale})`);
  if (flipX) transforms.push('scaleX(-1)');
  if (flipY) transforms.push('scaleY(-1)');
  const transformStyle = transforms.join(' ') || undefined;

  let ambientClass = '';
  if (name === 'asset-garland') ambientClass = 'ambient-garland';
  else if (name === 'asset-chandelier') ambientClass = 'ambient-chandelier';
  else if (name === 'asset-diya') ambientClass = 'ambient-diya';

  return (
    <img
      src={assetState.workingSource}
      alt=""
      data-decor-name={name}
      loading="eager"
      decoding="sync"
      style={{
        width: effectiveSize,
        minWidth: effectiveSize,
        maxWidth: 'none',
        height: 'auto',
        flex: '0 0 auto',
        objectFit: 'contain',
        display: 'block',
        transform: transformStyle,
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
        ...style
      }}
      className={`decor-rendered ${ambientClass} pointer-events-none select-none ${className}`}
    />
  );
}

// PART 1: The Two Image Blocks (arch-couple & arch-venue)
function ArchImageBlock({
  idKey,
  title,
}: {
  idKey: 'arch-couple' | 'arch-venue';
  title: string;
}) {
  const assetState = useAssetState(idKey);

  return (
    <section
      style={{ backgroundColor: '#FBF3E0', contain: 'paint' }}
      className="relative w-full min-h-[100svh] flex flex-col items-center justify-center text-center overflow-hidden m-0 p-0"
    >
      <div className="w-full max-w-[900px] flex flex-col items-center justify-center py-[4dvh] px-4 my-auto relative z-10">
        {assetState.status === 'success' && assetState.workingSource && (
          <div className="w-full flex justify-center mb-6 relative">
            <img
              src={assetState.workingSource}
              alt=""
              loading="eager"
              decoding="sync"
              style={{
                width: 'min(100vw, 900px)',
                minWidth: 'min(100vw, 900px)',
                maxWidth: 'none',
                height: 'auto',
                maxHeight: '80dvh',
                objectFit: 'contain',
                maskImage: 'radial-gradient(ellipse 92% 92% at 50% 50%, black 65%, transparent 100%)',
                WebkitMaskImage: 'radial-gradient(ellipse 92% 92% at 50% 50%, black 65%, transparent 100%)',
              }}
              className="animate-slow-zoom transition-opacity duration-700 pointer-events-none"
            />
          </div>
        )}

        <h2
          style={{
            fontFamily: "'Great Vibes', cursive",
            color: '#5E1224',
            fontSize: 'clamp(56px, 17vw, 84px)',
            lineHeight: 1.0,
          }}
          className="font-normal drop-shadow-sm my-2"
        >
          {title}
        </h2>
        <DiamondDivider color="#B8862B" />
      </div>
    </section>
  );
}

// Temporary Debug Box fixed at bottom-right displaying 10 asset lines, status, rendered width in px, and 40 count
function DecorDebugBox() {
  const [, setTick] = useState(0);
  const [renderedCount, setRenderedCount] = useState(0);
  const [decorWidths, setDecorWidths] = useState<Record<string, number>>({});

  useEffect(() => {
    const listener = () => setTick((t) => t + 1);
    assetListeners.add(listener);
    return () => {
      assetListeners.delete(listener);
    };
  }, []);

  useEffect(() => {
    const updateMetrics = () => {
      const els = document.querySelectorAll('.decor-rendered');
      setRenderedCount(els.length);

      const widths: Record<string, number> = {};
      Object.keys(DECOR_THRESHOLDS).forEach((name) => {
        const el = document.querySelector(`img[data-decor-name="${name}"]`);
        if (el) {
          const rect = el.getBoundingClientRect();
          widths[name] = Math.round(rect.width);
        }
      });
      setDecorWidths(widths);
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-2 right-2 z-[9999] bg-black/90 text-white p-3 rounded-lg text-[10px] font-mono shadow-2xl border border-amber-500/40 pointer-events-none max-w-[340px]">
      <div className="font-bold border-b border-white/20 pb-1.5 mb-2 text-amber-300 flex justify-between items-center gap-2">
        <span>DECOR ASSETS CHECK</span>
        <span className="text-[10px] bg-amber-900/60 text-amber-200 px-1.5 py-0.5 rounded border border-amber-500/30">
          Rendered: {renderedCount} / 40
        </span>
      </div>
      <div className="space-y-1">
        {Object.keys(ASSET_IDS).map((name) => {
          const id = ASSET_IDS[name];
          const idPreview = id ? `${id.substring(0, 6)}…${id.substring(id.length - 4)}` : '';
          const st = globalAssetStates[name];
          const isSuccess = st?.status === 'success';
          const isFailed = st?.status === 'failed';
          const isLoading = st?.status === 'loading' || st?.status === 'pending';

          const threshold = DECOR_THRESHOLDS[name];
          const measuredWidth = decorWidths[name];
          const isWidthTooSmall = threshold !== undefined && measuredWidth !== undefined && measuredWidth < threshold;

          return (
            <div key={name} className="flex items-center justify-between gap-1.5">
              <span className="truncate opacity-90">
                {name} <span className="text-amber-200/80">{idPreview}</span>:
              </span>
              <div className="flex items-center gap-1.5">
                {threshold !== undefined && measuredWidth !== undefined && (
                  <span className={isWidthTooSmall ? 'text-red-400 font-bold' : 'text-green-300 font-semibold'}>
                    {measuredWidth}px
                  </span>
                )}
                {isSuccess && <span className="text-green-400 font-bold">✓</span>}
                {isFailed && <span className="text-red-400 font-bold">✗</span>}
                {isLoading && (
                  <span className="text-yellow-300 font-medium animate-pulse">
                    ({st?.attempts || 0}/12)
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Helper: formats event date into "Full Weekday, DD Month YYYY"
function formatFullDate(dateStr: string): string {
  try {
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const d = new Date(year, month, day);
        const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const weekday = weekdays[d.getDay()] || 'Monday';
        const monthName = months[d.getMonth()] || 'December';
        return `${weekday}, ${day} ${monthName} ${year}`;
      }
    }
  } catch (e) {
    console.warn('Error formatting full date:', e);
  }
  return dateStr;
}

// Map of event decorations for PART 3
const EVENT_DECOR: Record<string, { top: React.ReactNode; bottom: React.ReactNode }> = {
  haldi: {
    top: (
      <DecorBand>
        <Decor name="asset-diya" size="min(24vw, 150px)" />
        <Decor name="asset-thali" size="min(46vw, 380px)" />
        <Decor name="asset-diya" size="min(24vw, 150px)" flipX={true} />
      </DecorBand>
    ),
    bottom: (
      <DecorBand>
        <Decor name="asset-garland" size="min(100%, 900px)" />
      </DecorBand>
    )
  },
  mehendi: {
    top: (
      <DecorBand>
        <Decor name="asset-garland" size="min(100%, 900px)" />
      </DecorBand>
    ),
    bottom: (
      <DecorBand>
        <Decor name="asset-henna" size="min(70vw, 420px)" />
      </DecorBand>
    )
  },
  sangeet: {
    top: (
      <DecorBand>
        <Decor name="asset-dholak" size="min(78vw, 480px)" />
      </DecorBand>
    ),
    bottom: (
      <DecorBand>
        <Decor name="asset-diya" size="min(24vw, 150px)" />
        <Decor name="asset-diya" size="min(24vw, 150px)" scale={1.15} />
        <Decor name="asset-diya" size="min(24vw, 150px)" />
      </DecorBand>
    )
  },
  vivah: {
    top: (
      <DecorBand>
        <Decor name="asset-diya" size="min(24vw, 150px)" />
        <Decor name="asset-kalash" size="min(40vw, 260px)" />
        <Decor name="asset-diya" size="min(24vw, 150px)" flipX={true} />
      </DecorBand>
    ),
    bottom: (
      <DecorBand>
        <Decor name="asset-garland" size="min(100%, 900px)" />
      </DecorBand>
    )
  },
  reception: {
    top: (
      <DecorBand style={{ marginTop: 0 }}>
        <Decor name="asset-chandelier" size="min(56vw, 360px)" />
      </DecorBand>
    ),
    bottom: (
      <DecorBand>
        <Decor name="asset-diya" size="min(24vw, 150px)" />
        <Decor name="asset-kalash" size="min(40vw, 260px)" />
        <Decor name="asset-diya" size="min(24vw, 150px)" flipX={true} />
      </DecorBand>
    )
  }
};

// Helper: computes RSVP deadline live helper text
function getRsvpDeadlineHelper(deadlineStr: string): string {
  try {
    const deadlineDate = new Date('2026-11-30T23:59:59');
    const now = new Date();
    const diffMs = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays > 0) {
      return `${diffDays} days left to reply`;
    } else {
      return 'The RSVP date has passed, but you can still send your reply';
    }
  } catch (e) {
    return `Kindly respond by ${deadlineStr}`;
  }
}

// Helper: computes arrival dates range from 2 days before 1st event to last event day
function getArrivalDates(events: typeof INVITE.events) {
  if (!events || events.length === 0) return [];
  const dates = events.map((e) => e.date).sort();
  const firstDateStr = dates[0];
  const lastDateStr = dates[dates.length - 1];

  const firstDate = new Date(firstDateStr + 'T00:00:00');
  const startDate = new Date(firstDate);
  startDate.setDate(startDate.getDate() - 2);

  const endDate = new Date(lastDateStr + 'T00:00:00');

  const result: { value: string; label: string }[] = [];
  const curr = new Date(startDate);

  while (curr <= endDate) {
    const yyyy = curr.getFullYear();
    const mm = String(curr.getMonth() + 1).padStart(2, '0');
    const dd = String(curr.getDate()).padStart(2, '0');
    const val = `${yyyy}-${mm}-${dd}`;

    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const label = `${weekdays[curr.getDay()]}, ${curr.getDate()} ${months[curr.getMonth()]} ${yyyy}`;
    result.push({ value: val, label });

    curr.setDate(curr.getDate() + 1);
  }
  return result;
}

function getEventPillLabel(dateStr: string): string {
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${weekdays[d.getDay()]}, ${day} ${months[d.getMonth()]}`;
    }
  } catch (e) {}
  return dateStr;
}

function PetalBurst() {
  const petals = Array.from({ length: 26 });
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {petals.map((_, i) => {
        const angle = (i / 26) * 360;
        const rad = (angle * Math.PI) / 180;
        const distance = 80 + Math.random() * 120;
        const x = Math.cos(rad) * distance;
        const y = Math.sin(rad) * distance;
        const rotation = Math.random() * 360;
        const scale = 0.6 + Math.random() * 0.8;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 1, x: 0, y: 0, scale: 0.2, rotate: 0 }}
            animate={{ opacity: 0, x, y, scale, rotate: rotation }}
            transition={{ duration: 1.6, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '12px',
              height: '18px',
              backgroundColor: i % 2 === 0 ? '#5E1224' : '#B8862B',
              borderRadius: '50% 0 50% 50%',
            }}
          />
        );
      })}
    </div>
  );
}

function getEventStartEndIso(dateStr: string, timeStr: string) {
  let hour = 10;
  let min = 0;
  try {
    const timeMatch = timeStr.match(/(1[0-2]|0?[1-9]):([0-5][0-9])\s*(AM|PM)/i);
    if (timeMatch) {
      hour = parseInt(timeMatch[1], 10);
      min = parseInt(timeMatch[2], 10);
      const ampm = timeMatch[3].toUpperCase();
      if (ampm === 'PM' && hour < 12) hour += 12;
      if (ampm === 'AM' && hour === 12) hour = 0;
    }
  } catch (e) {}

  const parts = dateStr.split('-');
  const yyyy = parts[0] || '2026';
  const mm = parts[1] || '12';
  const dd = parts[2] || '12';

  const startH = String(hour).padStart(2, '0');
  const startM = String(min).padStart(2, '0');
  const startIso = `${yyyy}${mm}${dd}T${startH}${startM}00`;

  let endHour = hour + 3;
  let endDay = parseInt(dd, 10);
  if (endHour >= 24) {
    endHour -= 24;
    endDay += 1;
  }
  const endH = String(endHour).padStart(2, '0');
  const endD = String(endDay).padStart(2, '0');
  const endIso = `${yyyy}${mm}${endD}T${endH}${startM}00`;

  return { startIso, endIso };
}

function generateIcsBlob(selectedEvents: typeof INVITE.events): Blob {
  let icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Aarav and Ananya Wedding RSVP//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  selectedEvents.forEach((ev) => {
    const { startIso, endIso } = getEventStartEndIso(ev.date, ev.time);
    icsLines.push(
      'BEGIN:VEVENT',
      `SUMMARY:${ev.name} - ${INVITE.groom.first} & ${INVITE.bride.first}`,
      `DESCRIPTION:${ev.note || ev.name}`,
      `LOCATION:${ev.venue}, ${ev.address}`,
      `DTSTART:${startIso}`,
      `DTEND:${endIso}`,
      'STATUS:CONFIRMED',
      'END:VEVENT'
    );
  });

  icsLines.push('END:VCALENDAR');
  return new Blob([icsLines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
}

function AdvancedRsvpForm({ cardScale, cardY }: { cardScale: any; cardY: any }) {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 'thankyou'>(1);

  // Step 1: You
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [side, setSide] = useState<'groom' | 'bride'>('groom');
  const [attending, setAttending] = useState<'accept' | 'decline' | ''>('');

  // Step 2: Celebrations
  const [selectedEvents, setSelectedEvents] = useState<string[]>(
    INVITE.events.map((e) => e.key)
  );
  const [adults, setAdults] = useState(1);
  const [childrenCount, setChildrenCount] = useState(0);
  const [adultNames, setAdultNames] = useState<string[]>([]);
  const [childNames, setChildNames] = useState<string[]>([]);
  const [meal, setMeal] = useState<'Vegetarian' | 'Jain' | 'Non-vegetarian'>('Vegetarian');
  const [specialRequest, setSpecialRequest] = useState('');

  // Step 3: Details
  const [needStay, setNeedStay] = useState<'Yes' | 'No'>('No');
  const [arrivingCity, setArrivingCity] = useState('');
  const arrivalDateOptions = getArrivalDates(INVITE.events);
  const [arrivalDate, setArrivalDate] = useState(
    arrivalDateOptions[0]?.value || '2026-12-10'
  );
  const [arrivalTime, setArrivalTime] = useState('');
  const [needPickup, setNeedPickup] = useState<'Yes' | 'No'>('No');
  const [wishes, setWishes] = useState('');

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [shakingField, setShakingField] = useState<string | null>(null);

  // Submitting
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Restore draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('rsvp-draft');
      if (saved) {
        const draft = JSON.parse(saved);
        if (draft.fullName) setFullName(draft.fullName);
        if (draft.mobile) setMobile(draft.mobile);
        if (draft.side) setSide(draft.side);
        if (draft.attending) setAttending(draft.attending);
        if (draft.selectedEvents) setSelectedEvents(draft.selectedEvents);
        if (draft.adults) setAdults(draft.adults);
        if (draft.childrenCount !== undefined) setChildrenCount(draft.childrenCount);
        if (draft.adultNames) setAdultNames(draft.adultNames);
        if (draft.childNames) setChildNames(draft.childNames);
        if (draft.meal) setMeal(draft.meal);
        if (draft.specialRequest) setSpecialRequest(draft.specialRequest);
        if (draft.needStay) setNeedStay(draft.needStay);
        if (draft.arrivingCity) setArrivingCity(draft.arrivingCity);
        if (draft.arrivalDate) setArrivalDate(draft.arrivalDate);
        if (draft.arrivalTime) setArrivalTime(draft.arrivalTime);
        if (draft.needPickup) setNeedPickup(draft.needPickup);
        if (draft.wishes) setWishes(draft.wishes);
      }
    } catch (e) {
      console.warn(e);
    }
  }, []);

  // Save draft on state changes
  useEffect(() => {
    if (step === 'thankyou') return;
    try {
      const draft = {
        fullName,
        mobile,
        side,
        attending,
        selectedEvents,
        adults,
        childrenCount,
        adultNames,
        childNames,
        meal,
        specialRequest,
        needStay,
        arrivingCity,
        arrivalDate,
        arrivalTime,
        needPickup,
        wishes,
        step,
      };
      localStorage.setItem('rsvp-draft', JSON.stringify(draft));
    } catch (e) {
      console.warn(e);
    }
  }, [
    fullName,
    mobile,
    side,
    attending,
    selectedEvents,
    adults,
    childrenCount,
    adultNames,
    childNames,
    meal,
    specialRequest,
    needStay,
    arrivingCity,
    arrivalDate,
    arrivalTime,
    needPickup,
    wishes,
    step,
  ]);

  const handleNextStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) {
      newErrors.fullName = 'Please enter your name';
    }

    const cleanMobile = mobile.replace(/\s+/g, '');
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!cleanMobile || !mobileRegex.test(cleanMobile)) {
      newErrors.mobile = 'Enter a valid 10-digit mobile number';
    }

    if (!attending) {
      newErrors.attending = 'Please choose an option';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstField = Object.keys(newErrors)[0];
      setShakingField(firstField);
      setTimeout(() => setShakingField(null), 400);
      return;
    }

    setErrors({});
    if (attending === 'decline') {
      setStep(4);
    } else {
      setStep(2);
    }
  };

  const handleNextStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (!selectedEvents || selectedEvents.length === 0) {
      newErrors.selectedEvents = 'Select at least one celebration';
    }
    if (!meal) {
      newErrors.meal = 'Please select a meal preference';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstField = Object.keys(newErrors)[0];
      setShakingField(firstField);
      setTimeout(() => setShakingField(null), 400);
      return;
    }

    setErrors({});
    setStep(3);
  };

  const handleNextStep3 = () => {
    setErrors({});
    setStep(4);
  };

  const constructMessage = () => {
    const sideText = side === 'groom' ? `${INVITE.groom.first}'s side` : `${INVITE.bride.first}'s side`;
    const cleanMobile = mobile.replace(/\s+/g, '');

    if (attending === 'decline') {
      let lines = [
        `🙏 Namaste! RSVP for ${INVITE.groom.first} & ${INVITE.bride.first}'s wedding`,
        '',
        `Name: ${fullName.trim()}`,
        `Mobile: +91 ${cleanMobile}`,
        `From: ${sideText}`,
        `Response: Regretfully Decline`,
      ];
      if (wishes.trim()) {
        lines.push(`Wishes: ${wishes.trim()}`);
      }
      return lines.join('\n');
    }

    const eventNames = INVITE.events
      .filter((e) => selectedEvents.includes(e.key))
      .map((e) => e.name)
      .join(', ');

    let allGuestNames: string[] = [];
    adultNames.forEach((n) => {
      if (n && n.trim()) allGuestNames.push(n.trim());
    });
    childNames.forEach((n) => {
      if (n && n.trim()) allGuestNames.push(n.trim());
    });
    const guestNamesStr = allGuestNames.length > 0 ? ` (Names: ${allGuestNames.join(', ')})` : '';

    let mealStr = meal;
    if (specialRequest.trim()) {
      mealStr += ` (${specialRequest.trim()})`;
    }

    const selDateObj = arrivalDateOptions.find((o) => o.value === arrivalDate);
    const dateLabel = selDateObj ? selDateObj.label : arrivalDate;

    let lines = [
      `🙏 Namaste! RSVP for ${INVITE.groom.first} & ${INVITE.bride.first}'s wedding`,
      '',
      `Name: ${fullName.trim()}`,
      `Mobile: +91 ${cleanMobile}`,
      `From: ${sideText}`,
      `Response: Joyfully Accept`,
      `Celebrations: ${eventNames}`,
      `Guests: ${adults} adult(s), ${childrenCount} child(ren)${guestNamesStr}`,
      `Meal: ${mealStr}`,
      `Stay needed: ${needStay}`,
    ];

    if (arrivingCity.trim()) {
      lines.push(`Arriving from: ${arrivingCity.trim()}, on ${dateLabel} at ${arrivalTime || 'N/A'}`);
    }

    lines.push(`Pickup needed: ${needPickup}`);

    if (wishes.trim()) {
      lines.push(`Wishes: ${wishes.trim()}`);
    }

    return lines.join('\n');
  };

  const handleSendWhatsApp = () => {
    setIsSubmitting(true);
    setTimeout(() => setIsSubmitting(false), 4000);

    try {
      localStorage.removeItem('rsvp-draft');
    } catch (e) {}

    const msg = constructMessage();
    const waUrl = `https://wa.me/917827537021?text=${encodeURIComponent(msg)}`;

    const win = window.open(waUrl, '_blank');
    if (!win) {
      window.location.href = waUrl;
    }

    setStep('thankyou');
  };

  const handleDownloadIcs = () => {
    const evs = INVITE.events.filter((e) => selectedEvents.includes(e.key));
    const blob = generateIcsBlob(evs);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wedding-events.ics';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `${INVITE.groom.first} & ${INVITE.bride.first} Wedding Invitation`,
          text: `Join us in celebrating ${INVITE.groom.first} and ${INVITE.bride.first}'s wedding!`,
          url: window.location.href,
        })
        .catch(() => {});
    }
  };

  const firstName = fullName.trim().split(' ')[0] || fullName || 'Guest';

  return (
    <motion.div
      style={{ scale: cardScale, y: cardY }}
      className="w-full max-w-[560px] max-[600px]:w-[calc(100vw-24px)] max-[600px]:p-5 bg-[#F3E6C8] border border-[#B8862B] rounded-[20px] p-[32px] text-left text-[var(--ink)] shadow-2xl flex flex-col gap-6 relative overflow-hidden will-change-transform"
    >
      {step === 'thankyou' ? (
        <div className="text-center py-6 flex flex-col items-center gap-5 relative z-10">
          <PetalBurst />
          <p
            style={{
              fontFamily: "'Great Vibes', cursive",
              color: '#5E1224',
              fontSize: 'clamp(30px, 8vw, 38px)',
              lineHeight: 1.2,
            }}
            className="font-normal drop-shadow-sm"
          >
            Thank you, {firstName}! Your RSVP is on its way
          </p>

          <DiamondDivider color="#B8862B" />

          {attending === 'accept' && (
            <div className="w-full flex flex-col gap-4 text-left my-2">
              <span
                style={{
                  fontFamily: "'Cinzel', serif",
                  color: '#B8862B',
                  letterSpacing: '0.2em',
                  fontSize: '12px',
                }}
                className="font-bold uppercase text-center block"
              >
                SELECTED CELEBRATIONS & CALENDAR LINKS
              </span>

              {INVITE.events
                .filter((e) => selectedEvents.includes(e.key))
                .map((ev) => {
                  const { startIso, endIso } = getEventStartEndIso(ev.date, ev.time);
                  const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
                    `${ev.name} - ${INVITE.groom.first} & ${INVITE.bride.first}`
                  )}&dates=${startIso}/${endIso}&details=${encodeURIComponent(
                    ev.note || ev.name
                  )}&location=${encodeURIComponent(`${ev.venue}, ${ev.address}`)}`;

                  return (
                    <div
                      key={ev.key}
                      className="bg-white/50 border border-[#B8862B]/30 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
                    >
                      <div>
                        <p style={{ fontFamily: "'Cinzel', serif", fontSize: '14px' }} className="font-bold text-[#5E1224]">
                          {ev.name} ({ev.hindi})
                        </p>
                        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '15px' }} className="text-stone-700">
                          {formatAnyDate(ev.date)} · {ev.time}
                        </p>
                      </div>

                      <a
                        href={gCalUrl}
                        target="_blank"
                        rel="noopener"
                        style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '15px' }}
                        className="text-[#5E1224] font-semibold underline hover:opacity-80 transition"
                      >
                        Add to Google Calendar
                      </a>
                    </div>
                  );
                })}

              <button
                type="button"
                onClick={handleDownloadIcs}
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: '12px',
                  color: '#5E1224',
                  borderColor: '#B8862B',
                }}
                className="w-full py-2.5 px-4 border rounded-full font-bold uppercase hover:bg-[#B8862B]/10 transition cursor-pointer mt-1"
              >
                Download all as a calendar file (.ics)
              </button>
            </div>
          )}

          <div className="flex flex-col items-center gap-3 w-full mt-2">
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                type="button"
                onClick={handleShare}
                style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px' }}
                className="text-[#5E1224] font-medium underline hover:opacity-80 transition cursor-pointer"
              >
                Share this invitation
              </button>
            )}

            <button
              type="button"
              onClick={() => setStep(1)}
              style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px' }}
              className="text-[#5E1224] font-medium underline hover:opacity-80 transition cursor-pointer"
            >
              Edit my reply
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Stepper Header */}
          <div className="w-full flex flex-col gap-2">
            <div className="flex items-center justify-between w-full px-2 relative">
              {/* Line */}
              <div className="absolute top-[6px] left-[12%] right-[12%] h-[1px] bg-[#B8862B]/40 z-0" />
              {['You', 'Celebrations', 'Details', 'Review'].map((label, idx) => {
                const sNum = idx + 1;
                const isActive = step === sNum;
                const isPassed = typeof step === 'number' && step > sNum;
                return (
                  <div key={label} className="flex flex-col items-center gap-1.5 relative z-10">
                    <div
                      className={`w-[13px] h-[13px] rounded-full transition-all duration-300 ${
                        isActive
                          ? 'bg-[#5E1224] ring-2 ring-[#B8862B]'
                          : isPassed
                          ? 'bg-[#B8862B]'
                          : 'bg-[#F3E6C8] border border-[#B8862B]'
                      }`}
                    />
                    <span
                      style={{ fontFamily: "'Cinzel', serif", fontSize: '10px' }}
                      className={`uppercase font-bold tracking-wider ${
                        isActive ? 'text-[#5E1224]' : 'text-[#5E1224]/60'
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Step Content with Slide & Fade */}
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-5 w-full"
          >
            {/* STEP 1: YOU */}
            {step === 1 && (
              <>
                {/* Full Name */}
                <div className={`flex flex-col gap-1.5 ${shakingField === 'fullName' ? 'animate-shake' : ''}`}>
                  <label
                    style={{ fontFamily: "'Cinzel', serif", color: '#B8862B', letterSpacing: '0.15em', fontSize: '12px' }}
                    className="font-bold uppercase"
                  >
                    FULL NAME *
                  </label>
                  <input
                    type="text"
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: '' }));
                    }}
                    placeholder="Enter your full name"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: '19px',
                      color: 'var(--ink)',
                      backgroundColor: 'transparent',
                      borderBottom: '1px solid #B8862B',
                      borderRadius: 0,
                    }}
                    className="py-2 px-1 focus:outline-none focus:border-[#5E1224] transition"
                  />
                  {errors.fullName && (
                    <p style={{ fontFamily: "'Cormorant Garamond', serif", color: '#8A1C1C', fontSize: '16px' }} className="italic font-normal">
                      {errors.fullName}
                    </p>
                  )}
                </div>

                {/* Mobile Number */}
                <div className={`flex flex-col gap-1.5 ${shakingField === 'mobile' ? 'animate-shake' : ''}`}>
                  <label
                    style={{ fontFamily: "'Cinzel', serif", color: '#B8862B', letterSpacing: '0.15em', fontSize: '12px' }}
                    className="font-bold uppercase"
                  >
                    MOBILE NUMBER *
                  </label>
                  <div className="flex items-center gap-2 border-b border-[#B8862B] focus-within:border-[#5E1224] transition">
                    <span
                      style={{ fontFamily: "'Cinzel', serif", fontSize: '14px', color: '#5E1224' }}
                      className="font-bold px-2 py-1.5 border-r border-[#B8862B]/40"
                    >
                      +91
                    </span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      value={mobile}
                      onChange={(e) => {
                        setMobile(e.target.value);
                        if (errors.mobile) setErrors((prev) => ({ ...prev, mobile: '' }));
                      }}
                      placeholder="10-digit mobile number"
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: '19px',
                        color: 'var(--ink)',
                        backgroundColor: 'transparent',
                        borderRadius: 0,
                      }}
                      className="py-2 px-1 w-full focus:outline-none"
                    />
                  </div>
                  {errors.mobile && (
                    <p style={{ fontFamily: "'Cormorant Garamond', serif", color: '#8A1C1C', fontSize: '16px' }} className="italic font-normal">
                      {errors.mobile}
                    </p>
                  )}
                </div>

                {/* I am from */}
                <div className="flex flex-col gap-2">
                  <label
                    style={{ fontFamily: "'Cinzel', serif", color: '#B8862B', letterSpacing: '0.15em', fontSize: '12px' }}
                    className="font-bold uppercase"
                  >
                    I AM FROM
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSide('groom')}
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: '17px',
                        backgroundColor: side === 'groom' ? '#5E1224' : 'transparent',
                        color: side === 'groom' ? '#F3E6C8' : '#5E1224',
                        border: '1px solid #B8862B',
                        borderRadius: '999px',
                        padding: '7px 18px',
                      }}
                      className="font-medium transition cursor-pointer"
                    >
                      {INVITE.groom.first}'s side
                    </button>
                    <button
                      type="button"
                      onClick={() => setSide('bride')}
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: '17px',
                        backgroundColor: side === 'bride' ? '#5E1224' : 'transparent',
                        color: side === 'bride' ? '#F3E6C8' : '#5E1224',
                        border: '1px solid #B8862B',
                        borderRadius: '999px',
                        padding: '7px 18px',
                      }}
                      className="font-medium transition cursor-pointer"
                    >
                      {INVITE.bride.first}'s side
                    </button>
                  </div>
                </div>

                {/* Will you attend */}
                <div className={`flex flex-col gap-2 ${shakingField === 'attending' ? 'animate-shake' : ''}`}>
                  <label
                    style={{ fontFamily: "'Cinzel', serif", color: '#B8862B', letterSpacing: '0.15em', fontSize: '12px' }}
                    className="font-bold uppercase"
                  >
                    WILL YOU ATTEND? *
                  </label>
                  <div className="flex items-center gap-3 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        setAttending('accept');
                        if (errors.attending) setErrors((prev) => ({ ...prev, attending: '' }));
                      }}
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: '17px',
                        backgroundColor: attending === 'accept' ? '#5E1224' : 'transparent',
                        color: attending === 'accept' ? '#F3E6C8' : '#5E1224',
                        border: '1px solid #B8862B',
                        borderRadius: '999px',
                        padding: '7px 18px',
                      }}
                      className="font-medium transition cursor-pointer"
                    >
                      Joyfully Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAttending('decline');
                        if (errors.attending) setErrors((prev) => ({ ...prev, attending: '' }));
                      }}
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: '17px',
                        backgroundColor: attending === 'decline' ? '#5E1224' : 'transparent',
                        color: attending === 'decline' ? '#F3E6C8' : '#5E1224',
                        border: '1px solid #B8862B',
                        borderRadius: '999px',
                        padding: '7px 18px',
                      }}
                      className="font-medium transition cursor-pointer"
                    >
                      Regretfully Decline
                    </button>
                  </div>
                  {errors.attending && (
                    <p style={{ fontFamily: "'Cormorant Garamond', serif", color: '#8A1C1C', fontSize: '16px' }} className="italic font-normal">
                      {errors.attending}
                    </p>
                  )}
                </div>

                {/* Step 1 Next Button */}
                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    onClick={handleNextStep1}
                    style={{
                      fontFamily: "'Cinzel', serif",
                      backgroundColor: '#B8862B',
                      color: '#5E1224',
                      borderRadius: '999px',
                      padding: '12px 28px',
                    }}
                    className="font-bold uppercase tracking-wider shadow hover:brightness-105 active:scale-[0.98] transition cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </>
            )}

            {/* STEP 2: CELEBRATIONS */}
            {step === 2 && (
              <>
                {/* Celebrations pills */}
                <div className={`flex flex-col gap-2 ${shakingField === 'selectedEvents' ? 'animate-shake' : ''}`}>
                  <label
                    style={{ fontFamily: "'Cinzel', serif", color: '#B8862B', letterSpacing: '0.15em', fontSize: '12px' }}
                    className="font-bold uppercase"
                  >
                    WHICH CELEBRATIONS WILL YOU JOIN? *
                  </label>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedEvents.length === INVITE.events.length) {
                            setSelectedEvents([]);
                          } else {
                            setSelectedEvents(INVITE.events.map((e) => e.key));
                            if (errors.selectedEvents) setErrors((prev) => ({ ...prev, selectedEvents: '' }));
                          }
                        }}
                        style={{ fontFamily: "'Cinzel', serif", fontSize: '11px', color: '#5E1224' }}
                        className="font-bold underline hover:opacity-80 transition cursor-pointer"
                      >
                        {selectedEvents.length === INVITE.events.length ? 'Deselect all' : 'Select all'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {INVITE.events.map((ev) => {
                        const isSel = selectedEvents.includes(ev.key);
                        return (
                          <button
                            key={ev.key}
                            type="button"
                            onClick={() => {
                              setSelectedEvents((prev) => {
                                const next = isSel ? prev.filter((k) => k !== ev.key) : [...prev, ev.key];
                                if (next.length > 0 && errors.selectedEvents) {
                                  setErrors((p) => ({ ...p, selectedEvents: '' }));
                                }
                                return next;
                              });
                            }}
                            style={{
                              backgroundColor: isSel ? '#5E1224' : 'transparent',
                              color: isSel ? '#F3E6C8' : '#5E1224',
                              border: '1px solid #B8862B',
                              borderRadius: '12px',
                              padding: '8px 14px',
                            }}
                            className="text-left flex flex-col transition cursor-pointer"
                          >
                            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px' }} className="font-bold leading-tight">
                              {ev.name} ({ev.hindi})
                            </span>
                            <span
                              style={{
                                fontFamily: "'Cinzel', serif",
                                fontSize: '10px',
                                color: isSel ? 'rgba(243, 230, 200, 0.85)' : 'rgba(94, 18, 36, 0.75)',
                              }}
                              className="uppercase tracking-wide"
                            >
                              {getEventPillLabel(ev.date)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {errors.selectedEvents && (
                    <p style={{ fontFamily: "'Cormorant Garamond', serif", color: '#8A1C1C', fontSize: '16px' }} className="italic font-normal">
                      {errors.selectedEvents}
                    </p>
                  )}
                </div>

                {/* Guests Counters */}
                <div className="flex flex-col gap-3 my-1">
                  <label
                    style={{ fontFamily: "'Cinzel', serif", color: '#B8862B', letterSpacing: '0.15em', fontSize: '12px' }}
                    className="font-bold uppercase"
                  >
                    GUESTS
                  </label>

                  <div className="flex items-center justify-between gap-4">
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px' }} className="font-medium text-[#5E1224]">
                      Adults (1-8, yourself included)
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          if (adults > 1) {
                            setAdults(adults - 1);
                            setAdultNames((prev) => prev.slice(0, adults - 2));
                          }
                        }}
                        style={{ borderColor: '#B8862B', color: '#5E1224' }}
                        className="w-8 h-8 rounded-full border flex items-center justify-center font-bold text-lg hover:bg-[#B8862B]/10 transition cursor-pointer"
                      >
                        -
                      </button>
                      <span style={{ fontFamily: "'Cinzel', serif", fontSize: '18px' }} className="font-bold text-[#5E1224] w-4 text-center">
                        {adults}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (adults < 8) {
                            setAdults(adults + 1);
                          }
                        }}
                        style={{ borderColor: '#B8862B', color: '#5E1224' }}
                        className="w-8 h-8 rounded-full border flex items-center justify-center font-bold text-lg hover:bg-[#B8862B]/10 transition cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px' }} className="font-medium text-[#5E1224]">
                      Children (0-6)
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          if (childrenCount > 0) {
                            setChildrenCount(childrenCount - 1);
                            setChildNames((prev) => prev.slice(0, childrenCount - 1));
                          }
                        }}
                        style={{ borderColor: '#B8862B', color: '#5E1224' }}
                        className="w-8 h-8 rounded-full border flex items-center justify-center font-bold text-lg hover:bg-[#B8862B]/10 transition cursor-pointer"
                      >
                        -
                      </button>
                      <span style={{ fontFamily: "'Cinzel', serif", fontSize: '18px' }} className="font-bold text-[#5E1224] w-4 text-center">
                        {childrenCount}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (childrenCount < 6) {
                            setChildrenCount(childrenCount + 1);
                          }
                        }}
                        style={{ borderColor: '#B8862B', color: '#5E1224' }}
                        className="w-8 h-8 rounded-full border flex items-center justify-center font-bold text-lg hover:bg-[#B8862B]/10 transition cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Dynamic Name Inputs */}
                  <motion.div layout className="flex flex-col gap-2 mt-2">
                    {adults > 1 &&
                      Array.from({ length: adults - 1 }).map((_, idx) => {
                        const gNum = idx + 2;
                        return (
                          <motion.div
                            key={`guest-${gNum}`}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="flex flex-col gap-1"
                          >
                            <input
                              type="text"
                              placeholder={`Guest ${gNum} name`}
                              value={adultNames[idx] || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setAdultNames((prev) => {
                                  const next = [...prev];
                                  next[idx] = val;
                                  return next;
                                });
                              }}
                              style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                fontSize: '18px',
                                color: 'var(--ink)',
                                backgroundColor: 'transparent',
                                borderBottom: '1px solid #B8862B',
                                borderRadius: 0,
                              }}
                              className="py-1.5 px-1 focus:outline-none focus:border-[#5E1224]"
                            />
                          </motion.div>
                        );
                      })}

                    {childrenCount > 0 &&
                      Array.from({ length: childrenCount }).map((_, idx) => {
                        const cNum = idx + 1;
                        return (
                          <motion.div
                            key={`child-${cNum}`}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="flex flex-col gap-1"
                          >
                            <input
                              type="text"
                              placeholder={`Child ${cNum} name`}
                              value={childNames[idx] || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setChildNames((prev) => {
                                  const next = [...prev];
                                  next[idx] = val;
                                  return next;
                                });
                              }}
                              style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                fontSize: '18px',
                                color: 'var(--ink)',
                                backgroundColor: 'transparent',
                                borderBottom: '1px solid #B8862B',
                                borderRadius: 0,
                              }}
                              className="py-1.5 px-1 focus:outline-none focus:border-[#5E1224]"
                            />
                          </motion.div>
                        );
                      })}
                  </motion.div>
                </div>

                {/* Meal Preference */}
                <div className={`flex flex-col gap-2 ${shakingField === 'meal' ? 'animate-shake' : ''}`}>
                  <label
                    style={{ fontFamily: "'Cinzel', serif", color: '#B8862B', letterSpacing: '0.15em', fontSize: '12px' }}
                    className="font-bold uppercase"
                  >
                    MEAL PREFERENCE *
                  </label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {(['Vegetarian', 'Jain', 'Non-vegetarian'] as const).map((mOption) => (
                      <button
                        key={mOption}
                        type="button"
                        onClick={() => {
                          setMeal(mOption);
                          if (errors.meal) setErrors((prev) => ({ ...prev, meal: '' }));
                        }}
                        style={{
                          fontFamily: "'Cormorant Garamond', serif",
                          fontSize: '17px',
                          backgroundColor: meal === mOption ? '#5E1224' : 'transparent',
                          color: meal === mOption ? '#F3E6C8' : '#5E1224',
                          border: '1px solid #B8862B',
                          borderRadius: '999px',
                          padding: '6px 16px',
                        }}
                        className="font-medium transition cursor-pointer"
                      >
                        {mOption}
                      </button>
                    ))}
                  </div>
                  {errors.meal && (
                    <p style={{ fontFamily: "'Cormorant Garamond', serif", color: '#8A1C1C', fontSize: '16px' }} className="italic font-normal">
                      {errors.meal}
                    </p>
                  )}
                </div>

                {/* Allergy / Special Request */}
                <div className="flex flex-col gap-1.5">
                  <label
                    style={{ fontFamily: "'Cinzel', serif", color: '#B8862B', letterSpacing: '0.15em', fontSize: '12px' }}
                    className="font-bold uppercase"
                  >
                    ANY ALLERGY OR SPECIAL REQUEST (OPTIONAL)
                  </label>
                  <input
                    type="text"
                    value={specialRequest}
                    onChange={(e) => setSpecialRequest(e.target.value)}
                    placeholder="e.g. Nut allergy, wheel chair access"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: '18px',
                      color: 'var(--ink)',
                      backgroundColor: 'transparent',
                      borderBottom: '1px solid #B8862B',
                      borderRadius: 0,
                    }}
                    className="py-1.5 px-1 focus:outline-none focus:border-[#5E1224]"
                  />
                </div>

                {/* Step 2 Navigation Buttons */}
                <div className="flex items-center justify-between mt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    style={{
                      fontFamily: "'Cinzel', serif",
                      borderColor: '#B8862B',
                      color: '#5E1224',
                      borderRadius: '999px',
                      padding: '12px 28px',
                    }}
                    className="border font-bold uppercase tracking-wider hover:bg-[#B8862B]/10 transition cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep2}
                    style={{
                      fontFamily: "'Cinzel', serif",
                      backgroundColor: '#B8862B',
                      color: '#5E1224',
                      borderRadius: '999px',
                      padding: '12px 28px',
                    }}
                    className="font-bold uppercase tracking-wider shadow hover:brightness-105 active:scale-[0.98] transition cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </>
            )}

            {/* STEP 3: DETAILS */}
            {step === 3 && (
              <>
                {/* Stay needed */}
                <div className="flex flex-col gap-2">
                  <label
                    style={{ fontFamily: "'Cinzel', serif", color: '#B8862B', letterSpacing: '0.15em', fontSize: '12px' }}
                    className="font-bold uppercase"
                  >
                    DO YOU NEED A STAY?
                  </label>
                  <div className="flex items-center gap-3">
                    {(['Yes', 'No'] as const).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setNeedStay(opt)}
                        style={{
                          fontFamily: "'Cormorant Garamond', serif",
                          fontSize: '17px',
                          backgroundColor: needStay === opt ? '#5E1224' : 'transparent',
                          color: needStay === opt ? '#F3E6C8' : '#5E1224',
                          border: '1px solid #B8862B',
                          borderRadius: '999px',
                          padding: '6px 20px',
                        }}
                        className="font-medium transition cursor-pointer"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Arriving from city */}
                <div className="flex flex-col gap-1.5">
                  <label
                    style={{ fontFamily: "'Cinzel', serif", color: '#B8862B', letterSpacing: '0.15em', fontSize: '12px' }}
                    className="font-bold uppercase"
                  >
                    ARRIVING FROM (CITY)
                  </label>
                  <input
                    type="text"
                    value={arrivingCity}
                    onChange={(e) => setArrivingCity(e.target.value)}
                    placeholder="e.g. Mumbai, Delhi, London"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: '18px',
                      color: 'var(--ink)',
                      backgroundColor: 'transparent',
                      borderBottom: '1px solid #B8862B',
                      borderRadius: 0,
                    }}
                    className="py-1.5 px-1 focus:outline-none focus:border-[#5E1224]"
                  />
                </div>

                {/* Arrival Date & Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label
                      style={{ fontFamily: "'Cinzel', serif", color: '#B8862B', letterSpacing: '0.15em', fontSize: '12px' }}
                      className="font-bold uppercase"
                    >
                      ARRIVAL DATE
                    </label>
                    <select
                      value={arrivalDate}
                      onChange={(e) => setArrivalDate(e.target.value)}
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: '18px',
                        color: 'var(--ink)',
                        backgroundColor: 'transparent',
                        borderBottom: '1px solid #B8862B',
                        borderRadius: 0,
                      }}
                      className="py-1.5 px-1 focus:outline-none focus:border-[#5E1224] cursor-pointer"
                    >
                      {arrivalDateOptions.map((opt) => (
                        <option key={opt.value} value={opt.value} style={{ backgroundColor: '#F3E6C8', color: '#2B1A12' }}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label
                      style={{ fontFamily: "'Cinzel', serif", color: '#B8862B', letterSpacing: '0.15em', fontSize: '12px' }}
                      className="font-bold uppercase"
                    >
                      ARRIVAL TIME
                    </label>
                    <input
                      type="time"
                      value={arrivalTime}
                      onChange={(e) => setArrivalTime(e.target.value)}
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: '18px',
                        color: 'var(--ink)',
                        backgroundColor: 'transparent',
                        borderBottom: '1px solid #B8862B',
                        borderRadius: 0,
                      }}
                      className="py-1.5 px-1 focus:outline-none focus:border-[#5E1224]"
                    />
                  </div>
                </div>

                {/* Pickup needed */}
                <div className="flex flex-col gap-2">
                  <label
                    style={{ fontFamily: "'Cinzel', serif", color: '#B8862B', letterSpacing: '0.15em', fontSize: '12px' }}
                    className="font-bold uppercase"
                  >
                    NEED PICKUP FROM AIRPORT OR STATION?
                  </label>
                  <div className="flex items-center gap-3">
                    {(['Yes', 'No'] as const).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setNeedPickup(opt)}
                        style={{
                          fontFamily: "'Cormorant Garamond', serif",
                          fontSize: '17px',
                          backgroundColor: needPickup === opt ? '#5E1224' : 'transparent',
                          color: needPickup === opt ? '#F3E6C8' : '#5E1224',
                          border: '1px solid #B8862B',
                          borderRadius: '999px',
                          padding: '6px 20px',
                        }}
                        className="font-medium transition cursor-pointer"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Wishes Textarea with Quick Chips */}
                <div className="flex flex-col gap-2">
                  <label
                    style={{ fontFamily: "'Cinzel', serif", color: '#B8862B', letterSpacing: '0.15em', fontSize: '12px' }}
                    className="font-bold uppercase"
                  >
                    WISHES FOR THE COUPLE
                  </label>
                  <textarea
                    rows={3}
                    value={wishes}
                    onChange={(e) => setWishes(e.target.value)}
                    placeholder="Write a warm note or wish for the couple"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: '18px',
                      color: 'var(--ink)',
                      backgroundColor: 'transparent',
                      borderBottom: '1px solid #B8862B',
                      borderRadius: 0,
                    }}
                    className="py-1.5 px-1 focus:outline-none focus:border-[#5E1224] resize-none"
                  />
                  <div className="flex items-center gap-2 flex-wrap mt-1">
                    {['Congratulations!', 'Blessings to you both', "Can't wait to celebrate with you"].map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => {
                          setWishes((prev) => (prev ? `${prev} ${chip}` : chip));
                        }}
                        style={{
                          fontFamily: "'Cormorant Garamond', serif",
                          fontSize: '14px',
                          backgroundColor: 'rgba(184, 134, 43, 0.12)',
                          color: '#5E1224',
                          border: '1px solid #B8862B',
                          borderRadius: '999px',
                          padding: '4px 12px',
                        }}
                        className="hover:bg-[#B8862B]/25 transition cursor-pointer font-medium"
                      >
                        + {chip}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 3 Navigation Buttons */}
                <div className="flex items-center justify-between mt-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    style={{
                      fontFamily: "'Cinzel', serif",
                      borderColor: '#B8862B',
                      color: '#5E1224',
                      borderRadius: '999px',
                      padding: '12px 28px',
                    }}
                    className="border font-bold uppercase tracking-wider hover:bg-[#B8862B]/10 transition cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep3}
                    style={{
                      fontFamily: "'Cinzel', serif",
                      backgroundColor: '#B8862B',
                      color: '#5E1224',
                      borderRadius: '999px',
                      padding: '12px 28px',
                    }}
                    className="font-bold uppercase tracking-wider shadow hover:brightness-105 active:scale-[0.98] transition cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </>
            )}

            {/* STEP 4: REVIEW */}
            {step === 4 && (
              <>
                <div className="flex flex-col gap-4">
                  <p style={{ fontFamily: "'Cinzel', serif", color: '#B8862B', fontSize: '13px' }} className="font-bold uppercase tracking-widest text-center">
                    REVIEW YOUR RSVP
                  </p>

                  {/* Summary Group: You */}
                  <div className="bg-white/40 border border-[#B8862B]/40 rounded-xl p-3.5 flex flex-col gap-2">
                    <div className="flex items-center justify-between border-b border-[#B8862B]/30 pb-1.5">
                      <span style={{ fontFamily: "'Cinzel', serif", fontSize: '11px', color: '#5E1224' }} className="font-bold uppercase">
                        1. You
                      </span>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        style={{ fontFamily: "'Cinzel', serif", fontSize: '11px', color: '#B8862B' }}
                        className="font-bold underline hover:opacity-80 cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-sm">
                      <span style={{ fontFamily: "'Cinzel', serif", fontSize: '11px' }} className="text-stone-600 uppercase">
                        Name:
                      </span>
                      <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px' }} className="font-semibold text-stone-900">
                        {fullName}
                      </span>

                      <span style={{ fontFamily: "'Cinzel', serif", fontSize: '11px' }} className="text-stone-600 uppercase">
                        Mobile:
                      </span>
                      <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px' }} className="font-semibold text-stone-900">
                        +91 {mobile}
                      </span>

                      <span style={{ fontFamily: "'Cinzel', serif", fontSize: '11px' }} className="text-stone-600 uppercase">
                        From:
                      </span>
                      <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px' }} className="font-semibold text-stone-900">
                        {side === 'groom' ? `${INVITE.groom.first}'s side` : `${INVITE.bride.first}'s side`}
                      </span>

                      <span style={{ fontFamily: "'Cinzel', serif", fontSize: '11px' }} className="text-stone-600 uppercase">
                        Response:
                      </span>
                      <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px' }} className="font-bold text-[#5E1224]">
                        {attending === 'accept' ? 'Joyfully Accept' : 'Regretfully Decline'}
                      </span>
                    </div>
                  </div>

                  {/* Summary Group: Celebrations & Details (if accepting) */}
                  {attending === 'accept' ? (
                    <>
                      <div className="bg-white/40 border border-[#B8862B]/40 rounded-xl p-3.5 flex flex-col gap-2">
                        <div className="flex items-center justify-between border-b border-[#B8862B]/30 pb-1.5">
                          <span style={{ fontFamily: "'Cinzel', serif", fontSize: '11px', color: '#5E1224' }} className="font-bold uppercase">
                            2. Celebrations & Guests
                          </span>
                          <button
                            type="button"
                            onClick={() => setStep(2)}
                            style={{ fontFamily: "'Cinzel', serif", fontSize: '11px', color: '#B8862B' }}
                            className="font-bold underline hover:opacity-80 cursor-pointer"
                          >
                            Edit
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-sm">
                          <span style={{ fontFamily: "'Cinzel', serif", fontSize: '11px' }} className="text-stone-600 uppercase">
                            Events:
                          </span>
                          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px' }} className="font-semibold text-stone-900">
                            {INVITE.events
                              .filter((e) => selectedEvents.includes(e.key))
                              .map((e) => e.name)
                              .join(', ')}
                          </span>

                          <span style={{ fontFamily: "'Cinzel', serif", fontSize: '11px' }} className="text-stone-600 uppercase">
                            Guests:
                          </span>
                          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px' }} className="font-semibold text-stone-900">
                            {adults} adult(s), {childrenCount} child(ren)
                          </span>

                          <span style={{ fontFamily: "'Cinzel', serif", fontSize: '11px' }} className="text-stone-600 uppercase">
                            Meal:
                          </span>
                          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px' }} className="font-semibold text-stone-900">
                            {meal} {specialRequest ? `(${specialRequest})` : ''}
                          </span>
                        </div>
                      </div>

                      <div className="bg-white/40 border border-[#B8862B]/40 rounded-xl p-3.5 flex flex-col gap-2">
                        <div className="flex items-center justify-between border-b border-[#B8862B]/30 pb-1.5">
                          <span style={{ fontFamily: "'Cinzel', serif", fontSize: '11px', color: '#5E1224' }} className="font-bold uppercase">
                            3. Stay & Travel Details
                          </span>
                          <button
                            type="button"
                            onClick={() => setStep(3)}
                            style={{ fontFamily: "'Cinzel', serif", fontSize: '11px', color: '#B8862B' }}
                            className="font-bold underline hover:opacity-80 cursor-pointer"
                          >
                            Edit
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-sm">
                          <span style={{ fontFamily: "'Cinzel', serif", fontSize: '11px' }} className="text-stone-600 uppercase">
                            Stay needed:
                          </span>
                          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px' }} className="font-semibold text-stone-900">
                            {needStay}
                          </span>

                          <span style={{ fontFamily: "'Cinzel', serif", fontSize: '11px' }} className="text-stone-600 uppercase">
                            Arriving from:
                          </span>
                          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px' }} className="font-semibold text-stone-900">
                            {arrivingCity || 'N/A'}
                          </span>

                          <span style={{ fontFamily: "'Cinzel', serif", fontSize: '11px' }} className="text-stone-600 uppercase">
                            Pickup needed:
                          </span>
                          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px' }} className="font-semibold text-stone-900">
                            {needPickup}
                          </span>

                          {wishes && (
                            <>
                              <span style={{ fontFamily: "'Cinzel', serif", fontSize: '11px' }} className="text-stone-600 uppercase">
                                Wishes:
                              </span>
                              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px' }} className="font-semibold text-stone-900 italic">
                                "{wishes}"
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <label
                        style={{ fontFamily: "'Cinzel', serif", color: '#B8862B', letterSpacing: '0.15em', fontSize: '12px' }}
                        className="font-bold uppercase"
                      >
                        WISHES FOR THE COUPLE (OPTIONAL)
                      </label>
                      <textarea
                        rows={3}
                        value={wishes}
                        onChange={(e) => setWishes(e.target.value)}
                        placeholder="Write a message or wish for the couple"
                        style={{
                          fontFamily: "'Cormorant Garamond', serif",
                          fontSize: '18px',
                          color: 'var(--ink)',
                          backgroundColor: 'transparent',
                          borderBottom: '1px solid #B8862B',
                          borderRadius: 0,
                        }}
                        className="py-1.5 px-1 focus:outline-none focus:border-[#5E1224] resize-none"
                      />
                    </div>
                  )}

                  {/* Final Submit Button */}
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleSendWhatsApp}
                    style={{
                      fontFamily: "'Cinzel', serif",
                      backgroundColor: '#B8862B',
                      color: '#5E1224',
                      borderRadius: '999px',
                      padding: '14px 32px',
                      letterSpacing: '0.1em',
                    }}
                    className="w-full mt-2 font-bold uppercase shadow-lg hover:brightness-105 active:scale-[0.98] transition cursor-pointer disabled:opacity-50"
                  >
                    Send RSVP on WhatsApp
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </motion.div>
  );
}

// Single Event Component (Two Screens per Event: Screen A + Screen B)
function EventSection({
  event,
  index,
}: {
  event: (typeof INVITE.events)[0];
  index: number;
}) {
  let bgHex = '#0F4A4A';
  let textColorClass = 'text-[#FBF3E0]';
  let textColorHex = '#FBF3E0';
  let labelColorHex = '#F3E5AB';
  let borderLineColor = 'rgba(243, 229, 171, 0.35)';
  let pillBg = 'rgba(251, 243, 224, 0.12)';
  let diamondColor = '#F3E5AB';

  if (event.key === 'haldi') {
    bgHex = '#F2B84B';
    textColorClass = 'text-[#2B1A12]';
    textColorHex = '#2B1A12';
    labelColorHex = '#5A2C00';
    borderLineColor = 'rgba(90, 44, 0, 0.35)';
    pillBg = 'rgba(43, 26, 18, 0.08)';
    diamondColor = '#5A2C00';
  } else if (event.key === 'mehendi') {
    bgHex = '#4A6B38';
  } else if (event.key === 'sangeet') {
    bgHex = '#6A1B45';
  } else if (event.key === 'vivah') {
    bgHex = '#4A0E1C';
  } else if (event.key === 'reception') {
    bgHex = '#0F4A4A';
  }

  // Candidate images for Screen A
  const sources = archSources(event.key);
  const [imgIndex, setImgIndex] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Pre-check if current image is already cached or completed
  useEffect(() => {
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setImgLoaded(true);
    }
  }, [imgIndex]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!imgLoaded && !imgFailed && imgIndex < sources.length) {
      timer = setTimeout(() => {
        setImgIndex((prev) => prev + 1);
      }, 5000);
    } else if (imgIndex >= sources.length) {
      setImgFailed(true);
    }
    return () => clearTimeout(timer);
  }, [imgIndex, imgLoaded, imgFailed, sources.length]);

  const handleImgLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (e.currentTarget.naturalWidth > 0) {
      setImgLoaded(true);
    } else {
      setImgIndex((prev) => prev + 1);
    }
  };

  const handleImgError = () => {
    setImgIndex((prev) => prev + 1);
  };

  // Screen B slide-in triggers
  const screenBRef = useRef<HTMLDivElement>(null);
  const [isIn, setIsIn] = useState(false);
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    try {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReduced(mq.matches);
    } catch (e) {
      console.warn(e);
    }
  }, []);

  useEffect(() => {
    if (prefersReduced) {
      setIsIn(true);
      return;
    }

    let observer: IntersectionObserver | null = null;
    const el = screenBRef.current;

    if (el && typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsIn(true);
            if (observer) observer.disconnect();
          }
        },
        { threshold: 0.2 }
      );
      observer.observe(el);
    }

    // Fallback polling
    const interval = setInterval(() => {
      if (screenBRef.current) {
        const rect = screenBRef.current.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.85) {
          setIsIn(true);
          clearInterval(interval);
          if (observer) observer.disconnect();
        }
      }
    }, 400);

    return () => {
      if (observer) observer.disconnect();
      clearInterval(interval);
    };
  }, [prefersReduced]);

  const currentImgSrc = sources[imgIndex] || '';

  // Slide transition inline styles for Screen B
  const getRowStyle = (rowIdx: number, fromLeft: boolean) => {
    if (prefersReduced) {
      return {};
    }
    const delayMs = rowIdx * 160;
    const startX = fromLeft ? '-70vw' : '70vw';
    return {
      opacity: isIn ? 1 : 0,
      transform: isIn ? 'translateX(0)' : `translateX(${startX})`,
      transition: `transform 1.1s cubic-bezier(0.22, 1, 0.36, 1) ${delayMs}ms, opacity 1.1s cubic-bezier(0.22, 1, 0.36, 1) ${delayMs}ms`,
    };
  };

  const getFadeRiseStyle = (delayMs = 640) => {
    if (prefersReduced) {
      return {};
    }
    return {
      opacity: isIn ? 1 : 0,
      transform: isIn ? 'translateY(0)' : 'translateY(20px)',
      transition: `transform 0.9s cubic-bezier(0.22, 1, 0.36, 1) ${delayMs}ms, opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1) ${delayMs}ms`,
    };
  };

  const oneLinerDate = getEventOneLiner(event.date, event.time);

  return (
    <div
      style={{ backgroundColor: bgHex }}
      className="w-[100vw] max-w-none m-0 p-0 overflow-x-clip relative select-none"
    >
      {/* ========================================================
          SCREEN A: THE IMAGE SCREEN (100vw x 100dvh)
          ======================================================== */}
      <div className="w-[100vw] h-[100dvh] relative overflow-hidden flex items-center justify-center select-none m-0 p-0">
        {/* Flat Event Color Background */}
        <div className="absolute inset-0 z-0" style={{ backgroundColor: bgHex }} />

        {/* Arch Image (Full-bleed on <=1100px mobile & tablet, Framed Arch on >1100px desktop) */}
        {!imgFailed && currentImgSrc && (
          <img
            ref={imgRef}
            src={currentImgSrc}
            alt={event.name}
            loading="eager"
            decoding="async"
            onLoad={handleImgLoad}
            onError={handleImgError}
            style={{
              objectFit: 'cover',
              objectPosition: '50% 38%',
              transition: 'opacity 0.4s ease-in-out',
              opacity: imgLoaded ? 1 : 0,
            }}
            className="animate-slow-zoom z-10 pointer-events-none max-w-none
              max-[1099px]:absolute max-[1099px]:top-0 max-[1099px]:left-0 max-[1099px]:w-full max-[1099px]:h-full max-[1099px]:rounded-none max-[1099px]:border-0
              min-[1100px]:relative min-[1100px]:w-[min(520px,80vw)] min-[1100px]:h-[min(720px,75vh)] min-[1100px]:rounded-[999px_999px_24px_24px] min-[1100px]:border-[3px] min-[1100px]:border-[#B8862B] min-[1100px]:shadow-2xl"
          />
        )}

        {/* Title Block over/below the image at lower-center - EXACTLY ONCE */}
        <div
          style={{
            position: 'absolute',
            bottom: '8vh',
            left: 0,
            width: '100%',
            textAlign: 'center',
            zIndex: 20,
            pointerEvents: 'none',
          }}
          className="flex flex-col items-center justify-center px-4"
        >
          <h2
            style={{
              fontFamily: "'Great Vibes', cursive",
              fontSize: 'clamp(48px, 12vw, 84px)',
              lineHeight: 1.0,
              color: textColorHex,
              filter: event.key === 'haldi' 
                ? 'drop-shadow(0 2px 4px rgba(255,255,255,0.3)) drop-shadow(0 2px 10px rgba(0,0,0,0.5))' 
                : 'drop-shadow(0 2px 8px rgba(0,0,0,0.8))',
            }}
            className="font-normal m-0 p-0"
          >
            {event.name}
          </h2>

          <p
            style={{
              fontFamily: "'Yatra One', 'Tiro Devanagari Hindi', cursive, serif",
              fontSize: '22px',
              color: textColorHex,
              filter: event.key === 'haldi' 
                ? 'drop-shadow(0 1px 3px rgba(255,255,255,0.3)) drop-shadow(0 2px 6px rgba(0,0,0,0.5))' 
                : 'drop-shadow(0 2px 6px rgba(0,0,0,0.8))',
              marginTop: '4px',
              lineHeight: 1.2,
            }}
            className="font-medium m-0 p-0 opacity-95"
          >
            {event.hindi}
          </p>
        </div>
      </div>

      {/* ========================================================
          SCREEN B: THE DETAILS SCREEN (100vw x min-h-100dvh)
          ======================================================== */}
      <div
        ref={screenBRef}
        style={{
          backgroundColor: bgHex,
          padding: '4dvh 20px',
        }}
        className={`w-[100vw] min-h-[100dvh] flex flex-col items-center justify-between text-center ${textColorClass} z-10 relative overflow-hidden`}
      >
        {/* TOP DECOR BAND */}
        {EVENT_DECOR[event.key]?.top}

        <div className="w-full max-w-[640px] flex flex-col items-center justify-center gap-[2.8dvh] my-auto relative z-10">
          {/* Header */}
          <div style={getFadeRiseStyle(640)} className="flex flex-col items-center justify-center">
            <div className="flex items-baseline justify-center gap-3 flex-wrap">
              <h2
                style={{
                  fontFamily: "'Great Vibes', cursive",
                  fontSize: '52px',
                  lineHeight: 1.0,
                }}
                className="font-normal drop-shadow-sm"
              >
                {event.name}
              </h2>
              <span
                style={{
                  fontFamily: "'Yatra One', 'Tiro Devanagari Hindi', cursive, serif",
                  fontSize: '20px',
                }}
                className="font-medium opacity-90"
              >
                {event.hindi}
              </span>
            </div>
            <DiamondDivider color={diamondColor} />
          </div>

          {/* 4 Detail Rows Container */}
          <div className="w-full flex flex-col gap-[2.2dvh] items-center justify-center">
            
            {/* ROW 1: DATE & TIME */}
            <div
              style={{
                ...getRowStyle(0, true),
                borderBottom: `1px solid ${borderLineColor}`,
                paddingBottom: '1.2dvh',
              }}
              className="w-full flex flex-col items-center justify-center gap-1"
            >
              <span
                style={{
                  fontFamily: "'Cinzel', serif",
                  letterSpacing: '0.2em',
                  fontSize: 'clamp(13px, 3.2vw, 18px)',
                  color: labelColorHex,
                  fontWeight: 700,
                }}
                className="uppercase"
              >
                {oneLinerDate}
              </span>
            </div>

            {/* ROW 2: VENUE */}
            <div
              style={{
                ...getRowStyle(1, false),
                borderBottom: `1px solid ${borderLineColor}`,
                paddingBottom: '1.2dvh',
              }}
              className="w-full flex flex-col items-center justify-center gap-1"
            >
              <span
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '22px',
                  lineHeight: 1.2,
                }}
                className="italic font-bold"
              >
                {event.venue}
              </span>
              <span
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '14px',
                }}
                className="opacity-90 font-normal"
              >
                {event.address}
              </span>
            </div>

            {/* ROW 3: DRESS CODE BADGE */}
            <div
              style={{
                ...getRowStyle(2, true),
                borderBottom: `1px solid ${borderLineColor}`,
                paddingBottom: '1.2dvh',
              }}
              className="w-full flex flex-col items-center justify-center"
            >
              <div
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: '12px',
                  letterSpacing: '0.15em',
                  backgroundColor: pillBg,
                  border: `1px solid ${borderLineColor}`,
                }}
                className="px-5 py-2 rounded-full uppercase font-semibold"
              >
                DRESS CODE: {event.dress}
              </div>
            </div>

            {/* ROW 4: NOTE & SCHEDULE */}
            <div
              style={{
                ...getRowStyle(3, false),
                paddingBottom: '0.5dvh',
              }}
              className="w-full flex flex-col items-center justify-center gap-3"
            >
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '18px',
                  lineHeight: 1.4,
                }}
                className="italic font-medium max-w-lg"
              >
                "{event.note}"
              </p>

              {event.schedule && event.schedule.length > 0 && (
                <div className="flex flex-col gap-1 mt-1 items-center justify-center opacity-90">
                  {event.schedule.map(([sTime, sDesc], sIdx) => (
                    <div key={sIdx} className="flex items-center justify-center gap-2 text-[14px]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                      <span className="font-bold tracking-wider uppercase" style={{ fontFamily: "'Cinzel', serif", fontSize: '11px' }}>{sTime}</span>
                      <span className="opacity-50">·</span>
                      <span>{sDesc}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* BOTTOM DECOR BAND */}
        {EVENT_DECOR[event.key]?.bottom}
      </div>

    </div>
  );
}

// Petals Falling Layer (3 Depth Tiers)
function PetalLayer({ isUnlocked }: { isUnlocked: boolean }) {
  const [petalCount, setPetalCount] = useState(28);
  const [prefersReduced, setPrefersReduced] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    try {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReduced(mq.matches);
      const isLowEnd =
        (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
        ((navigator as any).deviceMemory && (navigator as any).deviceMemory <= 4);
      if (isLowEnd) {
        setPetalCount(8);
      }
    } catch (e) {
      console.warn('PetalLayer error:', e);
    }
  }, []);

  useEffect(() => {
    if (!isUnlocked || prefersReduced) return;
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isUnlocked, prefersReduced]);

  if (!isUnlocked || prefersReduced) return null;

  const petals = Array.from({ length: petalCount }).map((_, i) => {
    const tier = i % 3; // 0 = far, 1 = middle, 2 = near
    const gradientType = i % 3;
    const leftPercent = (i * 37 + 13) % 100;
    const duration = tier === 0 ? 26 : tier === 1 ? 18 : 12;
    const delay = (i * 0.7) % duration;
    const size = tier === 0 ? 6 : tier === 1 ? 10 : 16;
    const opacity = tier === 0 ? 0.35 : tier === 1 ? 0.5 : 0.6;
    const k = tier === 0 ? 0.04 : tier === 1 ? 0.12 : 0.25;

    const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
    const scrollShift = (scrollY * k) % vh;

    let background = 'linear-gradient(135deg, #E8891C, #F2B84B)';
    if (gradientType === 1) {
      background = 'linear-gradient(135deg, #C83B56, #E86B84)';
    } else if (gradientType === 2) {
      background = 'linear-gradient(135deg, #FBF3E0, #F3E6C8)';
    }

    return {
      id: i,
      tier,
      size,
      opacity,
      leftPercent,
      duration,
      delay,
      background,
      scrollShift,
    };
  });

  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden select-none">
      {petals.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: -30, x: 0, rotate: 0 }}
          animate={{
            y: ['0vh', '110vh'],
            x: [0, p.id % 2 === 0 ? 20 : -20, 0],
            rotate: [0, p.id % 2 === 0 ? 180 : -180],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{
            position: 'absolute',
            top: 0,
            left: `${p.leftPercent}%`,
            width: `${p.size}px`,
            height: `${p.size * 1.4}px`,
            borderRadius: '60% 40% 60% 40%',
            background: p.background,
            opacity: p.opacity,
            transform: `translateY(-${p.scrollShift}px)`,
            filter: p.tier === 2 ? 'blur(1.5px)' : 'none',
          }}
        />
      ))}
    </div>
  );
}

// Right Edge Scroll Progress Line with Riding Diya Head
function ScrollProgressLine({ isUnlocked }: { isUnlocked: boolean }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isUnlocked) return;
    const handleScroll = () => {
      try {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (totalHeight > 0) {
          const currentProgress = Math.min(1, Math.max(0, window.scrollY / totalHeight));
          setProgress(currentProgress);
        }
      } catch (e) {
        console.warn('ScrollProgressLine error:', e);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isUnlocked]);

  if (!isUnlocked) return null;

  return (
    <div
      style={{
        position: 'fixed',
        right: 'clamp(6px, 1.5vw, 10px)',
        top: '12vh',
        height: '76vh',
        width: '2px',
        zIndex: 40,
        pointerEvents: 'none',
      }}
      className="flex flex-col items-center justify-start select-none"
    >
      <div className="absolute inset-0 bg-[var(--gold)] opacity-25 rounded-full" />
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'var(--gold)',
          transform: `scaleY(${progress})`,
          transformOrigin: 'top',
        }}
        className="relative rounded-full transition-transform duration-75 ease-out"
      />
      <div
        style={{
          position: 'absolute',
          top: `${progress * 100}%`,
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
        className="w-6 h-6 flex items-center justify-center ambient-diya"
      >
        <svg className="w-6 h-6 object-contain" viewBox="0 0 24 24" fill="none">
          <path d="M12 3C12 3 8 7 8 10C8 12.2 9.8 14 12 14C14.2 14 16 12.2 16 10C16 7 12 3 12 3Z" fill="#F2B84B" />
          <path d="M4 14C4 14 5 19 12 19C19 19 20 14 20 14H4Z" fill="#B8862B" />
        </svg>
      </div>
    </div>
  );
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
      return true;
    }
    return false;
  };

  return { isInstallable: !!deferredPrompt, isInstalled, isIOS, install };
}

function PWAInstallButton() {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) return null;

  if (isInstallable) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={install}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-lg text-[#FBF3E0] bg-[#4A0E1C]/90 border border-[#B8862B] hover:bg-[#5E1224] transition-all backdrop-blur-sm cursor-pointer"
          style={{ fontFamily: "'Cinzel', serif" }}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          INSTALL APP
        </button>
      </div>
    );
  }

  if (isIOS) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-lg text-[#FBF3E0] bg-[#4A0E1C]/90 border border-[#B8862B] hover:bg-[#5E1224] transition-all backdrop-blur-sm cursor-pointer"
          style={{ fontFamily: "'Cinzel', serif" }}
        >
          INSTALL APP
        </button>
        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-xs rounded-2xl bg-[#FBF3E0] p-5 shadow-2xl border-2 border-[#B8862B] text-center">
              <h3 className="text-base font-bold text-[#4A0E1C]" style={{ fontFamily: "'Cinzel', serif" }}>
                Install on iPhone / iPad
              </h3>
              <p className="mt-2 text-xs text-[#5C2B18] leading-relaxed" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                1. Tap the <strong className="text-[#4A0E1C]">Share</strong> button in Safari toolbar.<br />
                2. Scroll down and tap <strong className="text-[#4A0E1C]">Add to Home Screen</strong>.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-xl bg-[#4A0E1C] py-2 text-xs font-semibold text-[#FBF3E0] hover:bg-[#5E1224] cursor-pointer"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                GOT IT
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}

const WALL_TEXT_SHADOW = '0 1px 0 rgba(255,248,225,0.9), 0 3px 8px rgba(94,18,36,0.18)';

export default function App() {
  useEffect(() => {
    startAllAssetPreloading();
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch((err) => {
          console.warn('Service worker registration failed:', err);
        });
      });
    }
  }, []);

  const [envelopeIndex, setEnvelopeIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [envelopeHidden, setEnvelopeHidden] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const [wallTextReady, setWallTextReady] = useState(false);
  const [isScrollLocked, setIsScrollLocked] = useState(true);

  // Video container rectangle calculation for wall text overlay
  const [videoRect, setVideoRect] = useState<{ width: number; height: number; top: number; left: number }>({
    width: 0,
    height: 0,
    top: 0,
    left: 0,
  });

  // Dynamic 180-day countdown target set on page load
  const targetDateRef = useRef<number>(Date.now() + 180 * 24 * 60 * 60 * 1000);
  const [countdown, setCountdown] = useState({ days: 180, hours: 0, minutes: 0, seconds: 0 });

  // RSVP state
  const [rsvpName, setRsvpName] = useState('');
  const [rsvpGuests, setRsvpGuests] = useState(1);
  const [rsvpAttending, setRsvpAttending] = useState<'accept' | 'decline'>('accept');
  const [rsvpMessage, setRsvpMessage] = useState('');
  const [rsvpError, setRsvpError] = useState('');
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const openedRef = useRef<boolean>(false);

  // Section Refs for scroll effects
  const invitationRef = useRef<HTMLElement | null>(null);
  const coupleRef = useRef<HTMLElement | null>(null);
  const countdownRef = useRef<HTMLElement | null>(null);
  const venueRef = useRef<HTMLElement | null>(null);
  const rsvpRef = useRef<HTMLElement | null>(null);
  const footerRef = useRef<HTMLElement | null>(null);

  // Scroll Progresses with Springs
  const { scrollYProgress: invScroll } = useScroll({ target: invitationRef, offset: ["start end", "end start"] });
  const pInvRaw = useSpring(invScroll, { stiffness: 100, damping: 20, restDelta: 0.001 });

  const { scrollYProgress: cplScroll } = useScroll({ target: coupleRef, offset: ["start end", "end start"] });
  const pCplRaw = useSpring(cplScroll, { stiffness: 100, damping: 20, restDelta: 0.001 });

  const { scrollYProgress: cntScroll } = useScroll({ target: countdownRef, offset: ["start end", "end start"] });
  const pCntRaw = useSpring(cntScroll, { stiffness: 100, damping: 20, restDelta: 0.001 });

  const { scrollYProgress: venScroll } = useScroll({ target: venueRef, offset: ["start end", "end start"] });
  const pVenRaw = useSpring(venScroll, { stiffness: 100, damping: 20, restDelta: 0.001 });

  const { scrollYProgress: rsvpScrollProgress } = useScroll({ target: rsvpRef, offset: ["start end", "end start"] });
  const pRsvpRaw = useSpring(rsvpScrollProgress, { stiffness: 100, damping: 20, restDelta: 0.001 });

  const { scrollYProgress: ftrScroll } = useScroll({ target: footerRef, offset: ["start end", "end start"] });
  const pFtrRaw = useSpring(ftrScroll, { stiffness: 100, damping: 20, restDelta: 0.001 });

  // Is mobile viewport check for half offsets
  const [isMobileScreen, setIsMobileScreen] = useState(false);
  useEffect(() => {
    try {
      const checkMobile = () => setIsMobileScreen(window.innerWidth < 700);
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    } catch (e) {
      console.warn(e);
    }
  }, []);

  const offsetFactor = isMobileScreen ? 0.5 : 1.0;

  // Invitation Transforms
  const cornerXOffset = 40 * offsetFactor;
  const cornerYOffset = 40 * offsetFactor;

  const invCornerTLX = useTransform(pInvRaw, [0, 0.4], [`-${cornerXOffset}vw`, '0vw']);
  const invCornerTLY = useTransform(pInvRaw, [0, 0.4], [`-${cornerYOffset}vw`, '0vw']);
  const invCornerTRX = useTransform(pInvRaw, [0, 0.4], [`${cornerXOffset}vw`, '0vw']);
  const invCornerTRY = useTransform(pInvRaw, [0, 0.4], [`-${cornerYOffset}vw`, '0vw']);
  const invCornerBLX = useTransform(pInvRaw, [0, 0.4], [`-${cornerXOffset}vw`, '0vw']);
  const invCornerBLY = useTransform(pInvRaw, [0, 0.4], [`${cornerYOffset}vw`, '0vw']);
  const invCornerBRX = useTransform(pInvRaw, [0, 0.4], [`${cornerXOffset}vw`, '0vw']);
  const invCornerBRY = useTransform(pInvRaw, [0, 0.4], [`${cornerYOffset}vw`, '0vw']);

  const invCornerRotTL = useTransform(pInvRaw, [0, 0.4], [-15, 0]);
  const invCornerRotTR = useTransform(pInvRaw, [0, 0.4], [15, 0]);
  const invCornerRotBL = useTransform(pInvRaw, [0, 0.4], [15, 0]);
  const invCornerRotBR = useTransform(pInvRaw, [0, 0.4], [-15, 0]);

  const invCornerScale = useTransform(pInvRaw, [0, 0.4], [0.5, 1]);
  const kalashY = useTransform(pInvRaw, [0, 0.4], ['-120%', '0%']);

  // Couple Transforms
  const cplGarlandY = useTransform(pCplRaw, [0, 0.4], ['-100%', '0%']);
  const cplGroomX = useTransform(pCplRaw, [0, 0.45], [`-${80 * offsetFactor}px`, '0px']);
  const cplBrideX = useTransform(pCplRaw, [0.05, 0.5], [`${80 * offsetFactor}px`, '0px']);
  const cplTitleScale = useTransform(pCplRaw, [0, 0.3], [0.85, 1]);
  const cplTitleOpacity = useTransform(pCplRaw, [0, 0.3], [0, 1]);

  // Countdown Transforms
  const cntTitleScale = useTransform(pCntRaw, [0, 0.3], [0.85, 1]);
  const cntTitleOpacity = useTransform(pCntRaw, [0, 0.3], [0, 1]);
  const cntDiyaY = useTransform(pCntRaw, [0, 0.4], ['140%', '0%']);
  const cntDiyaScale = useTransform(pCntRaw, [0, 0.4], [0.5, 1]);

  const cntBoxY = useTransform(pCntRaw, [0, 0.4], [40, 0]);
  const cntBoxRotX = useTransform(pCntRaw, [0, 0.4], [70, 0]);

  // Venue Transforms
  const venGarlandY = useTransform(pVenRaw, [0, 0.4], ['-100%', '0%']);
  const venArchScale = useTransform(pVenRaw, [0, 0.35], [0.78, 1]);
  const venArchY = useTransform(pVenRaw, [0, 0.35], [80, 0]);
  const venArchOpacity = useTransform(pVenRaw, [0, 0.35], [0, 1]);
  const venArchInnerDrift = useTransform(pVenRaw, [0, 1], ['4%', '-4%']);
  const venTextX = useTransform(pVenRaw, [0, 0.4], [`${80 * offsetFactor}px`, '0px']);

  // RSVP Transforms
  const rsvpGarlandY = useTransform(pRsvpRaw, [0, 0.4], ['-100%', '0%']);
  const rsvpDiyaY = useTransform(pRsvpRaw, [0, 0.4], ['140%', '0%']);
  const rsvpDiyaScale = useTransform(pRsvpRaw, [0, 0.4], [0.5, 1]);
  const rsvpCardScale = useTransform(pRsvpRaw, [0, 0.4], [0.92, 1]);
  const rsvpCardY = useTransform(pRsvpRaw, [0, 0.4], [50, 0]);

  // Footer Transforms
  const ftrDiyaY = useTransform(pFtrRaw, [0, 0.4], ['140%', '0%']);
  const ftrNamesScale = useTransform(pFtrRaw, [0, 0.4], [0.8, 1]);

  const currentEnvelopeUrl = ENVELOPE_URLS[envelopeIndex] || ENVELOPE_URLS[0];

  // Preload video on mount
  useEffect(() => {
    try {
      if (videoRef.current) {
        videoRef.current.load();
      }
    } catch (e) {
      console.warn('Video load on mount warning:', e);
    }
  }, []);

  // Preload all 5 event images on mount immediately
  useEffect(() => {
    const allKeys = ['haldi', 'mehendi', 'sangeet', 'vivah', 'reception'];
    allKeys.forEach((k) => {
      const srcs = archSources(k);
      srcs.slice(0, 2).forEach((srcUrl) => {
        const img = new Image();
        img.src = srcUrl;
      });
    });
  }, []);

  // Compute exact rendered rectangle of video (object-fit: contain)
  const updateVideoRect = () => {
    try {
      const video = videoRef.current;
      if (!video) return;

      const vw = window.innerWidth || 360;
      const vh = window.innerHeight || 800;
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      if (!videoWidth || !videoHeight || isNaN(videoWidth) || isNaN(videoHeight) || videoWidth <= 0 || videoHeight <= 0) {
        setVideoRect({ width: 0, height: 0, top: 0, left: 0 });
        return;
      }

      const videoAspect = videoWidth / videoHeight;
      const screenAspect = vw / vh;

      let renderedW = 0;
      let renderedH = 0;
      let top = 0;
      let left = 0;

      if (screenAspect > videoAspect) {
        renderedH = vh;
        renderedW = vh * videoAspect;
        top = 0;
        left = (vw - renderedW) / 2;
      } else {
        renderedW = vw;
        renderedH = vw / videoAspect;
        top = (vh - renderedH) / 2;
        left = 0;
      }

      if (isNaN(renderedW) || isNaN(renderedH) || renderedW <= 0 || renderedH <= 0) {
        setVideoRect({ width: 0, height: 0, top: 0, left: 0 });
        return;
      }

      setVideoRect({ width: renderedW, height: renderedH, top, left });
    } catch (err) {
      console.warn('updateVideoRect warning:', err);
      setVideoRect({ width: 0, height: 0, top: 0, left: 0 });
    }
  };

  useEffect(() => {
    window.addEventListener('resize', updateVideoRect);
    window.addEventListener('orientationchange', updateVideoRect);
    return () => {
      window.removeEventListener('resize', updateVideoRect);
      window.removeEventListener('orientationchange', updateVideoRect);
    };
  }, []);

  // Envelope image timeout hook: advance if not loaded within 4 seconds
  useEffect(() => {
    if (imageLoaded) return;
    const timer = setTimeout(() => {
      if (!imageLoaded) {
        setEnvelopeIndex((prev) => {
          if (prev < ENVELOPE_URLS.length - 1) {
            console.warn(`Envelope image index ${prev} timed out after 4s, trying next candidate`);
            return prev + 1;
          }
          return prev;
        });
      }
    }, 4000);
    return () => clearTimeout(timer);
  }, [envelopeIndex, imageLoaded]);

  // Dynamic 180-day countdown timer updating every second without animation
  useEffect(() => {
    const updateCountdown = () => {
      try {
        const now = Date.now();
        const diff = Math.max(0, targetDateRef.current - now);

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        setCountdown({ days, hours, minutes, seconds });
      } catch (e) {
        console.warn('Countdown update warning:', e);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Lock / unlock page scrolling
  useEffect(() => {
    try {
      if (isScrollLocked) {
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
        document.body.style.touchAction = 'none';
      } else {
        document.documentElement.style.overflow = 'auto';
        document.body.style.overflow = 'auto';
        document.body.style.touchAction = 'auto';
      }
    } catch (e) {
      console.warn('Scroll lock effect warning:', e);
    }
  }, [isScrollLocked]);

  // Try playing video (unmuted first, then muted fallback)
  const tryPlay = async () => {
    if (!videoRef.current) return;
    try {
      videoRef.current.muted = false;
      await videoRef.current.play();
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      if (videoRef.current) {
        videoRef.current.muted = true;
        try {
          await videoRef.current.play();
        } catch (e: any) {
          if (e?.name !== 'AbortError') {
            console.warn('Muted play rejected:', e);
          }
        }
      }
    }
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    if (envelopeIndex < ENVELOPE_URLS.length - 1) {
      setEnvelopeIndex((prev) => prev + 1);
    }
  };

  const handleCanPlay = () => {
    updateVideoRect();
    if (openedRef.current && videoRef.current && videoRef.current.paused) {
      tryPlay();
    }
  };

  // Envelope tap handler: wait for first video frame before splitting
  const handleOpenEnvelope = () => {
    try {
      if (openedRef.current) return;
      openedRef.current = true;

      const video = videoRef.current;
      if (video) {
        if (video.readyState === 0) {
          try {
            video.load();
          } catch (e) {
            console.warn('Video load error:', e);
          }
        }
        try {
          video.currentTime = 0;
        } catch (e) {
          console.warn('Set currentTime error:', e);
        }
        tryPlay();

        // 500ms safety check
        setTimeout(() => {
          try {
            if (videoRef.current && videoRef.current.paused) {
              videoRef.current.muted = true;
              videoRef.current.play().catch((err) => console.error('Safety play error:', err));
            }
          } catch (e) {
            console.warn('Safety check warning:', e);
          }
        }, 500);
      }

      let started = false;
      const startSplitAnimation = () => {
        if (started) return;
        started = true;
        setIsOpen(true);
        setTimeout(() => {
          setEnvelopeHidden(true);
          try {
            window.dispatchEvent(new CustomEvent('opening:complete'));
          } catch (e) {
            console.warn('opening:complete dispatch warning:', e);
          }
        }, 3000); // Exactly 2.8s split animation + 200ms
      };

      // Check for first frame decoding
      if (video) {
        try {
          if ('requestVideoFrameCallback' in HTMLVideoElement.prototype && typeof (video as any).requestVideoFrameCallback === 'function') {
            (video as any).requestVideoFrameCallback(() => {
              startSplitAnimation();
            });
          } else {
            const onPlaying = () => {
              if (video.currentTime > 0) {
                video.removeEventListener('playing', onPlaying);
                video.removeEventListener('timeupdate', onPlaying);
                startSplitAnimation();
              }
            };
            video.addEventListener('playing', onPlaying);
            video.addEventListener('timeupdate', onPlaying);
          }
        } catch (e) {
          console.warn('Video frame callback error:', e);
          startSplitAnimation();
        }
      } else {
        startSplitAnimation();
      }

      // Maximum 2500ms safety timeout: start animation anyway
      setTimeout(() => {
        startSplitAnimation();
      }, 2500);
    } catch (err) {
      console.error('Error in handleOpenEnvelope:', err);
      setIsOpen(true);
      setTimeout(() => {
        setEnvelopeHidden(true);
      }, 3000);
    }
  };

  // Handle video end: wait for document.fonts.ready (max 1500 ms), show wall text, then unlock scroll & auto-scroll
  const handleVideoEnded = () => {
    setVideoEnded(true);

    const startWallTextAnimation = () => {
      setWallTextReady(true);
    };

    if ('fonts' in document && document.fonts.ready) {
      let resolved = false;
      const timeoutId = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          startWallTextAnimation();
        }
      }, 1500);

      document.fonts.ready
        .then(() => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeoutId);
            startWallTextAnimation();
          }
        })
        .catch(() => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeoutId);
            startWallTextAnimation();
          }
        });
    } else {
      startWallTextAnimation();
    }
  };

  // Auto-scroll after last line appears:
  // Last line (Line 9) starts at 2.8s and has 1.2s duration -> finishes at 4.0s.
  // Wait 3.5s after that (total 7.5s = 7500ms) to unlock scroll and auto-scroll down.
  useEffect(() => {
    if (!wallTextReady) return;

    const scrollTimer = setTimeout(() => {
      setIsScrollLocked(false);
      setTimeout(() => {
        try {
          invitationRef.current?.scrollIntoView({ behavior: 'smooth' });
        } catch (e) {
          console.warn('Auto-scroll warning:', e);
        }
      }, 100);
    }, 7500);

    return () => clearTimeout(scrollTimer);
  }, [wallTextReady]);

  // Handle RSVP Submit
  const handleRsvpSubmit = () => {
    if (!rsvpName.trim()) {
      setRsvpError('Please enter your name');
      return;
    }
    setRsvpError('');

    const attendStatus = rsvpAttending === 'accept' ? 'attend' : 'not be able to attend';
    const textMsg = `Namaste! This is ${rsvpName.trim()}. I will ${attendStatus} the wedding of ${INVITE.groom.first} & ${INVITE.bride.first}. Guests: ${rsvpGuests}.${rsvpMessage.trim() ? ` ${rsvpMessage.trim()}` : ''}`;

    const url = `https://wa.me/${INVITE.rsvp.whatsapp}?text=${encodeURIComponent(textMsg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setRsvpSubmitted(true);
  };

  // Measured width for names fit rule on wall text
  const blockWidthPx = videoRect.width > 0 ? videoRect.width * 0.74 : 300;
  const groomFontSizeCqw = getFittingNameFontSize(INVITE.groom.first, blockWidthPx);
  const brideFontSizeCqw = getFittingNameFontSize(INVITE.bride.first, blockWidthPx);
  const formattedDate = formatAnyDate(INVITE.date);

  return (
    <div className="min-h-screen bg-[#0A1F1F] text-[#F3E6C8] select-none cursor-none [webkit-tap-highlight-color:transparent] font-sans relative overflow-x-clip">
      
      {/* PWA INSTALL BUTTON */}
      <PWAInstallButton />

      {/* PETAL LAYER (Only active after scroll is unlocked) */}
      <PetalLayer isUnlocked={!isScrollLocked} />

      {/* SCROLL PROGRESS LINE (Right edge) */}
      <ScrollProgressLine isUnlocked={!isScrollLocked} />

      {/* SECTION 1: VIDEO SCREEN & WALL TEXT OVERLAY */}
      <section className="relative w-screen h-[100dvh] overflow-hidden bg-black flex items-center justify-center">
        
        {/* Layer 0: 9:16 Video Container */}
        <div
          id="video-container"
          style={{
            width: 'min(100vw, calc(100dvh * 9 / 16))',
            height: 'min(100dvh, calc(100vw * 16 / 9))',
            margin: '0 auto',
            position: 'relative',
            backgroundColor: '#000',
            overflow: 'hidden',
          }}
          className="relative flex items-center justify-center bg-black overflow-hidden z-0"
        >
          <video
            ref={videoRef}
            src="/video.mp4"
            playsInline
            preload="auto"
            disablePictureInPicture
            disableRemotePlayback
            controlsList="nodownload nofullscreen noremoteplayback"
            onLoadedMetadata={updateVideoRect}
            onCanPlay={handleCanPlay}
            onEnded={handleVideoEnded}
            style={{ pointerEvents: 'none', width: '100%', height: '100%', objectFit: 'cover' }}
            className="w-full h-full object-cover bg-black pointer-events-none"
          >
            Your browser does not support HTML5 video.
          </video>
        </div>

        {/* Layer 10: Wall Text Overlay (Appears on video end on the empty wall area) */}
        {videoEnded && videoRect.width > 0 && wallTextReady && (
          <div
            style={{
              position: 'absolute',
              top: `${videoRect.top}px`,
              left: `${videoRect.left}px`,
              width: `${videoRect.width}px`,
              height: `${videoRect.height}px`,
              pointerEvents: 'none',
              zIndex: 10,
              containerType: 'inline-size',
            }}
          >
            {/* Centered Text Box on the wall area */}
            <div
              style={{
                position: 'absolute',
                top: '45%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '74%',
                maxWidth: '74%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
              }}
            >
              {/* Line 1: "॥ श्री गणेशाय नमः ॥" */}
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 0.0, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  fontFamily: "'Tiro Devanagari Hindi', serif",
                  fontSize: '3.6cqw',
                  color: '#8A1C1C',
                  letterSpacing: '0.08em',
                  textShadow: WALL_TEXT_SHADOW,
                  whiteSpace: 'nowrap',
                  lineHeight: '1.2',
                }}
              >
                ॥ श्री गणेशाय नमः ॥
              </motion.p>

              {/* Line 2: "शुभ विवाह" */}
              <motion.h2
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  fontFamily: "'Yatra One', cursive",
                  fontSize: '9cqw',
                  background: 'linear-gradient(to bottom, #A3241F, #6E1423)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 1px 0 rgba(255,248,225,0.9)) drop-shadow(0 3px 8px rgba(94,18,36,0.18))',
                  whiteSpace: 'nowrap',
                  lineHeight: '1.1',
                  marginTop: '0.1cqw',
                  marginBottom: '0.1cqw',
                }}
              >
                शुभ विवाह
              </motion.h2>

              {/* Line 3: Groom First Name */}
              <motion.h1
                initial={{ clipPath: 'inset(-15% 100% -15% -5%)', opacity: 1 }}
                animate={{ clipPath: 'inset(-15% -5% -15% -5%)', opacity: 1 }}
                transition={{ duration: 2.0, delay: 0.70, ease: 'easeInOut' }}
                style={{
                  fontFamily: "'Great Vibes', cursive",
                  fontSize: `${groomFontSizeCqw}cqw`,
                  lineHeight: '0.95',
                  color: '#5E1224',
                  textShadow: WALL_TEXT_SHADOW,
                  whiteSpace: 'nowrap',
                }}
              >
                {INVITE.groom.first}
              </motion.h1>

              {/* Line 4: "&" */}
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 1.05, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  fontFamily: "'Great Vibes', cursive",
                  fontSize: '7cqw',
                  lineHeight: '0.95',
                  color: '#B8862B',
                  textShadow: WALL_TEXT_SHADOW,
                  whiteSpace: 'nowrap',
                }}
              >
                &
              </motion.p>

              {/* Line 5: Bride First Name */}
              <motion.h1
                initial={{ clipPath: 'inset(-15% 100% -15% -5%)', opacity: 1 }}
                animate={{ clipPath: 'inset(-15% -5% -15% -5%)', opacity: 1 }}
                transition={{ duration: 2.0, delay: 1.40, ease: 'easeInOut' }}
                style={{
                  fontFamily: "'Great Vibes', cursive",
                  fontSize: `${brideFontSizeCqw}cqw`,
                  lineHeight: '0.95',
                  color: '#5E1224',
                  textShadow: WALL_TEXT_SHADOW,
                  whiteSpace: 'nowrap',
                }}
              >
                {INVITE.bride.first}
              </motion.h1>

              {/* Line 6: Divider (Gold Hairlines + 7px Rotated Diamond) */}
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.8, delay: 1.75, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  marginTop: '0.5cqw',
                  marginBottom: '0.5cqw',
                  transformOrigin: 'center center',
                }}
              >
                <div
                  style={{
                    width: '34%',
                    height: '1px',
                    background: 'linear-gradient(to right, transparent, #B8862B)',
                  }}
                />
                <div
                  style={{
                    width: '7px',
                    height: '7px',
                    backgroundColor: '#B8862B',
                    transform: 'rotate(45deg)',
                    marginLeft: '0.6cqw',
                    marginRight: '0.6cqw',
                    boxShadow: WALL_TEXT_SHADOW,
                  }}
                />
                <div
                  style={{
                    width: '34%',
                    height: '1px',
                    background: 'linear-gradient(to left, transparent, #B8862B)',
                  }}
                />
              </motion.div>

              {/* Line 7: "आप सपरिवार सादर आमंत्रित हैं" */}
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 2.10, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  fontFamily: "'Tiro Devanagari Hindi', serif",
                  fontSize: '3.6cqw',
                  color: '#5A3A1E',
                  textShadow: WALL_TEXT_SHADOW,
                  whiteSpace: 'nowrap',
                  lineHeight: '1.2',
                }}
              >
                आप सपरिवार सादर आमंत्रित हैं
              </motion.p>

              {/* Line 8: Weekday and Date e.g. "MONDAY · 14 DECEMBER 2026" */}
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 2.45, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontWeight: 600,
                  fontSize: '3.8cqw',
                  letterSpacing: '0.22em',
                  color: '#3B2414',
                  textShadow: WALL_TEXT_SHADOW,
                  whiteSpace: 'nowrap',
                  lineHeight: '1.2',
                  marginTop: '0.2cqw',
                }}
              >
                {formattedDate}
              </motion.p>

              {/* Line 9: City and State e.g. "Jaipur, Rajasthan" */}
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 2.80, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontStyle: 'italic',
                  fontWeight: 600,
                  fontSize: '4.6cqw',
                  color: '#6E1423',
                  textShadow: WALL_TEXT_SHADOW,
                  whiteSpace: 'nowrap',
                  lineHeight: '1.2',
                  marginTop: '0.1cqw',
                }}
              >
                {INVITE.city}
              </motion.p>

            </div>
          </div>
        )}

        {/* Layer 50: Full-Screen Envelope Overlay (Fully Transparent Container) */}
        {!envelopeHidden && (
          <div
            onClick={handleOpenEnvelope}
            className={`fixed inset-0 w-[100vw] h-[100dvh] bg-transparent overflow-hidden select-none cursor-none [webkit-tap-highlight-color:transparent] z-50 ${
              isOpen ? 'pointer-events-none' : 'pointer-events-auto'
            }`}
          >
            {/* Left Half Panel */}
            <motion.div
              initial={{ x: '0%' }}
              animate={isOpen ? { x: '-100%' } : { x: '0%' }}
              transition={{
                duration: 2.8,
                ease: [0.65, 0, 0.35, 1],
              }}
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                width: '50vw',
                overflow: 'hidden',
                backgroundColor: '#000',
              }}
            >
              <img
                src={currentEnvelopeUrl}
                alt="Wedding Envelope Left"
                loading="eager"
                fetchPriority="high"
                referrerPolicy="no-referrer"
                onLoad={handleImageLoad}
                onError={handleImageError}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100vw',
                  height: '100dvh',
                }}
                className="portrait:object-cover landscape:object-contain pointer-events-none max-w-none max-h-none"
              />
            </motion.div>

            {/* Right Half Panel */}
            <motion.div
              initial={{ x: '0%' }}
              animate={isOpen ? { x: '100%' } : { x: '0%' }}
              transition={{
                duration: 2.8,
                ease: [0.65, 0, 0.35, 1],
              }}
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: '50vw',
                width: '50vw',
                overflow: 'hidden',
                backgroundColor: '#000',
              }}
            >
              <img
                src={currentEnvelopeUrl}
                alt="Wedding Envelope Right"
                loading="eager"
                fetchPriority="high"
                referrerPolicy="no-referrer"
                onLoad={handleImageLoad}
                onError={handleImageError}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '-50vw',
                  width: '100vw',
                  height: '100dvh',
                }}
                className="portrait:object-cover landscape:object-contain pointer-events-none max-w-none max-h-none"
              />
            </motion.div>
          </div>
        )}

      </section>

      {/* GARLAND DIVIDER 1 */}
      <GarlandDivider />

      {/* SECTION A - INVITATION */}
      <section
        ref={invitationRef}
        id="invitation-card"
        style={{ contain: 'paint', paddingTop: 'min(46vw, 340px)', paddingBottom: 'min(46vw, 340px)' }}
        className="relative w-full min-h-[100svh] bg-[var(--ivory)] text-[var(--ink)] flex flex-col items-center justify-center px-[6vw] overflow-hidden"
      >
        {/* Double Gold Frame */}
        <div className="absolute inset-[16px] border border-[var(--gold)] pointer-events-none z-0">
          <div className="absolute inset-[14px] border border-[var(--gold)]">
            <div className="absolute -top-[5px] -left-[5px] w-[9px] h-[9px] bg-[var(--gold)] rotate-45" />
            <div className="absolute -top-[5px] -right-[5px] w-[9px] h-[9px] bg-[var(--gold)] rotate-45" />
            <div className="absolute -bottom-[5px] -left-[5px] w-[9px] h-[9px] bg-[var(--gold)] rotate-45" />
            <div className="absolute -bottom-[5px] -right-[5px] w-[9px] h-[9px] bg-[var(--gold)] rotate-45" />
          </div>
        </div>

        {/* 4 Corners (Absolute) */}
        <Decor name="asset-corner" size="min(44vw, 320px)" style={{ position: 'absolute', top: 0, left: 0, zIndex: 10 }} />
        <Decor name="asset-corner" size="min(44vw, 320px)" flipX={true} style={{ position: 'absolute', top: 0, right: 0, zIndex: 10 }} />
        <Decor name="asset-corner" size="min(44vw, 320px)" flipY={true} style={{ position: 'absolute', bottom: 0, left: 0, zIndex: 10 }} />
        <Decor name="asset-corner" size="min(44vw, 320px)" flipX={true} flipY={true} style={{ position: 'absolute', bottom: 0, right: 0, zIndex: 10 }} />

        {/* Content Container */}
        <div className="relative z-10 w-full max-w-[960px] text-center flex flex-col items-center justify-center gap-4 sm:gap-5 my-auto">
          {/* Kalash alone as first element */}
          <DecorBand>
            <Decor name="asset-kalash" size="min(40vw, 240px)" />
          </DecorBand>

          <p
            style={{ fontFamily: "'Tiro Devanagari Hindi', serif", color: 'var(--crimson)', fontSize: '20px' }}
            className="font-semibold tracking-wide"
          >
            ॥ श्री गणेशाय नमः ॥
          </p>

          <p
            style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--ink)', fontSize: '24px', lineHeight: 1.4 }}
            className="font-medium"
          >
            {INVITE.groom.parents}
          </p>

          <span
            style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--gold)', fontSize: '20px' }}
            className="italic font-normal"
          >
            and
          </span>

          <p
            style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--ink)', fontSize: '24px', lineHeight: 1.4 }}
            className="font-medium"
          >
            {INVITE.bride.parents}
          </p>

          <p
            style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--ink)', fontSize: '20px', lineHeight: 1.6 }}
            className="italic my-1"
          >
            request the honour of your presence at the wedding of their children
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 my-2">
            <span
              style={{
                fontFamily: "'Great Vibes', cursive",
                color: 'var(--maroon)',
                fontSize: 'clamp(64px, 18vw, 140px)',
                lineHeight: 0.9,
              }}
            >
              {INVITE.groom.first}
            </span>
            <span
              style={{
                fontFamily: "'Great Vibes', cursive",
                color: 'var(--gold)',
                fontSize: 'clamp(44px, 12vw, 90px)',
                lineHeight: 0.9,
              }}
            >
              &
            </span>
            <span
              style={{
                fontFamily: "'Great Vibes', cursive",
                color: 'var(--maroon)',
                fontSize: 'clamp(64px, 18vw, 140px)',
                lineHeight: 0.9,
              }}
            >
              {INVITE.bride.first}
            </span>
          </div>

          <DiamondDivider color="var(--gold)" />

          <p
            style={{ fontFamily: "'Tiro Devanagari Hindi', serif", color: 'var(--crimson)', fontSize: '18px' }}
            className="font-medium tracking-wide"
          >
            आपके आगमन की हम सब प्रतीक्षा करेंगे
          </p>
        </div>
      </section>

      {/* GARLAND DIVIDER 2 */}
      <GarlandDivider />

      {/* PART 1: ARCH-COUPLE BLOCK */}
      <ArchImageBlock idKey="arch-couple" title="The Couple" />

      {/* SECTION B - THE COUPLE */}
      <section
        ref={coupleRef}
        style={{
          background:
            'radial-gradient(circle at top left, rgba(232, 137, 28, 0.15), transparent 45%), radial-gradient(circle at bottom right, rgba(232, 137, 28, 0.15), transparent 45%), var(--cream)',
          contain: 'paint',
        }}
        className="relative w-full min-h-[100svh] text-[var(--ink)] flex flex-col items-center justify-center px-[6vw] py-[12vh] overflow-hidden"
      >
        <div className="w-full max-w-[960px] text-center flex flex-col items-center justify-center gap-8 my-auto relative z-10">

          <div className="w-full flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8">
            {/* Groom Card (Slides from Left) */}
            <motion.div
              style={{ x: cplGroomX }}
              className="flex-1 w-full bg-[var(--ivory)] border border-[var(--gold)] rounded-[20px] p-[36px] text-center flex flex-col items-center justify-center gap-4 shadow-md will-change-transform"
            >
              <DecorBand>
                <Decor name="asset-garland" size="min(100%, 900px)" />
              </DecorBand>

              <div className="w-[96px] h-[96px] rounded-full border-2 border-[var(--gold)] flex items-center justify-center bg-white/40">
                <span
                  style={{ fontFamily: "'Great Vibes', cursive", color: 'var(--maroon)', fontSize: '48px', lineHeight: 1 }}
                >
                  {INVITE.groom.first.charAt(0)}
                </span>
              </div>

              <span
                style={{ fontFamily: "'Cinzel', serif", color: 'var(--gold)', letterSpacing: '0.3em', fontSize: '13px' }}
                className="uppercase font-semibold"
              >
                THE GROOM
              </span>

              <h3
                style={{ fontFamily: "'Great Vibes', cursive", color: 'var(--maroon)', fontSize: '44px', lineHeight: 1 }}
              >
                {INVITE.groom.full}
              </h3>

              <p
                style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--ink)', fontSize: '18px', lineHeight: 1.6 }}
              >
                {INVITE.groom.about}
              </p>

              <div className="w-full h-[1px] bg-[var(--gold)]/30 my-1" />

              <p
                style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--ink)', fontSize: '18px' }}
                className="italic font-medium"
              >
                Son of {INVITE.groom.parents}
              </p>
            </motion.div>

            {/* Ampersand between cards */}
            <div className="flex flex-col items-center justify-center">
              <span
                style={{
                  fontFamily: "'Great Vibes', cursive",
                  color: 'var(--gold)',
                  fontSize: 'clamp(36px, 6vw, 54px)',
                }}
              >
                &
              </span>
            </div>

            {/* Bride Card (Slides from Right) */}
            <motion.div
              style={{ x: cplBrideX }}
              className="flex-1 w-full bg-[var(--ivory)] border border-[var(--gold)] rounded-[20px] p-[36px] text-center flex flex-col items-center justify-center gap-4 shadow-md will-change-transform"
            >
              <DecorBand>
                <Decor name="asset-garland" size="min(100%, 900px)" />
              </DecorBand>

              <div className="w-[96px] h-[96px] rounded-full border-2 border-[var(--gold)] flex items-center justify-center bg-white/40">
                <span
                  style={{ fontFamily: "'Great Vibes', cursive", color: 'var(--maroon)', fontSize: '48px', lineHeight: 1 }}
                >
                  {INVITE.bride.first.charAt(0)}
                </span>
              </div>

              <span
                style={{ fontFamily: "'Cinzel', serif", color: 'var(--gold)', letterSpacing: '0.3em', fontSize: '13px' }}
                className="uppercase font-semibold"
              >
                THE BRIDE
              </span>

              <h3
                style={{ fontFamily: "'Great Vibes', cursive", color: 'var(--maroon)', fontSize: '44px', lineHeight: 1 }}
              >
                {INVITE.bride.full}
              </h3>

              <p
                style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--ink)', fontSize: '18px', lineHeight: 1.6 }}
              >
                {INVITE.bride.about}
              </p>

              <div className="w-full h-[1px] bg-[var(--gold)]/30 my-1" />

              <p
                style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--ink)', fontSize: '18px' }}
                className="italic font-medium"
              >
                Daughter of {INVITE.bride.parents}
              </p>
            </motion.div>
          </div>

        </div>
      </section>

      {/* SECTION C - FIVE EVENT SECTIONS */}
      {INVITE.events.map((event, index) => (
        <EventSection key={event.key} event={event} index={index} />
      ))}

      {/* GARLAND DIVIDER BEFORE COUNTDOWN */}
      <GarlandDivider />

      {/* SECTION 1 - COUNTDOWN */}
      <section
        ref={countdownRef}
        className="relative w-full min-h-[100svh] flex flex-col items-center justify-center px-[6vw] py-[12vh] text-[var(--cream)] overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #5E1224, #3A0B16)', contain: 'paint' }}
      >
        {/* Double Gold Frame Inset 16px */}
        <div className="absolute inset-[16px] border border-[var(--gold)] pointer-events-none z-0">
          <div className="absolute inset-[10px] border border-[var(--gold)] opacity-70" />
        </div>

        <div className="relative z-10 w-full max-w-[960px] text-center flex flex-col items-center justify-center gap-8 my-auto">
          {/* Top Band: Chandelier */}
          <DecorBand>
            <Decor name="asset-chandelier" size="min(56vw, 360px)" />
          </DecorBand>

          <div className="flex flex-col items-center justify-center">
            <motion.h2
              style={{
                fontFamily: "'Great Vibes', cursive",
                color: 'var(--cream)',
                fontSize: 'clamp(48px, 12vw, 96px)',
                lineHeight: 1.0,
                scale: cntTitleScale,
                opacity: cntTitleOpacity,
              }}
              className="will-change-transform"
            >
              Counting Down to Our Forever
            </motion.h2>
          </div>

          {/* 4 Countdown Boxes */}
          <motion.div
            style={{ y: cntBoxY, rotateX: cntBoxRotX }}
            className="grid grid-cols-2 min-[480px]:grid-cols-4 gap-4 sm:gap-6 w-full max-w-[800px] will-change-transform"
          >
            {/* Days */}
            <div className="bg-[var(--cream)] border border-[var(--gold)] rounded-[16px] p-5 sm:p-6 text-center flex flex-col items-center justify-center shadow-lg">
              <span
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontWeight: 700,
                  fontSize: 'clamp(36px, 9vw, 72px)',
                  color: 'var(--maroon)',
                  lineHeight: 1.1,
                }}
              >
                {String(countdown.days).padStart(2, '0')}
              </span>
              <span
                style={{
                  fontFamily: "'Cinzel', serif",
                  color: 'var(--gold)',
                  letterSpacing: '0.2em',
                  fontSize: '13px',
                }}
                className="uppercase font-semibold mt-2"
              >
                DAYS
              </span>
            </div>

            {/* Hours */}
            <div className="bg-[var(--cream)] border border-[var(--gold)] rounded-[16px] p-5 sm:p-6 text-center flex flex-col items-center justify-center shadow-lg">
              <span
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontWeight: 700,
                  fontSize: 'clamp(36px, 9vw, 72px)',
                  color: 'var(--maroon)',
                  lineHeight: 1.1,
                }}
              >
                {String(countdown.hours).padStart(2, '0')}
              </span>
              <span
                style={{
                  fontFamily: "'Cinzel', serif",
                  color: 'var(--gold)',
                  letterSpacing: '0.2em',
                  fontSize: '13px',
                }}
                className="uppercase font-semibold mt-2"
              >
                HOURS
              </span>
            </div>

            {/* Minutes */}
            <div className="bg-[var(--cream)] border border-[var(--gold)] rounded-[16px] p-5 sm:p-6 text-center flex flex-col items-center justify-center shadow-lg">
              <span
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontWeight: 700,
                  fontSize: 'clamp(36px, 9vw, 72px)',
                  color: 'var(--maroon)',
                  lineHeight: 1.1,
                }}
              >
                {String(countdown.minutes).padStart(2, '0')}
              </span>
              <span
                style={{
                  fontFamily: "'Cinzel', serif",
                  color: 'var(--gold)',
                  letterSpacing: '0.2em',
                  fontSize: '13px',
                }}
                className="uppercase font-semibold mt-2"
              >
                MINUTES
              </span>
            </div>

            {/* Seconds */}
            <div className="bg-[var(--cream)] border border-[var(--gold)] rounded-[16px] p-5 sm:p-6 text-center flex flex-col items-center justify-center shadow-lg">
              <span
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontWeight: 700,
                  fontSize: 'clamp(36px, 9vw, 72px)',
                  color: 'var(--maroon)',
                  lineHeight: 1.1,
                }}
              >
                {String(countdown.seconds).padStart(2, '0')}
              </span>
              <span
                style={{
                  fontFamily: "'Cinzel', serif",
                  color: 'var(--gold)',
                  letterSpacing: '0.2em',
                  fontSize: '13px',
                }}
                className="uppercase font-semibold mt-2"
              >
                SECONDS
              </span>
            </div>
          </motion.div>

          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: 'var(--cream)',
              fontSize: '22px',
            }}
            className="italic font-normal my-2"
          >
            until we say I do
          </p>

          {/* Bottom Band: 3 Diyas */}
          <DecorBand>
            <Decor name="asset-diya" size="min(24vw, 150px)" />
            <Decor name="asset-diya" size="min(24vw, 150px)" />
            <Decor name="asset-diya" size="min(24vw, 150px)" />
          </DecorBand>
        </div>
      </section>

      {/* GARLAND DIVIDER BEFORE VENUE */}
      <GarlandDivider />

      {/* PART 1: ARCH-VENUE BLOCK */}
      <ArchImageBlock idKey="arch-venue" title="The Venue" />

      {/* SECTION 2 - VENUE DETAILS */}
      <section
        ref={venueRef}
        style={{ contain: 'paint' }}
        className="relative w-full min-h-[100svh] bg-[var(--ivory)] text-[var(--ink)] flex flex-col items-center justify-center px-[6vw] py-[12vh] overflow-hidden"
      >
        <div className="w-full max-w-[960px] text-center flex flex-col items-center justify-center gap-8 my-auto relative z-10">
          {/* Garland Band directly after arch-venue block and before details */}
          <DecorBand>
            <Decor name="asset-garland" size="min(100%, 900px)" />
          </DecorBand>

          {/* Tall Arch Mehrab */}
          <motion.div
            style={{
              width: 'min(88vw, 520px)',
              borderRadius: '999px 999px 24px 24px',
              border: '2px solid var(--gold)',
              backgroundColor: 'var(--cream)',
              padding: '8px',
              scale: venArchScale,
              y: venArchY,
              opacity: venArchOpacity,
            }}
            className="relative shadow-xl overflow-hidden will-change-transform"
          >
            {/* Inner Gold Border & Content */}
            <motion.div
              style={{
                borderRadius: '991px 991px 18px 18px',
                border: '1px solid var(--gold)',
                padding: '72px 32px 48px',
                y: venArchInnerDrift,
              }}
              className="flex flex-col items-center justify-center text-center gap-4 will-change-transform"
            >
              <span
                style={{
                  fontFamily: "'Cinzel', serif",
                  color: 'var(--gold)',
                  letterSpacing: '0.3em',
                  fontSize: '13px',
                }}
                className="font-bold uppercase"
              >
                WEDDING VENUE
              </span>

              <motion.h3
                style={{
                  fontFamily: "'Great Vibes', cursive",
                  color: 'var(--maroon)',
                  fontSize: '48px',
                  lineHeight: 1.0,
                  x: venTextX,
                }}
                className="will-change-transform"
              >
                {INVITE.venue.name}
              </motion.h3>

              <p
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  color: 'var(--ink)',
                  fontSize: '22px',
                  lineHeight: 1.4,
                }}
              >
                {INVITE.venue.address}
              </p>

              <DiamondDivider color="var(--gold)" />

              {/* Airport & Station rows */}
              <div className="w-full flex flex-col gap-3 my-1 text-center">
                <div>
                  <p
                    style={{
                      fontFamily: "'Cinzel', serif",
                      color: 'var(--gold)',
                      letterSpacing: '0.2em',
                      fontSize: '12px',
                    }}
                    className="font-bold uppercase"
                  >
                    NEAREST AIRPORT
                  </p>
                  <p
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      color: 'var(--ink)',
                      fontSize: '20px',
                    }}
                  >
                    {INVITE.venue.airport}
                  </p>
                </div>

                <div>
                  <p
                    style={{
                      fontFamily: "'Cinzel', serif",
                      color: 'var(--gold)',
                      letterSpacing: '0.2em',
                      fontSize: '12px',
                    }}
                    className="font-bold uppercase"
                  >
                    NEAREST RAILWAY STATION
                  </p>
                  <p
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      color: 'var(--ink)',
                      fontSize: '20px',
                    }}
                  >
                    {INVITE.venue.station}
                  </p>
                </div>
              </div>

              {/* Google Maps text link */}
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${INVITE.venue.name}, ${INVITE.venue.address}`
                )}`}
                target="_blank"
                rel="noopener"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  color: 'var(--crimson)',
                  fontSize: '18px',
                }}
                className="mt-3 font-semibold underline hover:opacity-80 transition"
              >
                View on Google Maps
              </a>
            </motion.div>
          </motion.div>

          {/* Kalash Band at bottom of venue details */}
          <DecorBand>
            <Decor name="asset-kalash" size="min(40vw, 240px)" />
          </DecorBand>
        </div>
      </section>

      {/* GARLAND DIVIDER BEFORE RSVP */}
      <GarlandDivider />

      {/* SECTION 3 - RSVP */}
      <section
        ref={rsvpRef}
        style={{ background: 'linear-gradient(160deg, #0F4A4A, #082F2F)', contain: 'paint' }}
        className="relative w-full min-h-[100svh] flex flex-col items-center justify-center px-[6vw] py-[12vh] text-[var(--cream)] overflow-hidden"
      >
        {/* RSVP Top Garland Band */}
        <DecorBand style={{ marginTop: 0 }}>
          <Decor name="asset-garland" size="min(100%, 900px)" />
        </DecorBand>

        <div className="w-full max-w-[960px] text-center flex flex-col items-center justify-center gap-6 my-auto relative z-10">
          <div className="flex flex-col items-center gap-1">
            <h2
              style={{
                fontFamily: "'Great Vibes', cursive",
                color: 'var(--cream)',
                fontSize: 'clamp(48px, 10vw, 80px)',
                lineHeight: 1.0,
              }}
            >
              Will You Join Us?
            </h2>
            <p
              style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--cream)', fontSize: '20px' }}
              className="italic opacity-90 mt-1"
            >
              {getRsvpDeadlineHelper(INVITE.rsvp.deadline)}
            </p>
          </div>

          {/* Advanced RSVP 4-Step Form Card */}
          <AdvancedRsvpForm cardScale={rsvpCardScale} cardY={rsvpCardY} />

          {/* Contact Line under card */}
          <p
            style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--cream)', fontSize: '18px' }}
            className="text-center opacity-90 mt-2"
          >
            For any help: {INVITE.contacts[0].name} ({INVITE.contacts[0].phone}) · {INVITE.contacts[1].name} ({INVITE.contacts[1].phone})
          </p>

          {/* RSVP Bottom Band under contact line */}
          <DecorBand>
            <Decor name="asset-diya" size="min(24vw, 150px)" />
            <Decor name="asset-kalash" size="min(40vw, 240px)" />
            <Decor name="asset-diya" size="min(24vw, 150px)" flipX={true} />
          </DecorBand>
        </div>
      </section>

      {/* GARLAND DIVIDER BEFORE FOOTER */}
      <GarlandDivider />

      {/* SECTION 4 - FOOTER */}
      <section
        ref={footerRef}
        style={{ contain: 'paint' }}
        className="relative w-full bg-[#2A0810] text-[var(--cream)] py-16 px-[6vw] flex flex-col items-center justify-center overflow-hidden"
      >
        {/* Footer Top Garland Band */}
        <DecorBand style={{ marginTop: 0 }}>
          <Decor name="asset-garland" size="min(100%, 900px)" />
        </DecorBand>

        <div className="w-full max-w-[960px] text-center flex flex-col items-center justify-center gap-5 my-auto relative z-10">
          <motion.h2
            style={{
              fontFamily: "'Great Vibes', cursive",
              color: 'var(--cream)',
              fontSize: 'clamp(56px, 14vw, 110px)',
              lineHeight: 1.0,
              scale: ftrNamesScale,
            }}
            className="will-change-transform"
          >
            {INVITE.groom.first} <span style={{ color: 'var(--gold)' }}>&</span> {INVITE.bride.first}
          </motion.h2>

          <p
            style={{
              fontFamily: "'Cinzel', serif",
              color: 'var(--gold)',
              letterSpacing: '0.3em',
              fontSize: '16px',
            }}
            className="font-bold uppercase"
          >
            {INVITE.hashtag}
          </p>

          {/* Footer Center Kalash Band */}
          <DecorBand>
            <Decor name="asset-kalash" size="min(40vw, 240px)" />
          </DecorBand>

          <DiamondDivider color="var(--gold)" />

          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: 'var(--cream)',
              fontSize: '22px',
            }}
            className="italic font-normal"
          >
            With love and blessings from {INVITE.families}
          </p>

          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: 'var(--cream)',
              fontSize: '16px',
            }}
            className="italic font-normal opacity-80"
          >
            With best compliments: {INVITE.compliments}
          </p>

          {/* Footer Bottom Band */}
          <DecorBand>
            <Decor name="asset-diya" size="min(24vw, 150px)" />
            <Decor name="asset-kalash" size="min(40vw, 240px)" />
            <Decor name="asset-diya" size="min(24vw, 150px)" flipX={true} />
          </DecorBand>
        </div>

        {/* Garland Divider Strip at the very bottom */}
        <div className="w-full mt-12">
          <GarlandDivider />
        </div>
      </section>

    </div>
  );
}
