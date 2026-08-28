import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  type InputHTMLAttributes,
} from "react";
import { IconButton } from "../Buttons/IconButton";
import "./Inputs.css";

export type ColorFormat = "hex" | "rgb" | "hsl";

export interface ColorInputSlots {
  root?: string;
  shell?: string;
  swatchTrigger?: string;
  input?: string;
  formatBadge?: string;
  copyButton?: string;
  popover?: string;
  popoverTabs?: string;
  popoverTab?: string;
  satArea?: string;
  hueBar?: string;
  swatchDot?: string;
}

export interface ColorInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "onChange" | "value"> {
  /**
   * Color string value (e.g. '#0B6763')
   */
  value?: string;

  /**
   * Default initial color value
   */
  defaultValue?: string;

  /**
   * Callback fired when color changes
   */
  onChange?: (color: string) => void;

  /**
   * Display color format
   * @default 'hex'
   */
  format?: ColorFormat;

  /**
   * Allows user to click format badge to cycle between HEX / RGB / HSL
   * @default false
   */
  showFormatToggle?: boolean;

  /**
   * Size scale
   * @default 'md'
   */
  size?: "sm" | "md" | "lg";

  /**
   * Disable interactive editing
   */
  disabled?: boolean;

  /**
   * Custom root class name
   */
  className?: string;

  /**
   * Object mapping custom class names to internal sub-element slots
   */
  classNames?: ColorInputSlots;

  /**
   * Custom inline styles for root container
   */
  wrapperStyle?: React.CSSProperties;
}

// HSV Color Interface
interface HSV {
  h: number; // 0..360
  s: number; // 0..1
  v: number; // 0..1
}

