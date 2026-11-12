'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BatteryFull,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  CreditCard,
  GraduationCap,
  Landmark,
  QrCode,
  RotateCcw,
  Settings as SettingsIcon,
  ShieldCheck,
  Signal,
  Store,
  UserRound,
  Wifi,
} from 'lucide-react'
import { BoliviaMap } from '@/components/bolivia-map'
import { Credit, Opportunities, Protection, Training } from '@/components/mobile-benefits'
import { Settings } from '@/components/mobile-settings'
import { cutOffLabel, FormalizationFunnel, KpiGrid } from '@/components/dashboard-summary'
import { RegistrationFlow } from '@/components/registration-flow'
import { createInitialCourseCompletion, type CourseCompletion } from '@/lib/mobile-details'
import { contributionFor, demoRegistration, parseAmount, type RegistrationValues } from '@/lib/registration'
import { getPerformanceBreakdown, getPerformanceMetrics } from '@/lib/performance-details'
import {
  ageGroups,
  departments,
  getDashboardMetrics,
  maria,
  sectors,
  sexes,
} from '@/lib/mock-data'

type MobileScreen =
  | 'landing'
  | 'registration'
  | 'success'
  | 'wallet'
  | 'home'
  | 'contribution'
  | 'credit'
  | 'protection'
  | 'training'
  | 'opportunities'
  | 'profile'
  | 'settings'
  | 'timeskip'
type DashboardTab = 'Resumen' | 'Desempeño'
type Filters = { department: string; sector: string; sex: string; ageGroup: string }

const initialFilters: Filters = { department: 'Todos', sector: 'Todos', sex: 'Todos', ageGroup: 'Todos' }
const money = (value: number) => `Bs ${new Intl.NumberFormat('es-BO', { maximumFractionDigits: 0 }).format(value)}`
const number = (value: number) => new Intl.NumberFormat('es-BO').format(value)
const statusLabels = { green: 'VERDE', yellow: 'AMARILLO', red: 'ROJO' } as const

type ButtonProps = {
  children: React.ReactNode
  onClick?: () => void
  secondary?: boolean
  className?: string
  type?: 'button' | 'submit'
  disabled?: boolean
}

function Button({ children, onClick, secondary = false, className = '', type = 'button', disabled = false }: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`demo-button ${secondary ? 'demo-button-secondary' : ''} ${className}`}
    >
      {children}
    </button>
  )
}

function Back({ onClick }: { onClick: () => void }) {
  return <button type="button" onClick={onClick} className="back-button"><ArrowLeft size={18} /> Volver</button>
}

type PhoneFrameProps = {
  children: React.ReactNode
  activeTab: string
  showNavigation: boolean
  screen: MobileScreen
  onTab: (value: 'home' | 'profile' | 'settings') => void
}

function PhoneFrame({ children, activeTab, showNavigation, onTab, screen }: PhoneFrameProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  useEffect(() => { scrollRef.current?.scrollTo({ top: 0 }) }, [screen])
  return (
    <div className="phone-frame">
      <div className="phone-statusbar" aria-hidden="true">
        <span className="phone-time">9:41</span>
        <div className="phone-speaker" />
        <div className="phone-status-icons"><Signal size={16} /><Wifi size={15} /><BatteryFull size={21} /></div>
      </div>
      <div ref={scrollRef} className="phone-content">{children}</div>
      {showNavigation && (
        <nav className="mobile-nav" aria-label="Navegación principal">
          <button type="button" onClick={() => onTab('home')} className={activeTab === 'home' ? 'active' : ''}><Landmark size={19} /><span>Inicio</span></button>
          <button type="button" onClick={() => onTab('profile')} className={activeTab === 'profile' ? 'active' : ''}><UserRound size={19} /><span>Perfil</span></button>
          <button type="button" onClick={() => onTab('settings')} className={activeTab === 'settings' ? 'active' : ''}><SettingsIcon size={19} /><span>Ajustes</span></button>
        </nav>
      )}
    </div>
  )
}

