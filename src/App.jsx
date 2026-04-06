import { useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'ols-airsoft-checklist-v1'

const PHASES = [
  {
    id: 'field-prep',
    label: 'Field Prep',
    items: {
      day: [
        'Confirm field waiver, call times, and filming permissions',
        'Charge cameras, action cams, comms, and spare batteries',
        'Pack ND filters, lens wipes, and anti-fog kit',
        'Prep bright tape or markers for player identification',
        'Stage hydration, snacks, and weather cover in the field bag',
      ],
      night: [
        'Confirm field waiver, call times, and low-light filming permissions',
        'Charge cameras, action cams, helmet lights, and spare batteries',
        'Pack fast lens, lens wipes, anti-fog kit, and rain cover',
        'Stage IR strobes, chem lights, or reflective markers for IDs',
        'Pre-brief flashlight discipline and safe movement lanes',
      ],
    },
  },
  {
    id: 'intake',
    label: 'Intake',
    items: {
      day: [
        'Offload all cards before formatting anything',
        'Create project folder with date, field, and event name',
        'Rename A-cam, B-cam, and POV footage consistently',
        'Backup raw footage to a second drive',
        'Log standout plays, callouts, and interview clips',
      ],
      night: [
        'Offload all cards and isolate low-light footage by camera',
        'Create project folder with date, field, and night-op tag',
        'Rename A-cam, B-cam, POV, and thermal or IR clips consistently',
        'Backup raw footage and verify dark-scene files copied cleanly',
        'Log standout tracer moments, light discipline clips, and comms audio',
      ],
    },
  },
  {
    id: 'sync',
    label: 'Sync',
    items: {
      day: [
        'Sync cameras with scratch audio or slate markers',
        'Check frame rates before building multicam sequences',
        'Align external audio for interviews and staging clips',
        'Build selects timeline for key engagements',
        'Flag clips with exposure or focus issues early',
      ],
      night: [
        'Sync cameras with waveform peaks from shots, comms, or slate clicks',
        'Check frame rates and shutter mismatches in low-light clips',
        'Align external audio and suppress handling noise where needed',
        'Build selects timeline around tracer fire and key pushes',
        'Flag clips with unusable darkness, focus hunting, or sensor noise',
      ],
    },
  },
  {
    id: 'cut',
    label: 'Cut',
    items: {
      day: [
        'Shape cold open around the strongest gameplay hook',
        'Cut dead space between movement, contact, and reactions',
        'Mix POV and wide shots to preserve field geography',
        'Add lower thirds or quick labels for squads and objectives',
        'Review pacing on iPad-sized playback before locking structure',
      ],
      night: [
        'Open with the clearest high-tension night engagement',
        'Trim dark dead space aggressively to keep momentum',
        'Alternate POV, tracer shots, and map context for orientation',
        'Add quick labels for squads, objectives, and lighting context',
        'Review pacing on small-screen playback to confirm readability',
      ],
    },
  },
  {
    id: 'ai-polish',
    label: 'AI Polish',
    items: {
      day: [
        'Run transcript or caption generation on dialogue-heavy sections',
        'Use speech cleanup on interviews and comms highlights',
        'Apply AI-assisted reframing only where action stays centered',
        'Generate chapter titles or social clip notes from the rough cut',
        'Review every AI change manually before approval',
      ],
      night: [
        'Run transcript or caption generation and correct low-light mishears',
        'Use speech cleanup to recover quiet comms and mask background hiss',
        'Apply AI-assisted exposure or denoise tools conservatively',
        'Generate chapter titles or social clip notes around key night pushes',
        'Review every AI change manually for artifacts and false detail',
      ],
    },
  },
  {
    id: 'export',
    label: 'Export',
    items: {
      day: [
        'Check titles, captions, and sponsor tags for final spelling',
        'Export master, upload version, and short-form cutdowns',
        'Watch exported file for color shifts or audio clipping',
        'Archive project file, graphics, and final assets',
        'Reset checklist only after backup is confirmed',
      ],
      night: [
        'Check titles, captions, and brightness notes for final spelling',
        'Export master, upload version, and vertical cutdowns',
        'Watch exported file for crushed shadows, banding, or audio clipping',
        'Archive project file, LUTs, denoise settings, and final assets',
        'Reset checklist only after backup is confirmed',
      ],
    },
  },
]

function buildInitialState(isNightGame) {
  return {
    isNightGame,
    checked: {},
  }
}

function normalizeState(savedState) {
  if (!savedState || typeof savedState !== 'object') {
    return buildInitialState(false)
  }

  return {
    isNightGame: Boolean(savedState.isNightGame),
    checked: savedState.checked && typeof savedState.checked === 'object' ? savedState.checked : {},
  }
}

function getChecklistKey(phaseId, mode, item) {
  return `${phaseId}:${mode}:${item}`
}

export default function App() {
  const [state, setState] = useState(() => {
    if (typeof window === 'undefined') {
      return buildInitialState(false)
    }

    const saved = window.localStorage.getItem(STORAGE_KEY)

    if (!saved) {
      return buildInitialState(false)
    }

    try {
      return normalizeState(JSON.parse(saved))
    } catch {
      return buildInitialState(false)
    }
  })

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const mode = state.isNightGame ? 'night' : 'day'

  const totalItems = useMemo(
    () => PHASES.reduce((count, phase) => count + phase.items[mode].length, 0),
    [mode],
  )

  const completedItems = useMemo(
    () =>
      PHASES.reduce(
        (count, phase) =>
          count +
          phase.items[mode].filter((item) => state.checked[getChecklistKey(phase.id, mode, item)]).length,
        0,
      ),
    [mode, state.checked],
  )

  const progress = totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100)

  function toggleNightGame() {
    setState((currentState) => ({
      ...currentState,
      isNightGame: !currentState.isNightGame,
    }))
  }

  function toggleItem(phaseId, item) {
    setState((currentState) => {
      const itemKey = getChecklistKey(phaseId, mode, item)

      return {
        ...currentState,
        checked: {
          ...currentState.checked,
          [itemKey]: !currentState.checked[itemKey],
        },
      }
    })
  }

  function resetCurrentMode() {
    setState((currentState) => {
      const nextChecked = { ...currentState.checked }

      PHASES.forEach((phase) => {
        phase.items[mode].forEach((item) => {
          delete nextChecked[getChecklistKey(phase.id, mode, item)]
        })
      })

      return {
        ...currentState,
        checked: nextChecked,
      }
    })
  }

  return (
    <main className="app-shell">
      <section className="hero-card">
        <p className="eyebrow">Airsoft Video Production</p>
        <h1>OLS Editing Checklist</h1>
        <p className="hero-copy">
          Track the shoot-to-export workflow on your iPad without losing progress.
        </p>

        <div className="hero-metrics">
          <div>
            <span className="metric-label">Mode</span>
            <strong>{state.isNightGame ? 'Night Game' : 'Day Game'}</strong>
          </div>
          <div>
            <span className="metric-label">Progress</span>
            <strong>
              {completedItems}/{totalItems}
            </strong>
          </div>
        </div>

        <label className="mode-toggle" htmlFor="night-mode">
          <span>
            <strong>Night Game</strong>
            <small>Swap each phase to low-light workflow items.</small>
          </span>
          <button
            id="night-mode"
            type="button"
            className={`toggle-button ${state.isNightGame ? 'is-active' : ''}`}
            onClick={toggleNightGame}
            aria-pressed={state.isNightGame}
          >
            <span className="toggle-thumb" />
          </button>
        </label>

        <div className="progress-block" aria-label="Checklist progress">
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span>{progress}% complete</span>
        </div>
      </section>

      <section className="phase-list" aria-label="Checklist phases">
        {PHASES.map((phase) => (
          <article className="phase-card" key={phase.id}>
            <div className="phase-header">
              <div>
                <p className="phase-kicker">Phase</p>
                <h2>{phase.label}</h2>
              </div>
              <span className="phase-count">{phase.items[mode].length} tasks</span>
            </div>

            <ul className="checklist">
              {phase.items[mode].map((item) => {
                const itemKey = getChecklistKey(phase.id, mode, item)
                const checked = Boolean(state.checked[itemKey])

                return (
                  <li key={itemKey}>
                    <label className={`checklist-item ${checked ? 'is-checked' : ''}`}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleItem(phase.id, item)}
                      />
                      <span className="checkbox-mark" aria-hidden="true" />
                      <span className="item-text">{item}</span>
                    </label>
                  </li>
                )
              })}
            </ul>
          </article>
        ))}
      </section>

      <section className="footer-bar">
        <p>
          Saved automatically in LocalStorage on this browser, so closing Safari on your iPad
          will not wipe the checklist.
        </p>
        <button type="button" className="reset-button" onClick={resetCurrentMode}>
          Reset Current Mode
        </button>
      </section>
    </main>
  )
}