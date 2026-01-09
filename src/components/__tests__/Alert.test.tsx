import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '../../test/utils'
import { Alert } from '../Alert'

describe('Alert', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders when isOpen is true', () => {
    render(
      <Alert
        type="success"
        message="Test message"
        isOpen={true}
        onClose={vi.fn()}
      />
    )
    expect(screen.getByText('Test message')).toBeInTheDocument()
  })

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <Alert
        type="success"
        message="Test message"
        isOpen={false}
        onClose={vi.fn()}
      />
    )
    expect(container.firstChild).toBeNull()
  })

  it('displays success icon for success type', () => {
    render(
      <Alert
        type="success"
        message="Success"
        isOpen={true}
        onClose={vi.fn()}
      />
    )
    expect(screen.getByText('✓')).toBeInTheDocument()
  })

  it('displays error icon for error type', () => {
    render(
      <Alert type="error" message="Error" isOpen={true} onClose={vi.fn()} />
    )
    expect(screen.getByText('✕')).toBeInTheDocument()
  })

  it('displays info icon for info type', () => {
    render(<Alert type="info" message="Info" isOpen={true} onClose={vi.fn()} />)
    expect(screen.getByText('ℹ')).toBeInTheDocument()
  })

  it('calls onClose when overlay is clicked', () => {
    const handleClose = vi.fn()
    render(
      <Alert
        type="success"
        message="Test"
        isOpen={true}
        onClose={handleClose}
      />
    )
    const overlay = screen.getByText('Test').closest('.alert-overlay') as HTMLElement | null
    overlay?.click()
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('does not call onClose when alert content is clicked', () => {
    const handleClose = vi.fn()
    render(
      <Alert
        type="success"
        message="Test"
        isOpen={true}
        onClose={handleClose}
      />
    )
    const alertContent = screen.getByText('Test').closest('.alert') as HTMLElement | null
    alertContent?.click()
    expect(handleClose).not.toHaveBeenCalled()
  })

  it('auto-closes after default duration', () => {
    const handleClose = vi.fn()
    render(
      <Alert
        type="success"
        message="Test"
        isOpen={true}
        onClose={handleClose}
      />
    )
    vi.advanceTimersByTime(3000)
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('auto-closes after custom duration', () => {
    const handleClose = vi.fn()
    render(
      <Alert
        type="success"
        message="Test"
        isOpen={true}
        onClose={handleClose}
        duration={5000}
      />
    )
    vi.advanceTimersByTime(5000)
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('does not auto-close when duration is 0', () => {
    const handleClose = vi.fn()
    render(
      <Alert
        type="success"
        message="Test"
        isOpen={true}
        onClose={handleClose}
        duration={0}
      />
    )
    vi.advanceTimersByTime(10000)
    expect(handleClose).not.toHaveBeenCalled()
  })
})

