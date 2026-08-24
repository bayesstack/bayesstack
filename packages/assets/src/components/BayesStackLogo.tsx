import React from "react";

export interface BayesStackLogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  variant?: "primary" | "white" | "black" | "mark";
  size?: number | string;
}

export const BayesStackLogo: React.FC<BayesStackLogoProps> = ({
  variant = "primary",
  size,
  className = "",
  alt,
  style,
  ...props
}) => {
  const getSrc = () => {
    switch (variant) {
      case "white":
        return "/assets/brand/logo-white.svg";
      case "black":
        return "/assets/brand/logo-black.svg";
      case "mark":
        return "/assets/brand/logo-mark.svg";
      case "primary":
      default:
        return "/assets/brand/logo-primary.svg";
    }
  };

  const computedStyle: React.CSSProperties = {
    height: size ? (typeof size === "number" ? `${size}px` : size) : undefined,
    width: "auto",
    ...style,
  };

  return (
    <img
      src={getSrc()}
      alt={alt || `BayesStack Logo (${variant})`}
      className={`bayesstack-logo ${className}`}
      style={computedStyle}
      {...props}
    />
  );
};
