import React from "react";
import "./Loading.css";

/* ==========================================================================
   Skeleton Sub-Component Props
   ========================================================================== */

export interface SkeletonAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | number;
  shape?: "circle" | "square";
  active?: boolean;
}

export interface SkeletonButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  shape?: "rounded" | "pill" | "circle" | "square";
  active?: boolean;
  block?: boolean;
}

export interface SkeletonInputProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  active?: boolean;
  block?: boolean;
}

export interface SkeletonImageProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  active?: boolean;
}

export interface SkeletonTitleProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  active?: boolean;
}

export interface SkeletonParagraphProps extends React.HTMLAttributes<HTMLDivElement> {
  rows?: number;
  width?: string | number | (string | number)[];
  active?: boolean;
}

/* ==========================================================================
   Main Skeleton Props
   ========================================================================== */

export interface SkeletonProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /**
   * If true or false, acts as a wrapper: displays skeleton when loading is true,
   * and renders `children` when loading is false.
   */
  loading?: boolean;

  /**
   * Toggle shimmer animation vs static gray skeleton
   * @default true
   */
  active?: boolean;

  /**
   * Render avatar skeleton on the left (or pass custom avatar props)
   */
  avatar?: boolean | SkeletonAvatarProps;

  /**
   * Render title line skeleton (or pass custom title props)
   */
  title?: boolean | SkeletonTitleProps;

  /**
   * Render paragraph lines skeleton (or pass custom paragraph props)
   */
  paragraph?: boolean | SkeletonParagraphProps;

  /**
   * Apply rounded pill corners to text & title lines
   * @default false
   */
  round?: boolean;

  /**
   * Atomic shape variant for standalone usage
   * @default 'rect'
   */
  variant?: "rect" | "circle" | "text";

  /**
   * Custom width for standalone skeleton
   */
  width?: string | number;

  /**
   * Custom height for standalone skeleton
   */
  height?: string | number;

  /**
   * Actual content to display when `loading: false`
   */
  children?: React.ReactNode;
}

/* ==========================================================================
   Sub-Component Implementations
   ========================================================================== */

const SkeletonAvatar: React.FC<SkeletonAvatarProps> = ({
  size = "md",
  shape = "circle",
  active = true,
  className = "",
  style,
  ...props
}) => {
  let sizePx = 40;
  if (typeof size === "number") {
    sizePx = size;
  } else if (size === "sm") {
    sizePx = 32;
  } else if (size === "lg") {
    sizePx = 56;
  }

  return (
    <div
      className={[
        "bs-skeleton",
        "bs-skeleton-avatar",
        `bs-skeleton-avatar--${shape}`,
        !active && "bs-skeleton--static",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ width: sizePx, height: sizePx, ...style }}
      {...props}
    />
  );
};

