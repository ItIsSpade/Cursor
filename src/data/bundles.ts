export type Category = 'Minimalist' | 'Gaming' | 'Creator' | 'Ergonomic';

export interface BundleItem {
  name: string;
  description: string;
}

export interface Bundle {
  id: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  category: Category;
  items: BundleItem[];
  imageUrl: string;
  featured: boolean;
}

export const bundles: Bundle[] = [
  {
    id: "bundle-01",
    name: "The Void",
    tagline: "Absolute focus. Zero distractions.",
    description: "An all-black, stealthy setup designed for deep work. Featuring silent tactile switches and a matte finish across all surfaces to eliminate glare and distractions.",
    price: 349,
    category: "Minimalist",
    items: [
      { name: "Void 65% Wireless Keyboard", description: "Matte black, silent linear switches, PBT keycaps." },
      { name: "Obsidian Mouse", description: "Ultra-lightweight, ambidextrous, 26K DPI sensor." },
      { name: "Eclipse Deskmat", description: "900x400mm, micro-woven cloth, anti-fray stitched edges." }
    ],
    imageUrl: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&q=80&w=1000",
    featured: true
  },
  {
    id: "bundle-02",
    name: "Neon Nights",
    tagline: "Synthwave aesthetic for late-night sessions.",
    description: "Vibrant RGB, translucent materials, and a retro-futuristic colorway. Perfect for gamers who want their desk to pop in the dark.",
    price: 429,
    category: "Gaming",
    items: [
      { name: "Cyber 75% Mechanical Keyboard", description: "Translucent case, hot-swappable, per-key RGB." },
      { name: "Laser Gaming Mouse", description: "Ergonomic shape, 11 programmable buttons." },
      { name: "Gridline RGB Deskmat", description: "Integrated edge lighting, water-resistant surface." },
      { name: "Neon Headset Stand", description: "Weighted base, dual USB hub." }
    ],
    imageUrl: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=1000",
    featured: true
  },
  {
    id: "bundle-03",
    name: "Aura Studio",
    tagline: "Tools for the modern creator.",
    description: "A clean, white and silver aesthetic featuring macro controls, high-fidelity audio, and an ultra-smooth tracking surface for precise design work.",
    price: 599,
    category: "Creator",
    items: [
      { name: "Aura Low-Profile Keyboard", description: "Aluminium frame, tactile low-profile switches." },
      { name: "Precision Master Mouse", description: "Horizontal scroll wheel, multi-device connectivity." },
      { name: "Cloud Deskmat", description: "Vegan leather surface, slip-resistant cork base." },
      { name: "Studio Dial", description: "Customizable macro dial for timeline scrubbing." }
    ],
    imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=1000",
    featured: true
  },
  {
    id: "bundle-04",
    name: "Zenith Flow",
    tagline: "Comfort meets productivity.",
    description: "Designed strictly around human anatomy. Split ergonomic keyboard and a vertical mouse to keep you in the flow state without the strain.",
    price: 489,
    category: "Ergonomic",
    items: [
      { name: "Zenith Split Keyboard", description: "Tenting system, columnar layout, wrist rests." },
      { name: "Flow Vertical Mouse", description: "57-degree angle, textured thumb grip." },
      { name: "Contour Deskmat", description: "Memory foam wrist support strip integrated." }
    ],
    imageUrl: "https://images.unsplash.com/photo-1518773553398-650c184e0bb3?auto=format&fit=crop&q=80&w=1000",
    featured: false
  },
  {
    id: "bundle-05",
    name: "Frostbite",
    tagline: "Ice cold precision.",
    description: "A striking all-white setup. Crisp, clean, and highly responsive. Features linear silver switches and a frictionless glass mousepad.",
    price: 389,
    category: "Gaming",
    items: [
      { name: "Glacier TKL Keyboard", description: "White aluminium case, silver linear switches." },
      { name: "Snow Fox Mouse", description: "Symmetrical shape, 58g weight, PTFE feet." },
      { name: "Ice Glide Pad", description: "Tempered glass surface, 400x500mm." }
    ],
    imageUrl: "https://images.unsplash.com/photo-1600861194942-f883de0dfe96?auto=format&fit=crop&q=80&w=1000",
    featured: false
  },
  {
    id: "bundle-06",
    name: "Timber",
    tagline: "Bring nature to your desk.",
    description: "Warm walnut wood accents combined with brushed aluminium. A sophisticated look for an executive or cozy home office setup.",
    price: 529,
    category: "Minimalist",
    items: [
      { name: "Timber 65% Keyboard", description: "Solid walnut case, tactile brown switches." },
      { name: "Alloy Mouse", description: "Aluminium body, wood accent panels." },
      { name: "Felt Deskmat", description: "Merino wool felt, natural cork base." },
      { name: "Wooden Wrist Rest", description: "Ergonomic slope, matching walnut." }
    ],
    imageUrl: "https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&q=80&w=1000",
    featured: false
  },
  {
    id: "bundle-07",
    name: "The Director",
    tagline: "Command your workflow.",
    description: "Geared towards video editors and streamers. Features a dedicated macro pad, a stream controller, and a high-end dynamic microphone arm.",
    price: 749,
    category: "Creator",
    items: [
      { name: "Director Full-Size Keyboard", description: "Media keys, volume roller, linear switches." },
      { name: "Action Mouse", description: "Adjustable weight system, hyper-fast scroll." },
      { name: "Control Deck", description: "15 LCD keys, multi-action capabilities." },
      { name: "Mic Arm Pro", description: "Low profile, hidden cable management." }
    ],
    imageUrl: "https://images.unsplash.com/photo-1598550476439-6847785fcea6?auto=format&fit=crop&q=80&w=1000",
    featured: false
  },
  {
    id: "bundle-08",
    name: "Retro 1984",
    tagline: "Nostalgia engineered.",
    description: "Chunky beige plastics, spherical keycaps, and a satisfying, loud click. Bringing the golden era of computing to the modern age.",
    price: 299,
    category: "Minimalist",
    items: [
      { name: "Model '84 Keyboard", description: "Beige ABS case, heavy clicky switches, SA profile keycaps." },
      { name: "Block Mouse", description: "Retro aesthetic, modern optical sensor." },
      { name: "Grid Deskmat", description: "Vintage graph paper design, thick rubber base." }
    ],
    imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=1000",
    featured: false
  },
  {
    id: "bundle-09",
    name: "Apex Competitive",
    tagline: "No compromises. Just wins.",
    description: "Built for eSports professionals. Features the fastest polling rates, optical switches, and a massive deskmat for low-sensitivity players.",
    price: 499,
    category: "Gaming",
    items: [
      { name: "Apex 60% Keyboard", description: "Optical switches, 8000Hz polling rate." },
      { name: "Viper Mouse", description: "4KHz wireless polling, 50g ultra-light." },
      { name: "Arena Deskmat", description: "1200x500mm, control surface texture." },
      { name: "Mouse Bungee", description: "Flexible arm, weighted base." }
    ],
    imageUrl: "https://images.unsplash.com/photo-1547394765-185e1e68f34e?auto=format&fit=crop&q=80&w=1000",
    featured: false
  },
  {
    id: "bundle-10",
    name: "Nomad",
    tagline: "Your setup, anywhere.",
    description: "Ultra-portable and wireless. Designed to fit in a backpack and transform a coffee shop table into a high-productivity workstation.",
    price: 249,
    category: "Minimalist",
    items: [
      { name: "Nomad Foldable Keyboard", description: "Bluetooth 5.0, pantograph switches, ultra-thin." },
      { name: "Pebble Mouse", description: "Silent clicks, flat profile for easy packing." },
      { name: "Origami Stand", description: "Foldable laptop and tablet stand." }
    ],
    imageUrl: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&q=80&w=1000",
    featured: false
  },
  {
    id: "bundle-11",
    name: "Monochrome",
    tagline: "Stark contrast.",
    description: "A bold black and white theme. High contrast aesthetics that make a statement without needing any RGB lighting.",
    price: 319,
    category: "Minimalist",
    items: [
      { name: "Oreo 75% Keyboard", description: "Black case, white keycaps with black legends." },
      { name: "Panda Mouse", description: "White body, black buttons and scroll wheel." },
      { name: "Zebra Deskmat", description: "Abstract black and white geometric pattern." }
    ],
    imageUrl: "https://images.unsplash.com/photo-1616423640778-28d1b53229bd?auto=format&fit=crop&q=80&w=1000",
    featured: false
  },
  {
    id: "bundle-12",
    name: "Audio Engineer",
    tagline: "Hear every detail.",
    description: "Focuses heavily on audio fidelity alongside a reliable input setup. Perfect for mixing, mastering, or audiophiles.",
    price: 899,
    category: "Creator",
    items: [
      { name: "Studio Macropad", description: "9 rotary encoders, 9 mechanical keys." },
      { name: "Reference Headphones", description: "Open-back, planar magnetic drivers." },
      { name: "DAC/Amp Combo", description: "High-resolution audio decoding, physical volume knob." },
      { name: "Acoustic Deskmat", description: "Thick sound-dampening material." }
    ],
    imageUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=1000",
    featured: false
  },
  {
    id: "bundle-13",
    name: "Pastel Dream",
    tagline: "Soft colors, hard performance.",
    description: "A calming setup featuring soft mint, lavender, and pink hues. Cozy aesthetics combined with reliable mechanical performance.",
    price: 369,
    category: "Gaming",
    items: [
      { name: "Macaron 65% Keyboard", description: "Pastel pink case, mint and lavender keycaps." },
      { name: "Cloud Mouse", description: "Pastel purple, lightweight, RGB underglow." },
      { name: "Dreamscape Deskmat", description: "Watercolor pastel design." }
    ],
    imageUrl: "https://images.unsplash.com/photo-1586816879360-004f5b0c51e3?auto=format&fit=crop&q=80&w=1000",
    featured: false
  },
  {
    id: "bundle-14",
    name: "Architect",
    tagline: "Draft with precision.",
    description: "A setup built around a high-end drafting tablet and precision tools. For architects, illustrators, and 3D artists.",
    price: 1199,
    category: "Creator",
    items: [
      { name: "Drafting Display", description: "16-inch 4K pen display, 8192 pressure levels." },
      { name: "Command Keypad", description: "One-handed wireless shortcut remote." },
      { name: "Stylus Stand", description: "Heavy metal base, integrated nib extractor." }
    ],
    imageUrl: "https://images.unsplash.com/photo-1503694978374-8a2fa686963a?auto=format&fit=crop&q=80&w=1000",
    featured: false
  },
  {
    id: "bundle-15",
    name: "Mech Warrior",
    tagline: "Heavy duty hardware.",
    description: "Industrial design language. Exposed screws, heavy aluminium plates, and rugged build quality that will last a lifetime.",
    price: 649,
    category: "Gaming",
    items: [
      { name: "Tank TKL Keyboard", description: "5lb raw aluminium case, heavy tactile switches." },
      { name: "Armor Mouse", description: "Magnesium alloy exoskeleton." },
      { name: "Kevlar Deskmat", description: "Ultra-durable synthetic weave." },
      { name: "Coiled Aviator Cable", description: "Thick paracord, metal aviator connector." }
    ],
    imageUrl: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&q=80&w=1000",
    featured: false
  }
];
