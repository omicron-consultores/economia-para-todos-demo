'use client'

import { useState } from 'react'
import { ArrowLeft, Bell, Fingerprint, IdCard, Lock, Mail, Phone } from 'lucide-react'
import type { RegistrationValues } from '@/lib/registration'

function Switch({ checked, onChange, label }: { checked: boolean; onChange: (checked: boolean) => void; label: string }) {
  return (
    <label className="switch-row">
      <span>{label}</span>
      <input type="checkbox" role="switch" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <i aria-hidden="true" />
    </label>
  )
}

export function Settings({ identity, onBack, onUpdate }: {
  identity: RegistrationValues
  onBack: () => void
  onUpdate: (patch: Partial<RegistrationValues>) => void
}) {
  const [notifications, setNotifications] = useState({ buzon: true, aporte: true, oportunidades: true })
  const fromCd = identity.verification === 'ciudadania'

  return (
    <div className="mobile-screen">
      <button type="button" className="back-button" onClick={onBack}><ArrowLeft size={18} />Volver</button>
      <h2>Ajustes</h2>

      <h4 className="settings-heading">Contacto</h4>
      <div className="settings-list">
        <div><Phone size={18} /> Celular <span>{identity.phone}</span></div>
        <div><Mail size={18} /> Correo <span>{identity.email}</span></div>
      </div>

      <h4 className="settings-heading">Avisos</h4>
      <div className="settings-group">
        <Switch label="Notificaciones de mi Buzón Tributario (SIN)" checked={notifications.buzon} onChange={(buzon) => setNotifications((current) => ({ ...current, buzon }))} />
        <Switch label="Recordatorio de pago del aporte único" checked={notifications.aporte} onChange={(aporte) => setNotifications((current) => ({ ...current, aporte }))} />
        <Switch label="Nuevas oportunidades para mi negocio" checked={notifications.oportunidades} onChange={(oportunidades) => setNotifications((current) => ({ ...current, oportunidades }))} />
      </div>

      <h4 className="settings-heading">Mis autorizaciones</h4>
      <div className="settings-group">
        <div className="consent-row"><Lock size={16} /><div><strong>Inscripción en el SIN</strong><small>Activa · necesaria para mantener tu NIT</small></div></div>
        <div className="consent-row"><Lock size={16} /><div><strong>Datos compartidos con SEGIP, SIN, SEPREC y Gestora</strong><small>Activa · necesaria para tu Libreta Digital</small></div></div>
        <Switch label="El BDP puede evaluar mi perfil y consultar la central de riesgos (ASFI)" checked={identity.consentCredit} onChange={(consentCredit) => onUpdate({ consentCredit })} />
        {!identity.consentCredit && <p className="detail-note">Retiraste esta autorización. El BDP ya no podrá consultar tu historial hasta que la vuelvas a dar.</p>}
      </div>

      <h4 className="settings-heading">Seguridad</h4>
      <div className="settings-list">
        <div>{fromCd ? <Fingerprint size={18} /> : <IdCard size={18} />} Ingreso <span>{fromCd ? 'Ciudadanía Digital' : 'Carnet + SEGIP'}</span></div>
        <div><Bell size={18} /> Último acceso <span>Hoy · este dispositivo</span></div>
      </div>
    </div>
  )
}