// Format Converter Helpers
// Expands shorthand 3-digit hex values (e.g. "#FFF" -> "#FFFFFF") and parses RGB integer components.
// Returns BayesStack brand teal (#0B6763) if the input string is malformed or invalid.
function hexToRgbNums(hex: string): { r: number; g: number; b: number } {
  let c = hex.replace("#", "");
  if (c.length === 3) c = c.split("").map((x) => x + x).join("");
  const num = parseInt(c, 16);
  if (isNaN(num)) return { r: 11, g: 103, b: 99 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function rgbNumsToHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  const toHex = (n: number) => {
    const h = clamp(n).toString(16);
    return h.length === 1 ? "0" + h : h;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function hexToHslNums(hex: string): { h: number; s: number; l: number } {
  const { r: r255, g: g255, b: b255 } = hexToRgbNums(hex);
  const r = r255 / 255;
  const g = g255 / 255;
  const b = b255 / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function hslNumsToHex(h: number, s: number, l: number): string {
  const hDeg = ((h % 360) + 360) % 360;
  const sPct = Math.max(0, Math.min(100, s)) / 100;
  const lPct = Math.max(0, Math.min(100, l)) / 100;

  const c = (1 - Math.abs(2 * lPct - 1)) * sPct;
  const x = c * (1 - Math.abs(((hDeg / 60) % 2) - 1));
  const m = lPct - c / 2;

  let r1 = 0,
    g1 = 0,
    b1 = 0;
  if (hDeg >= 0 && hDeg < 60) {
    r1 = c;
    g1 = x;
    b1 = 0;
  } else if (hDeg >= 60 && hDeg < 120) {
    r1 = x;
    g1 = c;
    b1 = 0;
  } else if (hDeg >= 120 && hDeg < 180) {
    r1 = 0;
    g1 = c;
    b1 = x;
  } else if (hDeg >= 180 && hDeg < 240) {
    r1 = 0;
    g1 = x;
    b1 = c;
  } else if (hDeg >= 240 && hDeg < 300) {
    r1 = x;
    g1 = 0;
    b1 = c;
  } else {
    r1 = c;
    g1 = 0;
    b1 = x;
  }

  return rgbNumsToHex(
    Math.round((r1 + m) * 255),
    Math.round((g1 + m) * 255),
    Math.round((b1 + m) * 255)
  );
}

function hexToHsv(hex: string): HSV {
  const { r: r255, g: g255, b: b255 } = hexToRgbNums(hex);
  const r = r255 / 255;
  const g = g255 / 255;
  const b = b255 / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max !== min) {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s, v };
}

function hsvToHex({ h, s, v }: HSV): string {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0,
    g = 0,
    b = 0;

  if (h >= 0 && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h >= 60 && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h >= 180 && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h >= 240 && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }

  return rgbNumsToHex(
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255)
  );
}

function formatColorValue(hex: string, fmt: ColorFormat): string {
  const cleanHex = hex.startsWith("#") ? hex : `#${hex}`;
  if (fmt === "rgb") {
    const { r, g, b } = hexToRgbNums(cleanHex);
    return `rgb(${r}, ${g}, ${b})`;
  }
  if (fmt === "hsl") {
    const { h, s, l } = hexToHslNums(cleanHex);
    return `hsl(${h}, ${s}%, ${l}%)`;
  }
  return cleanHex.toUpperCase();
}

const POPOVER_SWATCHES = [
  "#0B6763", // Teal Primary
  "#1677FF", // Blue Accent
  "#722ED1", // Purple
  "#278800", // Green
  "#AD4E00", // Orange
  "#D32029", // Red
  "#123333", // Dark Slate
  "#FFFFFF", // Pure White
  "#8E9E9C", // Muted Gray
];

export const ColorInput = React.forwardRef<HTMLInputElement, ColorInputProps>(
  (
    {
      value,
      defaultValue = "#0B6763",
      format = "hex",
      showFormatToggle = false,
      size = "md",
      disabled = false,
      onChange,
      className = "",
      classNames,
      wrapperStyle,
      style,
      ...props
    },
    ref
  ) => {
    const isControlled = value !== undefined;
    const [internalColor, setInternalColor] = useState<string>(
      defaultValue || "#0B6763"
    );
    const currentColor = isControlled ? String(value) : internalColor;

    const [activeFormat, setActiveFormat] = useState<ColorFormat>(format);
    const [copied, setCopied] = useState<boolean>(false);
    const [typedText, setTypedText] = useState<string>(
      formatColorValue(currentColor, activeFormat)
    );

    const [isOpen, setIsOpen] = useState<boolean>(false);

    // Dynamic Mode Channels State
    const [hsv, setHsv] = useState<HSV>(() => hexToHsv(currentColor));
    const [rgb, setRgb] = useState(() => hexToRgbNums(currentColor));
    const [hsl, setHsl] = useState(() => hexToHslNums(currentColor));

    const containerRef = useRef<HTMLDivElement | null>(null);
    const satRef = useRef<HTMLDivElement | null>(null);
    const hueRef = useRef<HTMLDivElement | null>(null);

    // Sync all format channels when current color changes externally
    useEffect(() => {
      setHsv(hexToHsv(currentColor));
      setRgb(hexToRgbNums(currentColor));
      setHsl(hexToHslNums(currentColor));
      setTypedText(formatColorValue(currentColor, activeFormat));
    }, [currentColor, activeFormat]);

    // Handle outside click to close popover
    useEffect(() => {
      if (!isOpen) return;
      const handleClickOutside = (e: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(e.target as Node)
        ) {
          setIsOpen(false);
        }
      };
      window.addEventListener("mousedown", handleClickOutside);
      return () => window.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const notifyChange = useCallback(
      (newHex: string) => {
        if (disabled) return;
        if (!isControlled) {
          setInternalColor(newHex);
        }
        if (onChange) onChange(newHex);
      },
      [disabled, isControlled, onChange]
    );

    // 1. HEX 2D Saturation / Value Canvas Drag Handler
    const updateSatVal = useCallback(
      (clientX: number, clientY: number) => {
        if (!satRef.current) return;
        const rect = satRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
        const y = Math.max(0, Math.min(rect.height, clientY - rect.top));

        const s = x / rect.width;
        const v = 1 - y / rect.height;

        setHsv((prev) => {
          const next = { ...prev, s, v };
          notifyChange(hsvToHex(next));
          return next;
        });
      },
      [notifyChange]
    );

    const handleSatMouseDown = (e: React.MouseEvent) => {
      if (disabled) return;
      updateSatVal(e.clientX, e.clientY);

      const handleMove = (ev: MouseEvent) => updateSatVal(ev.clientX, ev.clientY);
      const handleUp = () => {
        window.removeEventListener("mousemove", handleMove);
        window.removeEventListener("mouseup", handleUp);
      };
      window.addEventListener("mousemove", handleMove);
      window.addEventListener("mouseup", handleUp);
    };

    // 1D Hue Spectrum Slider Handler
    const updateHue = useCallback(
      (clientX: number) => {
        if (!hueRef.current) return;
        const rect = hueRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
        const h = Math.round((x / rect.width) * 360);

        setHsv((prev) => {
          const next = { ...prev, h };
          notifyChange(hsvToHex(next));
          return next;
        });
      },
      [notifyChange]
    );

    const handleHueMouseDown = (e: React.MouseEvent) => {
      if (disabled) return;
      updateHue(e.clientX);

      const handleMove = (ev: MouseEvent) => updateHue(ev.clientX);
      const handleUp = () => {
        window.removeEventListener("mousemove", handleMove);
        window.removeEventListener("mouseup", handleUp);
      };
      window.addEventListener("mousemove", handleMove);
      window.addEventListener("mouseup", handleUp);
    };

    // 2. RGB Channel Handlers
    const handleRgbChannelChange = (channel: "r" | "g" | "b", val: number) => {
      const clamped = Math.max(0, Math.min(255, isNaN(val) ? 0 : val));
      const nextRgb = { ...rgb, [channel]: clamped };
      setRgb(nextRgb);
      notifyChange(rgbNumsToHex(nextRgb.r, nextRgb.g, nextRgb.b));
    };

    // 3. HSL Channel Handlers
    const handleHslChannelChange = (
      channel: "h" | "s" | "l",
      val: number,
      maxVal: number
    ) => {
      const clamped = Math.max(0, Math.min(maxVal, isNaN(val) ? 0 : val));
      const nextHsl = { ...hsl, [channel]: clamped };
      setHsl(nextHsl);
      notifyChange(hslNumsToHex(nextHsl.h, nextHsl.s, nextHsl.l));
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;
      setTypedText(input);
      const hexMatch = input.match(/^#?([0-9A-Fa-f]{6})$/);
      if (hexMatch) {
        notifyChange(`#${hexMatch[1]}`);
      }
    };

    const handleCycleFormat = () => {
      if (!showFormatToggle) return;
      const formats: ColorFormat[] = ["hex", "rgb", "hsl"];
      const nextIdx = (formats.indexOf(activeFormat) + 1) % formats.length;
      setActiveFormat(formats[nextIdx]);
    };

    const handleCopy = () => {
      const textToCopy = formatColorValue(currentColor, activeFormat);
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    };

    const handleEyedropper = async () => {
      if (!("EyeDropper" in window)) return;
      try {
        // @ts-expect-error EyeDropper API
        const eyeDropper = new window.EyeDropper();
        const result = await eyeDropper.open();
        if (result && result.sRGBHex) {
          notifyChange(result.sRGBHex.toUpperCase());
        }
      } catch (err) {
        // Canceled
      }
    };

    return (
      <div
        ref={containerRef}
        className={classNames?.root}
        style={{ position: "relative", display: "inline-block", ...wrapperStyle }}
      >
        {/* Main Input Shell */}
        <div
          className={[
            "bs-color-input-shell",
            `bs-color-input-shell--${size}`,
            className,
            classNames?.shell,
          ]
            .filter(Boolean)
            .join(" ")}
          style={{ opacity: disabled ? 0.6 : 1, ...style }}
        >
          {/* Swatch Trigger Box */}
          <div
            className={["bs-color-swatch-trigger", classNames?.swatchTrigger].filter(Boolean).join(" ")}
            style={{ backgroundColor: currentColor }}
            onClick={() => !disabled && setIsOpen((prev) => !prev)}
            title="Click to open custom color visualizer"
          >
            <input
              ref={ref}
              type="hidden"
              value={currentColor}
              disabled={disabled}
              {...props}
            />
          </div>

          {/* Formatted Text Field */}
          <input
            type="text"
            value={typedText}
            onChange={handleTextChange}
            disabled={disabled}
            className={["bs-color-text-field", classNames?.input].filter(Boolean).join(" ")}
            spellCheck={false}
          />

          {/* Format Toggle Badge */}
          {showFormatToggle && (
            <span
              className={["bs-color-format-badge", classNames?.formatBadge].filter(Boolean).join(" ")}
              onClick={handleCycleFormat}
              title="Click to cycle format (HEX / RGB / HSL)"
            >
              {activeFormat}
            </span>
          )}

          {/* Copy Button */}
          <IconButton
            name={copied ? "Check" : "Copy"}
            label="Copy color code"
            variant="transparent"
            size={size === "sm" ? "xs" : "sm"}
            className={classNames?.copyButton}
            onClick={handleCopy}
            disabled={disabled}
          />
        </div>

        {/* BayesStack Advanced Color Visualizer Popover */}
        {isOpen && !disabled && (
          <div className={["bs-color-popover-advanced", classNames?.popover].filter(Boolean).join(" ")}>
            {/* Format Tabs Switcher */}
            <div className={["bs-color-popover-tabs", classNames?.popoverTabs].filter(Boolean).join(" ")}>
              {(["hex", "rgb", "hsl"] as ColorFormat[]).map((fmt) => (
                <div
                  key={fmt}
                  className={[
                    "bs-color-popover-tab",
                    activeFormat === fmt && "bs-color-popover-tab--active",
                    classNames?.popoverTab,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => setActiveFormat(fmt)}
                >
                  {fmt.toUpperCase()}
                </div>
              ))}
            </div>

            {/* MODE 1: HEX CANVAS VISUALIZER */}
            {activeFormat === "hex" && (
              <>
                <div
                  ref={satRef}
                  className={["bs-color-sat-area", classNames?.satArea].filter(Boolean).join(" ")}
                  onMouseDown={handleSatMouseDown}
                >
                  <div
                    className="bs-color-sat-bg"
                    style={{ backgroundColor: `hsl(${hsv.h}, 100%, 50%)` }}
                  />
                  <div className="bs-color-sat-white" />
                  <div className="bs-color-sat-black" />
                  <div
                    className="bs-color-sat-handle"
                    style={{
                      left: `${hsv.s * 100}%`,
                      top: `${(1 - hsv.v) * 100}%`,
                      backgroundColor: currentColor,
                    }}
                  />
                </div>

                <div
                  ref={hueRef}
                  className={["bs-color-hue-bar", classNames?.hueBar].filter(Boolean).join(" ")}
                  onMouseDown={handleHueMouseDown}
                >
                  <div
                    className="bs-color-hue-handle"
                    style={{ left: `${(hsv.h / 360) * 100}%` }}
                  />
                </div>

                {/* Contrast Preview Box */}
                <div
                  className="bs-color-preview-card"
                  style={{ backgroundColor: currentColor }}
                >
                  <span style={{ color: "#000000" }}>Text Dark (Aa)</span>
                  <span style={{ color: "#FFFFFF" }}>Text Light (Aa)</span>
                </div>
              </>
            )}

            {/* MODE 2: RGB CHANNEL CONTROLS */}
            {activeFormat === "rgb" && (
              <div className="bs-color-channels-stack">
                {/* Red Channel */}
                <div className="bs-color-channel-row">
                  <span className="bs-color-channel-badge bs-color-channel-badge--r">R</span>
                  <input
                    type="range"
                    min={0}
                    max={255}
                    value={rgb.r}
                    onChange={(e) => handleRgbChannelChange("r", Number(e.target.value))}
                    className="bs-color-channel-slider"
                    style={{
                      background: `linear-gradient(to right, rgb(0, ${rgb.g}, ${rgb.b}), rgb(255, ${rgb.g}, ${rgb.b}))`,
                    }}
                  />
                  <input
                    type="number"
                    min={0}
                    max={255}
                    value={rgb.r}
                    onChange={(e) => handleRgbChannelChange("r", Number(e.target.value))}
                    className="bs-color-channel-input"
                  />
                </div>

                {/* Green Channel */}
                <div className="bs-color-channel-row">
                  <span className="bs-color-channel-badge bs-color-channel-badge--g">G</span>
                  <input
                    type="range"
                    min={0}
                    max={255}
                    value={rgb.g}
                    onChange={(e) => handleRgbChannelChange("g", Number(e.target.value))}
                    className="bs-color-channel-slider"
                    style={{
                      background: `linear-gradient(to right, rgb(${rgb.r}, 0, ${rgb.b}), rgb(${rgb.r}, 255, ${rgb.b}))`,
                    }}
                  />
                  <input
                    type="number"
                    min={0}
                    max={255}
                    value={rgb.g}
                    onChange={(e) => handleRgbChannelChange("g", Number(e.target.value))}
                    className="bs-color-channel-input"
                  />
                </div>

                {/* Blue Channel */}
                <div className="bs-color-channel-row">
                  <span className="bs-color-channel-badge bs-color-channel-badge--b">B</span>
                  <input
                    type="range"
                    min={0}
                    max={255}
                    value={rgb.b}
                    onChange={(e) => handleRgbChannelChange("b", Number(e.target.value))}
                    className="bs-color-channel-slider"
                    style={{
                      background: `linear-gradient(to right, rgb(${rgb.r}, ${rgb.g}, 0), rgb(${rgb.r}, ${rgb.g}, 255))`,
                    }}
                  />
                  <input
                    type="number"
                    min={0}
                    max={255}
                    value={rgb.b}
                    onChange={(e) => handleRgbChannelChange("b", Number(e.target.value))}
                    className="bs-color-channel-input"
                  />
                </div>
              </div>
            )}

            {/* MODE 3: HSL CHANNEL CONTROLS */}
            {activeFormat === "hsl" && (
              <div className="bs-color-channels-stack">
                {/* Hue Channel */}
                <div className="bs-color-channel-row">
                  <span className="bs-color-channel-badge bs-color-channel-badge--h">H</span>
                  <input
                    type="range"
                    min={0}
                    max={360}
                    value={hsl.h}
                    onChange={(e) => handleHslChannelChange("h", Number(e.target.value), 360)}
                    className="bs-color-channel-slider"
                    style={{
                      background: `linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)`,
                    }}
                  />
                  <input
                    type="number"
                    min={0}
                    max={360}
                    value={hsl.h}
                    onChange={(e) => handleHslChannelChange("h", Number(e.target.value), 360)}
                    className="bs-color-channel-input"
                  />
                </div>

                {/* Saturation Channel */}
                <div className="bs-color-channel-row">
                  <span className="bs-color-channel-badge bs-color-channel-badge--s">S</span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={hsl.s}
                    onChange={(e) => handleHslChannelChange("s", Number(e.target.value), 100)}
                    className="bs-color-channel-slider"
                    style={{
                      background: `linear-gradient(to right, hsl(${hsl.h}, 0%, ${hsl.l}%), hsl(${hsl.h}, 100%, ${hsl.l}%))`,
                    }}
                  />
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={hsl.s}
                    onChange={(e) => handleHslChannelChange("s", Number(e.target.value), 100)}
                    className="bs-color-channel-input"
                  />
                </div>

                {/* Lightness Channel */}
                <div className="bs-color-channel-row">
                  <span className="bs-color-channel-badge bs-color-channel-badge--l">L</span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={hsl.l}
                    onChange={(e) => handleHslChannelChange("l", Number(e.target.value), 100)}
                    className="bs-color-channel-slider"
                    style={{
                      background: `linear-gradient(to right, hsl(${hsl.h}, ${hsl.s}%, 0%), hsl(${hsl.h}, ${hsl.s}%, 50%), hsl(${hsl.h}, ${hsl.s}%, 100%))`,
                    }}
                  />
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={hsl.l}
                    onChange={(e) => handleHslChannelChange("l", Number(e.target.value), 100)}
                    className="bs-color-channel-input"
                  />
                </div>
              </div>
            )}

            {/* Quick Swatch Palette & Eyedropper (Constant Across All Modes) */}
            <div className="bs-color-popover-swatches-box">
              <div className="bs-color-popover-swatches">
                {POPOVER_SWATCHES.map((swatchHex) => (
                  <div
                    key={swatchHex}
                    className={[
                      "bs-color-popover-swatch-dot",
                      currentColor.toLowerCase() === swatchHex.toLowerCase() &&
                        "bs-color-popover-swatch-dot--active",
                      classNames?.swatchDot,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    style={{ backgroundColor: swatchHex }}
                    onClick={() => notifyChange(swatchHex)}
                    title={swatchHex}
                  />
                ))}
              </div>

              {typeof window !== "undefined" && "EyeDropper" in window && (
                <IconButton
                  name="Search"
                  label="Sample color from screen"
                  variant="transparent"
                  size="sm"
                  onClick={handleEyedropper}
                />
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

ColorInput.displayName = "ColorInput";
