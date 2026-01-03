import React from 'react'
import { Link } from 'react-router-dom'
import './CountriesSection.css'

interface Country {
  id: string
  name: { en: string; he: string }
  flag: string
  available: boolean
}

interface CountriesSectionProps {
  language: 'en' | 'he'
  translations: {
    countries: {
      title: string
      subtitle: string
      available: string
      upcoming: string
      select: string
    }
  }
  availableCountries: Country[]
  upcomingCountries: Country[]
}

export const CountriesSection = ({ language, translations, availableCountries, upcomingCountries }: CountriesSectionProps) => {
  return (
    <section className="countries" id="countries">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{translations.countries.title}</h2>
          <p className="section-subtitle">{translations.countries.subtitle}</p>
        </div>

        <div className="countries-group">
          <h3 className="countries-group-title">{translations.countries.available}</h3>
          <div className="countries-grid">
            {availableCountries.map((country) => (
              <Link
                key={country.id}
                to={`/apply/${country.id}`}
                className="country-card available"
              >
                <div className="country-flag">{country.flag}</div>
                <h3 className="country-name">{country.name[language]}</h3>
                <div className="country-select-btn">
                  {translations.countries.select}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {upcomingCountries.length > 0 && (
          <div className="countries-group">
            <h3 className="countries-group-title">{translations.countries.upcoming}</h3>
            <div className="countries-grid">
              {upcomingCountries.map((country) => (
                <div
                  key={country.id}
                  className="country-card upcoming"
                >
                  <div className="country-flag">{country.flag}</div>
                  <h3 className="country-name">{country.name[language]}</h3>
                  <div className="coming-soon-badge">{translations.countries.upcoming}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

