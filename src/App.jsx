import { useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'ols-airsoft-checklist-v1'

const PHASES = [
  {
    id: 'field-prep',
    label: 'Field Prep & Storage',
    subtitle: 'Before the iPad',
    items: {
      day: [
        'Pull Internal Batteries: Use external power banks only (prevents overheating).',
        'Rode "Always Record": Set both transmitters to internal backup recording.',
        'Wind Protection: Twist-lock deadcats on Rodes; use foam "windslayers" or tape on GoPros.',
        'Camera Settings: Lock Day (4K/60) and Dusk (4K/24, ISO 1600) presets.',
        'SSD Prep: Format your Samsung/SanDisk SSD to APFS (fastest for iPad).',
        'Folder Drop: Use the ME_FACE, ME_SCOPE, CALLIE, LEADER structure.',
      ],
      night: [
        'Pull Internal Batteries: Use external power banks only (night sessions run long).',
        'Rode "Always Record": Set both transmitters to internal backup recording.',
        'Wind Protection: Twist-lock deadcats on Rodes; use foam "windslayers" or tape on GoPros.',
        'Camera Settings: Lock Night preset (4K/24, ISO 3200) for all cameras.',
        'SSD Prep: Format your Samsung/SanDisk SSD to APFS (fastest for iPad).',
        'Folder Drop: Use the ME_FACE, ME_SCOPE, CALLIE, LEADER structure with a NIGHT tag.',
      ],
    },
  },
  {
    id: 'intake',
    label: 'Technical Intake',
    subtitle: 'The "Resource Saver" Step',
    items: {
      day: [
        'Import Media: Bring your structured folders into the Media Pool.',
        'Assign Angles: In Metadata, tag cameras 1 through 4 (this fixes the sync grid later).',
        'Generate Proxies: Right-click all clips > Generate Proxies (ProRes 422 LT).',
        'Timeline Hack: Set Project Settings to 1080p (even if footage is 4K).',
        'AI Audio Cleanup: Turn on Voice Isolation (50%) and Dialogue Leveler on your Rode tracks.',
      ],
      night: [
        'Import Media: Bring your structured night-op folders into the Media Pool.',
        'Assign Angles: In Metadata, tag cameras 1 through 4 (this fixes the sync grid later).',
        'Generate Proxies: Right-click all clips > Generate Proxies (ProRes 422 LT).',
        'Timeline Hack: Set Project Settings to 1080p (even if footage is 4K).',
        'AI Audio Cleanup: Turn on Voice Isolation (50%) and Dialogue Leveler on your Rode tracks.',
      ],
    },
  },
  {
    id: 'sync',
    label: 'Master Sync',
    subtitle: 'Cut Page',
    items: {
      day: [
        'Create Multicam: Highlight all video and Rode files > Create Multicam Clip (Sound/Waveform).',
        'Open in Timeline: Right-click Multicam > Open in Timeline to mute all GoPro mics.',
        'Sync Check: Confirm the GoPro "Beeps" or gunshots line up with the Rode audio waveforms.',
        'The "Anchor": Keep the Rode tracks as your constant audio throughout the project.',
      ],
      night: [
        'Create Multicam: Highlight all video and Rode files > Create Multicam Clip (Sound/Waveform).',
        'Open in Timeline: Right-click Multicam > Open in Timeline to mute all GoPro mics.',
        'Sync Check: Confirm the GoPro beeps or BB impacts line up with the Rode audio waveforms.',
        'The "Anchor": Keep the Rode tracks as your constant audio throughout the night project.',
      ],
    },
  },
  {
    id: 'cut',
    label: 'Creative Cut',
    subtitle: 'Speed Editor Mode',
    items: {
      day: [
        'Source Tape: Use the wheel to find action hits/tags across the whole day.',
        'Append Cuts: Build your rough story by "stacking" clips onto the timeline.',
        'Source Overwrite: While watching a headcam hit, use the CAM 2 button + wheel to drop in the scope-cam shot.',
        'Ignore Gaps: Keep the sync gaps on the timeline until the very end of the rough cut.',
      ],
      night: [
        'Source Tape: Use the wheel to find tracer fire, light hits, and tags across the night footage.',
        'Append Cuts: Build your rough story by stacking clips; trim dark dead space aggressively.',
        'Source Overwrite: While watching a headcam hit, use the CAM 2 button + wheel to drop in the scope-cam shot.',
        'Ignore Gaps: Keep the sync gaps on the timeline until the very end of the rough cut.',
      ],
    },
  },
  {
    id: 'ai-polish',
    label: 'Hero 4 & AI Polish',
    subtitle: 'Phased Resource Use',
    items: {
      day: [
        'Stabilize & Up-Res: Apply SuperScale 2x and Stabilization to only the Hero 4 clips you used.',
        'Render in Place: Right-click those Hero 4 clips > Render in Place (bakes the AI so RAM doesn\'t recalculate).',
        'Shared Nodes: In the Color Page, apply one "Grade" to the GoPro 10 track so every clip matches at once.',
        'AI Magic Mask: (Do this last!) Track a person or object, then Lock the Node.',
      ],
      night: [
        'Stabilize & Up-Res: Apply SuperScale 2x and Stabilization to Hero 4 clips only; skip excessively noisy low-light clips.',
        'Render in Place: Right-click those Hero 4 clips > Render in Place to bake the AI.',
        'Shared Nodes + LUT: In the Color Page, apply one grade with a denoise pass to the GoPro 10 track.',
        'AI Magic Mask: (Do this last!) Track a person or IR light source, then Lock the Node.',
      ],
    },
  },
  {
    id: 'export',
    label: 'Final Export',
    subtitle: 'The "Pro" Finish',
    items: {
      day: [
        'Switch to 4K: Go back to Project Settings and flip the timeline from 1080p to 3840 x 2160.',
        'Smart Cache Check: Ensure the "Render Cache" bar is Blue (wait for it to turn from Red).',
        'The Render: MP4 · H.265 (Master) · 60,000 Kbps (for 60fps action).',
        'SSD Export: Export to the 04_EXPORTS folder to keep your RAW files clean.',
      ],
      night: [
        'Switch to 4K: Flip the timeline from 1080p to 3840 x 2160 in Project Settings.',
        'Smart Cache Check: Ensure the "Render Cache" bar is Blue (denoise + upscale may take longer).',
        'The Render: MP4 · H.265 (Master) · 60,000 Kbps (for 24fps night footage).',
        'SSD Export: Export to the 04_EXPORTS folder to keep your RAW files clean.',
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
          DaVinci Resolve iPad workflow — from field prep to 4K export. Proxies and 1080p timeline keep the iPad cool; AI up-res waits until the edit is short.
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
                <p className="phase-kicker">Phase {PHASES.indexOf(phase) + 1}</p>
                <h2>{phase.label}</h2>
                {phase.subtitle && <p className="phase-subtitle">{phase.subtitle}</p>}
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