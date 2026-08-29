import React, { forwardRef, useState } from "react";
import { Icon } from "../../atoms/Icons";
import { IconButton } from "../../atoms/Buttons/IconButton";
import { Select } from "../Selects/Select";
import "./Navigation.css";

export interface PagerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /**
   * Active page index (1-indexed)
   * @default 1
   */
  page?: number;

  /**
   * Total number of pages available
   * @default 10
   */
  totalPages: number;

  /**
   * Items per page size
   * @default 10
   */
  pageSize?: number;

  /**
   * Available page size options array (e.g. [10, 20, 50, 100])
   */
  pageSizeOptions?: number[];

  /**
   * Callback fired when active page changes
   */
  onPageChange?: (page: number) => void;

  /**
   * Callback fired when page size changes
   */
  onPageSizeChange?: (pageSize: number) => void;

  /**
   * Displays 'Go to' direct page input box
   * @default false
   */
  withGoTo?: boolean;

  /**
   * Displays page size selector dropdown
   * @default false
   */
  withSizeSelector?: boolean;

  /**
   * Displays First (|‹) and Last (›|) edge control buttons
   * @default false
   */
  withEdges?: boolean;

  /**
   * Displays Prev (‹) and Next (›) page controls
   * @default true
   */
  withControls?: boolean;

  /**
   * Number of adjacent sibling page buttons to show around current page
   * @default 1
   */
  siblings?: number;

  /**
   * Disables pagination buttons
   * @default false
   */
  disabled?: boolean;

  /**
   * Pagination layout variant ('paged' = numeric buttons, 'compact' = 'Page X of Y' text)
   * @default 'paged'
   */
  variant?: "paged" | "compact";

  /**
   * Additional root container CSS class string
   */
  className?: string;

  /**
   * Slot class names object for granular component targeted overrides
   */
  classNames?: PagerClassNames;
}

export interface PagerClassNames {
  root?: string;
  controls?: string;
  button?: string;
  activeButton?: string;
  sizeSelector?: string;
  goTo?: string;
}

