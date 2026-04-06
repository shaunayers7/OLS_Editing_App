import { useState, useCallback } from 'react'

// ─────────────────────────────────────────────
// useLocalStorage hook
// ─────────────────────────────────────────────
function useLocalStorage(key, initialValue) {
  const [state, setStateRaw] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setState = useCallback(
    (value) => {
      setStateRaw((prev) => {
        const next = typeof value === 'function' ? value(prev) : value
        try {
          window.localStorage.setItem(key, JSON.stringify(next))
        } catch {}
        return next
      })
    },
    [key],
  )

  return [state, setState]
}

// ─────────────────────────────────────────────
// Camera Ledger Data
// ─────────────────────────────────────────────
const CAMERAS = [
  {
    id: 'gp10',
    name: 'GP 10',
    role: 'Me / Face',
    res: '2.7K/60',
    ar: '4:3',
    storage: '128GB Pro',
    power: 'Ext. Bank',
    nightCam: false,
    card: 'SanDisk Extreme Pro V30',
    notes:
      'Primary face cam. 4:3 aspect gives vertical crop flexibility for Reels/Shorts. Always on external power bank — internal overheats.',
  },
  {
    id: 'gp8',
    name: 'GP 8',
    role: 'Callie',
    res: '2.7K/60',
    ar: '4:3',
    storage: '128GB',
    power: 'Internal',
    nightCam: false,
    card: 'SanDisk Extreme',
    notes:
      'Secondary face cam. Check internal battery charge the night before. Same resolution settings as GP 10.',
  },
  {
    id: 'gp4',
    name: 'GP 4',
    role: 'Leader',
    res: '2.7K/30',
    ar: '4:3',
    storage: '64GB',
    power: 'Ext. Bank',
    nightCam: false,
    card: 'SanDisk Extreme',
    notes:
      '30fps source — requires SuperScale 2x in AI Polish phase. SMALLEST card (64GB) — warn the Leader to offload early at half-time.',
  },
  {
    id: 'gitup',
    name: 'GitUp',
    role: 'Scope Cam',
    res: '2.7K/60',
    ar: '16:9',
    storage: '128GB',
    power: 'Internal',
    nightCam: false,
    card: 'SanDisk',
    notes:
      'Fixed focus 10–50m. 16:9 widescreen. Mount at scope-level for tight gun-cam POV. Check focus ring before every game.',
  },
  {
    id: 'sionyx',
    name: 'Sionyx',
    role: 'Night Vision',
    res: '720p/24',
    ar: '16:9',
    storage: 'Internal',
    power: 'Internal',
    nightCam: true,
    card: 'Internal — offload after every game',
    notes:
      '⚠ Night vision only. Set Scene: Night preset before every op. Requires SuperScale 2x. NIGHT OPS EXCLUSIVE — do not use in daylight.',
  },
  {
    id: 'iphone',
    name: 'iPhones',
    role: '13 / 10',
    res: '1080p–2.7K',
    ar: '16:9',
    storage: 'Internal',
    power: 'Battery',
    nightCam: false,
    card: 'AirDrop or cable immediately',
    notes:
      'Backup angles only. Standard mode, 60fps. Import via AirDrop or USB-C cable to SSD immediately — do not rely on iCloud.',
  },
]

