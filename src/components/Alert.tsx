import { useEffect } from 'react'
import './Alert.css'

interface AlertProps {
  type: 'success' | 'error' | 'info'
  message: string
  isOpen: boolean
  onClose: () => void
  duration?: number
}

export const Alert = ({ type, message, isOpen, onClose, duration = 3000 }: AlertProps) => {
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
    success: '✓',
    error: '✕',
    info: 'ℹ'
  }

  return (
    <div className="alert-overlay" onClick={onClose}>
      <div className={`alert alert-${type}`} onClick={(e) => e.stopPropagation()}>
        <div className="alert-content">
          <span className="alert-icon">{icons[type]}</span>
          <span className="alert-message">{message}</span>
        </div>
      </div>
    </div>
  )
}