export const Pager = forwardRef<HTMLDivElement, PagerProps>(
  (
    {
      page: controlledPage,
      totalPages = 10,
      pageSize = 10,
      pageSizeOptions = [10, 20, 50, 100],
      onPageChange,
      onPageSizeChange,
      withGoTo = false,
      withSizeSelector = false,
      withEdges = false,
      withControls = true,
      siblings = 1,
      disabled = false,
      variant = "paged",
      className = "",
      classNames,
      style,
      ...props
    },
    ref
  ) => {
    const isControlled = controlledPage !== undefined;
    const [internalPage, setInternalPage] = useState<number>(1);
    const activePage = isControlled ? controlledPage : internalPage;

    const [goToInputValue, setGoToInputValue] = useState<string>("");

    const handleSetPage = (newPage: number) => {
      if (disabled) return;
      const clamped = Math.max(1, Math.min(newPage, totalPages));
      if (!isControlled) {
        setInternalPage(clamped);
      }
      if (onPageChange) {
        onPageChange(clamped);
      }
    };

    const handleGoToSubmit = () => {
      const parsed = parseInt(goToInputValue, 10);
      if (!isNaN(parsed)) {
        handleSetPage(parsed);
      } else {
        // Reset input string back to valid current activePage if user typed invalid non-numeric text
        setGoToInputValue(String(activePage));
      }
    };

    // Dynamic pagination window calculation: calculates sibling offsets around active page
    // and collapses left/right overflow bounds into ellipsis ('...') items.
    const getPageRange = () => {
      const totalNumbers = siblings * 2 + 3; // siblings + current + first + last
      const totalBlocks = totalNumbers + 2; // + 2 ellipsis blocks

      if (totalPages <= totalBlocks) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
      }

      const leftSiblingIndex = Math.max(activePage - siblings, 1);
      const rightSiblingIndex = Math.min(activePage + siblings, totalPages);

      const shouldShowLeftDots = leftSiblingIndex > 2;
      const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

      const firstPageIndex = 1;
      const lastPageIndex = totalPages;

      if (!shouldShowLeftDots && shouldShowRightDots) {
        const leftItemCount = 3 + 2 * siblings;
        const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
        return [...leftRange, "...", totalPages];
      }

      if (shouldShowLeftDots && !shouldShowRightDots) {
        const rightItemCount = 3 + 2 * siblings;
        const rightRange = Array.from(
          { length: rightItemCount },
          (_, i) => totalPages - rightItemCount + i + 1
        );
        return [firstPageIndex, "...", ...rightRange];
      }

      if (shouldShowLeftDots && shouldShowRightDots) {
        const middleRange = Array.from(
          { length: rightSiblingIndex - leftSiblingIndex + 1 },
          (_, i) => leftSiblingIndex + i
        );
        return [firstPageIndex, "...", ...middleRange, "...", lastPageIndex];
      }

      return [];
    };

    const pageItems = getPageRange();

    return (
      <div
        ref={ref}
        className={[
          "bs-pager-container",
          disabled ? "bs-pager-container--disabled" : "",
          className,
          classNames?.root,
        ]
          .filter(Boolean)
          .join(" ")}
        style={style}
        {...props}
      >
        {/* Page Size Dropdown Selector */}
        {withSizeSelector && (
          <div className={["bs-pager-size-selector", classNames?.sizeSelector].filter(Boolean).join(" ")}>
            <span className="bs-pager-label">Show</span>
            <Select
              value={String(pageSize)}
              disabled={disabled}
              options={pageSizeOptions.map((opt) => ({
                label: `${opt} / page`,
                value: String(opt),
              }))}
              onValueChange={(val) => {
                if (onPageSizeChange) onPageSizeChange(Number(val));
              }}
              style={{ width: 120 }}
            />
          </div>
        )}

        {/* Numeric Page Buttons or Compact Text */}
        <div className={["bs-pager-controls-row", classNames?.controls].filter(Boolean).join(" ")}>
          {/* First Page Edge (|‹) */}
          {withEdges && (
            <IconButton
              name="ArrowLeft"
              label="First Page"
              size="xs"
              variant="outline"
              disabled={disabled || activePage <= 1}
              onClick={() => handleSetPage(1)}
            />
          )}

          {/* Previous Page Control (‹) */}
          {withControls && (
            <IconButton
              name="ChevronLeft"
              label="Previous Page"
              size="xs"
              variant="outline"
              disabled={disabled || activePage <= 1}
              onClick={() => handleSetPage(activePage - 1)}
            />
          )}

          {/* Page Items / Numbers */}
          {variant === "compact" ? (
            <span className="bs-pager-compact-text">
              Page <strong>{activePage}</strong> of <strong>{totalPages}</strong>
            </span>
          ) : (
            <div className="bs-pager-number-list">
              {pageItems.map((item, idx) => {
                if (item === "...") {
                  return (
                    <span key={`dots-${idx}`} className="bs-pager-dots">
                      &hellip;
                    </span>
                  );
                }
                const pageNum = Number(item);
                const isActive = pageNum === activePage;

                return (
                  <button
                    key={pageNum}
                    type="button"
                    disabled={disabled}
                    className={[
                      "bs-pager-btn",
                      isActive ? "bs-pager-btn--active" : "",
                      classNames?.button,
                      isActive ? classNames?.activeButton : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => handleSetPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
          )}

          {/* Next Page Control (›) */}
          {withControls && (
            <IconButton
              name="ChevronRight"
              label="Next Page"
              size="xs"
              variant="outline"
              disabled={disabled || activePage >= totalPages}
              onClick={() => handleSetPage(activePage + 1)}
            />
          )}

          {/* Last Page Edge (›|) */}
          {withEdges && (
            <IconButton
              name="ArrowRight"
              label="Last Page"
              size="xs"
              variant="outline"
              disabled={disabled || activePage >= totalPages}
              onClick={() => handleSetPage(totalPages)}
            />
          )}
        </div>

        {/* 'Go to' Jump Input */}
        {withGoTo && (
          <form className={["bs-pager-goto-form", classNames?.goTo].filter(Boolean).join(" ")} onSubmit={handleGoToSubmit}>
            <span className="bs-pager-label">Go to</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              disabled={disabled}
              className="bs-pager-goto-input"
              aria-label="Go to page number"
              value={goToInputValue}
              onChange={(e) => setGoToInputValue(e.target.value)}
              onBlur={() => handleGoToSubmit}
            />
          </form>
        )}
      </div>
    );
  }
);

Pager.displayName = "Pager";
