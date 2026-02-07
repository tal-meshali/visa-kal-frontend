import { useEffect, useRef } from "react";
import { useLanguage } from "../contexts/useLanguage";
import type { ContrastMode } from "../types/accessibility";
import "./AccessibilityOptionsPanel.css";

export type FontSizeValue = "100" | "110" | "125" | "150";

type FontSizeOption =
  | { value: FontSizeValue; labelKey: "textSizeDefault"; label?: never }
  | { value: FontSizeValue; label: string; labelKey?: never };

const FONT_SIZE_OPTIONS: FontSizeOption[] = [
  { value: "100", labelKey: "textSizeDefault" },
  { value: "110", label: "110%" },
  { value: "125", label: "125%" },
  { value: "150", label: "150%" },
];

interface AccessibilityOptionsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  contrastMode: ContrastMode;
  onContrastChange: (value: ContrastMode) => void;
  fontSize: FontSizeValue;
  onFontSizeChange: (value: FontSizeValue) => void;
  reduceMotion: boolean;
  onReduceMotionChange: (value: boolean) => void;
  monochrome: boolean;
  onMonochromeChange: (value: boolean) => void;
  reportIssueUrl?: string;
}

export const AccessibilityOptionsPanel = ({
  isOpen,
  onClose,
  contrastMode,
  onContrastChange,
  fontSize,
  onFontSizeChange,
  reduceMotion,
  onReduceMotionChange,
  monochrome,
  onMonochromeChange,
  reportIssueUrl = "mailto:support@visa-kal.com?subject=Accessibility%20issue",
}: AccessibilityOptionsPanelProps) => {
  const { t } = useLanguage();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    closeButtonRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent): void => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="a11y-panel-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="a11y-panel-title"
    >
      <div ref={panelRef} className="a11y-panel">
        <h2 id="a11y-panel-title" className="a11y-panel-title">
          {t.a11y.title}
        </h2>

        <div className="a11y-panel-option">
          <span className="a11y-panel-label" id="a11y-contrast-label">
            {t.a11y.contrast}
          </span>
          <div
            className="a11y-panel-options"
            role="group"
            aria-labelledby="a11y-contrast-label"
          >
            <label className="a11y-panel-radio">
              <input
                type="radio"
                name="contrast"
                value="standard"
                checked={contrastMode === "standard"}
                onChange={() => onContrastChange("standard")}
              />
              <span>{t.a11y.contrastStandard}</span>
            </label>
            <label className="a11y-panel-radio">
              <input
                type="radio"
                name="contrast"
                value="high"
                checked={contrastMode === "high"}
                onChange={() => onContrastChange("high")}
              />
              <span>{t.a11y.contrastHigh}</span>
            </label>
            <label className="a11y-panel-radio">
              <input
                type="radio"
                name="contrast"
                value="low"
                checked={contrastMode === "low"}
                onChange={() => onContrastChange("low")}
              />
              <span>{t.a11y.contrastLow}</span>
            </label>
          </div>
        </div>

        <div className="a11y-panel-option">
          <span className="a11y-panel-label" id="a11y-text-size-label">
            {t.a11y.textSize}
          </span>
          <div
            className="a11y-panel-options"
            role="group"
            aria-labelledby="a11y-text-size-label"
          >
            {FONT_SIZE_OPTIONS.map((opt) => (
              <label key={opt.value} className="a11y-panel-radio">
                <input
                  type="radio"
                  name="fontSize"
                  value={opt.value}
                  checked={fontSize === opt.value}
                  onChange={() => onFontSizeChange(opt.value as FontSizeValue)}
                />
                <span>{opt.label ?? (opt.labelKey ? (t.a11y as Record<string, string>)[opt.labelKey] : "")}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="a11y-panel-option">
          <label className="a11y-panel-toggle">
            <input
              type="checkbox"
              checked={reduceMotion}
              onChange={(e) => onReduceMotionChange(e.target.checked)}
              aria-describedby="a11y-reduce-motion-desc"
            />
            <span>{t.a11y.reduceMotion}</span>
          </label>
          <p id="a11y-reduce-motion-desc" className="a11y-panel-desc">
            {t.a11y.reduceMotionDesc}
          </p>
        </div>

        <div className="a11y-panel-option">
          <label className="a11y-panel-toggle">
            <input
              type="checkbox"
              checked={monochrome}
              onChange={(e) => onMonochromeChange(e.target.checked)}
              aria-describedby="a11y-monochrome-desc"
            />
            <span>{t.a11y.monochrome}</span>
          </label>
          <p id="a11y-monochrome-desc" className="a11y-panel-desc">
            {t.a11y.monochromeDesc}
          </p>
        </div>

        {reportIssueUrl && (
          <div className="a11y-panel-option">
            <a
              href={reportIssueUrl}
              className="a11y-panel-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t.a11y.reportIssue}
            </a>
          </div>
        )}

        <button
          ref={closeButtonRef}
          type="button"
          className="a11y-panel-close"
          onClick={onClose}
          aria-label={t.a11y.close}
        >
          {t.a11y.close}
        </button>
      </div>
    </div>
  );
};
