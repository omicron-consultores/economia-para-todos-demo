'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Award, BadgeCheck, BookOpen, BriefcaseBusiness, Check, Circle, HeartPulse, PiggyBank, ShieldCheck } from 'lucide-react'
import { Choice } from '@/components/choice'
import { maria, trainings } from '@/lib/mock-data'
import {
  courseProviders, courseTopics, creditOffer, deadlineFrom, GESTORA_INDIVIDUAL_ACCOUNT_RATE, GESTORA_RATE, getCourseProgress,
  mariaOpportunities, MINIMUM_WAGE_BS, monthlyInstallment, protectionDetails, type CourseCompletion,
} from '@/lib/mobile-details'
import { parseAmount, type RegistrationValues } from '@/lib/registration'

const money = (value: number) => `Bs ${new Intl.NumberFormat('es-BO').format(value)}`
const money2 = (value: number) => `Bs ${new Intl.NumberFormat('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)}`

function BenefitScreen({ title, onBack, children }: { title: string; onBack: () => void; children: React.ReactNode }) {
  const screenRef = useRef<HTMLDivElement>(null)
  useEffect(() => { screenRef.current?.closest('.phone-content')?.scrollTo({ top: 0 }) }, [title])
  return (
    <div ref={screenRef} className="mobile-screen">
      <button type="button" className="back-button" onClick={onBack}><ArrowLeft size={18} />Volver</button>
      <h2>{title}</h2>
      {children}
    </div>
  )
}

function Confirmation({ title, text }: { title: string; text: string }) {
  return <div className="inline-success" role="status"><Check size={22} /><div><strong>{title}</strong><span>{text}</span></div></div>
}

/* ---------- Crédito ---------- */

export function Credit({ onBack, identity, submitted, onSubmit }: {
  onBack: () => void
  identity: RegistrationValues
  submitted: boolean
  onSubmit: (authorizedBureau: boolean) => void
}) {
  const [amount, setAmount] = useState<number>(creditOffer.amounts[2])
  const [term, setTerm] = useState<number>(creditOffer.terms[1])
  const [bureauConsent, setBureauConsent] = useState(identity.consentCredit)
  const installment = monthlyInstallment(amount, term, creditOffer.annualRatePct)
  const requestNumber = `BDP-2026-${identity.cedula.slice(-5)}`
  const profile = [
    'Identidad verificada por el SEGIP',
    `NIT activo · ${identity.nit}`,
    `${maria.monthsInProgram} meses de aportes al día`,
    `Ventas declaradas: ${money(parseAmount(identity.sales))} al mes`,
    'Curso "Tu NIT y tus obligaciones" aprobado',
  ]

  return (
    <BenefitScreen title="Crédito" onBack={onBack}>
      <h4>Tu perfil</h4>
      <ul className="check-list">{profile.map((item) => <li key={item}><Check size={16} />{item}</li>)}</ul>
      <div className="credit-box">
        <small>Precalificación</small>
        <strong>Hasta {money(maria.creditPrequalifiedBs)}</strong>
        <span>{creditOffer.product}</span>
        <span>{creditOffer.uses}</span>
      </div>
      {submitted ? (
        <Confirmation title={`Solicitud ${requestNumber} enviada`}
          text={`${creditOffer.lender} · ${creditOffer.branch}. Un oficial de crédito te llamará al ${identity.phone} en las próximas 48 horas.`} />
      ) : <>
        <div className="field-group"><span>¿Cuánto necesitas?</span>
          <Choice label="Monto" options={creditOffer.amounts} value={amount} onChange={setAmount} format={money} /></div>
        <div className="field-group"><span>¿En cuánto tiempo pagarías?</span>
          <Choice label="Plazo" options={creditOffer.terms} value={term} onChange={setTerm} format={(value) => `${value} meses`} /></div>
        <dl className="loan-terms">
          <div><dt>Cuota estimada</dt><dd className="loan-installment">{money(installment)} <span>al mes</span></dd></div>
          <div><dt>Tasa referencial</dt><dd>{creditOffer.annualRatePct}% anual · tope regulado {String(creditOffer.regulatoryCapPct).replace('.', ',')}%</dd></div>
          <div><dt>Garantía</dt><dd>{creditOffer.guarantee}</dd></div>
          <div><dt>Entidad</dt><dd>{creditOffer.lender} · {creditOffer.branch}</dd></div>
        </dl>
        {identity.consentCredit ? (
          <span className="benefit-status"><BadgeCheck size={16} />Ya autorizaste consultar tu historial en la central de riesgos (ASFI)</span>
        ) : (
          <label className="checkbox-row consent-inline">
            <input type="checkbox" checked={bureauConsent} onChange={(event) => setBureauConsent(event.target.checked)} />
            <span>Autorizo al BDP a consultar mi historial en la central de riesgos de ASFI.</span>
          </label>
        )}
        <button type="button" className="demo-button" disabled={!bureauConsent} onClick={() => onSubmit(bureauConsent)}>Solicitar evaluación</button>
        <p className="detail-note">Cuota calculada con la tasa referencial. La aprobación final depende de la evaluación del BDP. Valores de demostración.</p>
      </>}
    </BenefitScreen>
  )
}

