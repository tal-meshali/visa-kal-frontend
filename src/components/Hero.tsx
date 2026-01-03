import './Hero.css'
import { Button } from './Button'

interface HeroProps {
  language: 'en' | 'he'
  translations: {
    hero: {
      badge: string
      title: string
      titleHighlight: string
      description: string
      startApplication: string
      learnMore: string
    }
    common?: {
      application?: string
      approved?: string
      travelReady?: string
    }
  }
}

export const Hero = ({ language, translations }: HeroProps) => {
  return (
    <section className="hero" id="home">
      <div className="hero-content">
        <div className="hero-badge">
          <span>{translations.hero.badge}</span>
        </div>
        <h1 className="hero-title">
          {translations.hero.title}{' '}
          <span className="gradient-text">{translations.hero.titleHighlight}</span>
        </h1>
        <p className="hero-description">
          {translations.hero.description}
        </p>
        <div className="hero-buttons">
          <Button variant="primary">{translations.hero.startApplication}</Button>
          <Button variant="secondary">{translations.hero.learnMore}</Button>
        </div>
      </div>
      <div className="hero-visual">
        <div className="floating-card card-1">
          <div className="card-icon">📋</div>
          <div className="card-text">{translations.common?.application || (language === 'en' ? 'Application' : 'בקשה')}</div>
        </div>
        <div className="floating-card card-2">
          <div className="card-icon">✅</div>
          <div className="card-text">{translations.common?.approved || (language === 'en' ? 'Approved' : 'אושר')}</div>
        </div>
        <div className="floating-card card-3">
          <div className="card-icon">✈️</div>
          <div className="card-text">{translations.common?.travelReady || (language === 'en' ? 'Travel Ready' : 'מוכן לנסיעה')}</div>
        </div>
      </div>
    </section>
  )
}

