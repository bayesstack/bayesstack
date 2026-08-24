export * from "./tokens/colors";
export * from "./components/BayesStackLogo";
export * from "./components/BayesStackMark";

export const BRAND_ASSET_PATHS = {
  logos: {
    primarySvg: "/assets/brand/logo-primary.svg",
    blackSvg: "/assets/brand/logo-black.svg",
    whiteSvg: "/assets/brand/logo-white.svg",
    markSvg: "/assets/brand/logo-mark.svg",
    primaryPng: "/assets/brand/logo-primary.png",
    whitePng: "/assets/brand/logo-white.png",
    primaryWebp: "/assets/brand/logo-primary.webp",
    whiteWebp: "/assets/brand/logo-white.webp",
    blackWebp: "/assets/brand/logo-black.webp",
  },
  favicons: {
    ico: "/favicon.ico",
    svg: "/favicon.svg",
    appleTouch: "/apple-touch-icon.png",
    icon192: "/android-chrome-192x192.png",
    icon512: "/android-chrome-512x512.png",
    webmanifest: "/site.webmanifest",
  },
  social: {
    ogShare: "/opengraph-image.png",
    ogShareDark: "/opengraph-image-dark.png",
    twitter: "/twitter-image.png",
    heroLight: "/hero-banner-light.webp",
    heroDark: "/hero-banner-dark.webp",
  },
} as const;
