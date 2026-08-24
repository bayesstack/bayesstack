export interface ColorSpec {
  hex: string;
  rgb: [number, number, number];
  cmyk: [number, number, number, number];
  hsl: [number, number, number];
}

export const BRAND_COLORS = {
  primary: {
    hex: "#056766",
    rgb: [5, 103, 102] as [number, number, number],
    cmyk: [95, 0, 1, 60] as [number, number, number, number],
    hsl: [179, 91, 21] as [number, number, number],
  },
  darkBackground: {
    hex: "#0b6763",
    rgb: [11, 103, 99] as [number, number, number],
    cmyk: [89, 31, 4, 33] as [number, number, number, number],
    hsl: [177, 81, 22] as [number, number, number],
  },
  pureWhite: {
    hex: "#FFFFFF",
    rgb: [255, 255, 255] as [number, number, number],
    cmyk: [0, 0, 0, 0] as [number, number, number, number],
    hsl: [0, 0, 100] as [number, number, number],
  },
} as const;

export const cssBrandVars = `
  --color-brand-primary: ${BRAND_COLORS.primary.hex};
  --color-brand-dark: ${BRAND_COLORS.darkBackground.hex};
  --color-brand-white: ${BRAND_COLORS.pureWhite.hex};
  --color-brand-primary-rgb: ${BRAND_COLORS.primary.rgb.join(", ")};
  --color-brand-dark-rgb: ${BRAND_COLORS.darkBackground.rgb.join(", ")};
`;

export const tailwindBrandColors = {
  brand: {
    DEFAULT: BRAND_COLORS.primary.hex,
    primary: BRAND_COLORS.primary.hex,
    dark: BRAND_COLORS.darkBackground.hex,
    white: BRAND_COLORS.pureWhite.hex,
  },
};
