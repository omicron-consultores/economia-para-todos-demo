import { opportunities, trainings } from './mock-data'

type CourseId = (typeof trainings)[number]['id']

export const courseTopics: Record<CourseId, readonly string[]> = {
  'obligaciones-tributarias': [
    'Qué es el NIT y para qué te sirve', 'Cómo se calcula y se paga tu aporte único',
    'Tu Buzón Tributario y tus notificaciones', 'Qué hacer si cambias de actividad o de domicilio',
  ],
  'educacion-financiera': [
    'Ingresos y gastos', 'Separar el dinero personal y del negocio', 'Ahorro para imprevistos',
    'Uso responsable del crédito', 'Planificación simple del negocio',
  ],
  'ventas-digitales': [
    'Preparar un catálogo de productos', 'Fotos y mensajes que comunican valor',
    'Atender consultas por WhatsApp', 'Cerrar una venta y coordinar la entrega',
  ],
  'gestion-costos': [
    'Identificar materiales y costos fijos', 'Valorar tu tiempo de trabajo',
    'Calcular el costo por producto', 'Definir el margen y el precio de venta',
  ],
  'servicio-cliente': [
    'Escuchar lo que necesita el cliente', 'Comunicar precios y plazos con claridad',
    'Resolver reclamos', 'Dar seguimiento y generar confianza',
  ],
}

/** Institutions that typically offer this content in Bolivia (see docs/investigacion-realismo.md §5). */
export const courseProviders: Record<CourseId, string> = {
  'obligaciones-tributarias': 'SIN · Núcleo de Apoyo Contable y Fiscal',
  'educacion-financiera': 'BDP · Educación financiera',
  'ventas-digitales': 'Pro-Bolivia',
  'gestion-costos': 'Pro-Bolivia',
  'servicio-cliente': 'Cámara empresarial participante (demo)',
}

export type CourseCompletion = Record<string, number[]>
export function createInitialCourseCompletion(): CourseCompletion {
  return Object.fromEntries(trainings.map((course) => [
    course.id,
    Array.from({ length: Math.round(courseTopics[course.id].length * course.mariaProgressPct / 100) }, (_, index) => index),
  ]))
}
export function getCourseProgress(courseId: CourseId, completion: CourseCompletion) {
  return Math.round((completion[courseId]?.length ?? 0) / courseTopics[courseId].length * 100)
}

/* ---------- Crédito ---------- */

/** Generic BDP-style productive microcredit. Rate below the 11,5% cap (DS 2055 mod. DS 5403). */
export const creditOffer = {
  product: 'Crédito productivo BDP · Capital de operación',
  lender: 'Banco de Desarrollo Productivo',
  branch: 'Agencia El Alto',
  annualRatePct: 10,
  regulatoryCapPct: 11.5,
  amounts: [6000, 9000, 12000],
  terms: [12, 18, 24],
  guarantee: 'Personal, con respaldo de un fondo de garantía (50%)',
  uses: 'Telas e insumos · Maquinaria · Mejora del taller',
} as const

/** French amortization: fixed monthly installment. */
export function monthlyInstallment(amountBs: number, months: number, annualRatePct: number) {
  const rate = annualRatePct / 100 / 12
  return Math.round(amountBs * rate / (1 - (1 + rate) ** -months))
}

/* ---------- Protección ---------- */

/** National minimum wage 2026 (DS 5516) and Gestora independent-worker rate. */
export const MINIMUM_WAGE_BS = 3300
export const GESTORA_RATE = 0.1442
export const GESTORA_INDIVIDUAL_ACCOUNT_RATE = 0.10

