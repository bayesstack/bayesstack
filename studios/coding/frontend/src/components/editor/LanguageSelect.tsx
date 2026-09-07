import React from "react";

interface LanguageOption {
  value: string;
  label: string;
}

interface LanguageSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: LanguageOption[];
  disabled?: boolean;
}

export function LanguageSelect({
  value,
  onChange,
  options,
  disabled = false,
}: LanguageSelectProps) {
  return (
    <div className="bs-cs-language-select">
      <select
        id="bs-cs-lang-select"
        aria-label="Select programming language"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: "4px 10px",
          borderRadius: "6px",
          border: "1px solid var(--bs-ui-line, #d7e8e4)",
          background: "var(--bs-ui-surface, #ffffff)",
          color: "var(--bs-ui-ink, #123333)",
          fontSize: "0.78rem",
          fontWeight: 700,
          fontFamily: "var(--bs-ui-font-sans, inherit)",
          cursor: "pointer",
          outline: "none",
          transition: "border-color 0.15s ease",
        }}
        onFocus={(e) => (e.target.style.borderColor = "var(--bs-ui-brand, #0b6763)")}
        onBlur={(e) => (e.target.style.borderColor = "var(--bs-ui-line, #d7e8e4)")}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
