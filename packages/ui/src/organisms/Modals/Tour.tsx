import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "../../atoms/Buttons/Button";
import { IconButton } from "../../atoms/Buttons/IconButton";
import "./Modals.css";

export interface TourStep {
  /**
   * CSS selector for anchor element (e.g. '#header-btn', '.sidebar-logo')
   */
  target: string;

  /**
   * Step title heading
   */
  title: React.ReactNode;

  /**
   * Step description content body
   */
  content: React.ReactNode;
}

export interface TourProps {
  /**
   * Controls tour walkthrough visibility
   */
  opened: boolean;

  /**
   * Close / finish tour callback
   */
  onClose: () => void;

  /**
   * Array of tour walkthrough steps
   */
  steps: TourStep[];

  /**
   * Initial active step index (0-indexed)
   * @default 0
   */
  initialStep?: number;

  /**
   * Additional root container CSS class string
   */
  className?: string;

  /**
   * Slot class names object for granular component targeted overrides
   */
  classNames?: TourClassNames;
}

export interface TourClassNames {
  root?: string;
  overlay?: string;
  spotlight?: string;
  card?: string;
  header?: string;
  title?: string;
  body?: string;
  footer?: string;
  progress?: string;
  actions?: string;
}

/**
 * Tour renders an interactive product onboarding walkthrough overlay that highlights DOM elements
 * by CSS selector using dynamic bounding rectangle cutouts and anchored popover instruction cards.
 */
export function Tour({
  opened,
  onClose,
  steps = [],
  initialStep = 0,
  className = "",
  classNames,
}: TourProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(initialStep);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const activeStep = steps[currentStepIndex];

  // Query DOM target element for active step and retrieve its screen bounding box coordinates
  useEffect(() => {
    if (!opened || !activeStep) return;

    const element = document.querySelector(activeStep.target);
    if (element) {
      const rect = element.getBoundingClientRect();
      setTargetRect(rect);
    } else {
      setTargetRect(null);
    }
  }, [opened, currentStepIndex, activeStep]);

  if (!opened || !activeStep) return null;

  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onClose();
    } else {
      setCurrentStepIndex((idx) => idx + 1);
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStepIndex((idx) => idx - 1);
    }
  };

  // Clamp popover position inside viewport boundaries (falls back to viewport center if DOM element is absent)
  const popoverStyle: React.CSSProperties = targetRect
    ? {
        position: "fixed",
        top: Math.min(targetRect.bottom + 12, window.innerHeight - 220),
        left: Math.max(Math.min(targetRect.left, window.innerWidth - 340), 16),
      }
    : {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };

  const tourContent = (
    <div className={["bs-tour-overlay", className, classNames?.root, classNames?.overlay].filter(Boolean).join(" ")}>
      {/* Spotlight cutout highlight box padded 4px around target element */}
      {targetRect && (
        <div
          className={["bs-tour-spotlight", classNames?.spotlight].filter(Boolean).join(" ")}
          style={{
            top: targetRect.top - 4,
            left: targetRect.left - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
          }}
        />
      )}

      {/* Popover Step Card */}
      <div className={["bs-tour-card", classNames?.card].filter(Boolean).join(" ")} style={popoverStyle}>
        <div className={["bs-tour-header", classNames?.header].filter(Boolean).join(" ")}>
          <h4 className={["bs-tour-title", classNames?.title].filter(Boolean).join(" ")}>{activeStep.title}</h4>
          <IconButton
            name="Close"
            label="Close tour"
            size="xs"
            variant="transparent"
            onClick={onClose}
          />
        </div>

        <div className={["bs-tour-body", classNames?.body].filter(Boolean).join(" ")}>{activeStep.content}</div>

        <div className={["bs-tour-footer", classNames?.footer].filter(Boolean).join(" ")}>
          <span className={["bs-tour-progress", classNames?.progress].filter(Boolean).join(" ")}>
            Step {currentStepIndex + 1} of {steps.length}
          </span>
          <div className={["bs-tour-actions", classNames?.actions].filter(Boolean).join(" ")}>
            {!isFirstStep && (
              <Button size="xs" variant="secondary" onClick={handleBack}>
                Back
              </Button>
            )}
            <Button size="xs" variant="primary" onClick={handleNext}>
              {isLastStep ? "Finish" : "Next"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  if (typeof document !== "undefined") {
    return createPortal(tourContent, document.body);
  }

  return tourContent;
}