/* ---------- Protección ---------- */

const protectionIcons = { insurance: ShieldCheck, health: HeartPulse, retirement: PiggyBank } as const
const declaredIncomeOptions = [MINIMUM_WAGE_BS, 4000, 5000] as const

export function Protection({ onBack }: { onBack: () => void }) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [requests, setRequests] = useState<string[]>([])
  const [declaredIncome, setDeclaredIncome] = useState<number>(MINIMUM_WAGE_BS)
  const selected = protectionDetails.find((item) => item.id === selectedId)

  if (selected) return (
    <BenefitScreen title={selected.title} onBack={() => setSelectedId(null)}>
      <span className="benefit-status"><Check size={16} />Estado: {selected.status}</span>
      <p>{selected.description}</p>
      <ul className="benefit-list">{selected.features.map((item) => <li key={item}>{item}</li>)}</ul>
      {selected.id === 'retirement' && (
        <div className="estimate-box">
          <small>Simula tu aporte · ingreso que declaras al mes</small>
          <Choice label="Ingreso declarado" options={declaredIncomeOptions} value={declaredIncome} onChange={setDeclaredIncome} format={money} />
          <strong>{money2(declaredIncome * GESTORA_RATE)} <span>al mes</span></strong>
          <span>{money2(declaredIncome * GESTORA_INDIVIDUAL_ACCOUNT_RATE)} van directo a tu cuenta personal de jubilación.</span>
        </div>
      )}
      <p className="detail-note">{selected.note}</p>
      {requests.includes(selected.id)
        ? <Confirmation title={selected.confirmation} text={selected.confirmationText} />
        : <button type="button" className="demo-button" onClick={() => setRequests((current) => [...current, selected.id])}>{selected.action}</button>}
    </BenefitScreen>
  )

  return (
    <BenefitScreen title="Protección" onBack={onBack}>
      {protectionDetails.map((item) => {
        const Icon = protectionIcons[item.id]
        return <button type="button" className="mobile-card detail-card" key={item.id} onClick={() => setSelectedId(item.id)}>
          <div className="mobile-card-heading"><Icon size={20} /><strong>{item.title}</strong></div>
          <span className="benefit-status">Estado: {item.status}</span>
          <span>{item.summary}</span>
          <span className="card-link">Ver detalle<ArrowRight size={15} /></span>
        </button>
      })}
    </BenefitScreen>
  )
}

/* ---------- Capacitación ---------- */

export function Training({ onBack, completion, onToggleTopic, cedula }: {
  onBack: () => void
  completion: CourseCompletion
  onToggleTopic: (courseId: string, topicIndex: number) => void
  cedula: string
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = trainings.find((course) => course.id === selectedId)

  if (selected) {
    const topics = courseTopics[selected.id]
    const completed = completion[selected.id] ?? []
    const progress = getCourseProgress(selected.id, completion)
    const courseIndex = trainings.findIndex((course) => course.id === selected.id) + 1
    return (
      <BenefitScreen title={selected.title} onBack={() => setSelectedId(null)}>
        <p className="screen-subtitle">{courseProviders[selected.id]} · {selected.format} · {selected.duration}</p>
        <p>{selected.description}</p>
        <div className="course-meta"><span>{completed.length} de {topics.length} temas completados</span><strong>{progress}%</strong></div>
        <div className="course-progress" role="progressbar" aria-label="Avance del curso" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${progress}%` }} /></div>
        <h4>Temario</h4>
        <p className="detail-note">Marca cada tema cuando lo hayas completado.</p>
        <div className="topic-checklist">
          {topics.map((topic, index) => <label key={topic} className={completed.includes(index) ? 'is-complete' : ''}>
            <input type="checkbox" checked={completed.includes(index)} onChange={() => onToggleTopic(selected.id, index)} />
            <span>{topic}</span>
          </label>)}
        </div>
        {progress === 100 && (
          <div className="certificate" role="status">
            <Award size={26} />
            <div><strong>Certificado emitido</strong><span>N° EPT-CERT-{cedula.slice(-4)}-{String(courseIndex).padStart(2, '0')} · se suma a tu perfil para crédito.</span></div>
          </div>
        )}
      </BenefitScreen>
    )
  }

  return (
    <BenefitScreen title="Capacitación" onBack={onBack}>
      <div className="training-list">
        {trainings.map((course) => {
          const progress = getCourseProgress(course.id, completion)
          const completed = progress === 100
          return <article className="training-card" key={course.id}>
            <div className="mobile-card-heading"><BookOpen size={20} /><strong>{course.title}</strong></div>
            <small className="course-provider">{courseProviders[course.id]}</small>
            <p>{course.description}</p>
            <div className="course-meta"><span>{course.duration}</span><span>{progress}%</span></div>
            <div className="course-progress" role="progressbar" aria-label={`Avance: ${course.title}`} aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${progress}%` }} /></div>
            <button type="button" className={completed ? 'completed' : ''} onClick={() => setSelectedId(course.id)}>
              {completed && <Award size={15} />}{completed ? 'Certificado' : progress === 0 ? 'Empezar' : 'Continuar'}
            </button>
          </article>
        })}
      </div>
    </BenefitScreen>
  )
}

