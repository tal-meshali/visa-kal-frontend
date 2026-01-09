import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../../test/utils'
import { Button } from '../Button'

describe('Button', () => {
  it('renders button with children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('applies primary variant by default', () => {
    const { container } = render(<Button>Test</Button>)
    const button = container.querySelector('.btn-primary')
    expect(button).toBeInTheDocument()
  })

  it('applies secondary variant when specified', () => {
    const { container } = render(<Button variant="secondary">Test</Button>)
    const button = container.querySelector('.btn-secondary')
    expect(button).toBeInTheDocument()
  })

  it('applies large size class when specified', () => {
    const { container } = render(<Button size="large">Test</Button>)
    const button = container.querySelector('.btn-large')
    expect(button).toBeInTheDocument()
  })

  it('applies fullWidth class when specified', () => {
    const { container } = render(<Button fullWidth>Test</Button>)
    const button = container.querySelector('.btn-full-width')
    expect(button).toBeInTheDocument()
  })

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    screen.getByText('Click me').click()
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies custom className', () => {
    const { container } = render(<Button className="custom-class">Test</Button>)
    const button = container.querySelector('.custom-class')
    expect(button).toBeInTheDocument()
  })

  it('passes through other button props', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByText('Disabled')).toBeDisabled()
  })
})