type MobileCardProps = {
  icon: React.ElementType
  title: string
  text: string
  onClick?: () => void
}

function MobileCard({ icon: Icon, title, text, onClick }: MobileCardProps) {
  const content = (
    <>
      <div className="mobile-card-heading"><Icon size={20} /><strong>{title}</strong></div>
      <span>{text}</span>
      {onClick && <span className="card-link">Ver <ArrowRight size={15} /></span>}
    </>
  )

  return onClick ? (
    <button type="button" onClick={onClick} className="mobile-card">{content}</button>
  ) : (
    <article className="mobile-card">{content}</article>
  )
}

function Landing({ go }: { go: (screen: MobileScreen) => void }) {
  return (
    <div className="mobile-screen landing">
      <div className="brand">ECONOMÍA PARA TODOS</div>
      <h1>Tu negocio puede<br />crecer más</h1>
      <p>Formaliza de manera simple y accede a crédito, protección y nuevos mercados.</p>
      <div className="landing-art"><Store size={38} /><span>Tu actividad, tus oportunidades.</span></div>
      <Button onClick={() => go('registration')}>Crear mi Libreta Digital</Button>
      <button type="button" className="text-action" onClick={() => go('registration')}>Ya estoy registrado</button>
    </div>
  )
}

const duration = (seconds: number) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
const longDate = (iso: string) => new Intl.DateTimeFormat('es-BO', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${iso}T12:00:00Z`))

function Success({ go, identity }: { go: (screen: MobileScreen) => void; identity: RegistrationValues }) {
  return (
    <div className="mobile-screen centered-screen">
      <Check className="success-check" size={48} />
      <h2>Tu Libreta está lista</h2>
      <p>Identidad verificada por el SEGIP · NIT creado en el SIN</p>
      <div className="success-facts">
        <div><span>Tu NIT</span><strong>{identity.nit}</strong></div>
        <div><span>N° de trámite</span><b>{identity.tramite}</b></div>
        <div><span>Tiempo de registro</span><b>{duration(identity.elapsedSeconds)}</b></div>
      </div>
      <p className="detail-note">Te enviamos tus credenciales del SIN a {identity.email}. NIT de demostración.</p>
      <Button onClick={() => go('wallet')}>Ver mi Libreta</Button>
    </div>
  )
}

function WalletCard({ profile = false, identity }: { profile?: boolean; identity: RegistrationValues }) {
  return (
    <div className={`wallet-card ${profile ? 'wallet-card-profile' : ''}`}>
      <div className="eyebrow">ECONOMÍA PARA TODOS</div>
      <h3>{`${identity.firstName} ${identity.lastName}`.toUpperCase()}</h3>
      <p>{identity.activity} · {identity.municipality}, {identity.department}</p>
      <div className="wallet-ids"><span>NIT <b>{identity.nit}</b></span><span>CAEB <b>{identity.activityCode}</b></span></div>
      <strong>Estado: {maria.programStatus.toUpperCase()} ✓</strong>
      <div className="qr"><QrCode aria-hidden="true" /><span>Credencial demo</span></div>
      <small>{maria.id} · Registrada el {longDate(identity.registeredAt)}</small>
    </div>
  )
}

function Wallet({ onContinue, identity }: { onContinue: () => void; identity: RegistrationValues }) {
  return (
    <div className="mobile-screen">
      <h2>Mi Libreta Digital</h2>
      <WalletCard identity={identity} />
      <Button onClick={onContinue}>Continuar</Button>
    </div>
  )
}

const monthWords: Record<number, string> = { 1: 'Un mes', 2: 'Dos meses', 3: 'Tres meses', 4: 'Cuatro meses', 5: 'Cinco meses', 6: 'Seis meses' }

/** Narrative bridge between registration (today) and Inicio, which shows months of formal history. */
function TimeSkip({ onSkip }: { onSkip: () => void }) {
  return (
    <button type="button" className="time-skip" onClick={onSkip} aria-label="Continuar a Inicio">
      <strong>{monthWords[maria.monthsInProgram] ?? `${maria.monthsInProgram} meses`} después…</strong>
      <span>María vende, paga su aporte y construye su historial formal.</span>
    </button>
  )
}

function HomeScreen({ go, identity }: { go: (screen: MobileScreen) => void; identity: RegistrationValues }) {
  const sales = parseAmount(identity.sales)
  return (
    <div className="mobile-screen home-screen">
      <h2>Buenos días, {identity.firstName}</h2>
      <strong className="section-label">Tu negocio</strong>
      <div className="mini-grid">
        <div><small>Estado</small><b>{maria.programStatus}</b></div>
        <div><small>Ventas este mes</small><b>{money(sales)}</b></div>
        <div><small>Aporte único del mes</small><b>{money(contributionFor(sales))}</b></div>
        <div><small>Historial formal</small><b>{maria.monthsInProgram} meses</b></div>
      </div>
      <button type="button" className="outline-cta" onClick={() => go('contribution')}>Ver cómo se utiliza mi aporte <ArrowRight size={17} /></button>
      <strong className="section-label">Tus beneficios</strong>
      <div className="benefits-grid">
        <MobileCard icon={CreditCard} title="Crédito" text={`Hasta ${money(maria.creditPrequalifiedBs)}`} onClick={() => go('credit')} />
        <MobileCard icon={ShieldCheck} title="Protección" text="Microseguro activo · SUS" onClick={() => go('protection')} />
        <MobileCard icon={GraduationCap} title="Capacitación" text="1 certificado · 4 cursos" onClick={() => go('training')} />
        <MobileCard icon={BriefcaseBusiness} title="Oportunidades" text={`${maria.matchedOpportunityIds.length} disponibles`} onClick={() => go('opportunities')} />
      </div>
    </div>
  )
}

function Detail({ title, children, go }: { title: string; children: React.ReactNode; go: (screen: MobileScreen) => void }) {
  return <div className="mobile-screen"><Back onClick={() => go('home')} /><h2>{title}</h2>{children}</div>
}

function Contribution({ go, identity }: { go: (screen: MobileScreen) => void; identity: RegistrationValues }) {
  const sales = parseAmount(identity.sales)
  const contribution = contributionFor(sales)
  const benefit = maria.benefitEstimateBs.total
  const contributionWidth = `${Math.min(100, (contribution / benefit) * 100)}%`
  const benefitRows = [
    ['Mejores condiciones financieras', maria.benefitEstimateBs.financial],
    ['Protección', maria.benefitEstimateBs.protection],
    ['Capacitación', maria.benefitEstimateBs.training],
    ['Acceso a mercados', maria.benefitEstimateBs.marketAccess],
  ] as const

  return (
    <Detail title="Mi aporte" go={go}>
      <div className="highlight-box"><b>Este mes</b><span>Ventas registradas: {money(sales)}</span><span>Aporte único: 3% de tus ventas · reúne tus impuestos de pequeño negocio</span></div>
      <div className="comparison-chart" aria-label={`Comparación: aporte ${money(contribution)}, valor estimado recibido ${money(benefit)}`}>
        <div className="comparison-item">
          <div className="comparison-label"><span>Aporte</span><b>{money(contribution)}</b></div>
          <div className="comparison-track"><span className="contribution-bar" style={{ width: contributionWidth }} /></div>
        </div>
        <div className="comparison-item">
          <div className="comparison-label"><span>Valor estimado recibido</span><b>{money(benefit)}</b></div>
          <div className="comparison-track"><span className="benefit-bar" /></div>
        </div>
      </div>
      <p className="comparison-note">Tu valor estimado recibido equivale a aproximadamente {new Intl.NumberFormat('es-BO', { maximumFractionDigits: 1 }).format(benefit / contribution)} veces tu aporte.</p>
      <h4>¿Qué incluye este valor estimado?</h4>
      {benefitRows.map(([label, value]) => <div className="benefit-row" key={label}><span>{label}</span><b>{money(value)}</b></div>)}
      <p className="detail-note">Aporte único: modelo propuesto del programa, no es una tasa tributaria vigente. Valores de demostración.</p>
    </Detail>
  )
}

function Profile({ go, onPresent, identity }: { go: (screen: MobileScreen) => void; onPresent: () => void; identity: RegistrationValues }) {
  return (
    <Detail title="Mi perfil" go={go}>
      <WalletCard profile identity={identity} />
      <div className="profile-data">
        <div><span>NIT</span><strong>{identity.nit}</strong></div>
        <div><span>Régimen</span><strong>Aporte único (propuesto)</strong></div>
        <div><span>Actividad</span><strong>{identity.activity} · {identity.activityCode}</strong></div>
        <div><span>Sector</span><strong>{identity.sector}</strong></div>
        <div><span>Negocio</span><strong>{identity.zone}, {identity.municipality}</strong></div>
        <div><span>Contacto</span><strong>{identity.phone} · {identity.email}</strong></div>
        <div><span>Estado</span><strong className="active-profile">{maria.programStatus}</strong></div>
      </div>
      <button type="button" className="presenter-helper profile-presenter-helper" onClick={onPresent}>Vista institucional</button>
    </Detail>
  )
}

type MobileExperienceProps = {
  screen: MobileScreen
  onboardingCompleted: boolean
  creditSubmitted: boolean
  go: (screen: MobileScreen) => void
  onCompleteOnboarding: () => void
  onSubmitCredit: (authorizedBureau: boolean) => void
  onUpdateIdentity: (patch: Partial<RegistrationValues>) => void
  onSkipTime: () => void
  onTab: (value: 'home' | 'profile' | 'settings') => void
  onPresent: () => void
  completion: CourseCompletion
  onToggleTopic: (courseId: string, index: number) => void
  interests: string[]
  onRegisterInterest: (id: string) => void
  identity: RegistrationValues
  onRegister: (values: RegistrationValues) => void
}

function MobileExperience({ screen, onboardingCompleted, creditSubmitted, go, onCompleteOnboarding, onSubmitCredit, onTab, onPresent, completion, onToggleTopic, interests, onRegisterInterest, identity, onRegister, onUpdateIdentity, onSkipTime }: MobileExperienceProps) {
  let content: React.ReactNode

  if (screen === 'landing') content = <Landing go={go} />
  else if (screen === 'registration') content = <RegistrationFlow onRegister={onRegister} onExit={() => go('landing')} />
  else if (screen === 'success') content = <Success go={go} identity={identity} />
  else if (screen === 'wallet') content = <Wallet onContinue={onCompleteOnboarding} identity={identity} />
  else if (screen === 'timeskip') content = <TimeSkip onSkip={onSkipTime} />
  else if (screen === 'home') content = <HomeScreen go={go} identity={identity} />
  else if (screen === 'contribution') content = <Contribution go={go} identity={identity} />
  else if (screen === 'credit') content = <Credit onBack={() => go('home')} identity={identity} submitted={creditSubmitted} onSubmit={onSubmitCredit} />
  else if (screen === 'protection') content = <Protection onBack={() => go('home')} />
  else if (screen === 'training') content = <Training onBack={() => go('home')} completion={completion} onToggleTopic={onToggleTopic} cedula={identity.cedula} />
  else if (screen === 'opportunities') content = <Opportunities onBack={() => go('home')} interests={interests} onRegisterInterest={onRegisterInterest} />
  else if (screen === 'profile') content = <Profile go={go} onPresent={onPresent} identity={identity} />
  else content = <Settings identity={identity} onBack={() => go('home')} onUpdate={onUpdateIdentity} />

  const showNavigation = onboardingCompleted && !['landing', 'registration', 'success', 'wallet', 'timeskip'].includes(screen)

  return (
    <PhoneFrame
      screen={screen}
      activeTab={screen === 'profile' ? 'profile' : screen === 'settings' ? 'settings' : 'home'}
      showNavigation={showNavigation}
      onTab={onTab}
    >
      {content}
    </PhoneFrame>
  )
}

function Filter({ label, value, options, onChange }: { label: string; value: string; options: readonly string[]; onChange: (value: string) => void }) {
  return (
    <label className="filter">
      <span>{label}</span>
      <div>
        <select value={value} onChange={(event) => onChange(event.target.value)}>
          <option>Todos</option>
          {options.map((option) => <option key={option}>{option}</option>)}
        </select>
        <ChevronDown size={14} />
      </div>
    </label>
  )
}

function Performance({ metricId, setMetricId, filters }: { metricId: string | null; setMetricId: (metricId: string) => void; filters: Filters }) {
  const metrics = useMemo(() => getPerformanceMetrics(filters), [filters])
  const selectedMetric = metrics.find((item) => item.id === metricId) ?? null
  const breakdown = selectedMetric ? getPerformanceBreakdown(selectedMetric.id, filters) : null
  const filtered = Object.values(filters).some((value) => value !== 'Todos')

  return (
    <div className="performance-layout">
      <section>
        <h1>Desempeño del programa</h1>
        <div className="performance-list">
          {metrics.map((metric) => (
            <button
              type="button"
              key={metric.id}
              className={metricId === metric.id ? 'selected' : ''}
              aria-pressed={metricId === metric.id}
              onClick={() => setMetricId(metric.id)}
            >
              <strong>{metric.label}</strong>
              <b>{metric.valuePct}%</b>
              <span className={`status ${metric.status}`}>{statusLabels[metric.status]}</span>
            </button>
          ))}
        </div>
      </section>
      <section className="performance-panel" aria-live="polite">
        {selectedMetric ? (
          <div className="metric-analysis">
            <div className="metric-heading">
              <div><span>{filtered ? 'Indicador del ámbito seleccionado' : 'Indicador nacional'}</span><h2>{selectedMetric.label}</h2></div>
              <div className="metric-value"><strong>{selectedMetric.valuePct}%</strong><span className={`status-pill ${selectedMetric.status}`}>{statusLabels[selectedMetric.status]}</span></div>
            </div>
            <p className="metric-definition">{selectedMetric.definition}</p>
            <div className="metric-context">
              <strong>Lectura ejecutiva</strong>
              <p>{number(selectedMetric.numerator)} de {number(selectedMetric.denominator)} participantes del ámbito seleccionado cumplen este indicador. El resultado está en estado {statusLabels[selectedMetric.status]} ({selectedMetric.thresholds[selectedMetric.status]}).</p>
              <p>{selectedMetric.status === 'red' ? 'La brecha requiere atención prioritaria. La comparación permite identificar los grupos con menor acceso.' : selectedMetric.status === 'yellow' ? 'El resultado muestra avances y espacio de mejora. Conviene reforzar el acompañamiento a los grupos con menor cobertura.' : 'El resultado cumple el umbral esperado. Conviene sostener el acompañamiento y revisar las diferencias entre grupos.'}</p>
            </div>
            {breakdown && (
              <div className="territorial-comparison">
                <h3>{breakdown.title}</h3>
                <p>{breakdown.rows.length > 5 ? 'Los cinco resultados con mayor brecha. ' : 'Resultados de menor a mayor. '}Se mantienen los demás filtros activos.</p>
                {breakdown.rows.slice(0, 5).map((row) => {
                  const status = row.status
                  return (
                    <div className="territory-bar-row" key={row.label}>
                      <div><strong>{row.label}</strong><span className={`status ${status}`}>{statusLabels[status]}</span><b>{row.valuePct}%</b></div>
                      <div className="territory-track"><span className={status} style={{ width: `${row.valuePct}%` }} /></div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="empty-performance">
            <BarChart3 size={36} />
            <h2>Explora el desempeño del programa</h2>
            <p>Selecciona un indicador para ver su valor, estado, contexto y distribución territorial disponible.</p>
          </div>
        )}
      </section>
    </div>
  )
}

type DashboardProps = {
  tab: DashboardTab
  setTab: (tab: DashboardTab) => void
  filters: Filters
  setFilters: React.Dispatch<React.SetStateAction<Filters>>
  metricId: string | null
  setMetricId: (metricId: string) => void
  onReturnToMobile: () => void
}

function Dashboard({ tab, setTab, filters, setFilters, metricId, setMetricId, onReturnToMobile }: DashboardProps) {
  const metrics = useMemo(() => getDashboardMetrics(filters), [filters])
  const hasFilters = Object.values(filters).some((value) => value !== 'Todos')
  const breadcrumbs = [
    'Bolivia',
    filters.department !== 'Todos' ? filters.department : null,
    filters.sector !== 'Todos' ? filters.sector : null,
    filters.sex !== 'Todos' ? filters.sex : null,
    filters.ageGroup !== 'Todos' ? filters.ageGroup : null,
  ].filter(Boolean)
  const update = useCallback((key: keyof Filters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }))
  }, [setFilters])
  const selectDepartment = useCallback((department: string) => update('department', department), [update])

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div><div className="dashboard-brand">ECONOMÍA PARA TODOS</div><div className="dashboard-subtitle">Centro Nacional de Gestión</div></div>
        <div className="dashboard-header-actions"><span>Datos de demostración · corte al {cutOffLabel}</span><button type="button" onClick={onReturnToMobile}>Volver a la app móvil<ArrowRight size={14} /></button></div>
      </header>
      <div className="dashboard-tabs">
        <button type="button" className={tab === 'Resumen' ? 'active' : ''} onClick={() => setTab('Resumen')}>Resumen</button>
        <button type="button" className={tab === 'Desempeño' ? 'active' : ''} onClick={() => setTab('Desempeño')}>Desempeño</button>
      </div>
      <div className="breadcrumb" aria-label="Contexto de los filtros">{breadcrumbs.map((item, index) => <span key={item as string}>{index > 0 && <b>›</b>}{item}</span>)}</div>
      <div className="dashboard-filter-bar">
        <div className="filters">
          <Filter label="Departamento" value={filters.department} options={departments.map((department) => department.name)} onChange={(value) => update('department', value)} />
          <Filter label="Sector" value={filters.sector} options={sectors.map((sector) => sector.name)} onChange={(value) => update('sector', value)} />
          <Filter label="Sexo" value={filters.sex} options={sexes} onChange={(value) => update('sex', value)} />
          <Filter label="Edad" value={filters.ageGroup} options={ageGroups} onChange={(value) => update('ageGroup', value)} />
        </div>
        {hasFilters && <Button secondary className="reset-button" onClick={() => setFilters(initialFilters)}><RotateCcw size={16} />Restablecer filtros</Button>}
      </div>
      {tab === 'Resumen' ? (
        <>
          <div className="dashboard-layout">
            <section>
              <KpiGrid metrics={metrics} filtered={hasFilters} />
            </section>
            <BoliviaMap selected={filters.department} onSelect={selectDepartment} filters={filters} />
          </div>
          <FormalizationFunnel metrics={metrics} />
        </>
      ) : (
        <Performance metricId={metricId} setMetricId={setMetricId} filters={filters} />
      )}
    </main>
  )
}

export default function Home() {
  const [screen, setScreen] = useState<MobileScreen>('landing')
  const [onboardingCompleted, setOnboardingCompleted] = useState(false)
  const [creditSubmitted, setCreditSubmitted] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)
  const [transition, setTransition] = useState(false)
  const [transitionStage, setTransitionStage] = useState(0)
  const [tab, setTab] = useState<DashboardTab>('Resumen')
  const [filters, setFilters] = useState<Filters>(initialFilters)
  const [metricId, setMetricId] = useState<string | null>(null)
  const [completion, setCompletion] = useState<CourseCompletion>(createInitialCourseCompletion)
  const [interests, setInterests] = useState<string[]>([])
  const [identity, setIdentity] = useState<RegistrationValues>(demoRegistration)
  const transitionTimers = useRef<number[]>([])
  useEffect(() => { window.scrollTo({ top: 0 }) }, [showDashboard])

  const clearTransitionTimers = useCallback(() => {
    transitionTimers.current.forEach((timer) => window.clearTimeout(timer))
    transitionTimers.current = []
  }, [])

  const present = useCallback(() => {
    clearTransitionTimers()
    setTransition(true)
    setTransitionStage(1)
    setTab('Resumen')
    transitionTimers.current = [
      window.setTimeout(() => setTransitionStage(2), 1800),
      window.setTimeout(() => {
        setShowDashboard(true)
        setTransition(false)
        setTransitionStage(0)
      }, 6000),
    ]
  }, [clearTransitionTimers])

  const returnToMobile = useCallback(() => {
    clearTransitionTimers()
    setTransition(false)
    setTransitionStage(0)
    setShowDashboard(false)
    setOnboardingCompleted(true)
    setScreen('home')
  }, [clearTransitionTimers])

  const reset = useCallback(() => {
    clearTransitionTimers()
    setShowDashboard(false)
    setTransition(false)
    setTransitionStage(0)
    setScreen('landing')
    setOnboardingCompleted(false)
    setCreditSubmitted(false)
    setTab('Resumen')
    setFilters(initialFilters)
    setMetricId(null)
    setCompletion(createInitialCourseCompletion())
    setInterests([])
    setIdentity(demoRegistration)
  }, [clearTransitionTimers])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!event.altKey || !event.shiftKey) return
      const key = event.key.toLowerCase()
      if (key === 'r') {
        event.preventDefault()
        reset()
      } else if (key === 'n') {
        event.preventDefault()
        present()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      clearTransitionTimers()
    }
  }, [clearTransitionTimers, present, reset])

  const finishTimeSkip = useCallback(() => {
    clearTransitionTimers()
    setOnboardingCompleted(true)
    setScreen('home')
  }, [clearTransitionTimers])

  const completeOnboarding = () => {
    clearTransitionTimers()
    setScreen('timeskip')
    transitionTimers.current = [window.setTimeout(finishTimeSkip, 2600)]
  }

  return (
    <div className={showDashboard ? 'app-root dashboard-root' : 'app-root'}>
      {showDashboard ? (
        <Dashboard
          tab={tab}
          setTab={setTab}
          filters={filters}
          setFilters={setFilters}
          metricId={metricId}
          setMetricId={setMetricId}
          onReturnToMobile={returnToMobile}
        />
      ) : (
        <div className="mobile-stage">
          <MobileExperience
            screen={screen}
            onboardingCompleted={onboardingCompleted}
            creditSubmitted={creditSubmitted}
            go={setScreen}
            onCompleteOnboarding={completeOnboarding}
            onSubmitCredit={(authorizedBureau) => {
              setCreditSubmitted(true)
              if (authorizedBureau) setIdentity((current) => ({ ...current, consentCredit: true }))
            }}
            onSkipTime={finishTimeSkip}
            onUpdateIdentity={(patch) => setIdentity((current) => ({ ...current, ...patch }))}
            identity={identity}
            onRegister={(values) => {
              setIdentity(values)
              setScreen('success')
            }}
            onPresent={present}
            completion={completion}
            onToggleTopic={(courseId, index) => setCompletion((current) => {
              const done = current[courseId] ?? []
              return { ...current, [courseId]: done.includes(index) ? done.filter((item) => item !== index) : [...done, index] }
            })}
            interests={interests}
            onRegisterInterest={(id) => setInterests((current) => current.includes(id) ? current : [...current, id])}
            onTab={(destination) => {
              if (onboardingCompleted) setScreen(destination)
            }}
          />
        </div>
      )}
      {transition && (
        <div className="transition-overlay">
          <div key={transitionStage} className={`transition-message transition-stage-${transitionStage}`}>{transitionStage === 1 ? 'Esa fue solo María…' : '¿Qué sucede cuando son 200.000 Marías?'}</div>
        </div>
      )}
    </div>
  )
}