// Fictional benefit descriptions anchored on real institutions; not policy terms.
export const protectionDetails = [
  {
    id: 'insurance', title: 'Microseguro de vida y accidentes', status: 'ACTIVO',
    summary: 'Protege a tu familia si tienes un accidente.',
    description: 'Un seguro sencillo incluido en tu aporte único (modelo propuesto), emitido por una aseguradora regulada por la APS.',
    features: ['Muerte accidental: Bs 20.000 para tus beneficiarios', 'Invalidez total por accidente: Bs 20.000', 'Gastos de sepelio: Bs 3.000', 'Equivale a una prima de Bs 25 al mes'],
    note: 'Coberturas ilustrativas de la demostración. Las condiciones reales dependen de la aseguradora contratada.',
    action: 'Recibir mi certificado de cobertura', confirmation: 'Certificado enviado',
    confirmationText: 'Te enviamos tu certificado de cobertura a tu correo.',
  },
  {
    id: 'health', title: 'Salud · SUS', status: 'CUBIERTA',
    summary: 'Atención gratuita en salud pública con tu carnet.',
    description: 'Como no tienes un seguro de salud de una caja, el Sistema Único de Salud (Ley 1152) te atiende sin costo en establecimientos públicos.',
    features: ['Consultas y atención en centros de salud públicos', 'Hospitalización y cirugías en la red pública', 'Solo necesitas tu carnet de identidad'],
    note: 'Información del SUS vigente. La app solo te orienta; no reemplaza tu atención en el sistema de salud.',
    action: 'Ver centros de salud cercanos', confirmation: 'Centros cercanos',
    confirmationText: 'Encontramos 3 centros de salud públicos a menos de 2 km de tu negocio.',
  },
  {
    id: 'retirement', title: 'Jubilación · Gestora Pública', status: 'DISPONIBLE',
    summary: 'Ahorra para tu jubilación como trabajadora independiente.',
    description: 'Puedes aportar a la Gestora Pública de la Seguridad Social como independiente. Tu aporte se calcula sobre un ingreso que tú declaras.',
    features: ['Aporte del 14,42% sobre el ingreso que declares', 'El 10% va a tu cuenta personal de jubilación', 'Incluye cobertura de riesgo común y profesional', 'Puedes pagar hasta 12 meses por adelantado'],
    note: 'Tasa vigente para independientes. Ingreso mínimo a declarar: un salario mínimo nacional (Bs 3.300 en 2026).',
    action: 'Iniciar mi afiliación', confirmation: 'Afiliación iniciada',
    confirmationText: 'Enviamos tus datos verificados a la Gestora. Recibirás tu número de afiliación por correo.',
  },
] as const

/* ---------- Oportunidades ---------- */

type Requirement = { label: string; met: boolean; hint?: string }
type OpportunityCopy = {
  title: string
  buyerDisplay: string
  description: string
  category: string
  modality: string
  reference?: string
  preference?: string
  action: string
  deadlineInDays: number | null
  requirements: Requirement[]
}

const opportunityCopy: Record<string, OpportunityCopy> = {
  'opp-lp-uniformes-municipio': {
    title: 'Prendas de trabajo para personal municipal',
    buyerDisplay: 'Gobierno Autónomo Municipal de El Alto (demo)',
    description: 'Confección y entrega de 150 chalecos y 150 poleras de trabajo para personal de limpieza y mantenimiento.',
    category: 'Compra pública', modality: 'Contratación Menor · SICOES', reference: 'CUCE 26-0201-00-1186402-1-1 (demo)',
    preference: 'Margen de preferencia MyPE de 20%, acumulable con 10% por producción nacional',
    action: 'Preparar mi propuesta', deadlineInDays: 12,
    requirements: [
      { label: 'NIT activo', met: true },
      { label: 'Actividad compatible (confección de prendas)', met: true },
      { label: 'Registro en Pro-Bolivia como unidad productiva', met: false, hint: 'Necesario para el margen MyPE. Te ayudamos a tramitarlo.' },
      { label: 'Muestra física de las prendas', met: false, hint: 'Se presenta junto con la propuesta.' },
    ],
  },
  'opp-lp-uniformes-privado': {
    title: 'Proveedor de uniformes para personal',
    buyerDisplay: 'Empresa privada participante (demo)',
    description: 'Una empresa de servicios busca un taller para producir 120 uniformes en 45 días, con entregas parciales.',
    category: 'Compra privada', modality: 'Compra directa', action: 'Contactar a la empresa', deadlineInDays: 20,
    requirements: [
      { label: 'NIT activo para emitir factura', met: true },
      { label: 'Capacidad de entrega: 120 prendas en 45 días', met: true },
      { label: 'Muestra aprobada por el comprador', met: false, hint: 'La empresa la solicita después del primer contacto.' },
    ],
  },
  'opp-lp-feria-productiva': {
    title: 'Feria productiva de fin de año',
    buyerDisplay: 'Gobierno municipal y cámara empresarial (demo)',
    description: 'Espacio para vender y exhibir tus productos en temporada alta. Stand sin costo para participantes del programa.',
    category: 'Feria', modality: 'Inscripción abierta', action: 'Reservar mi stand', deadlineInDays: 7,
    requirements: [
      { label: 'Libreta Digital activa', met: true },
      { label: 'Productos listos para exhibir', met: true },
    ],
  },
}

export const mariaOpportunities = opportunities
  .filter((opportunity) => opportunity.matchForMaria)
  .map((opportunity) => ({ ...opportunity, ...opportunityCopy[opportunity.id] }))

/** Deadlines are relative to the presentation date so the demo never shows expired calls. */
export function deadlineFrom(baseMs: number, days: number) {
  return new Intl.DateTimeFormat('es-BO', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(baseMs + days * 86400000))
}