const SkeletonButton: React.FC<SkeletonButtonProps> = ({
  size = "md",
  shape = "rounded",
  active = true,
  block = false,
  className = "",
  style,
  ...props
}) => {
  return (
    <div
      className={[
        "bs-skeleton",
        "bs-skeleton-button",
        `bs-skeleton-button--${size}`,
        `bs-skeleton-button--${shape}`,
        block && "bs-skeleton-button--block",
        !active && "bs-skeleton--static",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
      {...props}
    />
  );
};

const SkeletonInput: React.FC<SkeletonInputProps> = ({
  size = "md",
  active = true,
  block = false,
  className = "",
  style,
  ...props
}) => {
  return (
    <div
      className={[
        "bs-skeleton",
        "bs-skeleton-input",
        `bs-skeleton-input--${size}`,
        block && "bs-skeleton-input--block",
        !active && "bs-skeleton--static",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
      {...props}
    />
  );
};

const SkeletonImage: React.FC<SkeletonImageProps> = ({
  width = 160,
  height = 120,
  active = true,
  className = "",
  style,
  ...props
}) => {
  return (
    <div
      className={[
        "bs-skeleton",
        "bs-skeleton-image",
        !active && "bs-skeleton--static",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ width, height, ...style }}
      {...props}
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="bs-skeleton-image-icon"
      >
        <path
          d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z"
          fill="#0B6763"
          opacity="0.3"
        />
      </svg>
    </div>
  );
};

const SkeletonTitle: React.FC<SkeletonTitleProps> = ({
  width = "38%",
  active = true,
  className = "",
  style,
  ...props
}) => {
  return (
    <div
      className={[
        "bs-skeleton",
        "bs-skeleton-title",
        !active && "bs-skeleton--static",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ width, ...style }}
      {...props}
    />
  );
};

const SkeletonParagraph: React.FC<SkeletonParagraphProps> = ({
  rows = 3,
  width = ["100%", "92%", "65%"],
  active = true,
  className = "",
  style,
  ...props
}) => {
  const getLineWidth = (index: number): string | number => {
    if (Array.isArray(width)) {
      return width[index] !== undefined ? width[index] : "100%";
    }
    if (index === rows - 1 && width === undefined) {
      return "65%";
    }
    return width;
  };

  return (
    <div className={["bs-skeleton-paragraph", className].filter(Boolean).join(" ")} style={style} {...props}>
      {Array.from({ length: rows }).map((_, idx) => (
        <div
          key={idx}
          className={["bs-skeleton", "bs-skeleton-paragraph-row", !active && "bs-skeleton--static"]
            .filter(Boolean)
            .join(" ")}
          style={{ width: getLineWidth(idx) }}
        />
      ))}
    </div>
  );
};

/* ==========================================================================
   Main Compound Skeleton Component
   ========================================================================== */

interface SkeletonComponent
  extends React.ForwardRefExoticComponent<SkeletonProps & React.RefAttributes<HTMLDivElement>> {
  Avatar: typeof SkeletonAvatar;
  Button: typeof SkeletonButton;
  Input: typeof SkeletonInput;
  Image: typeof SkeletonImage;
  Title: typeof SkeletonTitle;
  Paragraph: typeof SkeletonParagraph;
}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      loading,
      active = true,
      avatar,
      title = true,
      paragraph = true,
      round = false,
      variant = "rect",
      width,
      height,
      className = "",
      style,
      children,
      ...props
    },
    ref
  ) => {
    // If loading prop is explicitly provided as false, render children
    if (loading === false) {
      return <>{children}</>;
    }

    // Compound Layout Mode (when avatar, title, or paragraph is specified or loading wrapper)
    const isCompound = Boolean(avatar || title || paragraph || loading !== undefined);

    if (isCompound) {
      const avatarProps: SkeletonAvatarProps =
        typeof avatar === "object" ? avatar : { active };
      const titleProps: SkeletonTitleProps =
        typeof title === "object" ? title : { active };
      const paragraphProps: SkeletonParagraphProps =
        typeof paragraph === "object" ? paragraph : { active };

      return (
        <div
          ref={ref}
          className={[
            "bs-skeleton-compound",
            round && "bs-skeleton--round",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          style={style}
          {...props}
        >
          {Boolean(avatar) && <SkeletonAvatar active={active} {...avatarProps} />}

          <div className="bs-skeleton-compound-content">
            {Boolean(title) && <SkeletonTitle active={active} {...titleProps} />}
            {Boolean(paragraph) && <SkeletonParagraph active={active} {...paragraphProps} />}
          </div>
        </div>
      );
    }

    // Standalone Atomic Mode (rect, circle, text)
    return (
      <div
        ref={ref}
        className={[
          "bs-skeleton",
          `bs-skeleton--${variant}`,
          !active && "bs-skeleton--static",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={{
          width,
          height,
          ...style,
        }}
        {...props}
      />
    );
  }
) as unknown as SkeletonComponent;

Skeleton.Avatar = SkeletonAvatar;
Skeleton.Button = SkeletonButton;
Skeleton.Input = SkeletonInput;
Skeleton.Image = SkeletonImage;
Skeleton.Title = SkeletonTitle;
Skeleton.Paragraph = SkeletonParagraph;

Skeleton.displayName = "Skeleton";
