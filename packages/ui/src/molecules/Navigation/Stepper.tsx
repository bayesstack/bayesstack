import React, { forwardRef } from "react";
import { Icon, IconName } from "../../atoms/Icons";
import "./Navigation.css";

export interface StepItem {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: IconName | React.ReactNode;
  error?: boolean;
}

export interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Current 0-indexed active step
   * @default 0
   */
  activeStep?: number;

  /**
   * Step definitions
   */
  steps: StepItem[];

  /**
   * Layout direction
   * @default 'horizontal'
   */
  orientation?: "horizontal" | "vertical";

  /**
   * Callback fired when a step header is clicked
   */
  onStepClick?: (stepIndex: number) => void;
}

export const Stepper = forwardRef<HTMLDivElement, StepperProps>(
  (
    {
      activeStep = 0,
      steps = [],
      orientation = "horizontal",
      onStepClick,
      className = "",
      style,
      ...props
    },
    ref
  ) => {
    const renderStepIcon = (
      step: StepItem,
      idx: number,
      isCompleted: boolean,
      isActive: boolean,
      isError: boolean
    ) => {
      if (isError) {
        return <Icon name="CancelCircle" size="sm" />;
      }
      if (isCompleted) {
        return <Icon name="Check" size="sm" strokeWidth={3} />;
      }
      if (step.icon) {
        if (typeof step.icon === "string") {
          return <Icon name={step.icon as IconName} size="sm" />;
        }
        return step.icon;
      }
      return idx + 1;
    };

    return (
      <div
        ref={ref}
        className={[
          "bs-stepper",
          `bs-stepper--${orientation}`,
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={style}
        {...props}
      >
        {steps.map((step, idx) => {
          const isCompleted = idx < activeStep;
          const isActive = idx === activeStep;
          const isError = Boolean(step.error);
          const isLast = idx === steps.length - 1;

          return (
            <React.Fragment key={idx}>
              <div
                className={[
                  "bs-step",
                  isActive ? "bs-step--active" : "",
                  isCompleted ? "bs-step--completed" : "",
                  isError ? "bs-step--error" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => onStepClick && onStepClick(idx)}
                style={{ cursor: onStepClick ? "pointer" : "default" }}
              >
                <div className="bs-step-icon-circle">
                  {renderStepIcon(step, idx, isCompleted, isActive, isError)}
                </div>
                <div className="bs-step-text">
                  <div className="bs-step-title">{step.title}</div>
                  {step.description && (
                    <div className="bs-step-description">
                      {step.description}
                    </div>
                  )}
                </div>
              </div>

              {!isLast && orientation === "horizontal" && (
                <div
                  className={[
                    "bs-step-line",
                    isCompleted ? "bs-step-line--completed" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  }
);

Stepper.displayName = "Stepper";
