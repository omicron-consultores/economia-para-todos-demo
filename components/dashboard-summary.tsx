import { Database } from 'lucide-react'
import { getDashboardMetrics, mockData, nationalSummary } from '@/lib/mock-data'

type Metrics = ReturnType<typeof getDashboardMetrics>

/** Program-level target the transition refers to ("200.000 Marías"). */
export const NATIONAL_TARGET = 200000
export const cutOffLabel = new Intl.DateTimeFormat('es-BO', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
  .format(new Date(`${mockData.meta.asOf}T12:00:00Z`))

const number = (value: number) => new Intl.NumberFormat('es-BO').format(value)
const money = (value: number) => `Bs ${new Intl.NumberFormat('es-BO', { maximumFractionDigits: 0 }).format(value)}`
const pct = (value: number) => `${new Intl.NumberFormat('es-BO', { maximumFractionDigits: 1 }).format(value)}%`

function KpiCard({ label, value, note, source, progress }: { label: string; value: string; note: string; source: string; progress?: number }) {
  return (
    <div className="kpi-card">
      <span>{label}</span>
      <strong>{value}</strong>
      {progress !== undefined && <div className="kpi-progress" aria-hidden="true"><i style={{ width: `${Math.min(100, progress)}%` }} /></div>}
      <small className="kpi-note">{note}</small>
      <small className="kpi-source"><Database size={11} />{source}</small>
    </div>
  )
}

export function KpiGrid({ metrics, filtered }: { metrics: Metrics; filtered: boolean }) {
  const registeredNote = filtered
    ? `${pct(metrics.registered / nationalSummary.registered * 100)} del total nacional`
    : `Meta 2026: ${number(NATIONAL_TARGET)} · avance ${pct(metrics.registered / NATIONAL_TARGET * 100)}`
  const kpis = [
    { label: 'Personas registradas', value: number(metrics.registered), note: registeredNote, source: 'Programa · SEGIP', progress: filtered ? undefined : metrics.registered / NATIONAL_TARGET * 100 },
    { label: 'Contribuyentes activos', value: number(metrics.active), note: `Aporte único al día · ${pct(metrics.activationRatePct)} de registrados`, source: 'SIN' },
    { label: 'Recaudación', value: money(metrics.revenueBs), note: 'Aportes únicos · acumulado 2026', source: 'SIN' },
    { label: 'Capital movilizado', value: money(metrics.capitalMobilizedBs), note: 'Créditos desembolsados · acumulado', source: 'BDP y entidades financieras' },
    { label: 'Créditos otorgados', value: number(metrics.creditsGranted), note: `${pct(metrics.creditAccessPct)} de contribuyentes activos`, source: 'BDP · ASFI' },
    { label: 'Personas con protección', value: number(metrics.protected), note: 'Microseguro o aporte a la Gestora', source: 'APS · Gestora' },
  ]
  return <div className="kpi-grid">{kpis.map((kpi) => <KpiCard key={kpi.label} {...kpi} />)}</div>
}

export function FormalizationFunnel({ metrics }: { metrics: Metrics }) {
  const steps = [
    { label: 'Registradas con NIT', value: metrics.registered, source: 'Programa · SIN' },
    { label: 'Con aporte al día', value: metrics.active, source: 'SIN' },
    { label: 'Con crédito', value: metrics.creditsGranted, source: 'BDP' },
    { label: 'Con protección', value: metrics.protected, source: 'APS · Gestora' },
    { label: 'Vendiendo a nuevos mercados', value: metrics.marketIntegrated, source: 'SICOES · programa' },
  ]
  const base = metrics.registered || 1
  return (
    <section className="funnel-panel" aria-labelledby="funnel-title">
      <div className="funnel-heading">
        <h3 id="funnel-title">Del registro a los beneficios</h3>
        <span>% sobre personas registradas en el ámbito seleccionado</span>
      </div>
      <div className="funnel-rows">
        {steps.map((step) => {
          const share = step.value / base * 100
          return <div className="funnel-row" key={step.label}>
            <div className="funnel-label"><strong>{step.label}</strong><small>{step.source}</small></div>
            <div className="funnel-track"><span style={{ width: `${share}%` }} /></div>
            <div className="funnel-value"><b>{number(step.value)}</b><small>{pct(share)}</small></div>
          </div>
        })}
      </div>
    </section>
  )
}
