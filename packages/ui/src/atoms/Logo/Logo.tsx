import React, { useState } from "react";
import "./Logo.css";

export interface LogoSlots {
  root?: string;
  markWrapper?: string;
  mark?: string;
  textGroup?: string;
  titleRow?: string;
  title?: string;
  badge?: string;
  subtitle?: string;
}

export interface LogoProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /**
   * Display variant
   * - `full`: Logo Mark + Brand/Tenant Title + Subtitle
   * - `inline`: Logo Mark + Brand/Tenant Title + Subtitle inline
   * - `mark`: Logo Mark only
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
   * Primary brand/tenant title string or custom node
   * @default 'BayesStack'
   */
  title?: React.ReactNode;

  /**
   * Secondary tagline or studio descriptor (e.g. "Learner Studio · BayesStack")
   */
  subtitle?: React.ReactNode;

  /**
   * Optional status or tier badge (e.g. "ENTERPRISE", "v2.0")
   */
  badge?: React.ReactNode;

  /**
   * Optional custom logo mark node (e.g. custom SVG, monogram avatar, or element)
   */
  mark?: React.ReactNode;

  /**
   * Optional custom logo mark image URL override.
   * Defaults to '/brand/logo-primary.svg' (public/brand/logo-primary.svg).
   */
  logoSrc?: string;

  /**
   * Custom root element class name
   */
  className?: string;

  /**
   * Object mapping custom class names to internal sub-element slots
   */
  classNames?: LogoSlots;
}

// Zero-dependency vector mark fallback rendering a Bayesian DAG (Directed Acyclic Graph) node network.
// Guarantees an immediate, crisp logo preview if static brand assets fail to load or are missing from public assets.
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
    {/* Stylized 'B' Logo Mark */}
    <path
      d="M15 13H25C28.866 13 32 15.6863 32 19C32 21.4 30.4 23.4 28 24.3C31 25.1 33 27.4 33 30.2C33 33.9553 29.4183 37 25 37H15V13ZM21 18V22.5H24.5C25.8807 22.5 27 21.6046 27 20.25C27 18.8954 25.8807 18 24.5 18H21ZM21 27.5V32H25.5C27.1569 32 28.5 30.9926 28.5 29.75C28.5 28.5074 27.1569 27.5 25.5 27.5H21Z"
      fill="#FFFFFF"
    />
  </svg>
);

export const Logo = React.forwardRef<HTMLDivElement, LogoProps>(
  (
    {
      variant = "full",
      theme = "light",
      size = "md",
      title = "BayesStack",
      subtitle,
      badge,
      mark,
      logoSrc,
      className = "",
      classNames,
      style,
      ...props
    },
    ref
  ) => {
    const [imgLoadFailed, setImgLoadFailed] = useState(false);

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
    const altText = typeof title === "string" ? title : "Logo";

    const handleImgError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      e.stopPropagation();
      if ("nativeEvent" in e && e.nativeEvent && typeof (e.nativeEvent as any).stopImmediatePropagation === "function") {
        (e.nativeEvent as any).stopImmediatePropagation();
      }
      setImgLoadFailed(true);
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
          classNames?.root,
        ]
          .filter(Boolean)
          .join(" ")}
        style={style}
        {...props}
      >
        {/* Logo Mark Slot */}
        <div
          className={["bs-logo-mark-wrapper", classNames?.markWrapper].filter(Boolean).join(" ")}
          style={{ width: sizePx, height: sizePx }}
        >
          {mark ? (
            typeof mark === "string" && (mark.startsWith("http") || mark.startsWith("/")) ? (
              !imgLoadFailed ? (
                <img
                  src={mark}
                  alt={altText}
                  className={["bs-logo-img", classNames?.mark].filter(Boolean).join(" ")}
                  style={{ width: sizePx, height: sizePx, objectFit: "contain" }}
                  onError={handleImgError}
                />
              ) : (
                <FallbackVectorMark size={sizePx} theme={theme} />
              )
            ) : (
              mark
            )
          ) : logoSrc && !imgLoadFailed ? (
            <img
              src={logoSrc}
              alt={altText}
              className={["bs-logo-img", classNames?.mark].filter(Boolean).join(" ")}
              style={{ width: sizePx, height: sizePx, objectFit: "contain" }}
              onError={handleImgError}
            />
          ) : (
            <FallbackVectorMark size={sizePx} theme={theme} />
          )}
        </div>

        {/* Text Brand/Tenant Title & Subtitle */}
        {variant !== "mark" && (
          <div className={["bs-logo-text-group", classNames?.textGroup].filter(Boolean).join(" ")}>
            <div className={["bs-logo-title-row", classNames?.titleRow].filter(Boolean).join(" ")}>
              <span className={["bs-logo-title", classNames?.title].filter(Boolean).join(" ")}>{title}</span>
              {badge && (
                <span className={["bs-logo-badge", classNames?.badge].filter(Boolean).join(" ")}>{badge}</span>
              )}
            </div>
            {subtitle && (
              <span className={["bs-logo-subtitle", classNames?.subtitle].filter(Boolean).join(" ")}>
                {subtitle}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }
);

Logo.displayName = "Logo";
