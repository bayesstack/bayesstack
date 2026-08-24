import React from "react";

export interface BayesStackMarkProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  size?: number | string;
}

export const BayesStackMark: React.FC<BayesStackMarkProps> = ({
  size = 40,
  className = "",
  alt = "BayesStack Logo Mark",
  style,
  ...props
}) => {
  const computedStyle: React.CSSProperties = {
    height: typeof size === "number" ? `${size}px` : size,
    width: typeof size === "number" ? `${size}px` : size,
    ...style,
  };

  return (
    <img
      src="/assets/brand/logo-mark.svg"
      alt={alt}
      className={`bayesstack-mark ${className}`}
      style={computedStyle}
      {...props}
    />
  );
};
