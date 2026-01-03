interface Country {
  id: string
  name: { en: string; he: string }
  flag: string
  available: boolean
}

export const countries: Country[] = [
  { id: 'morocco', name: { en: 'Morocco', he: 'מרוקו' }, flag: '🇲🇦', available: true },
  { id: 'tanzania', name: { en: 'Tanzania / Zanzibar', he: 'טנזניה / זנזיבר' }, flag: '🇹🇿', available: true },
  { id: 'sri-lanka', name: { en: 'Sri Lanka', he: 'סרי לנקה' }, flag: '🇱🇰', available: false }
]