// ─────────────────────────────────────────────
// Phase / Checklist Data
// ─────────────────────────────────────────────
const DEFAULT_PHASES = [
  {
    id: 'field-prep',
    label: 'Field Prep & Storage',
    subtitle: 'Before the iPad',
    day: [
      'Pull Internal Batteries: Use external power banks only (prevents overheating).',
      'Rode "Always Record": Set both transmitters to internal backup recording.',
      'Wind Protection: Twist-lock deadcats on Rodes; foam "windslayers" or tape on GoPros.',
      'Camera Settings: Lock Day (4K/60) and Dusk (4K/24, ISO 1600) presets.',
      'SSD Prep: Format Samsung/SanDisk SSD to APFS (fastest for iPad).',
      'Folder Drop: Use ME_FACE, ME_SCOPE, CALLIE, LEADER structure.',
    ],
    night: [
      'Pull Internal Batteries: Use external power banks only (night sessions run long).',
      'Rode "Always Record": Set both transmitters to internal backup recording.',
      'Wind Protection: Twist-lock deadcats on Rodes; foam "windslayers" or tape on GoPros.',
      'Camera Settings: Lock Night preset (4K/24, ISO 3200) + Sionyx → Scene: Night.',
      'SSD Prep: Format Samsung/SanDisk SSD to APFS.',
      'Folder Drop: ME_FACE, ME_SCOPE, CALLIE, LEADER, SIONYX — add NIGHT tag.',
      'Sionyx Check: Fully charged, Scene: Night, internal recording ON.',
    ],
  },
  {
    id: 'intake',
    label: 'Technical Intake',
    subtitle: 'The "Resource Saver" Step',
    day: [
      'Import Media: Bring structured folders into the Media Pool.',
      'Assign Angles: In Metadata, tag cameras 1–4 (fixes the sync grid).',
      'Generate Proxies: Right-click all clips → Generate Proxies (ProRes 422 LT).',
      'Timeline Hack: Set Project Settings to 1080p (even if footage is 4K).',
      'AI Audio Cleanup: Voice Isolation (50%) + Dialogue Leveler on Rode tracks.',
    ],
    night: [
      'Import Media: Bring night-op folders into the Media Pool.',
      'Assign Angles: Tag cameras 1–4 + Sionyx as CAM 5 in Metadata.',
      'Generate Proxies: Right-click all clips → Generate Proxies (ProRes 422 LT).',
      'Timeline Hack: Set Project Settings to 1080p.',
      'AI Audio Cleanup: Voice Isolation (50%) + Dialogue Leveler on Rode tracks.',
    ],
  },
  {
    id: 'sync',
    label: 'Master Sync',
    subtitle: 'Cut Page — NO CLAPS',
    day: [
      '⚠ NO CLAPS. Rely on Waveform + Startup/Shutdown Beeps only.',
      'Create Multicam: Highlight all video + Rode files → Create Multicam Clip (Sound/Waveform).',
      'Open in Timeline: Right-click Multicam → Open in Timeline → mute all GoPro mics.',
      'Sync Check: Confirm GoPro Beeps or gunshots align with Rode waveforms.',
      'The "Anchor": Keep Rode tracks as constant audio throughout.',
    ],
    night: [
      '⚠ NO CLAPS. Rely on Waveform + Startup/Shutdown Beeps only.',
      'Create Multicam: Highlight all video + Rode files → Create Multicam Clip (Sound/Waveform).',
      'Open in Timeline: Mute all GoPro mics; Sionyx audio is reference only.',
      'Sync Check: Sionyx audio clicks or BB impacts vs. Rode waveforms.',
      'The "Anchor": Rode tracks stay constant; Sionyx is additional angle only.',
    ],
  },
  {
    id: 'cut',
    label: 'Creative Cut',
    subtitle: 'Speed Editor Mode',
    day: [
      'Source Tape: Use the wheel to scan action hits/tags across the whole day.',
      'Append Cuts: Build rough story by stacking clips onto the timeline.',
      'Source Overwrite: Headcam hit → CAM 2 + wheel → drop in scope-cam shot.',
      'Ignore Gaps: Leave sync gaps on timeline until end of rough cut.',
    ],
    night: [
      'Source Tape: Scan for tracer fire, light hits, and tags.',
      'Append Cuts: Build rough story; trim dark dead space aggressively.',
      'Source Overwrite: Headcam hit → CAM 2 + wheel → scope or Sionyx shot.',
      'Ignore Gaps: Leave sync gaps until end of rough cut.',
    ],
  },
  {
    id: 'ai-polish',
    label: 'Hero 4 & AI Polish',
    subtitle: 'Phased Resource Use',
    day: [
      'Stabilize & Up-Res: SuperScale 2x + Stabilization on Hero 4 clips only.',
      "Render in Place: Right-click Hero 4 clips → Render in Place (bakes AI so RAM doesn't recalculate).",
      'Shared Nodes: Color Page → one "Grade" on GoPro 10 track → all clips match at once.',
      'AI Magic Mask: (Do this LAST) Track person/object, then Lock the Node.',
    ],
    night: [
      'Stabilize & Up-Res: SuperScale 2x on Hero 4 AND Sionyx clips. Skip crushed/noisy clips.',
      'Render in Place: Right-click → Render in Place on all AI-processed clips.',
      'Shared Nodes + LUT: One grade + denoise pass on GoPro 10 track.',
      'AI Magic Mask: (Do this LAST) Track person or IR light, then Lock the Node.',
    ],
  },
  {
    id: 'export',
    label: 'Final Export',
    subtitle: 'The "Pro" Finish',
    day: [
      'Switch to 4K: Project Settings → 3840 × 2160.',
      'Smart Cache Check: Wait for Render Cache bar to turn Blue (from Red).',
      'Render: MP4 · H.265 (Master) · 60,000 Kbps (for 60fps action).',
      'SSD Export: Save to 04_EXPORTS — keeps RAW files clean.',
    ],
    night: [
      'Switch to 4K: Project Settings → 3840 × 2160.',
      'Smart Cache: Denoise + upscale takes longer — wait for full Blue bar.',
      'Render: MP4 · H.265 (Master) · 60,000 Kbps.',
      'SSD Export: Save to 04_EXPORTS — keeps RAW files clean.',
    ],
  },
]

