import React, { useState, useEffect } from "react";
import { Button } from "../../atoms/Buttons/Button";
import { LatexText } from "../../atoms/Typography/LatexText";
import "./Editor.css";

export interface LatexModalProps {
  open: boolean;
  onClose: () => void;
  onInsertFormula: (formula: string, displayBlock: boolean) => void;
  initialFormula?: string;
  initialBlock?: boolean;

  /**
   * Additional root container CSS class string
   */
  className?: string;

  /**
   * Slot class names object for granular component targeted overrides
   */
  classNames?: LatexModalClassNames;
}

export interface LatexModalClassNames {
  root?: string;
  container?: string;
  header?: string;
  title?: string;
  form?: string;
  field?: string;
  textarea?: string;
  preview?: string;
  actions?: string;
}

const PRESET_FORMULAS = [
  { label: "Fraction", code: "\\frac{a}{b}" },
  { label: "Integral", code: "\\int_{0}^{\\infty} f(x) dx" },
  { label: "Summation", code: "\\sum_{i=1}^{n} x_i" },
  { label: "Square Root", code: "\\sqrt{x^2 + y^2}" },
  { label: "Matrix", code: "\\begin{matrix} a & b \\\\ c & d \\end{matrix}" },
  { label: "Sub/Superscript", code: "x_i^2 + y_i^2 = z^2" },
];

export function LatexModal({
  open,
  onClose,
  onInsertFormula,
  initialFormula = "\\int_{0}^{\\infty} e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}",
  initialBlock = false,
  className = "",
  classNames,
}: LatexModalProps) {
  const [formula, setFormula] = useState(initialFormula);
  const [isBlock, setIsBlock] = useState(initialBlock);

  useEffect(() => {
    if (open) {
      setFormula(initialFormula);
      setIsBlock(initialBlock);
    }
  }, [open, initialFormula, initialBlock]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formula.trim()) return;
    onInsertFormula(formula.trim(), isBlock);
    onClose();
  };

  return (
    <div className={["bs-editor-modal-overlay", className, classNames?.root].filter(Boolean).join(" ")} onClick={onClose}>
      <div
        className={["bs-editor-modal-container", "bs-latex-modal-container", classNames?.container].filter(Boolean).join(" ")}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={["bs-editor-modal-header", classNames?.header].filter(Boolean).join(" ")}>
          <h3 className={["bs-editor-modal-title", classNames?.title].filter(Boolean).join(" ")}>Insert LaTeX Math Equation</h3>
          <button className="bs-editor-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className={["bs-editor-modal-form", classNames?.form].filter(Boolean).join(" ")}>
          {/* Preset Formulas toolbar */}
          <div className="bs-latex-presets">
            <span className="bs-latex-presets-label">Presets:</span>
            <div className="bs-latex-presets-list">
              {PRESET_FORMULAS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  className="bs-latex-preset-chip"
                  onClick={() => setFormula(preset.code)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Formula Code Field */}
          <div className={["bs-editor-modal-field", classNames?.field].filter(Boolean).join(" ")}>
            <label className="bs-editor-modal-label">LaTeX Formula Code</label>
            <textarea
              className={["bs-editor-modal-input", "bs-latex-textarea", classNames?.textarea].filter(Boolean).join(" ")}
              rows={3}
              value={formula}
              onChange={(e) => setFormula(e.target.value)}
              placeholder="e.g. \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}"
              autoFocus
            />
          </div>

          {/* Render Mode Checkbox */}
          <div className="bs-latex-mode-selector">
            <label className="bs-latex-checkbox-label">
              <input
                type="checkbox"
                checked={isBlock}
                onChange={(e) => setIsBlock(e.target.checked)}
              />
              Display as centered block equation ($$ ... $$)
            </label>
          </div>

          {/* Live KaTeX Preview Box */}
          <div className={["bs-latex-preview-box", classNames?.preview].filter(Boolean).join(" ")}>
            <span className="bs-latex-preview-title">Live Preview</span>
            <div className="bs-latex-preview-content">
              {formula.trim() ? (
                <LatexText math={formula} block={isBlock} inline={!isBlock} errorMode="fallback" />
              ) : (
                <span className="bs-latex-preview-empty">Type a formula above to see preview</span>
              )}
            </div>
          </div>

          {/* Modal Actions */}
          <div className={["bs-editor-modal-actions", classNames?.actions].filter(Boolean).join(" ")}>
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={!formula.trim()}>
              Insert Equation
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