/* ---------- Oportunidades ---------- */

export function Opportunities({ onBack, interests, onRegisterInterest }: {
  onBack: () => void
  interests: string[]
  onRegisterInterest: (id: string) => void
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [today] = useState(() => Date.now())
  const selected = mariaOpportunities.find((item) => item.id === selectedId)

  if (selected) {
    const met = selected.requirements.filter((item) => item.met).length
    return (
      <BenefitScreen title={selected.title} onBack={() => setSelectedId(null)}>
        <p className="screen-subtitle">{selected.buyerDisplay}</p>
        <p>{selected.description}</p>
        <dl className="opportunity-facts">
          <div><dt>Tipo</dt><dd>{selected.category}</dd></div>
          <div><dt>Modalidad</dt><dd>{selected.modality}</dd></div>
          {selected.reference && <div><dt>Referencia</dt><dd>{selected.reference}</dd></div>}
          <div><dt>Ubicación</dt><dd>{selected.municipality}, {selected.department}</dd></div>
          {selected.estimatedValueBs !== null && <div><dt>Monto estimado</dt><dd>{money(selected.estimatedValueBs)}</dd></div>}
          {selected.deadlineInDays !== null && <div><dt>Fecha límite</dt><dd>{deadlineFrom(today, selected.deadlineInDays)}</dd></div>}
        </dl>
        {selected.preference && <div className="highlight-box"><b>Ventaja por ser MyPE</b><span>{selected.preference}.</span></div>}
        <h4>Requisitos · cumples {met} de {selected.requirements.length}</h4>
        <ul className="requirement-list">
          {selected.requirements.map((item) => <li key={item.label} className={item.met ? 'is-met' : ''}>
            {item.met ? <Check size={17} /> : <Circle size={17} />}
            <div><span>{item.label}</span>{item.hint && <small>{item.hint}</small>}</div>
          </li>)}
        </ul>
        <p className="detail-note">Oportunidad de demostración. La participación está sujeta a la revisión de la entidad convocante.</p>
        {interests.includes(selected.id)
          ? <Confirmation title="Listo" text={selected.category === 'Compra pública'
            ? 'Guardamos la convocatoria y te avisaremos qué falta para presentar tu propuesta.'
            : 'Compartimos tu Libreta Digital con el organizador. Te contactarán por celular.'} />
          : <button type="button" className="demo-button" onClick={() => onRegisterInterest(selected.id)}>{selected.action}</button>}
      </BenefitScreen>
    )
  }

  return (
    <BenefitScreen title="Oportunidades para ti" onBack={onBack}>
      <p className="screen-subtitle">Elegidas según tu actividad y tu ubicación.</p>
      {mariaOpportunities.map((item) => <button type="button" key={item.id} className="mobile-card detail-card" onClick={() => setSelectedId(item.id)}>
        <div className="mobile-card-heading"><BriefcaseBusiness size={20} /><strong>{item.title}</strong></div>
        <span>{item.buyerDisplay}</span>
        <span>{item.category} · {item.estimatedValueBs === null ? item.modality : money(item.estimatedValueBs)}</span>
        {item.deadlineInDays !== null && <span className="benefit-status">Cierra el {deadlineFrom(today, item.deadlineInDays)}</span>}
        <span className="card-link">Ver oportunidad<ArrowRight size={15} /></span>
      </button>)}
    </BenefitScreen>
  )
}
