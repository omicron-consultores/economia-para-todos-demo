'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, BadgeCheck, Check, ChevronDown, Fingerprint, IdCard, LoaderCircle, LocateFixed, MapPin, Search, Smartphone, TriangleAlert } from 'lucide-react'
import { Choice } from '@/components/choice'
import { boliviaLocations, getMunicipalities } from '@/lib/bolivia-locations'
import {
  ANNUAL_SALES_LIMIT_BS, capitalRanges, contributionFor, createEmptyRegistration, demoActivityValues, demoBusiness,
  demoIdentity, demoLocation, demoNit, demoTramite, invoiceOptions, isValidCedula, isValidEmail, isValidPhone,
  municipalityCenters, parseAmount, paymentOptions, searchActivities, sectorName, workerOptions,
  type RegistrationValues, type VerificationMethod,
} from '@/lib/registration'

const steps = ['Identidad', 'Tus registros', 'Actividad', 'Ubicación', 'Tu negocio', 'Confirmar'] as const
type IdentityStage = 'choose' | 'ciudadania' | 'carnet' | 'verifying' | 'verified'

const money = (value: number) => `Bs ${new Intl.NumberFormat('es-BO').format(value)}`
const formatDate = (iso: string) => iso
  ? new Intl.DateTimeFormat('es-BO', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${iso}T12:00:00Z`))
  : ''
const coordinate = (value: number) => value.toFixed(4).replace('.', ',')

const lookups = [
  { institution: 'SEGIP', label: 'Identidad', result: 'Verificada', tone: 'ok' },
  { institution: 'SIN', label: 'NIT', result: 'No registrado · lo crearemos ahora', tone: 'new' },
  { institution: 'SEPREC', label: 'Matrícula de comercio', result: 'No registrada · opcional', tone: 'info' },
  { institution: 'Gestora Pública', label: 'Aportes de largo plazo', result: 'Sin aportes registrados', tone: 'info' },
] as const

function PinMap({ municipality, lat, lng, onPick }: { municipality: string; lat: number | null; lng: number | null; onPick: (lat: number, lng: number) => void }) {
  const center = municipalityCenters[municipality]
  const width = 320
  const height = 170
  const spanLng = 0.02
  const spanLat = 0.0106
  const pin = center && lat !== null && lng !== null
    ? { x: ((lng - center[1]) / spanLng + 0.5) * width, y: (0.5 - (lat - center[0]) / spanLat) * height }
    : null

  const pick = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!center) return
    const box = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - box.left) / box.width
    const y = (event.clientY - box.top) / box.height
    onPick(Number((center[0] + (0.5 - y) * spanLat).toFixed(5)), Number((center[1] + (x - 0.5) * spanLng).toFixed(5)))
  }

  return (
    <div className="pin-map-field">
      <div className={`pin-map ${center ? '' : 'is-disabled'}`}>
        <svg viewBox={`0 0 ${width} ${height}`} onClick={pick} role="img" aria-label={center ? 'Mapa: toca para marcar la ubicación de tu negocio' : 'Mapa no disponible: elige primero tu municipio'}>
          <rect width={width} height={height} className="map-ground" />
          {Array.from({ length: 6 }, (_, row) => Array.from({ length: 9 }, (_, col) => (
            <rect key={`${row}-${col}`} x={6 + col * 35 + (row % 2) * 4} y={6 + row * 28} width={27} height={20} rx={3} className="map-block" />
          )))}
          <path d={`M0 ${height * 0.58} L${width} ${height * 0.46}`} className="map-avenue" />
          <path d={`M${width * 0.36} 0 L${width * 0.42} ${height}`} className="map-avenue" />
          {pin && <g transform={`translate(${pin.x} ${pin.y})`} className="map-pin"><path d="M0 0 C-9 -12 -10 -16 -10 -20 A10 10 0 1 1 10 -20 C10 -16 9 -12 0 0Z" /><circle cy={-20} r={4} /></g>}
        </svg>
        {!center && <span className="pin-map-overlay">Elige primero tu municipio</span>}
      </div>
      <div className="pin-map-meta">
        <small>{pin ? `Lat ${coordinate(lat!)} · Lon ${coordinate(lng!)}` : 'Toca el mapa para marcar tu negocio'}</small>
        <button type="button" disabled={!center} onClick={() => center && onPick(Number((center[0] + 0.0016).toFixed(5)), Number((center[1] + 0.0042).toFixed(5)))}>
          <LocateFixed size={14} />Usar mi ubicación
        </button>
      </div>
    </div>
  )
}

export function RegistrationFlow({ onRegister, onExit }: { onRegister: (values: RegistrationValues) => void; onExit: () => void }) {
  const [step, setStep] = useState(0)
  const [values, setValues] = useState(createEmptyRegistration)
  const [identityStage, setIdentityStage] = useState<IdentityStage>('choose')
  const [lookupProgress, setLookupProgress] = useState(0)
  const [activityQuery, setActivityQuery] = useState('')
  const [contactTouched, setContactTouched] = useState(false)
  const startedAt = useRef(0)
  const timers = useRef<number[]>([])

  useEffect(() => {
    startedAt.current = Date.now()
    const pending = timers.current
    return () => pending.forEach((timer) => window.clearTimeout(timer))
  }, [])

  const update = <K extends keyof RegistrationValues>(key: K, value: RegistrationValues[K]) => setValues((current) => ({ ...current, [key]: value }))
  const later = (callback: () => void, delay: number) => { timers.current.push(window.setTimeout(callback, delay)) }

  const verify = (method: VerificationMethod) => {
    if (method === 'ciudadania') setValues((current) => ({ ...current, ...demoIdentity }))
    update('verification', method)
    setIdentityStage('verifying')
    later(() => setIdentityStage('verified'), 1300)
  }

  const goToLookup = () => {
    setStep(1)
    setLookupProgress(0)
    lookups.forEach((_, index) => later(() => setLookupProgress(index + 1), 550 * (index + 1)))
  }

  const identityReady = isValidCedula(values.cedula) && values.birthDate && values.firstName.trim() && values.lastName.trim()
  const contactValid = isValidEmail(values.email) && isValidPhone(values.phone)
  const activities = searchActivities(activityQuery).slice(0, 6)
  const sales = parseAmount(values.sales)
  const contribution = contributionFor(sales)
  const overLimit = sales * 12 > ANNUAL_SALES_LIMIT_BS
  const locationValid = Boolean(values.department && values.municipality && values.zone.trim() && values.reference.trim() && values.lat !== null
    && (values.worksAtHome || (values.homeZone.trim() && values.homeReference.trim())))
  const businessValid = sales > 0 && Boolean(values.capitalRange && values.workers && values.paymentMethods.length && values.invoiceDemand)
  const consentValid = values.consentSin && values.consentShare

  const fillDemo = () => {
    if (step === 0) {
      setValues((current) => ({ ...current, ...demoIdentity }))
      if (identityStage === 'choose' || identityStage === 'ciudadania') setIdentityStage('carnet')
    }
    if (step === 2) {
      setActivityQuery('costura')
      setValues((current) => ({ ...current, ...demoActivityValues }))
    }
    if (step === 3) setValues((current) => ({ ...current, ...demoLocation }))
    if (step === 4) setValues((current) => ({ ...current, ...demoBusiness }))
    if (step === 5) setValues((current) => ({ ...current, consentSin: true, consentShare: true, consentCredit: true }))
  }

  const submit = () => {
    if (!consentValid) return
    const now = Date.now()
    onRegister({
      ...values,
      cedula: values.cedula.trim(), firstName: values.firstName.trim(), lastName: values.lastName.trim(),
      email: values.email.trim(), phone: values.phone.trim(), zone: values.zone.trim(), reference: values.reference.trim(),
      nit: demoNit(values.cedula), tramite: demoTramite(values.cedula),
      registeredAt: new Date(now).toISOString().slice(0, 10),
      elapsedSeconds: Math.max(1, Math.round((now - startedAt.current) / 1000)),
    })
  }

  const back = () => {
    if (step === 0) {
      if (identityStage === 'choose') onExit()
      else { setIdentityStage('choose'); update('verification', null) }
    } else setStep(step === 2 ? 0 : step - 1)
  }

  let body: React.ReactNode = null
  let action: React.ReactNode = null

  if (step === 0) {
    if (identityStage === 'choose') {
      body = <>
        <h2>Crear mi Libreta Digital</h2>
        <p className="screen-subtitle">Primero confirmamos quién eres. No necesitas fotocopias.</p>
        <button type="button" className="identity-option primary" onClick={() => setIdentityStage('ciudadania')}>
          <Fingerprint size={26} /><span><strong>Ingresar con Ciudadanía Digital</strong><small>Tus datos llegan ya verificados</small></span>
        </button>
        <button type="button" className="identity-option" onClick={() => setIdentityStage('carnet')}>
          <IdCard size={26} /><span><strong>Usar mi carnet de identidad</strong><small>Verificamos tus datos con el SEGIP</small></span>
        </button>
        <p className="detail-note">Economía para Todos usa tu identidad solo para crear tu registro y tu NIT.</p>
      </>
    } else if (identityStage === 'ciudadania') {
      body = <>
        <h2>Ciudadanía Digital</h2>
        <div className="cd-card">
          <Smartphone size={30} />
          <strong>Aprueba la solicitud en tu celular</strong>
          <span>Abre la app Ciudadanía Digital. Economía para Todos solicita:</span>
          <ul className="check-list compact">
            {['Nombre y número de carnet', 'Fecha de nacimiento', 'Correo y celular'].map((item) => <li key={item}><Check size={15} />{item}</li>)}
          </ul>
          <div className="cd-code"><small>Código de confirmación</small><b>4 8 2 1</b></div>
        </div>
        <button type="button" className="text-action" onClick={() => setIdentityStage('carnet')}>Prefiero usar mi carnet</button>
      </>
      action = <button type="button" className="demo-button" onClick={() => verify('ciudadania')}>Ya aprobé en mi celular</button>
    } else if (identityStage === 'carnet') {
      body = <>
        <h2>Tu carnet de identidad</h2>
        <p className="screen-subtitle">Escribe los datos tal como aparecen en tu carnet.</p>
        <div className="form-stack">
          <div className="form-row">
            <label>Número de carnet<input inputMode="numeric" autoComplete="off" value={values.cedula} onChange={(event) => update('cedula', event.target.value.replace(/\D/g, ''))} /></label>
            <label className="narrow">Complemento<input autoComplete="off" maxLength={2} placeholder="Si tiene" value={values.complement} onChange={(event) => update('complement', event.target.value.toUpperCase())} /></label>
          </div>
          <label>Fecha de nacimiento<input type="date" value={values.birthDate} onChange={(event) => update('birthDate', event.target.value)} /></label>
          <label>Nombres<input autoComplete="given-name" value={values.firstName} onChange={(event) => update('firstName', event.target.value)} /></label>
          <label>Apellidos<input autoComplete="family-name" value={values.lastName} onChange={(event) => update('lastName', event.target.value)} /></label>
        </div>
      </>
      action = <button type="button" className="demo-button" disabled={!identityReady} onClick={() => verify('segip')}>Verificar con el SEGIP</button>
    } else if (identityStage === 'verifying') {
      body = <div className="verifying" role="status">
        <LoaderCircle size={40} className="spin" />
        <strong>{values.verification === 'ciudadania' ? 'Recibiendo tus datos de Ciudadanía Digital…' : 'Verificando tus datos con el SEGIP…'}</strong>
      </div>
    } else {
      const fromCd = values.verification === 'ciudadania'
      body = <>
        <h2>Identidad verificada</h2>
        <div className="verified-card">
          <span className="benefit-status"><BadgeCheck size={17} />{fromCd ? 'Ciudadanía Digital · contrastado con SEGIP' : 'Contrastado con SEGIP'}</span>
          <strong>{values.firstName} {values.lastName}</strong>
          <span>CI {values.cedula}{values.complement && `-${values.complement}`} · Nació el {formatDate(values.birthDate)}</span>
        </div>
        <h4>¿Dónde te avisamos?</h4>
        {fromCd ? (
          <div className="profile-data">
            <div><span>Correo</span><strong>{values.email}</strong></div>
            <div><span>Celular</span><strong>{values.phone}</strong></div>
          </div>
        ) : (
          <div className="form-stack">
            <label>Correo electrónico<input type="email" autoComplete="email" value={values.email} onBlur={() => setContactTouched(true)} onChange={(event) => update('email', event.target.value)} /></label>
            <label>Celular<input inputMode="tel" autoComplete="tel" maxLength={8} value={values.phone} onBlur={() => setContactTouched(true)} onChange={(event) => update('phone', event.target.value.replace(/\D/g, ''))} /></label>
            {contactTouched && !contactValid && <p className="field-error" role="alert">Revisa tu correo y tu celular (8 dígitos, empieza con 6 o 7).</p>}
          </div>
        )}
        <p className="detail-note">Aquí recibirás tus credenciales del SIN y los avisos de tu Libreta.</p>
      </>
      action = <button type="button" className="demo-button" disabled={!contactValid} onClick={goToLookup}>Continuar</button>
    }
  } else if (step === 1) {
    const done = lookupProgress >= lookups.length
    body = <>
      <h2>Revisamos tus registros</h2>
      <p className="screen-subtitle">Consultamos a las instituciones por ti, con tu carnet.</p>
      <ul className="lookup-list" aria-live="polite">
        {lookups.map((item, index) => {
          const ready = lookupProgress > index
          return <li key={item.institution} className={ready ? `is-${item.tone}` : ''}>
            <span className="lookup-icon">{ready ? <Check size={16} /> : <LoaderCircle size={16} className="spin" />}</span>
            <div><small>{item.institution} · {item.label}</small><strong>{ready ? item.result : 'Consultando…'}</strong></div>
          </li>
        })}
      </ul>
      {done && <div className="highlight-box"><b>Te falta poco</b><span>Con tu actividad y tu ubicación creamos tu NIT y tu Libreta Digital en un solo paso.</span></div>}
      <p className="detail-note">Consulta mediante la Plataforma de Interoperabilidad del Estado · simulada para la demostración.</p>
    </>
    action = <button type="button" className="demo-button" disabled={!done} onClick={() => setStep(2)}>Continuar</button>
  } else if (step === 2) {
    body = <>
      <h2>¿A qué te dedicas?</h2>
      <p className="screen-subtitle">Escribe con tus palabras. Lo traducimos a la actividad oficial.</p>
      <label className="search-field">
        <Search size={18} />
        <input aria-label="Buscar actividad" placeholder="Ej.: costura, comida, peluquería" value={activityQuery} onChange={(event) => setActivityQuery(event.target.value)} />
      </label>
      <div className="option-list" role="radiogroup" aria-label="Actividad económica">
        {activities.length ? activities.map((item) => {
          const selected = values.activityCode === item.code
          return <button type="button" role="radio" aria-checked={selected} key={item.code} className={`option-item ${selected ? 'selected' : ''}`}
            onClick={() => setValues((current) => ({ ...current, activityCode: item.code, activity: item.label, sectorId: item.sectorId, sector: sectorName(item.sectorId) }))}>
            <span><strong>{item.label}</strong><small>Código {item.code} · {sectorName(item.sectorId)}</small></span>
            {selected && <Check size={18} />}
          </button>
        }) : <p className="detail-note">No encontramos esa actividad. Prueba con otra palabra.</p>}
      </div>
      <p className="detail-note">Clasificador de actividades CAEB del SIN, alineado al INE · muestra de demostración.</p>
    </>
    action = <button type="button" className="demo-button" disabled={!values.activityCode} onClick={() => setStep(3)}>Continuar</button>
  } else if (step === 3) {
    const municipalities = getMunicipalities(values.department)
    body = <>
      <h2>¿Dónde trabajas?</h2>
      <p className="screen-subtitle">El SIN necesita saber dónde funciona tu negocio.</p>
      <div className="form-stack">
        <div className="form-row">
          <label>Departamento<div className="form-select">
            <select value={values.department} onChange={(event) => setValues((current) => ({ ...current, department: event.target.value, municipality: '', lat: null, lng: null }))}>
              <option value="" disabled>Elige</option>
              {boliviaLocations.map((item) => <option key={item.name}>{item.name}</option>)}
            </select><ChevronDown size={16} />
          </div></label>
          <label>Municipio<div className="form-select">
            <select disabled={!values.department} value={values.municipality} onChange={(event) => setValues((current) => ({ ...current, municipality: event.target.value, lat: null, lng: null }))}>
              <option value="" disabled>Elige</option>
              {municipalities.map((item) => <option key={item}>{item}</option>)}
            </select><ChevronDown size={16} />
          </div></label>
        </div>
        <label>Zona o barrio<input value={values.zone} onChange={(event) => update('zone', event.target.value)} /></label>
        <div className="ci-field"><span><MapPin size={14} /> Marca tu negocio en el mapa</span>
          <PinMap municipality={values.municipality} lat={values.lat} lng={values.lng} onPick={(lat, lng) => setValues((current) => ({ ...current, lat, lng }))} />
        </div>
        <label>¿Cómo se llega?<textarea rows={2} maxLength={500} placeholder="Ej.: frente al mercado, puerta verde" value={values.reference} onChange={(event) => update('reference', event.target.value)} /></label>
        <label className="checkbox-row">
          <input type="checkbox" checked={values.worksAtHome} onChange={(event) => update('worksAtHome', event.target.checked)} />
          <span>Mi negocio funciona en mi casa</span>
        </label>
        {!values.worksAtHome && <>
          <label>Zona de tu domicilio<input value={values.homeZone} onChange={(event) => update('homeZone', event.target.value)} /></label>
          <label>Referencia de tu domicilio<input value={values.homeReference} onChange={(event) => update('homeReference', event.target.value)} /></label>
        </>}
      </div>
    </>
    action = <button type="button" className="demo-button" disabled={!locationValid} onClick={() => setStep(4)}>Continuar</button>
  } else if (step === 4) {
    body = <>
      <h2>Tu negocio</h2>
      <p className="screen-subtitle">Valores aproximados. Puedes actualizarlos después.</p>
      <div className="form-stack">
        <label>¿Cuánto vendes en un mes normal?
          <span className="money-input"><b>Bs</b><input inputMode="numeric" value={sales ? new Intl.NumberFormat('es-BO').format(sales) : ''} onChange={(event) => update('sales', event.target.value.replace(/\D/g, ''))} /></span>
        </label>
        <label>¿Cuánto vale lo que usas para trabajar?<div className="form-select">
          <select value={values.capitalRange} onChange={(event) => update('capitalRange', event.target.value)}>
            <option value="" disabled>Máquinas, herramientas e insumos</option>
            {capitalRanges.map((item) => <option key={item}>{item}</option>)}
          </select><ChevronDown size={16} />
        </div></label>
        <div className="field-group"><span>¿Cuántas personas trabajan?</span><Choice label="Personas que trabajan" options={workerOptions} value={values.workers} onChange={(value) => update('workers', value)} /></div>
        <div className="field-group"><span>¿Cómo te pagan?</span><Choice label="Formas de pago" multiple options={paymentOptions} value={values.paymentMethods}
          onChange={(value) => update('paymentMethods', values.paymentMethods.includes(value) ? values.paymentMethods.filter((item) => item !== value) : [...values.paymentMethods, value])} /></div>
        <div className="field-group"><span>¿Tus clientes te piden factura?</span><Choice label="Clientes piden factura" options={invoiceOptions} value={values.invoiceDemand} onChange={(value) => update('invoiceDemand', value)} /></div>
      </div>
      {sales > 0 && (overLimit ? (
        <div className="warning-box" role="status"><TriangleAlert size={20} /><span>Tus ventas superan {money(ANNUAL_SALES_LIMIT_BS)} al año. Te orientaremos al Régimen General del SIN.</span></div>
      ) : (
        <div className="estimate-box" role="status">
          <small>Tu aporte único estimado</small>
          <strong>{money(contribution)} <span>al mes</span></strong>
          <span>Un solo pago que reúne tus impuestos de pequeño negocio.</span>
          <em>Modelo propuesto del programa · no es una tasa vigente</em>
        </div>
      ))}
    </>
    action = <button type="button" className="demo-button" disabled={!businessValid || overLimit} onClick={() => setStep(5)}>Continuar</button>
  } else {
    const rows = [
      ['Identidad', `${values.firstName} ${values.lastName} · CI ${values.cedula}`, 0],
      ['Actividad', `${values.activity} (${values.activityCode})`, 2],
      ['Negocio', `${values.zone}, ${values.municipality} · ${values.department}`, 3],
      ['Ventas y aporte', `${money(sales)} al mes · aporte ${money(contribution)}`, 4],
    ] as const
    body = <>
      <h2>Revisa y autoriza</h2>
      <dl className="summary-list">
        {rows.map(([label, value, target]) => <div key={label}>
          <dt>{label}</dt><dd>{value}</dd>
          <button type="button" onClick={() => { if (target === 0) setIdentityStage('verified'); setStep(target) }}>Cambiar</button>
        </div>)}
      </dl>
      <div className="consent-list">
        <label className="checkbox-row"><input type="checkbox" checked={values.consentSin} onChange={(event) => update('consentSin', event.target.checked)} />
          <span><strong>Inscribirme en el SIN</strong> y obtener mi NIT con estos datos.</span></label>
        <label className="checkbox-row"><input type="checkbox" checked={values.consentShare} onChange={(event) => update('consentShare', event.target.checked)} />
          <span><strong>Compartir mis datos</strong> con SEGIP, SIN, SEPREC y Gestora solo para este trámite.</span></label>
        <label className="checkbox-row"><input type="checkbox" checked={values.consentCredit} onChange={(event) => update('consentCredit', event.target.checked)} />
          <span><strong>Opcional:</strong> que el BDP evalúe mi perfil para crédito y consulte la central de riesgos de ASFI.</span></label>
      </div>
      <p className="detail-note">Puedes revisar o retirar tus autorizaciones en Ajustes.</p>
    </>
    action = <button type="button" className="demo-button" disabled={!consentValid} onClick={submit}>Confirmar registro</button>
  }

  return (
    <div className="mobile-screen registration-flow">
      <div className="wizard-header">
        {identityStage !== 'verifying' && <button type="button" className="back-button" onClick={back}><ArrowLeft size={18} />Volver</button>}
        <div className="wizard-step"><span>Paso {step + 1} de {steps.length}</span><b>{steps[step]}</b></div>
        <div className="wizard-progress" aria-hidden="true">{steps.map((item, index) => <span key={item} className={index <= step ? 'done' : ''} />)}</div>
      </div>
      {body}
      <div className="wizard-actions">
        {action}
        {step !== 1 && !(step === 0 && (identityStage === 'verifying' || identityStage === 'ciudadania' || (identityStage === 'verified' && values.verification === 'ciudadania'))) && (
          <button type="button" className="presenter-helper" onClick={fillDemo}>llenar datos demo</button>
        )}
      </div>
    </div>
  )
}
