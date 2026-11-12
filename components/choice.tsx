import { Check } from 'lucide-react'

/** Large tappable chips for single or multiple choice in the mobile app. */
export function Choice<T extends string | number>({ options, value, onChange, multiple = false, label, format = String }: {
  options: readonly T[]
  value: T | T[]
  onChange: (value: T) => void
  multiple?: boolean
  label: string
  format?: (value: T) => string
}) {
  return (
    <div className="choice-row" role="group" aria-label={label}>
      {options.map((option) => {
        const selected = multiple ? (value as T[]).includes(option) : value === option
        return <button type="button" key={String(option)} aria-pressed={selected} className={`choice-chip ${selected ? 'selected' : ''}`} onClick={() => onChange(option)}>
          {selected && <Check size={14} />}{format(option)}
        </button>
      })}
    </div>
  )
}
