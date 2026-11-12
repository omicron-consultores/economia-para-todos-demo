/**
 * Registration data model for the demo.
 *
 * Mirrors the SIN "Registro Nacional de Contribuyentes" (RND 10-2500-00000017)
 * for a persona natural: identity contrasted with SEGIP, verified contact,
 * CAEB-SIN activity, three domicilios with geo-reference, and a short
 * business questionnaire. Identity can arrive pre-verified from Ciudadanía
 * Digital (AGETIC). All values are fictional; see docs/investigacion-realismo.md.
 */

import { maria } from './mock-data'

export type VerificationMethod = 'ciudadania' | 'segip'

export type RegistrationValues = {
  verification: VerificationMethod | null
  cedula: string
  complement: string
  birthDate: string
  firstName: string
  lastName: string
  email: string
  phone: string
  activityCode: string
  activity: string
  sectorId: string
  sector: string
  department: string
  municipality: string
  zone: string
  reference: string
  lat: number | null
  lng: number | null
  worksAtHome: boolean
  homeZone: string
  homeReference: string
  sales: string
  capitalRange: string
  workers: string
  paymentMethods: string[]
  invoiceDemand: string
  consentSin: boolean
  consentShare: boolean
  consentCredit: boolean
  nit: string
  tramite: string
  registeredAt: string
  elapsedSeconds: number
}

/**
 * Demo subset of the CAEB-SIN activity classifier (aligned with INE CAEB /
 * CIIU Rev. 4). Codes are the 4-digit CIIU class; the real SIN catalog is
 * larger and uses its own sector → subsector → actividad hierarchy.
 */
export const caebActivities = [
  { code: '1410', label: 'Confección de prendas de vestir', keywords: 'costura ropa textil taller polleras uniformes', sectorId: 'textil' },
  { code: '1392', label: 'Confección de artículos textiles para el hogar', keywords: 'cortinas manteles sábanas textil', sectorId: 'textil' },
  { code: '1430', label: 'Tejido de prendas de punto', keywords: 'tejido chompas lana alpaca', sectorId: 'textil' },
  { code: '4771', label: 'Venta al por menor de prendas de vestir', keywords: 'tienda ropa venta feria', sectorId: 'comercio' },
  { code: '4711', label: 'Venta al por menor en tiendas de barrio', keywords: 'tienda abarrotes almacén', sectorId: 'comercio' },
  { code: '4781', label: 'Venta de alimentos en puestos de mercado', keywords: 'mercado puesto verduras feria', sectorId: 'comercio' },
  { code: '5610', label: 'Restaurantes y venta de comidas', keywords: 'comida pensión restaurante salteñas', sectorId: 'gastronomia' },
  { code: '1071', label: 'Elaboración de pan y masas', keywords: 'panadería pan repostería', sectorId: 'gastronomia' },
  { code: '9602', label: 'Peluquería y tratamientos de belleza', keywords: 'peluquería salón belleza barbería uñas', sectorId: 'belleza' },
  { code: '9529', label: 'Reparación de efectos personales', keywords: 'reparación zapatos costura arreglos', sectorId: 'servicios' },
  { code: '4520', label: 'Mantenimiento y reparación de vehículos', keywords: 'mecánico taller autos', sectorId: 'servicios' },
  { code: '4921', label: 'Transporte urbano de pasajeros', keywords: 'minibús trufi taxi transporte', sectorId: 'transporte' },
  { code: '1520', label: 'Fabricación de calzado', keywords: 'zapatos calzado cuero', sectorId: 'artesania' },
  { code: '3100', label: 'Fabricación de muebles', keywords: 'carpintería muebles madera', sectorId: 'artesania' },
  { code: '0113', label: 'Cultivo de hortalizas y tubérculos', keywords: 'papa hortalizas agricultura', sectorId: 'agro' },
  { code: '4791', label: 'Venta al por menor por internet', keywords: 'internet redes sociales tienda en línea whatsapp', sectorId: 'digital' },
] as const

const sectorNames: Record<string, string> = {
  comercio: 'Comercio minorista', gastronomia: 'Gastronomía y alimentos', textil: 'Textil y confección',
  servicios: 'Servicios y oficios', transporte: 'Transporte', agro: 'Producción agropecuaria',
  artesania: 'Artesanía y manufactura', digital: 'Comercio y servicios digitales', belleza: 'Belleza y cuidado personal',
}
export const sectorName = (sectorId: string) => sectorNames[sectorId] ?? ''

const normalize = (value: string) => value.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
export function searchActivities(query: string) {
  const terms = normalize(query).split(/\s+/).filter(Boolean)
  if (!terms.length) return caebActivities.slice(0, 5)
  return caebActivities.filter((item) => {
    const haystack = normalize(`${item.code} ${item.label} ${item.keywords}`)
    return terms.every((term) => haystack.includes(term))
  })
}

