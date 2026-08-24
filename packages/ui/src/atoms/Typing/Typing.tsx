import React, { forwardRef, useState, useEffect, useRef } from "react";
import "./Typing.css";

export type TypingSize = "xs" | "sm" | "md" | "lg" | "xl";
export type TypingColor =
  | "primary"
  | "secondary"
  | "tertiary"
  | "interactive"
  | "error"
  | "success"
  | "warning";
export type TypingStyle = "default" | "serif" | "handwritten" | "monospace";
export type TypingAs = "span" | "div" | "p" | "label";

export interface TypingProps extends Omit<React.HTMLAttributes<HTMLElement>, "style" | "children"> {
  /**
   * Text or array of strings to display with typewriter effect
   */
  text?: string | string[];

  /**
   * Children text fallback if `text` prop is omitted
   */
  children?: string;

  /**
   * Underlying HTML tag to render
   * @default 'span'
   */
  as?: TypingAs;

  /**
   * Typing speed in milliseconds per character
   * @default 50
   */
  speed?: number;

  /**
   * Delay before typing animation begins (in ms)
   * @default 0
   */
  delay?: number;

  /**
   * Pause duration in ms after typing full string before erasing (if looping)
   * @default 1500
   */
  eraseDelay?: number;

  /**
   * Erasing speed in ms per character
   * @default 30
   */
  eraseSpeed?: number;

  /**
   * Whether to loop infinitely through strings
   * @default false
   */
  loop?: boolean;

  /**
   * Custom blinking cursor character or boolean flag (`true` for `"|"`)
   * @default true
   */
  cursor?: boolean | string;

  /**
   * Font size scale
   * @default 'md'
   */
  size?: TypingSize;

  /**
   * Font style variant
   * @default 'default'
   */
  style?: TypingStyle | React.CSSProperties;

  /**
   * Semantic color token
   * @default 'primary'
   */
  color?: TypingColor;

  /**
   * Callback fired when typing finishes (for single non-looping text)
   */
  onFinished?: () => void;
}

export const Typing = forwardRef<HTMLElement, TypingProps>(
  (
    {
      text,
      children,
      as: Component = "span",
      speed = 50,
      delay = 0,
      eraseDelay = 1500,
      eraseSpeed = 30,
      loop = false,
      cursor = true,
      size = "md",
      style,
      color = "primary",
      onFinished,
      className = "",
      ...props
    },
    ref
  ) => {
    const textList: string[] = Array.isArray(text)
      ? text
      : typeof text === "string"
      ? [text]
      : typeof children === "string"
      ? [children]
      : [""];

    const [textIndex, setTextIndex] = useState<number>(0);
    const [displayedText, setDisplayedText] = useState<string>("");
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [isStarted, setIsStarted] = useState<boolean>(delay === 0);

    const onFinishedCalledRef = useRef<boolean>(false);

    useEffect(() => {
      onFinishedCalledRef.current = false;
      setTextIndex(0);
      setDisplayedText("");
      setIsDeleting(false);

      if (delay > 0) {
        setIsStarted(false);
        const timer = setTimeout(() => setIsStarted(true), delay);
        return () => clearTimeout(timer);
      } else {
        setIsStarted(true);
      }
    }, [text, children, delay]);

    useEffect(() => {
      if (!isStarted) return;

      const currentFullText = textList[textIndex] || "";

      if (!isDeleting) {
        if (displayedText.length < currentFullText.length) {
          const timeout = setTimeout(() => {
            setDisplayedText(currentFullText.slice(0, displayedText.length + 1));
          }, speed);
          return () => clearTimeout(timeout);
        } else {
          if (loop || textList.length > 1) {
            const timeout = setTimeout(() => {
              setIsDeleting(true);
            }, eraseDelay);
            return () => clearTimeout(timeout);
          } else {
            if (!onFinishedCalledRef.current) {
              onFinishedCalledRef.current = true;
              onFinished?.();
            }
          }
        }
      } else {
        if (displayedText.length > 0) {
          const timeout = setTimeout(() => {
            setDisplayedText(currentFullText.slice(0, displayedText.length - 1));
          }, eraseSpeed);
          return () => clearTimeout(timeout);
        } else {
          setIsDeleting(false);
          const nextIndex = (textIndex + 1) % textList.length;
          setTextIndex(nextIndex);
          if (!loop && nextIndex === 0) {
            if (!onFinishedCalledRef.current) {
              onFinishedCalledRef.current = true;
              onFinished?.();
            }
          }
        }
      }
    }, [
      displayedText,
      isDeleting,
      textIndex,
      isStarted,
      textList,
      speed,
      eraseSpeed,
      eraseDelay,
      loop,
      onFinished,
    ]);

    let computedStyleVariant: TypingStyle = "default";
    let computedInlineStyle: React.CSSProperties | undefined = undefined;

    if (typeof style === "string") {
      computedStyleVariant = style as TypingStyle;
    } else if (typeof style === "object") {
      computedInlineStyle = style;
    }

    const classNames = [
      "bs-typing",
      `bs-typing--size-${size}`,
      `bs-typing--style-${computedStyleVariant}`,
      `bs-typing--color-${color}`,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const cursorSymbol =
      typeof cursor === "string" ? cursor : cursor ? "|" : null;

    return (
      <Component ref={ref as any} className={classNames} style={computedInlineStyle} {...props}>
        <span>{displayedText}</span>
        {cursorSymbol && <span className="bs-typing__cursor">{cursorSymbol}</span>}
      </Component>
    );
  }
);

Typing.displayName = "Typing";
