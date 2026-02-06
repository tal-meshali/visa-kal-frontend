import { useEffect } from "react";
import { useKeyDownActivate } from "../hooks/useKeyDownActivate";
import "./Alert.css";

interface AlertProps {
  type: 'success' | 'error' | 'info'
  message: string
  isOpen: boolean
  onClose: () => void
  duration?: number
}

export const Alert = ({ type, message, isOpen, onClose, duration = 3000 }: AlertProps) => {
  const handleOverlayKeyDown = useKeyDownActivate(onClose);
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [isOpen, duration, onClose])

  if (!isOpen) {
    return null
  }

  const icons: Record<string, string> = {
    success: "✓",
    error: "✕",
    info: "ℹ"
  };

  return (
    <div
      className="alert-overlay"
      role="button"
      tabIndex={0}
      aria-label="Dismiss"
      onClick={onClose}
      onKeyDown={handleOverlayKeyDown}
    >
      {/* Content area: stop propagation so overlay click doesn't close when clicking inside */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- dialog content must stop propagation */}
      <div
        className={`alert alert-${type}`}
        role="alertdialog"
        aria-live="polite"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <div className="alert-content">
          <span className="alert-icon">{icons[type]}</span>
          <span className="alert-message">{message}</span>
        </div>
      </div>
    </div>
  )
}