export const capitalRanges = ['Hasta Bs 12.000', 'Bs 12.001 – 30.000', 'Bs 30.001 – 60.000', 'Más de Bs 60.000'] as const
export const workerOptions = ['Solo yo', '2 a 3', '4 a 10'] as const
export const paymentOptions = ['Efectivo', 'QR', 'Transferencia'] as const
export const invoiceOptions = ['Sí', 'A veces', 'No'] as const

/** Proposed program model (not current law): one monthly contribution. */
export const CONTRIBUTION_RATE = 0.03
export const ANNUAL_SALES_LIMIT_BS = 400000
export const parseAmount = (value: string) => Number(value.replace(/\D/g, '')) || 0
export const contributionFor = (monthlySalesBs: number) => Math.round(monthlySalesBs * CONTRIBUTION_RATE)

export const isValidPhone = (value: string) => /^[67]\d{7}$/.test(value.trim())
export const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())
export const isValidCedula = (value: string) => /^\d{5,9}$/.test(value.trim())

/** Approximate municipal centroids, used to place the map pin. */
export const municipalityCenters: Record<string, [number, number]> = {
  Trinidad: [-14.833, -64.9], Riberalta: [-11.0, -66.067], Guayaramerín: [-10.826, -65.357],
  Sucre: [-19.047, -65.259], Monteagudo: [-19.799, -63.957], Camargo: [-20.64, -65.21],
  Cochabamba: [-17.389, -66.157], Quillacollo: [-17.392, -66.278], Sacaba: [-17.398, -66.04],
  'La Paz': [-16.5, -68.15], 'El Alto': [-16.51, -68.163], Viacha: [-16.654, -68.302], Achocalla: [-16.574, -68.165], Copacabana: [-16.166, -69.086],
  Oruro: [-17.969, -67.115], Challapata: [-18.9, -66.774], Huanuni: [-18.289, -66.838],
  Cobija: [-11.027, -68.769], Porvenir: [-11.25, -68.7], 'Puerto Rico': [-11.103, -67.553],
  Potosí: [-19.583, -65.753], Uyuni: [-20.46, -66.825], Villazón: [-22.087, -65.596],
  'Santa Cruz de la Sierra': [-17.784, -63.182], Montero: [-17.338, -63.25], Warnes: [-17.511, -63.166], Cotoca: [-17.753, -63.0],
  Tarija: [-21.535, -64.729], Yacuiba: [-22.015, -63.678], Bermejo: [-22.732, -64.335],
}

/** Demo NIT: CI plus three check digits. The real SIN format is not public. */
export const demoNit = (cedula: string) => `${cedula.trim()}01${(cedula.trim().split('').reduce((sum, digit) => sum + Number(digit), 0) % 10)}`
export const demoTramite = (cedula: string) => `RNC-2026-${cedula.trim().slice(-5).padStart(5, '0')}`

export const createEmptyRegistration = (): RegistrationValues => ({
  verification: null, cedula: '', complement: '', birthDate: '', firstName: '', lastName: '', email: '', phone: '',
  activityCode: '', activity: '', sectorId: '', sector: '',
  department: '', municipality: '', zone: '', reference: '', lat: null, lng: null,
  worksAtHome: true, homeZone: '', homeReference: '',
  sales: '', capitalRange: '', workers: '', paymentMethods: [], invoiceDemand: '',
  consentSin: false, consentShare: false, consentCredit: false,
  nit: '', tramite: '', registeredAt: '', elapsedSeconds: 0,
})

/** María Quispe as returned by Ciudadanía Digital / filled by the presenter. */
export const demoIdentity = {
  cedula: '8347621', complement: '', birthDate: '1992-03-14',
  firstName: maria.firstName, lastName: maria.lastName,
  email: 'maria.quispe@ejemplo.bo', phone: '71234567',
} as const

const demoActivity = caebActivities[0]
export const demoActivityValues = {
  activityCode: demoActivity.code, activity: demoActivity.label, sectorId: demoActivity.sectorId, sector: sectorName(demoActivity.sectorId),
} as const

export const demoLocation = {
  department: maria.department, municipality: maria.municipality, zone: 'Villa Adela',
  reference: 'Calle 3, a media cuadra del mercado, puerta verde', lat: -16.5118, lng: -68.1594,
  worksAtHome: true, homeZone: '', homeReference: '',
} as const

export const demoBusiness = {
  sales: String(maria.monthlySalesBs), capitalRange: capitalRanges[1], workers: workerOptions[0],
  paymentMethods: ['Efectivo', 'QR'], invoiceDemand: 'A veces',
}

export const demoRegistration: RegistrationValues = {
  ...createEmptyRegistration(),
  verification: 'ciudadania', ...demoIdentity, ...demoActivityValues, ...demoLocation, ...demoBusiness,
  consentSin: true, consentShare: true, consentCredit: true,
  nit: demoNit(demoIdentity.cedula), tramite: demoTramite(demoIdentity.cedula), registeredAt: '2026-04-08', elapsedSeconds: 222,
}
