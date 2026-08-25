import React, { useState } from "react";
import "./Logo.css";

export interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Display variant
   * - `full`: Official Logo Mark + Brand Title + Subtitle
   * - `inline`: Official Logo Mark + Brand Title + Subtitle inline
   * - `mark`: Official Logo Mark only
   * @default 'full'
   */
  variant?: "full" | "inline" | "mark";

  /**
   * Color theme environment
   * @default 'light'
   */
  theme?: "light" | "dark";

  /**
   * Size scale
   * @default 'md'
   */
  size?: "sm" | "md" | "lg" | "xl";

  /**
   * Primary brand title string
   * @default 'BayesStack'
   */
  title?: string;

  /**
   * Secondary tagline string (e.g. "Design Studio" or "Platform")
   * @default 'Design Studio'
   */
  subtitle?: string;

  /**
   * Optional status badge (e.g. "v2.0" or "PRO")
   */
  badge?: string;

  /**
   * Optional custom logo mark image URL override.
   * Defaults to '/brand/logo-primary.svg' (public/brand/logo-primary.svg).
   */
  logoSrc?: string;
}

const FallbackVectorMark: React.FC<{ size: number; theme: "light" | "dark" }> = ({ size, theme }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="bs-logo-vector-mark"
  >
    <defs>
      <linearGradient id="bsLogoGradPrimary" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#0B6763" />
        <stop offset="100%" stopColor="#14B8A6" />
      </linearGradient>
      <linearGradient id="bsLogoGradDark" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#14B8A6" />
        <stop offset="100%" stopColor="#5EEAD4" />
      </linearGradient>
    </defs>
    <rect
      width="48"
      height="48"
      rx="12"
      fill={theme === "dark" ? "url(#bsLogoGradDark)" : "url(#bsLogoGradPrimary)"}
    />
    {/* Bayesian Nodes */}
    <circle cx="14" cy="24" r="4.5" fill="#FFFFFF" />
    <circle cx="34" cy="14" r="4.5" fill="#FFFFFF" />
    <circle cx="34" cy="34" r="4.5" fill="#FFFFFF" />
    {/* Edges */}
    <path d="M17.5 22.5L30.5 15.5" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
    <path d="M17.5 25.5L30.5 32.5" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
    <path d="M34 18.5V29.5" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="3 3" opacity="0.7" />
  </svg>
);

export const Logo = React.forwardRef<HTMLDivElement, LogoProps>(
  (
    {
      variant = "full",
      theme = "light",
      size = "md",
      title = "BayesStack",
      subtitle = "Design Studio",
      badge,
      logoSrc,
      className = "",
      style,
      ...props
    },
    ref
  ) => {
    const [imgErrorIndex, setImgErrorIndex] = useState(0);

    const getSizePixel = (s: LogoProps["size"]) => {
      switch (s) {
        case "sm":
          return 28;
        case "md":
          return 36;
        case "lg":
          return 44;
        case "xl":
          return 56;
        default:
          return 36;
      }
    };

    const sizePx = getSizePixel(size);

    // Sequence of fallback image URLs for the mark icon wrapper.
    // NOTE: logo-primary.svg wraps a base64-encoded PNG inside an <image> element.
    // Browsers refuse to render <image> inside SVGs loaded via <img src>, so we
    // prioritize the actual PNG/mark assets that render reliably.
    const fallbackSources = [
      logoSrc,
      "/assets/brand/logo-mark.svg",
      "/brand/logo-mark.svg",
      "/brand/logo-primary.png",
      "/assets/brand/logo-primary.png",
    ].filter(Boolean) as string[];

    const currentSrc = fallbackSources[imgErrorIndex];
    const isFailed = imgErrorIndex >= fallbackSources.length;

    const handleImgError = () => {
      setImgErrorIndex((prev) => prev + 1);
    };

    return (
      <div
        ref={ref}
        className={[
          "bs-logo-container",
          `bs-logo--${size}`,
          `bs-logo--${theme}`,
          `bs-logo--variant-${variant}`,
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={style}
        {...props}
      >
        {/* Official BayesStack Logo Mark */}
        <div className="bs-logo-mark-wrapper" style={{ width: sizePx, height: sizePx }}>
          {!isFailed && currentSrc ? (
            <img
              src={currentSrc}
              alt={title || "BayesStack Logo"}
              className="bs-logo-img"
              style={{ width: sizePx, height: sizePx, objectFit: "contain" }}
              onError={handleImgError}
            />
          ) : (
            <FallbackVectorMark size={sizePx} theme={theme} />
          )}
        </div>

        {/* Text Brand Title & Subtitle */}
        {variant !== "mark" && (
          <div className="bs-logo-text-group">
            <div className="bs-logo-title-row">
              <span className="bs-logo-title">{title}</span>
              {badge && <span className="bs-logo-badge">{badge}</span>}
            </div>
            {subtitle && <span className="bs-logo-subtitle">{subtitle}</span>}
          </div>
        )}
      </div>
    );
  }
);

Logo.displayName = "Logo";