// ─────────────────────────────────────────────
// Build default app state from phase data
// ─────────────────────────────────────────────
function buildDefaultState() {
  const phaseItems = {}
  DEFAULT_PHASES.forEach((phase) => {
    phaseItems[phase.id] = {
      day: phase.day.map((text, i) => ({ id: `${phase.id}-d-${i}`, text, checked: false })),
      night: phase.night.map((text, i) => ({ id: `${phase.id}-n-${i}`, text, checked: false })),
    }
  })
  return { nightOps: false, phaseItems }
}

const STORAGE_KEY = 'ols-sop-v2'


export default function App() {
  const [appState, setAppState] = useLocalStorage(STORAGE_KEY, buildDefaultState())
  const [activeCamera, setActiveCamera] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editingText, setEditingText] = useState('')

  const { nightOps, phaseItems } = appState
  const mode = nightOps ? 'night' : 'day'

  function setNightOps(val) {
    setAppState((s) => ({ ...s, nightOps: val }))
  }

  function toggleCheck(phaseId, itemId) {
    setAppState((s) => ({
      ...s,
      phaseItems: {
        ...s.phaseItems,
        [phaseId]: {
          ...s.phaseItems[phaseId],
          [mode]: s.phaseItems[phaseId][mode].map((item) =>
            item.id === itemId ? { ...item, checked: !item.checked } : item,
          ),
        },
      },
    }))
  }

  function moveItem(phaseId, index, dir) {
    setAppState((s) => {
      const items = [...s.phaseItems[phaseId][mode]]
      const next = index + dir
      if (next < 0 || next >= items.length) return s
      ;[items[index], items[next]] = [items[next], items[index]]
      return {
        ...s,
        phaseItems: {
          ...s.phaseItems,
          [phaseId]: { ...s.phaseItems[phaseId], [mode]: items },
        },
      }
    })
  }

  function startEdit(item) {
    setEditingId(item.id)
    setEditingText(item.text)
  }

  function commitEdit(phaseId) {
    if (!editingId) return
    const trimmed = editingText.trim()
    setAppState((s) => ({
      ...s,
      phaseItems: {
        ...s.phaseItems,
        [phaseId]: {
          ...s.phaseItems[phaseId],
          [mode]: s.phaseItems[phaseId][mode].map((item) =>
            item.id === editingId ? { ...item, text: trimmed || item.text } : item,
          ),
        },
      },
    }))
    setEditingId(null)
    setEditingText('')
  }

  function resetChecks() {
    setAppState((s) => {
      const next = { ...s.phaseItems }
      Object.keys(next).forEach((id) => {
        next[id] = {
          ...next[id],
          [mode]: next[id][mode].map((item) => ({ ...item, checked: false })),
        }
      })
      return { ...s, phaseItems: next }
    })
  }

  const allItems = DEFAULT_PHASES.flatMap((p) => phaseItems[p.id]?.[mode] ?? [])
  const total = allItems.length
  const completed = allItems.filter((i) => i.checked).length
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100)

  return (
    <div className={`app${nightOps ? ' night-ops' : ''}`}>

      {/* ── Header ── */}
      <header className="app-header">
        <div className="header-top">
          <div className="header-title">
            <p className="eyebrow">Airsoft Production SOP</p>
            <h1>OLS Editing</h1>
          </div>
          <button
            className={`night-ops-btn${nightOps ? ' active' : ''}`}
            onClick={() => setNightOps(!nightOps)}
            aria-pressed={nightOps}
          >
            <span className="night-ops-dot" />
            {nightOps ? 'Night Ops' : 'Day Game'}
          </button>
        </div>

        <div className="progress-row">
          <div className="progress-track" aria-label="Overall progress">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="progress-label">
            {completed}/{total}&nbsp;·&nbsp;{progress}%
          </span>
        </div>
      </header>

      {/* ── Camera Ledger ── */}
      <section className="app-section">
        <div className="section-title-row">
          <h2 className="section-title">Camera Ledger</h2>
          <span className="section-hint">Tap row for details</span>
        </div>
        <div className="ledger-scroll">
          <table className="ledger-table">
            <thead>
              <tr>
                <th>Camera</th>
                <th>Res / FPS</th>
                <th>AR</th>
                <th>Card</th>
                <th>Power</th>
              </tr>
            </thead>
            <tbody>
              {CAMERAS.map((cam) => (
                <tr
                  key={cam.id}
                  className={
                    cam.nightCam ? (nightOps ? 'row-night-active' : 'row-night-dim') : ''
                  }
                  onClick={() => setActiveCamera(cam)}
                >
                  <td>
                    <span className="cam-name">{cam.name}</span>
                    <span className="cam-role">{cam.role}</span>
                  </td>
                  <td>{cam.res}</td>
                  <td className="mono">{cam.ar}</td>
                  <td>{cam.storage}</td>
                  <td>{cam.power}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Edit mode bar ── */}
      <div className="edit-bar">
        <span className="edit-bar-label">Checklist</span>
        <button
          className={`edit-toggle${editMode ? ' active' : ''}`}
          onClick={() => { setEditMode((e) => !e); setEditingId(null) }}
        >
          {editMode ? '✓ Done' : '✏ Edit / Reorder'}
        </button>
      </div>

      {/* ── Phase Cards ── */}
      {DEFAULT_PHASES.map((phase, phaseIdx) => {
        const items = phaseItems[phase.id]?.[mode] ?? []
        const phaseChecked = items.filter((i) => i.checked).length

        return (
          <section key={phase.id} className="phase-card">
            <div className="phase-header">
              <div>
                <p className="phase-kicker">Phase {phaseIdx + 1}</p>
                <h2 className="phase-name">{phase.label}</h2>
                <p className="phase-sub">{phase.subtitle}</p>
              </div>
              <span className={`phase-badge${phaseChecked === items.length ? ' complete' : ''}`}>
                {phaseChecked}/{items.length}
              </span>
            </div>

            <ul className="checklist">
              {items.map((item, idx) => (
                <li
                  key={item.id}
                  className={[
                    'cl-item',
                    item.checked ? 'is-checked' : '',
                    editMode ? 'is-editing' : '',
                  ].filter(Boolean).join(' ')}
                >
                  {editMode ? (
                    <div className="cl-edit-row">
                      <div className="reorder-btns">
                        <button
                          className="reorder-btn"
                          disabled={idx === 0}
                          onClick={() => moveItem(phase.id, idx, -1)}
                          aria-label="Move up"
                        >▲</button>
                        <button
                          className="reorder-btn"
                          disabled={idx === items.length - 1}
                          onClick={() => moveItem(phase.id, idx, 1)}
                          aria-label="Move down"
                        >▼</button>
                      </div>

                      {editingId === item.id ? (
                        <input
                          className="cl-input"
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          onBlur={() => commitEdit(phase.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') commitEdit(phase.id)
                            if (e.key === 'Escape') { setEditingId(null); setEditingText('') }
                          }}
                          autoFocus
                        />
                      ) : (
                        <span className="cl-text" onClick={() => startEdit(item)}>
                          {item.text}
                        </span>
                      )}

                      <button className="pencil-btn" onClick={() => startEdit(item)} aria-label="Edit item">
                        ✏
                      </button>
                    </div>
                  ) : (
                    <label className="cl-label">
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => toggleCheck(phase.id, item.id)}
                      />
                      <span className="cl-checkmark" aria-hidden="true" />
                      <span className="cl-text">{item.text}</span>
                    </label>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )
      })}

      {/* ── Footer ── */}
      <footer className="app-footer">
        <p className="footer-note">
          Auto-saved to LocalStorage — progress survives closing Safari on iPad.
        </p>
        <button className="reset-btn" onClick={resetChecks}>
          Reset {nightOps ? 'Night Ops' : 'Day Game'} Checks
        </button>
      </footer>

      {/* ── Camera Popover ── */}
      {activeCamera && (
        <div
          className="popover-overlay"
          onClick={() => setActiveCamera(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`${activeCamera.name} details`}
        >
          <div className="popover-sheet" onClick={(e) => e.stopPropagation()}>
            <div className={`popover-header${activeCamera.nightCam ? ' night-header' : ''}`}>
              <div>
                <h3 className="popover-name">{activeCamera.name}</h3>
                <p className="popover-role">{activeCamera.role}</p>
              </div>
              <button className="popover-close" onClick={() => setActiveCamera(null)} aria-label="Close">✕</button>
            </div>
            <div className="popover-body">
              <div className="spec-grid">
                {[
                  ['Resolution', activeCamera.res],
                  ['Aspect Ratio', activeCamera.ar],
                  ['Storage', activeCamera.storage],
                  ['Power', activeCamera.power],
                  ['SD Card', activeCamera.card],
                ].map(([label, value]) => (
                  <div key={label} className="spec-row">
                    <span className="spec-label">{label}</span>
                    <strong className="spec-value">{value}</strong>
                  </div>
                ))}
              </div>
              <p className="popover-notes">{activeCamera.notes}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}