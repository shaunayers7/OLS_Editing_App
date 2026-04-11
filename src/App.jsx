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
// Shared Camera Settings (shown in every popover)
// ─────────────────────────────────────────────
const SHARED_CAM_SETTINGS = [
  ['EV Compensation', '-0.5 (all cameras)'],
  ['White Balance', '5500K Daylight — NOT Auto'],
  ['Sharpness', 'Low / Medium — NOT High'],
  ['Night Protocol', 'GP10 + GP8: drop to 24fps when light fails'],
]

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
    storage: '128GB',
    power: 'UGREEN Nexode 10000mAh (back helmet pouch)',
    nightCam: false,
    card: 'SanDisk 128GB Extreme Pro V30',
    lens: 'TBD — test Wide vs Linear in dry run',
    bitrate: '100 Mbps (High)',
    isoDay: '800',
    isoNight: '1600 / drop to 24fps',
    recordTime: '~3.5 hrs per card',
    notes:
      'Primary face cam. 4:3 aspect gives vertical crop flexibility for Reels/Shorts. UGREEN Nexode 10000mAh mounted in back-of-helmet counterweight pouch — route USB-C cable cleanly to avoid snag risk in Alberta woods. Set Bitrate: High. Lens mode: confirm Wide vs Linear in dry run side-by-side test.',
  },
  {
    id: 'gp8',
    name: 'GP 8',
    role: 'Callie',
    res: '2.7K/60',
    ar: '4:3',
    storage: '2× 128GB',
    power: 'UGREEN Nexode 10000mAh (back helmet pouch)',
    nightCam: false,
    card: '2× SanDisk 128GB Extreme',
    lens: 'Wide',
    bitrate: '60–100 Mbps (High)',
    isoDay: '800',
    isoNight: '1600 / drop to 24fps',
    recordTime: '~4.0 hrs per card (~8.0 hrs total)',
    notes:
      'Callie face cam. 4:3 matches GP10 for multi-cam consistency. Running 2× SanDisk 128GB Extreme cards — swap mid-game if needed. UGREEN Nexode 10000mAh mounted in back-of-helmet counterweight pouch. Set Lens: Wide — NOT SuperView. Set Bitrate: High. Check charge night before. Drop to 24fps when light is failing at night.',
  },
  {
    id: 'gp4',
    name: 'GP 4',
    role: 'Squad Lead',
    res: '1080p/60',
    ar: '4:3',
    storage: '64GB',
    power: 'Anker 321 PowerCore 5K',
    nightCam: false,
    card: 'SanDisk Extreme',
    lens: 'Wide (NOT SuperView)',
    bitrate: '45–60 Mbps',
    isoDay: '400',
    isoNight: 'N/A — pack away when dark',
    recordTime: '~4.5 hrs per card',
    notes:
      '1080p/60 is the MAXIMUM 60fps resolution on the Hero 4 Black — 2.7K and 4K only reach 30fps on this body. Shooting at 1080p/60 and applying SuperScale 2x in DaVinci Resolve AI Polish phase recovers the resolution difference in post. Anker 321 "lipstick" style keeps weight low. Set Lens: Wide (NOT SuperView) to match GP10/GP8. SMALLEST card (64GB) — warn leader to offload early. Day only camera.',
  },
  {
    id: 'gitup',
    name: 'GitUp F1',
    role: 'Scope Cam',
    res: '2.7K/60',
    ar: '16:9',
    storage: '64GB',
    power: 'Internal + Anker 321 5K',
    nightCam: false,
    card: 'SanDisk Extreme',
    lens: 'Fixed — no adjustment',
    bitrate: '30–40 Mbps',
    isoDay: '400',
    isoNight: 'N/A',
    recordTime: '~5.0 hrs per card',
    notes:
      'Fixed focus 10–50m. 16:9 widescreen — used as PiP corner element over 4:3 helmet cam in edit. 1080p/120 also available for BB flight path slow-mo. Check focus ring before every game. Anker 321 backup keeps it live through night game if needed.',
  },
  {
    id: 'as20',
    name: 'Sony AS20',
    role: 'Back / Static',
    res: '1080p/60',
    ar: '16:9',
    storage: '64GB',
    power: 'Internal (150 min)',
    nightCam: false,
    card: 'SanDisk Extreme',
    lens: '—',
    bitrate: '28 Mbps (PS)',
    isoDay: 'Auto',
    isoNight: 'N/A',
    recordTime: '~8.0 hrs per card',
    notes:
      'Static/back angle. Internal battery only (~150 min) — monitor runtime, swap if battery dies. Label card "AS20-A" with Sharpie. Day camera only — pack away when dark.',
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
    lens: 'Fixed',
    bitrate: '—',
    isoDay: 'N/A',
    isoNight: 'Night Vision sensor',
    recordTime: 'Internal storage — offload each game',
    notes:
      '⚠ Night vision only — NIGHT OPS EXCLUSIVE. Set Scene: Night preset before every op. Requires SuperScale 2x in AI Polish. Deploy only if light is insufficient for other cameras. Do not use in daylight.',
  },
  {
    id: 'dji',
    name: 'DJI Mini 2 SE',
    role: 'Drone',
    res: '2.7K/30',
    ar: '16:9',
    storage: 'MicroSD',
    power: 'Battery (31 min)',
    nightCam: false,
    card: 'Carry 2–3 spare batteries',
    lens: 'Fixed wide',
    bitrate: '~40 Mbps',
    isoDay: 'Auto',
    isoNight: 'N/A — do NOT fly at night',
    recordTime: '31 min per battery',
    notes:
      'Fly between games or during open field periods. 2.7K/30 cinematic field coverage. Carry 2–3 batteries. Do NOT fly at night. Bonus coverage only — no drone footage = no problem.',
  },
  {
    id: 'iphone13',
    name: 'iPhone 13 Pro',
    role: 'Shaun B-Roll',
    res: '4K/60',
    ar: '16:9',
    storage: 'Internal',
    power: 'Battery',
    nightCam: false,
    card: 'AirDrop or USB-C to SSD',
    lens: 'Wide / Tele',
    bitrate: 'H.264 (Most Compatible)',
    isoDay: 'Auto',
    isoNight: 'Auto',
    recordTime: 'Battery limited — charge between games',
    videoFormat: 'Most Compatible (H.264) — Settings > Camera > Formats',
    autoFps: 'OFF — Settings > Camera > Record Video > Auto FPS',
    lockWB: 'ON — Settings > Camera > Record Video > Lock White Balance',
    nightMode: '30fps when dark — save to SHAUN_IPHONE_30fps folder (separate from 60fps day clips)',
    notes:
      'Shaun B-roll only. Pre-trip, road trip, camp setup, reactions, post-game. Set to 4K/60fps — gives "room to zoom" when cropping over 2.7K GoPro timeline. Format: Most Compatible (H.264) for smooth M4 playback. Auto FPS: OFF — prevents secret 24fps drop in dark. Lock White Balance: ON — stops color shifting between sun and shade. Night: switch to 30fps and save to _30fps folder. Import via AirDrop or USB-C to SSD immediately.',
  },
  {
    id: 'iphone10',
    name: 'iPhone 10 Pro',
    role: 'Callie B-Roll',
    res: '4K/60',
    ar: '16:9',
    storage: 'Internal',
    power: 'Battery',
    nightCam: false,
    card: 'AirDrop or USB-C to SSD',
    lens: 'Wide / Tele',
    bitrate: 'H.264 (Most Compatible)',
    isoDay: 'Auto',
    isoNight: 'Auto',
    recordTime: 'Battery limited — charge between games',
    videoFormat: 'Most Compatible (H.264) — Settings > Camera > Formats',
    autoFps: 'OFF — Settings > Camera > Record Video > Auto FPS',
    lockWB: 'ON — Settings > Camera > Record Video > Lock White Balance',
    nightMode: '30fps when dark — save to CALLIE_IPHONE_30fps folder (separate from 60fps day clips)',
    notes:
      'Callie B-roll only. Reactions, her perspective shots, candid moments. Set to 4K/60fps — matches GP10 frame rate and allows crop without quality loss. Format: Most Compatible (H.264) for smooth M4 playback. Auto FPS: OFF — prevents secret 24fps drop in dark. Lock White Balance: ON — stops color shifting between sun and shade. Night: switch to 30fps and save to _30fps folder (shutter stays open longer = more light). Import via AirDrop or USB-C to SSD immediately.',
  },
]

// ─────────────────────────────────────────────
// Phase / Checklist Data
// ─────────────────────────────────────────────
const DEFAULT_PHASES = [
  {
    id: 'pre-production',
    label: 'Pre-Production Assets',
    subtitle: '4-Month Prep — Before July',
    day: [
      'Create DaVinci project folder structure on SSD: 00_RAW / 01_PROXIES / 02_PROJECT / 03_ASSETS / 04_EXPORTS.',
      'iPhone Folder Structure: Inside 00_RAW create SHAUN_IPHONE_60fps + SHAUN_IPHONE_30fps and CALLIE_IPHONE_60fps + CALLIE_IPHONE_30fps — 30fps night clips MUST stay separate from 60fps day clips or you will break slow-mo.',
      'PowerGrades Safety Deposit Box: Create 03_ASSETS/POWERGRADES folder on SSD. After every color look you love, export as .drx file here — permanent backup that survives app crashes and iPad replacements.',
      'Import hit markers into DaVinci Power Bin → HIT_MARKERS. Verify alpha channel (transparency). Test over 2.7K test footage.',
      'Research + collect SFX: BB impact, ricochet, radio static, hit confirmation beep. Sources: Freesound.org, Pixabay SFX.',
      'Select + download music — Intro (×1–2), Action (×2–3), Transition (×1), Outro (×1). NCS + royalty-free only. Instrumental preferred.',
      'Import music to Power Bin → MUSIC folder sorted by section (INTRO / ACTION / TRANSITION / OUTRO).',
      'Build map overlay HUD frame template (swap actual field map image before July).',
      'Build scope cam PiP border/frame template for GitUp F1 corner element.',
      'Build lower thirds: Shaun, Callie, Squad Lead name tags.',
      'Decide: Kill counter — in or out?',
      'Decide: Kill cam — in or out?',
      '3D print all camera mounts — test each on actual gun/helmet.',
      'Mount vibration test: film target practice, review footage for shake or shift.',
      'Dry run session 1: GP10 + RØDE LAV1 only. Record 5-min practice. Full intake → sync in DaVinci.',
      'Dry run session 2: Full multi-cam. All cameras + RØDE. Complete intake + Sync Bin verify.',
      'Speed Editor drill: Cut dry run footage start-to-finish using 3-pass method.',
      'GP10 lens test: side-by-side Wide vs Linear footage comparison — decide before event.',
      'Sharpie-label all SD cards (H10-A, H10-B / GP8-A, GP8-B / GP4-A / etc.).',
      'Test all power banks under load: plug in camera + record for 30 min.',
      'Confirm card count: 3× GP10, 3× GP8, 2× GitUp, 2× GP4, 1× AS20.',
      'Test PiP: GitUp scope cam in corner over GP10 helmet footage — confirm sizing.',
      'Set up DaVinci Power Bin with all assets: hit markers, SFX, music, overlays, lower thirds.',
    ],
    night: [
      'Create DaVinci project folder structure on SSD: 00_RAW / 01_PROXIES / 02_PROJECT / 03_ASSETS / 04_EXPORTS.',
      'Import hit markers into DaVinci Power Bin → HIT_MARKERS. Verify alpha channel. Test over 2.7K test footage.',
      'Research + collect SFX: BB impact, ricochet, radio static, hit confirmation beep.',
      'Select + download music — Intro, Action, Transition, Outro. NCS + royalty-free only.',
      'Build map overlay HUD frame template + scope cam PiP border template.',
      'Build lower thirds: Shaun, Callie, Squad Lead name tags.',
      'Decide: Kill counter in or out? Kill cam in or out?',
      '3D print all camera mounts — test on actual gear.',
      'Sharpie-label all SD cards. Confirm card count. Test all power banks.',
      'Set up DaVinci Power Bin with all assets ready to drop in.',
    ],
  },
  {
    id: 'dry-run',
    label: 'Dry Run / Practical Test',
    subtitle: 'Backyard Practice = Real B-Roll',
    day: [
      'Set cameras to final event settings: GP10/GP8/GitUp → 2.7K/60, GP4/AS20 → 1080p/60, Drone → 2.7K/30.',
      'GP10 + GP8: Set Bitrate to High. Set Lens mode (Wide or confirmed setting from test).',
      'GP4: Set Lens to Wide (NOT SuperView).',
      'All cameras: EV Compensation -0.5, White Balance 5500K Daylight, Sharpness Low/Medium.',
      'Mount all 3D-printed mounts — film movement and check for vibration or shift.',
      'RØDE LAV test: Start both transmitters (32-bit Float, Internal Record ON). Record radio chatter + HPA sounds.',
      'GBB rack clack in front of ALL active cameras — this is your sync point.',
      'Intake test: Import all footage into DaVinci. Create bin for this session. Select All → Sync Bin → Sync by Audio.',
      'Sync verification: Confirm clack aligns across all angles in Multi-View grid.',
      'RØDE test in DaVinci: Apply Voice Isolation (50%) to LAV track — confirm wind/noise reduction.',
      'Speed Editor drill 1: SHTL + dial, JOG + dial, TRIM IN/OUT. Cut a 1-min highlight.',
      'Speed Editor drill 2: SCRL cull (10-sec dead-air rule), LIVE O/WR double-tap angle switch.',
      'EV/WB check: Review footage — adjust if sky is blown out or skin looks green.',
      '⚠ Cooling Check: Remove iPad from case if editing for 30+ min. Lay on metal/granite surface.',
    ],
    night: [
      'Set cameras to night settings: GP10/GP8 → drop to 24fps when light fails. Sionyx → Scene: Night.',
      'All cameras: EV -0.5, WB 5500K Daylight (even at night — prevents colour shift), Sharpness Low/Medium.',
      'RØDE LAV test: 32-bit Float, Internal Record ON. Leave running.',
      'GBB rack clack in front of all cameras at session start and each restart.',
      'Intake test: Import, Sync Bin → Sync by Audio. Verify alignment.',
      'Test night capture threshold: When too dark → pack all cameras except Sionyx.',
      '⚠ Cooling Check: Remove iPad from case if editing for 30+ min.',
    ],
  },
  {
    id: 'field-prep',
    label: 'Field Prep & Storage',
    subtitle: 'Before Each Game',
    day: [
      'Pull Internal Batteries: Use external power banks only — prevents overheating during long sessions.',
      'RØDE Setup: Mount Lav 1 (Shaun) at helmet cheek. Mount Lav 2 (Callie) at helmet or collar.',
      'RØDE Settings: Enable 32-bit Float + Internal Record ON + Timecode ON on both transmitters.',
      'Press Record on both RØDE transmitters at game start — leave running all day.',
      'Wind Protection: Twist-lock deadcats on RØDEs. Foam windslayers or tape on GoPros.',
      'Cable Management: Coil + zip-tie Anker cables to helmet — snag in Alberta woods risks pulling USB-C port.',
      'Camera Settings: All cameras → EV -0.5, WB 5500K Daylight, Sharpness Low/Medium.',
      'GP10 + GP8: Bitrate High. GP4: Lens Wide (NOT SuperView).',
      'SSD Prep: Eject check — ensure SSD is properly mounted. Never pull cord while DaVinci is open.',
      'iPad plug: Ensure iPad is on the 100W PD port on the Satechi Hub (hub reserves ~15W for itself).',
      'Folder Structure: Create 00_RAW subfolders — SHAUN_GP10, SHAUN_AS20, SHAUN_GITUP, SHAUN_IPHONE, CALLIE_GP8, CALLIE_IPHONE, LEADER_GP4, RODE_LAV1, RODE_LAV2, DRONE_DJI, SUBMISSIONS.',
      'GBB rack clack in front of all cameras before EVERY game and after EVERY restart.',
    ],
    night: [
      'Pull Internal Batteries: Use external power banks — night sessions run long.',
      'RØDE Setup: Mount and start both LAVs as per day setup. Leave running even when cameras are packed.',
      'RØDE Settings: 32-bit Float + Internal Record ON + Timecode ON.',
      'Wind Protection: Twist-lock deadcats on RØDEs.',
      'Cable Management: Coil + zip-tie Anker cables to helmet.',
      'Camera Settings: All active cameras → EV -0.5, WB 5500K Daylight, Sharpness Low/Medium.',
      'iPhone Night Mode: Switch both iPhones to 30fps (Settings > Camera > Record Video > 1080p HD at 30fps OR 4K at 30fps). Save all night clips to _30fps folder — NEVER mix with 60fps day footage or it will stutter on the timeline.',
      'Night Protocol: 8pm–10pm — all cameras active, assess light. 10pm–1am — pack all GoPros, AS20, GitUp when too dark.',
      'When cameras are packed: RØDE LAVs stay running. Even dark footage can use RØDE over a map graphic.',
      'Drone: Do NOT fly at night — grounded.',
      'Sionyx (optional): Set Scene: Night preset, Internal Record ON before deploying.',
      'Fallback: If video is too dark, narrate over Tactical Map graphic in post using RØDE audio.',
      'GBB rack clack in front of all cameras at every session start and restart.',
    ],
  },
  {
    id: 'intake',
    label: 'Technical Intake',
    subtitle: 'The "Resource Saver" Step',
    day: [
      'Connect SSD to iPad via 100W PD port on Satechi Hub. Verify it mounts in Files app.',
      '⚠ SSD Safety: Always Eject in Files app before unplugging. Never pull cord while DaVinci is open.',
      'Copy footage into correct 00_RAW subfolders: SHAUN_GP10, SHAUN_GITUP, SHAUN_AS20, SHAUN_IPHONE, CALLIE_GP8, CALLIE_IPHONE, LEADER_GP4, RODE_LAV1, RODE_LAV2, DRONE_DJI, SUBMISSIONS.',
      'Open DaVinci Resolve. Keep Project Settings at 2.7K (NOT 4K) for the entire edit — cooler iPad.',
      'Import Media: Bring structured folders into the Media Pool.',
      'Metadata Tagging: Select all clips from each camera → Metadata tab → set Camera #: GP10=1, GP8=2, GP4=3, GitUp=4, AS20=5, Sionyx=6, Drone=7. Sync Bin requires this.',
      '4:3 Note: Do NOT convert GP10/GP8/GP4 footage to 16:9 at import — crop per shot in post for vertical slack.',
      'Generate Proxies: Right-click all clips → Generate Proxies → H.264 1080p. Fastest SCRL scrubbing on Speed Editor.',
      'RØDE LAV1 + LAV2: Import internal audio files as audio tracks 1 and 2. These are the "Golden Tracks" — sync anchors.',
      'AI Audio Cleanup: Voice Isolation (50%) + Dialogue Leveler on RØDE tracks.',
      '⚠ Thermal Check: Remove iPad from case if editing for 30+ min. Lay flat on metal or granite surface.',
    ],
    night: [
      'Connect SSD to iPad. Verify mount. iPad on 100W PD port.',
      '⚠ SSD Safety: Always Eject in Files app before unplugging.',
      'Copy night footage into correct folders — add SIONYX folder if deployed.',
      'Open DaVinci. Keep Project Settings at 2.7K — do NOT switch to 4K during edit.',
      'Import Media: Night folders into Media Pool.',
      'Metadata Tagging: Camera # as above + Sionyx as CAM 6.',
      '4:3 Note: Do NOT convert GP10/GP8 footage to 16:9 at import.',
      'Generate Proxies: H.264 1080p proxies on all clips.',
      'RØDE LAV1 + LAV2: Import as Golden Tracks 1 and 2.',
      'AI Audio Cleanup: Voice Isolation (50%) + Dialogue Leveler on RØDE tracks.',
      '⚠ Thermal Check: Remove iPad from case after 30+ min. Metal/granite surface as passive heat sink.',
    ],
  },
  {
    id: 'sync',
    label: 'Master Sync',
    subtitle: 'Cut Page — Batched by Round',
    day: [
      'Stay on the Cut Page for all sync work — do not open Edit Page yet.',
      'Batch by Round: Create one Media Pool Bin per game round (e.g. "Round 1 – Morning", "Round 2 – Afternoon"). Drag only that round\'s clips in.',
      'Do NOT dump all 50 clips from all cameras into one folder — Sync Bin gets confused.',
      'GBB Rack Clack as sync point: Use the loud mechanical spike from the airsoft marker clack. This is your sync anchor — done at every camera restart.',
      'Sync Bin: Select all clips in the bin → click the Sync Bin icon → Sync by Audio.',
      'Multi-View Grid: Click the Multi-View button in the Sync Bin — shows all angles simultaneously. Verify alignment.',
      'RØDE = Anchor/Floor: Align all camera clips to the continuous RØDE Golden Track.',
      'Master Audio Compound Clip: After sync — unlink audio from ALL video clips. Right-click RØDE LAV track → Create Compound Clip. Re-link to primary video track. Camera angles now switch freely without audio jumping.',
      'Fine-Tune: Use Speed Editor Search Dial to nudge any slightly misaligned clip.',
      'Mute all GoPro mic tracks — RØDE is your only audio source.',
      'Repeat for each round bin before moving to the cut.',
      '⚠ Cooling Check: If iPad case is warm — Cmd+S and rest 5 minutes. Thermal throttling shows as laggy Speed Editor dial.',
    ],
    night: [
      'Stay on the Cut Page for all sync work.',
      'Batch by Round: Create bins per night game session.',
      'Sync Bin → Sync by Audio on each bin separately.',
      'Multi-View Grid: Verify all angles including Sionyx (if deployed).',
      'RØDE = Anchor: Align all clips to RØDE Golden Track — it runs continuously even in total darkness.',
      'Master Audio Compound Clip: Unlink video audio, wrap RØDE in Compound Clip, re-link.',
      'Mute all GoPro mic tracks. Sionyx audio is reference only.',
      '⚠ Cooling Check: Cmd+S and rest if iPad feels warm.',
    ],
  },
  {
    id: 'cut',
    label: 'Creative Cut',
    subtitle: 'Speed Editor — 3-Pass Method',
    day: [
      '── DaVinci Page Order (non-negotiable) ──',
      'Order: Cut Page → Fairlight → Edit Page → Color → Deliver. Do not color before edit is locked.',
      '── Pass 1 — Cull ──',
      'Source Tape: Press SHTL + rotate dial → scans all clips across the day like a tape deck.',
      '10-Second Dead-Air Rule: If no action, comms, or movement for 10 seconds → SCRL to find the next hit and cut it.',
      'Only keep: hits, run-and-gun movement, comms, reactions. Delete everything else.',
      '── Pass 2 — Angles ──',
      'Helmet cam (GP10) on timeline as the master track.',
      'LIVE O/WR: Double-Tap → Switches to the next camera angle in the Sync Bin. Use this over every key hit.',
      'Scope cam PiP: Place GitUp 16:9 as a corner element over 4:3 helmet cam. No keyframing for static PiP.',
      '── Pass 3 — Polish ──',
      'CLOSE UP: Hold + Rotate Dial → Punch in on 2.7K footage to reframe without cutting.',
      'AUDIO LEVEL: Hold + Rotate Dial → Duck field/wind noise; keep BB ping and comms loud.',
      'MARK: Double-Tap → Drop a note wherever VO narration is needed later.',
      '── Speed Editor Quick Reference ──',
      'SHTL: Press once + Rotate Dial → Continuous playback, like fast-forward/rewind on a tape deck.',
      'JOG: Press once + Rotate Dial → Precise frame-by-frame movement; stops when you stop.',
      'SCRL: Press once + Rotate Dial → High-speed navigation to fly through long timelines.',
      'TRIM IN / OUT: Hold + Rotate Dial → Shortens or lengthens the start or end of a clip.',
      'ROLL: Hold + Rotate Dial → Moves a cut point left or right without changing total timeline length.',
      'SLIDE: Double-Tap ROLL + Rotate → Shuffles a clip\'s position between two other clips.',
      'SLIP SOURCE: Hold + Rotate Dial → Changes the start of the footage inside the clip.',
      'SLIP DEST: Hold + Rotate Dial → Changes the end of the footage inside the clip.',
      'SPLIT / MOVE: Hold + Rotate Dial → Picks up the clip and slides it to a new spot in the timeline.',
      'TRANSITION: Hold + Rotate Dial → Cycles through fades, wipes, and dissolves.',
      'TRANS DUR: Hold + Rotate Dial → Makes a transition (e.g. cross-dissolve) longer or shorter.',
      'AUDIO LEVEL: Hold + Rotate Dial → Instantly raises or lowers volume of the selected clip.',
      'CLOSE UP: Hold + Rotate Dial → Moves the zoom up or down to keep a face or object in frame.',
      '── Modifier & Hidden Keys ──',
      'SMART IN / APPEND: Double-Tap → Drops the full clip straight into the timeline. Perfect for timelapse or full overlay drop.',
      'IN / OUT (White Keys): Double-Tap → Clears the In or Out mark on your source tape.',
      'TRANSITION (Lock Default): Double-Tap while setting duration → Locks that duration as the new default.',
      'ESCAPE: Double-Tap → Undo (Cmd/Ctrl + Z) — reverses your last mistake.',
      'MARK: Double-Tap → Opens the Marker Note box so you can type a label for that spot.',
      'REVIEW (Full View): Double-Tap → Plays your sequence from the very beginning in Full Screen mode.',
      'LIVE O/WR: Double-Tap → Switches to a different camera angle from your Sync Bin.',
      'SPLIT (Join Trick): Press once on a through-cut → Joins the two halves of the clip back together.',
    ],
    night: [
      '── DaVinci Page Order ──',
      'Order: Cut Page → Fairlight → Edit Page → Color → Deliver.',
      '── Pass 1 — Cull ──',
      'Source Tape: SHTL + dial. Scan for tracer fire, IR light hits, flashlight movement.',
      '10-Second Dead-Air Rule: Dark/static footage → cut aggressively. Keep only active moments.',
      '── Pass 2 — Angles ──',
      'Helmet cam (GP10) as master. LIVE O/WR double-tap to swap to Sionyx or scope cam on hits.',
      '── Pass 3 — Polish ──',
      'CLOSE UP + dial: Punch in on brighter areas of frame.',
      'AUDIO LEVEL + dial: Night game = audio is king. Comms and radio chatter drive the edit.',
      'MARK double-tap: Drop VO markers where video is too dark — narrate over map graphic in post.',
      '── Speed Editor Quick Reference ──',
      'SHTL: Press once + Rotate Dial → Continuous playback.',
      'JOG: Press once + Rotate Dial → Frame-by-frame movement.',
      'SCRL: Press once + Rotate Dial → High-speed navigation.',
      'TRIM IN / OUT: Hold + Rotate Dial → Shorten clip start or end.',
      'ROLL: Hold + Rotate Dial → Move cut point without changing total length.',
      'SLIDE: Double-Tap ROLL + Rotate → Shuffle clip position.',
      'SLIP SOURCE / DEST: Hold + Rotate Dial → Move clip in/out points.',
      'AUDIO LEVEL: Hold + Rotate Dial → Raise or lower volume.',
      'CLOSE UP: Hold + Rotate Dial → Punch in / reframe.',
      'ESCAPE: Double-Tap → Undo.',
      'LIVE O/WR: Double-Tap → Switch camera angle.',
      'MARK: Double-Tap → Drop VO marker note.',
    ],
  },
  {
    id: 'fairlight',
    label: 'Audio — Fairlight Page',
    subtitle: 'After Cut is Locked',
    day: [
      'Switch to Fairlight Page — do this AFTER cut is locked, BEFORE Edit Page.',
      'Voice Isolation: Select RØDE comms track → Effects → Voice Isolation (50%) → kills wind and field noise.',
      'Dialogue Leveler: Apply to both RØDE tracks to normalize volume between quiet and loud moments.',
      'AUDIO LEVEL dial: Duck game/field audio during narration sections.',
      'MARK double-tap any spot where VO narration is still needed — label it (e.g. "VO: Objective here").',
      'SFX Layering: Layer impact + ricochet SFX from Power Bin over raw GoPro audio on hit moments.',
      'SFX balance: Leave BB ping/hit sounds at full level. Duck background field noise below them.',
      'Music tracks: Drop in music from Power Bin MUSIC folder. Set levels: music ducks under comms audio.',
    ],
    night: [
      'Switch to Fairlight Page after cut is locked.',
      'Voice Isolation (50%) on RØDE tracks — critical at night when video may be unusable.',
      'Audio is King at night: RØDE comms + radio chatter carry the entire edit if video is too dark.',
      'AUDIO LEVEL dial: Balance comms vs. ambient night sounds.',
      'MARK double-tap: Drop VO markers on dark sections — narrate over Tactical Map graphic in post.',
      'SFX: Use tracer fire and ricochet sounds. Subtle atmosphere bed under RØDE.',
      'Music: Tactical/ambient tracks under comms for atmosphere.',
    ],
  },
  {
    id: 'edit-page',
    label: 'Titles, HUD & Overlays',
    subtitle: 'Edit Page — After Fairlight',
    day: [
      'Switch to Edit Page — this is for non-linear overlay work only.',
      'Drop HUD overlays from Power Bin onto a track above video: hit markers, crosshair, kill counter (if used).',
      'Hit Marker timing: Align with the exact frame of each BB impact using JOG + dial.',
      'Lower Thirds: Drop Shaun, Callie, Squad Lead name tags on first appearance.',
      'Map Overlay: Drop map HUD frame template into corner on key navigation moments.',
      'PiP Scope Cam: Highlight GitUp clip + helmet cam clip → Create Compound Clip. Scale GitUp to corner using Transform. No keyframing needed for static PiP.',
      'Titles: Intro title card and section titles (Objective, Day 1, Day 2, etc.).',
      'Intro structure: Hook → Objective → Execution → Outcome. Gear prep before gameplay.',
    ],
    night: [
      'Switch to Edit Page after Fairlight.',
      'Hit markers on tracer fire impacts. Lower thirds on first appearance.',
      'Map overlay: Use on sections where video is dark — viewer follows the map while audio plays.',
      'Tactical Map + RØDE audio: On dark sections, overlay Tactical Map full-screen or corner. RØDE audio runs under it.',
      'Night title card if Sionyx is deployed.',
    ],
  },
  {
    id: 'ai-polish',
    label: 'AI Polish',
    subtitle: 'Color Page Prep — Before Grading',
    day: [
      'Switch to Color Page — ONLY after Edit Page work is completely locked.',
      'SuperScale 2x + Stabilization: Apply to GP4 (1080p) and AS20 (1080p) clips that need upscaling.',
      'SuperScale on Sionyx 720p clips: Required to bring night vision footage to usable resolution.',
      'Render in Place: Right-click ALL AI-processed clips → Render in Place. Bakes SuperScale + Stabilization so GPU does not recalculate during grading.',
      'Primary Grade: Apply one primary color grade to GP10 clips → use Shared Nodes to match all other cameras at once.',
      'AI Magic Mask v2: (Do this LAST) Track a person or object, then Lock the Node.',
      'Render in Place again after Magic Mask before export.',
      '⚠ Cooling Check: Color page is the heaviest GPU task. Cmd+S and rest if iPad feels warm.',
    ],
    night: [
      'Switch to Color Page only after all edits are locked.',
      'SuperScale 2x on GP4, AS20, AND Sionyx clips.',
      'Denoise pass on GP10/GP8 clips for any shots taken in failing light.',
      'Render in Place on ALL AI-processed clips before grading.',
      'Shared Nodes + LUT: One grade + denoise pass on GP10 track → match all clips.',
      'AI Magic Mask: (Do this LAST) Track IR lights or subject outlines. Lock Node.',
      'Render in Place after Magic Mask.',
      '⚠ Cooling Check: Color + Denoise takes longest on M4. Cmd+S and rest if warm.',
    ],
  },
  {
    id: 'export',
    label: 'Final Export',
    subtitle: 'Deliver Page — 4K Upscale',
    day: [
      'Smart Cache Check: Wait for Render Cache bar to turn Blue from Red before exporting.',
      '⚠ Do NOT change Project Settings to 4K — keep project at 2.7K throughout.',
      'Deliver Page: Set Export Resolution to Ultra HD (3840 × 2160) — only change resolution HERE on Deliver Page.',
      'Why 4K export: YouTube assigns higher-quality VP9/AV1 codec to 4K uploads. Your 2.7K footage looks sharper than if uploaded as 2.7K.',
      'Render settings: MP4 · H.265 (HEVC) · Hardware Encoder · 80,000 Kbps.',
      'SSD Export: Save to 04_EXPORTS folder — keeps RAW files clean.',
      '⚠ SSD Eject: Always eject SSD in Files app before unplugging after export completes.',
    ],
    night: [
      'Smart Cache Check: Denoise + upscale takes longer — wait for full Blue bar.',
      '⚠ Keep project at 2.7K. Only switch to 4K on Deliver Page.',
      'Deliver Page: Export Resolution → Ultra HD (3840 × 2160).',
      'Render: MP4 · H.265 · Hardware Encoder · 80,000 Kbps.',
      'SSD Export: Save to 04_EXPORTS — keep RAW files clean.',
      '⚠ SSD Eject: Eject in Files app before unplugging.',
    ],
  },
]

// ─────────────────────────────────────────────
// Shot List Data
// ─────────────────────────────────────────────
const DEFAULT_SHOT_LIST = [
  { id: 'sl-0',  text: '── Pre-Trip ──', divider: true },
  { id: 'sl-1',  text: 'Gear laid out and packed (home — wide shot + close-ups)', checked: false },
  { id: 'sl-2',  text: 'Practice session: Shaun + Callie shooting together', checked: false },
  { id: 'sl-3',  text: '3D-printed mounts being assembled and attached to gear', checked: false },
  { id: 'sl-4',  text: 'Loading the truck / packing the car', checked: false },
  { id: 'sl-5',  text: 'Road trip driving shots (windshield POV, passenger shots)', checked: false },
  { id: 'sl-6',  text: 'Key stops along the way (fuel, food, scenery)', checked: false },
  { id: 'sl-7',  text: 'Road signs: entering Alberta, town signs', checked: false },
  { id: 'sl-8',  text: 'Team convoy driving', checked: false },
  { id: 'sl-9',  text: '── Arrival & Setup ──', divider: true },
  { id: 'sl-10', text: 'First look at the field (arrival shot)', checked: false },
  { id: 'sl-11', text: 'Camp setup: tent, tables, gear stations', checked: false },
  { id: 'sl-12', text: 'Drone: field overview — first look at terrain from above', checked: false },
  { id: 'sl-13', text: 'Chrono line / gun check / tech inspection', checked: false },
  { id: 'sl-14', text: 'Squad gear-up montage', checked: false },
  { id: 'sl-15', text: 'Mission / field briefing by squad leader on map', checked: false },
  { id: 'sl-16', text: '── Day Game ──', divider: true },
  { id: 'sl-17', text: 'Drone: field overview before game starts', checked: false },
  { id: 'sl-18', text: 'Drone: tracking player movement across field', checked: false },
  { id: 'sl-19', text: 'Drone: checking enemy positions from above', checked: false },
  { id: 'sl-20', text: 'iPhone: squad moving out at game start', checked: false },
  { id: 'sl-21', text: 'iPhone: Callie in action (reaction + movement)', checked: false },
  { id: 'sl-22', text: 'iPhone: tactical hand signals close-up', checked: false },
  { id: 'sl-23', text: 'iPhone: reload close-ups', checked: false },
  { id: 'sl-24', text: '── Night Game ──', divider: true },
  { id: 'sl-25', text: 'Night game atmosphere (tracer fire if present)', checked: false },
  { id: 'sl-26', text: 'Squad silhouettes with lights / flashlights', checked: false },
  { id: 'sl-27', text: '── Post-Game ──', divider: true },
  { id: 'sl-28', text: 'After-action reactions: high-fives, laughs, debrief', checked: false },
  { id: 'sl-29', text: '"What went wrong" conversation immediately after whistle', checked: false },
  { id: 'sl-30', text: 'Awards ceremony (if attending)', checked: false },
  { id: 'sl-31', text: 'Camp meal, end-of-day wind-down', checked: false },
  { id: 'sl-32', text: 'Final morning: packing up camp', checked: false },
  { id: 'sl-33', text: 'Drone: leaving the field — departure aerial shot', checked: false },
  { id: 'sl-34', text: '── Voiceover Markers ──', divider: true },
  { id: 'sl-35', text: 'VO NEEDED: Explain mission objective for viewers', checked: false },
  { id: 'sl-36', text: 'VO NEEDED: Where we are on the map / field orientation', checked: false },
  { id: 'sl-37', text: 'VO NEEDED: Key moment callout (mark specific hit or play)', checked: false },
]

// ─────────────────────────────────────────────
// Speed Editor Reference Data
// ─────────────────────────────────────────────
const SE_DIAL = [
  ['SHTL', 'Press once + Rotate', 'Continuous playback — like fast-forward/rewind on a tape deck.'],
  ['JOG', 'Press once + Rotate', 'Precise frame-by-frame movement. Stops when you stop.'],
  ['SCRL', 'Press once + Rotate', 'High-speed navigation to fly through long timelines for culling.'],
  ['TRIM IN / OUT', 'Hold + Rotate', 'Shortens or lengthens the start or end of a clip.'],
  ['ROLL', 'Hold + Rotate', 'Moves a cut point left or right without changing total timeline length.'],
  ['SLIDE', 'Double-Tap ROLL + Rotate', "Shuffles a clip's position between two neighboring clips."],
  ['SLIP SOURCE', 'Hold + Rotate', 'Changes what footage starts the clip (moves In point of source).'],
  ['SLIP DEST', 'Hold + Rotate', 'Changes what footage ends the clip (moves Out point of source).'],
  ['SPLIT / MOVE', 'Hold + Rotate', 'Picks up the clip and slides it to a new position in the timeline.'],
  ['TRANSITION', 'Hold + Rotate', 'Cycles through fades, wipes, and dissolves.'],
  ['TRANS DUR', 'Hold + Rotate', 'Makes the current transition (e.g. cross-dissolve) longer or shorter.'],
  ['AUDIO LEVEL', 'Hold + Rotate', 'Instantly raises or lowers the volume of the selected clip.'],
  ['CLOSE UP', 'Hold + Rotate', 'Moves the zoom up or down to keep a face or object in frame.'],
]

const SE_SINGLE = [
  ['SMART IN / APPEND', 'Double-Tap', 'Ignores In/Out points — drops the full clip straight into the timeline. Perfect for overlays and timelapse.'],
  ['IN / OUT (White Keys)', 'Double-Tap', 'Clears the In or Out mark on your source tape.'],
  ['TRANSITION (Lock Default)', 'Double-Tap while setting', 'Locks the current duration as the new default for all future dissolves.'],
  ['ESCAPE', 'Double-Tap', 'Undo (Cmd/Ctrl+Z) — reverses your last mistake.'],
  ['MARK', 'Double-Tap', 'Opens the Marker Note box so you can type a label (e.g. "VO needed here").'],
  ['REVIEW (Full View)', 'Double-Tap', 'Plays your sequence from the very beginning in Full Screen mode.'],
  ['LIVE O/WR', 'Double-Tap', 'Switches to a different camera angle from your Sync Bin.'],
  ['SPLIT (Join Trick)', 'Press once on a through-cut', 'If parked on a cut in the middle of one clip — joins the two halves back together.'],
]

const SE_PRECISION = [
  ['SLIDE (Roll)', 'Double-Tap Hold + Dial', "Slides the clip's position between its neighbors."],
  ['MARKER Color', 'Double-Tap Hold + Dial', 'Selects a new default color for all markers you drop from now on.'],
  ['TITLE Font', 'Double-Tap Hold + Dial', 'Quickly previews different fonts on your title while watching live.'],
  ['SNAP Viewer', 'Double-Tap Hold + Dial', 'Shrinks or grows the video preview window to give your timeline more room.'],
]

const SE_DRILLS_DEFAULT = [
  { id: 'sed-1',  text: '1. SHTL + dial — basic continuous playback (learn first — every edit starts here)', checked: false },
  { id: 'sed-2',  text: '2. JOG + dial — frame-accurate movement, stops when you stop', checked: false },
  { id: 'sed-3',  text: '3. TRIM IN / TRIM OUT + dial — shorten clip start or end', checked: false },
  { id: 'sed-4',  text: '4. MARK double-tap — drop VO marker note while watching footage', checked: false },
  { id: 'sed-5',  text: '5. SCRL + dial — fly through long timelines for culling dead air', checked: false },
  { id: 'sed-6',  text: '6. LIVE O/WR double-tap — switch camera angle in Sync Bin', checked: false },
  { id: 'sed-7',  text: '7. ROLL + dial — move a cut point without changing total length', checked: false },
  { id: 'sed-8',  text: '8. AUDIO LEVEL + dial — duck/raise volume of selected clip', checked: false },
  { id: 'sed-9',  text: '9. CLOSE UP + dial — punch in on 2.7K footage, reframe without cutting', checked: false },
  { id: 'sed-10', text: '10. SLIP SOURCE + dial — change what footage starts the clip (advanced)', checked: false },
  { id: 'sed-11', text: '11. SLIP DEST + dial — change the out point of clip content (advanced)', checked: false },
  { id: 'sed-12', text: '12. ESCAPE double-tap — undo last action (use this constantly)', checked: false },
]

// ─────────────────────────────────────────────
// Editing Lab Data
// ─────────────────────────────────────────────
const DEFAULT_EDIT_WORKFLOW = [
  { id: 'ew-1', text: 'INTAKE & STORAGE: Move cards to SSD (APFS Format). Organize into folders: ME_FACE, ME_SCOPE, CALLIE, SQUAD_LEAD.', checked: false },
  { id: 'ew-2', text: 'PROXY GENERATION: Create ProRes 422 LT (1080p) Proxies. Crucial for iPad RAM management.', checked: false },
  { id: 'ew-3', text: "THE CUT PAGE ROUGH-IN: Use Speed Editor 'Source Tape'. Trim 40-minute hikes down to 5-minute action loops.", checked: false },
  { id: 'ew-4', text: "SMART SYNC: Create 'Sync Bin' using Waveform. Align GP10, GP8, and GP4.", checked: false },
  { id: 'ew-5', text: "AI PROCESSING: Apply 'Voice Isolation' (50%) to Rodes. Apply 'SuperScale 2x' to GP4/Sionyx.", checked: false },
  { id: 'ew-6', text: 'RENDER IN PLACE: Right-click AI-heavy clips → Render in Place (ProRes 422). Prevents lag during playback.', checked: false },
  { id: 'ew-7', text: "ASSET LAYER: Drop 'Hybrid Phonk' music (-18dB) and Hit-Marker SFX.", checked: false },
]

const DEFAULT_ASSET_BUCKET = [
  { id: 'ab-1', title: 'MUSIC VIBE',  desc: 'Hybrid Phonk / Industrial Cyberpunk (Fast cuts)' },
  { id: 'ab-2', title: 'AUDIO SFX',   desc: 'Mechanical bolt cycles, Radio squelch, Bullet cracks' },
  { id: 'ab-3', title: 'HIT MARKERS', desc: "4-frame visual overlay + 'Tick' sound effect" },
  { id: 'ab-4', title: 'J-CUTS',      desc: 'Start audio of the next clip 1 second early for flow' },
]

const SE_GODMODE = [
  { key: 'SOURCE TAPE',      desc: 'Scroll through all footage in one continuous strip.' },
  { key: 'SOURCE OVERWRITE', desc: 'Instantly place Scope-cam over Head-cam in sync.' },
  { key: 'RIPPLE DELETE',    desc: 'Remove dead air with one tap.' },
]

// ─────────────────────────────────────────────
// Phase → Tab mapping (0=Field Prep, 1=Sync Lab, 2=Studio)
// ─────────────────────────────────────────────
const PHASE_TAB = {
  'pre-production': 0, 'dry-run': 0, 'field-prep': 0, 'intake': 0,
  'sync': 1, 'cut': 1, 'fairlight': 1,
  'edit-page': 2, 'ai-polish': 2, 'export': 2,
}

// ─────────────────────────────────────────────
// Section 1 — Metadata Prep (Camera Assignment for DaVinci Sync Bin)
// ─────────────────────────────────────────────
const METADATA_PREP = [
  { cam: 1, name: 'GP 10',   role: 'Head / Face', res: '2.7K/60',  ar: '4:3',  badge: 'anchor' },
  { cam: 2, name: 'AS20',    role: 'Selfie',       res: '1080p/60', ar: '16:9', badge: 'toggle' },
  { cam: 3, name: 'GitUp F1',role: 'Scope / PiP',  res: '2.7K/60',  ar: '16:9', badge: null   },
  { cam: 4, name: 'GP 8',    role: 'Callie',       res: '2.7K/60',  ar: '4:3',  badge: null   },
  { cam: 5, name: 'GP 4',    role: 'Lead',         res: '1080p/60', ar: '4:3',  badge: 'warn'  },
]

// ─────────────────────────────────────────────
// Section 2 — Sync & Multicam Workflow Checklist
// ─────────────────────────────────────────────
const DEFAULT_SYNC_CHECKLIST = [
  {
    id: 'sc-1',
    title: 'WAVEFORM SYNC',
    desc: 'Select CAM 1–5 + 2 Rode Mics → Create Sync Bin.',
    detail: 'Cut Page → select all clips in batch bin → click Sync Bin icon → Sync by Audio. Use GBB rack clack as the waveform spike anchor. Multi-View grid confirms alignment across all angles.',
    checked: false,
    warn: false,
  },
  {
    id: 'sc-2',
    title: 'LOCK AUDIO',
    desc: 'Lock A1 (Lead Audio) before using Speed Editor Live Overwrite.',
    detail: 'Right-click RØDE LAV1 track header → Lock Track. This prevents Live Overwrite from accidentally replacing your golden audio. A1 stays locked — only the video layer switches on angle changes.',
    checked: false,
    warn: false,
  },
  {
    id: 'sc-3',
    title: 'PAINTING PASS',
    desc: 'Hold CAM [1–5] + Search Dial to overlay angles on master track.',
    detail: 'Press and hold the camera number key (1–5) on the Speed Editor, then rotate the Search Dial to scrub. Release when you find the best angle. The selected angle overwrites the master track at that section. Dial up = faster forward, Dial down = reverse.',
    checked: false,
    warn: false,
  },
  {
    id: 'sc-4',
    title: 'DOUBLE-TAP CHECK',
    desc: 'Double-tap Live O/WR to preview angle focus / framing before committing.',
    detail: 'Before committing to an angle switch: LIVE O/WR double-tap previews the next camera angle full-screen. Verify focus and framing are clean before the cut lands on the timeline. This is your quality gate for every angle change.',
    checked: false,
    warn: false,
  },
  {
    id: 'sc-5',
    title: 'SEQUENTIAL APPEND',
    desc: 'Split Squad segments — move A2 (Callie) to Lead Audio before cut.',
    detail: "For segments where Callie is the primary action: mute A1 (Shaun), unmute A2 (Callie), and set A2 as the dialogue anchor. Split the sequence at the transition point, re-lock the new Lead Audio. Callie's perspective now drives the audio bed for that segment.",
    checked: false,
    warn: false,
  },
]

// ─────────────────────────────────────────────
// Section 3 — Audio & AI Lab constants
// ─────────────────────────────────────────────
const TRANSCRIPT_KEYWORDS = ['Contact', 'Moving', 'Medic']

// ─────────────────────────────────────────────
// Section 4 — iPad Performance Protocol
// ─────────────────────────────────────────────
const DEFAULT_IPAD_PERF = [  {
    id: 'ip-1',
    title: 'RENDER IN PLACE',
    desc: '⚠ Right-click GP4 SuperScale / AI clips → Render in Place before final edit.',
    detail: 'CRITICAL: Without this, the M4 recalculates SuperScale 2x every frame during grading — causing thermal throttle and dropped frames. Right-click all AI-processed clips → Render in Place → ProRes 422. Bake before you grade.',
    checked: false,
    warn: true,
  },
  {
    id: 'ip-2',
    title: 'GAP KILLER',
    desc: '[Split] → [Jog] → [Split] → [Ripple Delete] — remove dead air gaps.',
    detail: 'Step 1: Park playhead at the START of the gap → press SPLIT. Step 2: JOG + Dial to move playhead precisely to the END of the gap. Step 3: press SPLIT again. Step 4: click the isolated gap clip → RIPPLE DELETE. The timeline closes the hole automatically.',
    checked: false,
    warn: false,
  },
  {
    id: 'ip-3',
    title: 'TIMELINE SCALING',
    desc: 'Duplicate Timeline → rename Part 01 / Part 02 / Part 03 for long edits.',
    detail: "Right-click timeline tab → Duplicate Timeline. Rename: 'OLS_Event_Part01'. Repeat for Parts 02 + 03. Trim each duplicate to its section using In/Out points. Each part gets its own Deliver queue — avoids single 30-min crash-prone export on M4.",
    checked: false,
    warn: false,
  },
]

// ─────────────────────────────────────────────
// Montage Lab — Intro & Highlights
// ─────────────────────────────────────────────
const DEFAULT_MONTAGE_LAB = [
  {
    id: 'ml-1',
    title: 'TRACK SELECTION',
    desc: "Hybrid Phonk or Cyber-Noir Trap — High BPM.",
    detail: 'Choose a track with strong transient peaks (kick drums, snares) for tight beat detection. Target 120–160 BPM. Import to Power Bin → MUSIC/INTRO before starting. Instrumental tracks avoid copyright and keep dialogue readable.',
    checked: false,
    warn: false,
  },
  {
    id: 'ml-2',
    title: 'BEAT SYNC',
    desc: "Right-click Audio → 'Show Music Beats' (AI Detection).",
    detail: "Right-click the music clip on the timeline → Show Music Beats. DaVinci AI parses the audio and drops beat markers (yellow flags) on every transient. These become your cut snap points. Enable Snapping (S key) so clip edges lock to markers.",
    checked: false,
    warn: false,
  },
  {
    id: 'ml-3',
    title: 'SOURCE TAPE DRUMMING',
    desc: 'Jog Wheel in Source Tape — mark IN/OUT on action beats, hit APPEND.',
    detail: "SHTL + Dial → enters Source Tape mode (all clips as one continuous strip). JOG + Dial → frame-accurate navigation to the action peak. Press IN at the start of the hit. Press OUT at the exit frame. Hit SMART IN / APPEND — drops the clip directly onto the next beat marker. Repeat for each impact. This is 'drumming' the edit to the track.",
    checked: false,
    warn: false,
  },
  {
    id: 'ml-4',
    title: 'SPEED RAMPING',
    desc: 'Speed Ramp: 200% → 40% → 200% — align the dip to gunshot audio.',
    detail: 'Highlight the contact clip → Right-click → Retime Controls → Speed Ramp. Keyframe 1: pre-hit at 200% (fast approach). Keyframe 2: impact frame at 40% (slow-mo). Keyframe 3: recovery at 200% (snap back to tempo). Use JOG + Dial to park the playhead on the gunshot waveform transient — align the 40% keyframe EXACTLY there for maximum impact.',
    checked: false,
    warn: false,
  },
  {
    id: 'ml-5',
    title: 'TRANSITION OVERLAYS',
    desc: "Glitch or Zoom transitions on the beat. Hold TRANS + Dial to cycle styles.",
    detail: "Hold TRANS on the Speed Editor + rotate Dial to cycle through styles: Cut → Dissolve → Glitch → Zoom Blur → Wipe. Stop on Glitch or Zoom Blur. Tap to apply at the cut point on the heat timeline. Dial in duration with TRANS DUR + Dial — 4–8 frames is the sweet spot for high-BPM action edits.",
    checked: false,
    warn: false,
  },
]

// ─────────────────────────────────────────────
// Video Progress Board Data
// ─────────────────────────────────────────────
const PROGRESS_SECTIONS = [
  { id: 'prog-pretrip',    label: 'Pre-Trip B-Roll',  states: ['Not Started', 'Filming', 'Editing', 'Done'] },
  { id: 'prog-arrival',   label: 'Arrival & Camp',    states: ['Not Started', 'Filming', 'Editing', 'Done'] },
  { id: 'prog-daygame',   label: 'Day Game',           states: ['Not Started', 'Filming', 'Editing', 'Done'] },
  { id: 'prog-nightgame', label: 'Night Game',         states: ['Not Started', 'Filming', 'Editing', 'Done'] },
  { id: 'prog-postgame',  label: 'Post-Game / Wrap',   states: ['Not Started', 'Filming', 'Editing', 'Done'] },
  { id: 'prog-assets',    label: 'Music & Assets',     states: ['Not Started', 'Collecting', 'In Power Bin', 'Done'] },
  { id: 'prog-color',     label: 'Color Grade',        states: ['Locked', 'In Progress', 'Done'] },
  { id: 'prog-export',    label: 'Final Export',       states: ['Not Started', 'Rendering', 'Done'] },
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
  const collapsedPhases = {}
  DEFAULT_PHASES.forEach((p) => { collapsedPhases[p.id] = true })
  return { nightOps: false, phaseItems, collapsedPhases }
}

const STORAGE_KEY        = 'ols-sop-v3'
const SHOTLIST_KEY       = 'ols-shotlist-v1'
const PROGRESS_KEY       = 'ols-progress-v1'
const SE_DRILLS_KEY      = 'ols-se-drills-v1'
const EDIT_WORKFLOW_KEY  = 'ols-edit-workflow-v1'
const ASSET_BUCKET_KEY   = 'ols-asset-bucket-v1'
const SYNC_CHECKLIST_KEY = 'ols-sync-checklist-v1'
const VOICE_ISO_KEY      = 'ols-voice-iso-v1'
const IPAD_PERF_KEY      = 'ols-ipad-perf-v1'
const CAM_NOTES_KEY      = 'ols-cam-notes-v1'
const TRANSCRIBE_KEY     = 'ols-transcribe-v1'
const DUCKER_KEY         = 'ols-ducker-v1'
const MONTAGE_LAB_KEY    = 'ols-montage-v1'

// ─────────────────────────────────────────────
// App
// ─────────────────────────────────────────────
export default function App() {
  const [appState, setAppState] = useLocalStorage(STORAGE_KEY, buildDefaultState())
  const [shotList, setShotList] = useLocalStorage(SHOTLIST_KEY, DEFAULT_SHOT_LIST)
  const [progressState, setProgressState] = useLocalStorage(PROGRESS_KEY,
    Object.fromEntries(PROGRESS_SECTIONS.map((s) => [s.id, 0]))
  )
  const [seDrills, setSeDrills] = useLocalStorage(SE_DRILLS_KEY, SE_DRILLS_DEFAULT)

  const [activeCamera, setActiveCamera] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editingText, setEditingText] = useState('')
  const [shotEditMode, setShotEditMode] = useState(false)
  const [shotEditingId, setShotEditingId] = useState(null)
  const [shotEditingText, setShotEditingText] = useState('')
  const [showSeRef, setShowSeRef]   = useState(false)
  const [editWorkflow, setEditWorkflow] = useLocalStorage(EDIT_WORKFLOW_KEY, DEFAULT_EDIT_WORKFLOW)
  const [assetBucket, setAssetBucket]   = useLocalStorage(ASSET_BUCKET_KEY, DEFAULT_ASSET_BUCKET)
  const [wfEditMode, setWfEditMode]     = useState(false)
  const [wfEditingId, setWfEditingId]   = useState(null)
  const [wfEditingText, setWfEditingText] = useState('')
  const [newStepText, setNewStepText]   = useState('')
  const [newAssetTitle, setNewAssetTitle] = useState('')
  const [newAssetDesc, setNewAssetDesc]  = useState('')
  const [showGodMode, setShowGodMode]   = useState(false)

  // ── Tab navigation ──
  const [activeTab, setActiveTab] = useState(0) // 0=Field Prep, 1=Sync Lab, 2=Studio

  // ── Section 2: Sync & Multicam checklist ──
  const [syncChecklist, setSyncChecklist] = useLocalStorage(SYNC_CHECKLIST_KEY, DEFAULT_SYNC_CHECKLIST)
  const [expandedSync, setExpandedSync]   = useState(null)

  // ── Section 3: Audio & AI Lab ──
  const [voiceIso, setVoiceIso]       = useLocalStorage(VOICE_ISO_KEY, { lav1: 50, lav2: 50 })
  const [duckerEnabled, setDuckerEnabled] = useLocalStorage(DUCKER_KEY, false)
  const [transcribeText, setTranscribeText] = useLocalStorage(TRANSCRIBE_KEY, '')
  const [transcribeQuery, setTranscribeQuery] = useState('')

  // ── Section 4: iPad Performance Protocol ──
  const [ipadPerf, setIpadPerf]       = useLocalStorage(IPAD_PERF_KEY, DEFAULT_IPAD_PERF)
  const [expandedIpad, setExpandedIpad] = useState(null)

  // ── Camera custom notes ──
  const [camNotes, setCamNotes] = useLocalStorage(CAM_NOTES_KEY, {})

  // ── Montage Lab ──
  const [montageItems, setMontageItems] = useLocalStorage(MONTAGE_LAB_KEY, DEFAULT_MONTAGE_LAB)
  const [expandedMontage, setExpandedMontage] = useState(null)

  const { nightOps, phaseItems, collapsedPhases } = appState
  const mode = nightOps ? 'night' : 'day'

  // ── SOP phase actions ──
  function setNightOps(val) {
    setAppState((s) => ({ ...s, nightOps: val }))
  }

  function togglePhase(phaseId) {
    setAppState((s) => ({
      ...s,
      collapsedPhases: { ...s.collapsedPhases, [phaseId]: !s.collapsedPhases[phaseId] },
    }))
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

  // ── Shot list actions ──
  function toggleShot(id) {
    setShotList((list) => list.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    ))
  }

  function moveShotItem(index, dir) {
    setShotList((list) => {
      const next = [...list]
      const target = index + dir
      if (target < 0 || target >= next.length) return list
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  function startShotEdit(item) {
    setShotEditingId(item.id)
    setShotEditingText(item.text)
  }

  function commitShotEdit() {
    if (!shotEditingId) return
    const trimmed = shotEditingText.trim()
    setShotList((list) => list.map((item) =>
      item.id === shotEditingId ? { ...item, text: trimmed || item.text } : item
    ))
    setShotEditingId(null)
    setShotEditingText('')
  }

  function deleteShotItem(id) {
    setShotList((list) => list.filter((item) => item.id !== id))
  }

  function resetShots() {
    setShotList((list) => list.map((item) => ({ ...item, checked: false })))
  }

  // ── Progress board ──
  function cycleProgress(sectionId, states) {
    setProgressState((s) => ({
      ...s,
      [sectionId]: ((s[sectionId] ?? 0) + 1) % states.length,
    }))
  }

  // ── SE Drills ──
  function toggleSeDrill(id) {
    setSeDrills((list) => list.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    ))
  }

  // ── Editing Lab: workflow ──
  function toggleWorkflowStep(id) {
    setEditWorkflow((list) => list.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    ))
  }

  function moveWorkflowStep(index, dir) {
    setEditWorkflow((list) => {
      const next = [...list]
      const target = index + dir
      if (target < 0 || target >= next.length) return list
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  function startWfEdit(item) {
    setWfEditingId(item.id)
    setWfEditingText(item.text)
  }

  function commitWfEdit() {
    if (!wfEditingId) return
    const trimmed = wfEditingText.trim()
    setEditWorkflow((list) => list.map((item) =>
      item.id === wfEditingId ? { ...item, text: trimmed || item.text } : item
    ))
    setWfEditingId(null)
    setWfEditingText('')
  }

  function addWorkflowStep() {
    const trimmed = newStepText.trim()
    if (!trimmed) return
    setEditWorkflow((list) => [...list, { id: `ew-${Date.now()}`, text: trimmed, checked: false }])
    setNewStepText('')
  }

  function deleteWorkflowStep(id) {
    setEditWorkflow((list) => list.filter((item) => item.id !== id))
  }

  function resetWorkflow() {
    setEditWorkflow((list) => list.map((item) => ({ ...item, checked: false })))
  }

  // ── Editing Lab: asset bucket ──
  function addAsset() {
    const title = newAssetTitle.trim()
    if (!title) return
    setAssetBucket((list) => [...list, { id: `ab-${Date.now()}`, title, desc: newAssetDesc.trim() }])
    setNewAssetTitle('')
    setNewAssetDesc('')
  }

  function deleteAsset(id) {
    setAssetBucket((list) => list.filter((item) => item.id !== id))
  }

  // ── Sync & Multicam checklist ──
  function toggleSyncItem(id) {
    setSyncChecklist((list) =>
      list.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    )
  }
  function resetSyncChecklist() {
    setSyncChecklist((list) => list.map((item) => ({ ...item, checked: false })))
  }

  // ── iPad Performance Protocol ──
  function toggleIpadPerf(id) {
    setIpadPerf((list) =>
      list.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    )
  }
  function resetIpadPerf() {
    setIpadPerf((list) => list.map((item) => ({ ...item, checked: false })))
  }

  // ── Camera custom notes ──
  function updateCamNote(camId, note) {
    setCamNotes((n) => ({ ...n, [camId]: note }))
  }

  // ── Montage Lab ──
  function toggleMontageItem(id) {
    setMontageItems((list) =>
      list.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    )
  }
  function resetMontage() {
    setMontageItems((list) => list.map((item) => ({ ...item, checked: false })))
  }

  // ── Progress calc ──
  const allItems = DEFAULT_PHASES.flatMap((p) => phaseItems[p.id]?.[mode] ?? [])
  const total = allItems.length
  const completed = allItems.filter((i) => i.checked).length
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100)

  const shotTotal = shotList.filter((i) => !i.divider).length
  const shotDone  = shotList.filter((i) => !i.divider && i.checked).length

  const seDrillDone = seDrills.filter((i) => i.checked).length
  const wfDone      = editWorkflow.filter((i) => i.checked).length
  const syncDone    = syncChecklist.filter((i) => i.checked).length
  const ipadDone    = ipadPerf.filter((i) => i.checked).length
  const montageDone = montageItems.filter((i) => i.checked).length

  const transcribeLines = transcribeText.split('\n').filter(Boolean)
  const transcribeMatches = transcribeQuery.trim()
    ? transcribeLines.filter((l) => l.toLowerCase().includes(transcribeQuery.toLowerCase()))
    : []

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
          <div className="progress-track" aria-label="Overall SOP progress">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="progress-label">
            {completed}/{total}&nbsp;·&nbsp;{progress}%
          </span>
        </div>
      </header>

      {/* ── Video Progress Board + Camera Ledger (Tab 0 only) ── */}
      {activeTab === 0 && <>
      <section className="app-section progress-board-section">
        <div className="section-title-row">
          <h2 className="section-title">Video Progress</h2>
          <span className="section-hint">Tap badge to advance</span>
        </div>
        <div className="progress-board">
          {PROGRESS_SECTIONS.map((sec) => {
            const idx = progressState[sec.id] ?? 0
            const stateLabel = sec.states[idx]
            const isDone = idx === sec.states.length - 1
            return (
              <div key={sec.id} className="pb-row">
                <span className="pb-label">{sec.label}</span>
                <button
                  className={`pb-badge${isDone ? ' pb-done' : ''}`}
                  onClick={() => cycleProgress(sec.id, sec.states)}
                >
                  {stateLabel}
                </button>
              </div>
            )
          })}
        </div>
      </section>

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
                  className={cam.nightCam ? (nightOps ? 'row-night-active' : 'row-night-dim') : ''}
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
      {/* End Camera Ledger — end Tab 0 top sections */}
      </>}

      {/* ── Tab 1: Sync Lab — top sections ── */}
      {activeTab === 1 && <>
        {/* Section 1: Metadata Prep Grid */}
        <section className="app-section">
          <div className="section-title-row">
            <h2 className="section-title">Metadata Prep</h2>
            <span className="section-hint">Camera Assignment · Sync Bin</span>
          </div>
          <div className="meta-grid">
            {METADATA_PREP.map(({ cam, name, role, res, ar, badge }) => (
              <div key={cam} className="meta-row">
                <span className="meta-cam">CAM {cam}</span>
                <div className="meta-body">
                  <span className="meta-name">{name}</span>
                  <span className="meta-role">{role}</span>
                </div>
                <div className="meta-specs">
                  <span className="meta-res">{res}</span>
                  <span className="meta-ar">{ar}</span>
                </div>
                {badge === 'anchor' && <span className="meta-badge meta-anchor">⚓ Anchor</span>}
                {badge === 'toggle' && <span className="meta-badge meta-toggle">↔ Full Screen</span>}
                {badge === 'warn'   && <span className="meta-badge meta-warn">⚠ SuperScale 2x</span>}
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: Sync & Multicam Workflow Checklist */}
        <section className="phase-card">
          <div className="shot-list-header">
            <div className="phase-header-left">
              <p className="phase-kicker">Editing SOP</p>
              <h2 className="phase-name">Sync &amp; Multicam Workflow</h2>
              <p className="phase-sub">5 logic gates — complete in order</p>
            </div>
            <div className="phase-header-right">
              <span className={`phase-badge${syncDone === syncChecklist.length ? ' complete' : ''}`}>
                {syncDone}/{syncChecklist.length}
              </span>
            </div>
          </div>
          <ul className="checklist">
            {syncChecklist.map((item) => (
              <li
                key={item.id}
                className={['cl-item', item.checked ? 'is-checked' : ''].filter(Boolean).join(' ')}
              >
                <div className="sync-row">
                  <label className="cl-label" style={{ flex: 1 }}>
                    <input type="checkbox" checked={item.checked} onChange={() => toggleSyncItem(item.id)} />
                    <span className="cl-checkmark" aria-hidden="true" />
                    <div>
                      <span className="sync-title">{item.title}</span>
                      <span className="sync-desc">{item.desc}</span>
                    </div>
                  </label>
                  <button
                    className="sync-expand-btn"
                    onClick={() => setExpandedSync(expandedSync === item.id ? null : item.id)}
                    aria-label="Expand details"
                  >
                    {expandedSync === item.id ? '▲' : '▼'}
                  </button>
                </div>
                {expandedSync === item.id && (
                  <p className="sync-detail">{item.detail}</p>
                )}
              </li>
            ))}
          </ul>
          <div className="card-footer-row">
            <button className="reset-btn" onClick={resetSyncChecklist}>Reset Sync Checks</button>
          </div>
        </section>
      </>}

      {/* ── Tab 2: Studio — top section ── */}
      {activeTab === 2 && <>
        {/* Section 4: iPad Performance Protocol */}
        <section className="phase-card">
          <div className="shot-list-header">
            <div className="phase-header-left">
              <p className="phase-kicker">System</p>
              <h2 className="phase-name">iPad Performance Protocol</h2>
              <p className="phase-sub">M4 optimisation — prevent thermal throttle</p>
            </div>
            <div className="phase-header-right">
              <span className={`phase-badge${ipadDone === ipadPerf.length ? ' complete' : ''}`}>
                {ipadDone}/{ipadPerf.length}
              </span>
            </div>
          </div>
          <ul className="checklist">
            {ipadPerf.map((item) => (
              <li
                key={item.id}
                className={['cl-item', item.checked ? 'is-checked' : ''].filter(Boolean).join(' ')}
              >
                <div className="sync-row">
                  <label className="cl-label" style={{ flex: 1 }}>
                    <input type="checkbox" checked={item.checked} onChange={() => toggleIpadPerf(item.id)} />
                    <span className="cl-checkmark" aria-hidden="true" />
                    <div>
                      <span className={`sync-title${item.warn ? ' warn-text' : ''}`}>{item.title}</span>
                      <span className="sync-desc">{item.desc}</span>
                    </div>
                  </label>
                  <button
                    className="sync-expand-btn"
                    onClick={() => setExpandedIpad(expandedIpad === item.id ? null : item.id)}
                    aria-label="Expand details"
                  >
                    {expandedIpad === item.id ? '▲' : '▼'}
                  </button>
                </div>
                {expandedIpad === item.id && (
                  <p className={`sync-detail${item.warn ? ' warn-detail' : ''}`}>{item.detail}</p>
                )}
              </li>
            ))}
          </ul>
          <div className="card-footer-row">
            <button className="reset-btn" onClick={resetIpadPerf}>Reset Protocol</button>
          </div>
        </section>
      </>}

      {/* ── Edit mode bar (all tabs — phases below are filtered) ── */}
      <div className="edit-bar">
        <span className="edit-bar-label">SOP Checklist</span>
        <button
          className={`edit-toggle${editMode ? ' active' : ''}`}
          onClick={() => { setEditMode((e) => !e); setEditingId(null) }}
        >
          {editMode ? '✓ Done' : '✏ Edit / Reorder'}
        </button>
      </div>

      {/* ── Phase Cards (filtered to active tab) ── */}
      {DEFAULT_PHASES.filter((p) => PHASE_TAB[p.id] === activeTab).map((phase, phaseIdx) => {
        const items = phaseItems[phase.id]?.[mode] ?? []
        const phaseChecked = items.filter((i) => i.checked).length
        const isCollapsed = collapsedPhases?.[phase.id] ?? true

        return (
          <section key={phase.id} className="phase-card">
            <button
              className="phase-header"
              onClick={() => togglePhase(phase.id)}
              aria-expanded={!isCollapsed}
            >
              <div className="phase-header-left">
                <p className="phase-kicker">Phase {phaseIdx + 1}</p>
                <h2 className="phase-name">{phase.label}</h2>
                <p className="phase-sub">{phase.subtitle}</p>
              </div>
              <div className="phase-header-right">
                <span className={`phase-badge${phaseChecked === items.length ? ' complete' : ''}`}>
                  {phaseChecked}/{items.length}
                </span>
                <span className={`phase-chevron${isCollapsed ? '' : ' open'}`}>›</span>
              </div>
            </button>

            {!isCollapsed && (
              <ul className="checklist">
                {items.map((item, idx) => {
                  const isDivider = item.text.startsWith('──')
                  return (
                    <li
                      key={item.id}
                      className={[
                        isDivider ? 'cl-divider' : 'cl-item',
                        !isDivider && item.checked ? 'is-checked' : '',
                        !isDivider && editMode ? 'is-editing' : '',
                      ].filter(Boolean).join(' ')}
                    >
                      {isDivider ? (
                        <span className="cl-divider-label">{item.text.replace(/^──\s*/, '').replace(/\s*──$/, '')}</span>
                      ) : editMode ? (
                        <div className="cl-edit-row">
                          <div className="reorder-btns">
                            <button className="reorder-btn" disabled={idx === 0} onClick={() => moveItem(phase.id, idx, -1)} aria-label="Move up">▲</button>
                            <button className="reorder-btn" disabled={idx === items.length - 1} onClick={() => moveItem(phase.id, idx, 1)} aria-label="Move down">▼</button>
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
                            <span className="cl-text" onClick={() => startEdit(item)}>{item.text}</span>
                          )}
                          <button className="pencil-btn" onClick={() => startEdit(item)} aria-label="Edit item">✏</button>
                        </div>
                      ) : (
                        <label className="cl-label">
                          <input type="checkbox" checked={item.checked} onChange={() => toggleCheck(phase.id, item.id)} />
                          <span className="cl-checkmark" aria-hidden="true" />
                          <span className="cl-text">{item.text}</span>
                        </label>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        )
      })}

      {/* ── Shot List (Tab 0 only) ── */}
      {activeTab === 0 && (
      <section className="phase-card shot-list-card">
        <div className="phase-header shot-list-header">
          <div className="phase-header-left">
            <p className="phase-kicker">Shot List</p>
            <h2 className="phase-name">Video Shot Planner</h2>
            <p className="phase-sub">Check off shots as captured</p>
          </div>
          <div className="phase-header-right">
            <span className={`phase-badge${shotDone === shotTotal ? ' complete' : ''}`}>
              {shotDone}/{shotTotal}
            </span>
            <button
              className={`edit-toggle${shotEditMode ? ' active' : ''}`}
              onClick={() => { setShotEditMode((e) => !e); setShotEditingId(null) }}
              style={{ marginLeft: '0.5rem' }}
            >
              {shotEditMode ? '✓ Done' : '✏'}
            </button>
          </div>
        </div>
        <ul className="checklist">
          {shotList.map((item, idx) => {
            if (item.divider) {
              return (
                <li key={item.id} className="cl-divider">
                  <span className="cl-divider-label">{item.text.replace(/^──\s*/, '').replace(/\s*──$/, '')}</span>
                </li>
              )
            }
            return (
              <li key={item.id} className={['cl-item', item.checked ? 'is-checked' : '', shotEditMode ? 'is-editing' : ''].filter(Boolean).join(' ')}>
                {shotEditMode ? (
                  <div className="cl-edit-row">
                    <div className="reorder-btns">
                      <button className="reorder-btn" disabled={idx === 0} onClick={() => moveShotItem(idx, -1)} aria-label="Move up">▲</button>
                      <button className="reorder-btn" disabled={idx === shotList.length - 1} onClick={() => moveShotItem(idx, 1)} aria-label="Move down">▼</button>
                    </div>
                    {shotEditingId === item.id ? (
                      <input
                        className="cl-input"
                        value={shotEditingText}
                        onChange={(e) => setShotEditingText(e.target.value)}
                        onBlur={commitShotEdit}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') commitShotEdit()
                          if (e.key === 'Escape') { setShotEditingId(null); setShotEditingText('') }
                        }}
                        autoFocus
                      />
                    ) : (
                      <span className="cl-text" onClick={() => startShotEdit(item)}>{item.text}</span>
                    )}
                    <button className="pencil-btn" onClick={() => startShotEdit(item)} aria-label="Edit">✏</button>
                    <button className="delete-btn" onClick={() => deleteShotItem(item.id)} aria-label="Delete">✕</button>
                  </div>
                ) : (
                  <label className="cl-label">
                    <input type="checkbox" checked={item.checked} onChange={() => toggleShot(item.id)} />
                    <span className="cl-checkmark" aria-hidden="true" />
                    <span className="cl-text">{item.text}</span>
                  </label>
                )}
              </li>
            )
          })}
        </ul>
        <div className="card-footer-row">
          <button className="reset-btn" onClick={resetShots}>Reset Shot List</button>
        </div>
      </section>
      )}{/* End Tab 0 Shot List */}

      {/* ── Section 3: Audio & AI Lab (Tab 1 only) ── */}
      {activeTab === 1 && (
      <section className="app-section">
        <div className="section-title-row">
          <h2 className="section-title">Audio &amp; AI Lab</h2>
          <span className="section-hint">Fairlight settings</span>
        </div>

        {/* Voice ISO */}
        <div className="audio-block">
          <p className="audio-block-title">VOICE ISO — Rode Tracks</p>
          {[['lav1', 'LAV 1 (Shaun)'], ['lav2', 'LAV 2 (Callie)']].map(([key, label]) => (
            <div key={key} className="voice-iso-row">
              <span className="voice-iso-label">{label}</span>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={voiceIso[key]}
                onChange={(e) => setVoiceIso((v) => ({ ...v, [key]: Number(e.target.value) }))}
                className="voice-iso-slider"
                aria-label={`${label} isolation`}
              />
              <span className="voice-iso-value">{voiceIso[key]}%</span>
            </div>
          ))}
          <p className="audio-hint">Target: 40–60% · Higher = more isolation, less natural tone</p>
        </div>

        {/* Auto-Ducker */}
        <div className="audio-block">
          <div className="audio-block-header">
            <p className="audio-block-title">AUTO-DUCKER — Music (A3)</p>
            <button
              className={`ducker-toggle${duckerEnabled ? ' on' : ''}`}
              onClick={() => setDuckerEnabled((v) => !v)}
            >
              {duckerEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
          <div className="ducker-spec-grid">
            <div className="ducker-spec"><span>Target Level</span><strong>−18 dB</strong></div>
            <div className="ducker-spec"><span>Reference</span><strong>A1 / A2 Dialogue</strong></div>
            <div className="ducker-spec"><span>Lookahead</span><strong>100 ms</strong></div>
            <div className="ducker-spec"><span>Rise / Fall</span><strong>500 ms</strong></div>
          </div>
        </div>

        {/* AI Transcribe */}
        <div className="audio-block">
          <p className="audio-block-title">AI TRANSCRIBE — Keyword Search</p>
          <div className="keyword-chips">
            {TRANSCRIPT_KEYWORDS.map((kw) => (
              <button
                key={kw}
                className={`chip${transcribeQuery === kw ? ' active' : ''}`}
                onClick={() => setTranscribeQuery(transcribeQuery === kw ? '' : kw)}
              >
                {kw}
              </button>
            ))}
          </div>
          <input
            className="cl-input transcribe-search"
            placeholder="Search keywords…"
            value={transcribeQuery}
            onChange={(e) => setTranscribeQuery(e.target.value)}
            aria-label="Search transcript"
          />
          <textarea
            className="transcribe-area"
            placeholder="Paste AI-generated transcript here…"
            value={transcribeText}
            onChange={(e) => setTranscribeText(e.target.value)}
            rows={5}
            aria-label="Transcript text"
          />
          {transcribeQuery.trim() && (
            <div className="transcribe-results" aria-live="polite">
              {transcribeMatches.length === 0 ? (
                <p className="transcribe-no-result">No matches for &ldquo;{transcribeQuery}&rdquo;</p>
              ) : (
                transcribeMatches.map((line, i) => (
                  <p key={i} className="transcribe-result-line">{line}</p>
                ))
              )}
            </div>
          )}
        </div>
      </section>
      )}{/* End Tab 1 Audio Lab */}

      {/* ── Tab 2: Studio — Speed Editor, Editing Lab, Footer ── */}
      {activeTab === 2 && <>

      {/* ── Montage Lab: Intro & Highlights ── */}
      <section className="phase-card montage-lab-card">
        <div className="shot-list-header montage-lab-header">
          <div className="phase-header-left">
            <p className="phase-kicker montage-kicker">Montage Lab</p>
            <h2 className="phase-name">Intro &amp; Highlights</h2>
            <p className="phase-sub">Beat-sync pipeline — 5 steps in order</p>
          </div>
          <div className="phase-header-right">
            <span className={`phase-badge${montageDone === montageItems.length ? ' complete' : ''}`}>
              {montageDone}/{montageItems.length}
            </span>
          </div>
        </div>
        <ul className="checklist">
          {montageItems.map((item) => (
            <li
              key={item.id}
              className={['cl-item', item.checked ? 'is-checked' : ''].filter(Boolean).join(' ')}
            >
              <div className="sync-row">
                <label className="cl-label" style={{ flex: 1 }}>
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => toggleMontageItem(item.id)}
                  />
                  <span className="cl-checkmark" aria-hidden="true" />
                  <div>
                    <span className="sync-title montage-title">{item.title}</span>
                    <span className="sync-desc">{item.desc}</span>
                  </div>
                </label>
                <button
                  className="sync-expand-btn"
                  onClick={() => setExpandedMontage(expandedMontage === item.id ? null : item.id)}
                  aria-label="Expand step detail"
                >
                  {expandedMontage === item.id ? '▲' : '▼'}
                </button>
              </div>
              {expandedMontage === item.id && (
                <p className="sync-detail montage-detail">{item.detail}</p>
              )}
            </li>
          ))}
        </ul>
        <div className="card-footer-row">
          <button className="reset-btn" onClick={resetMontage}>Reset Montage Checks</button>
        </div>
      </section>

      {/* ── Speed Editor Muscle Memory Drills ── */}
      <section className="phase-card">
        <div className="phase-header" style={{ pointerEvents: 'none' }}>
          <div className="phase-header-left">
            <p className="phase-kicker">Speed Editor</p>
            <h2 className="phase-name">Muscle Memory Drills</h2>
            <p className="phase-sub">Check off when you can do it without looking</p>
          </div>
          <div className="phase-header-right">
            <span className={`phase-badge${seDrillDone === seDrills.length ? ' complete' : ''}`}>
              {seDrillDone}/{seDrills.length}
            </span>
          </div>
        </div>
        <ul className="checklist">
          {seDrills.map((item) => (
            <li key={item.id} className={['cl-item', item.checked ? 'is-checked' : ''].filter(Boolean).join(' ')}>
              <label className="cl-label">
                <input type="checkbox" checked={item.checked} onChange={() => toggleSeDrill(item.id)} />
                <span className="cl-checkmark" aria-hidden="true" />
                <span className="cl-text">{item.text}</span>
              </label>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Speed Editor Full Reference (collapsible) ── */}
      <section className="app-section se-ref-section">
        <button
          className="se-ref-toggle"
          onClick={() => setShowSeRef((v) => !v)}
          aria-expanded={showSeRef}
        >
          <div>
            <p className="section-title" style={{ marginBottom: '0.2rem' }}>Speed Editor Reference</p>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>Full button guide — all 3 groups</p>
          </div>
          <span className={`phase-chevron${showSeRef ? ' open' : ''}`}>›</span>
        </button>

        {showSeRef && (
          <div className="se-ref-body">
            <p className="se-group-title">Standard Dial Operations</p>
            <div className="se-table">
              <div className="se-row se-head">
                <span>Button</span><span>How to Use</span><span>What it Does</span>
              </div>
              {SE_DIAL.map(([btn, how, what]) => (
                <div key={btn} className="se-row">
                  <span className="se-btn">{btn}</span>
                  <span className="se-how">{how}</span>
                  <span className="se-what">{what}</span>
                </div>
              ))}
            </div>

            <p className="se-group-title">Single-Press &amp; Double-Tap Actions</p>
            <div className="se-table">
              <div className="se-row se-head">
                <span>Button</span><span>How to Use</span><span>What it Does</span>
              </div>
              {SE_SINGLE.map(([btn, how, what]) => (
                <div key={btn} className="se-row">
                  <span className="se-btn">{btn}</span>
                  <span className="se-how">{how}</span>
                  <span className="se-what">{what}</span>
                </div>
              ))}
            </div>

            <p className="se-group-title">Double-Tap + Hold Precision Modes</p>
            <div className="se-table">
              <div className="se-row se-head">
                <span>Button</span><span>How to Use</span><span>What it Does</span>
              </div>
              {SE_PRECISION.map(([btn, how, what]) => (
                <div key={btn} className="se-row">
                  <span className="se-btn">{btn}</span>
                  <span className="se-how">{how}</span>
                  <span className="se-what">{what}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── Editing Lab separator ── */}
      <div className="lab-separator" aria-hidden="true">
        <span className="lab-separator-label">Editing Lab</span>
      </div>

      {/* ── Editing Lab: Speed-First Workflow ── */}
      <section className="phase-card editing-lab-card">
        <div className="phase-header shot-list-header">
          <div className="phase-header-left">
            <p className="phase-kicker">Editing Lab</p>
            <h2 className="phase-name">Speed-First Workflow</h2>
            <p className="phase-sub">7-step pipeline — reorder to match your session</p>
          </div>
          <div className="phase-header-right">
            <span className={`phase-badge${wfDone === editWorkflow.length ? ' complete' : ''}`}>
              {wfDone}/{editWorkflow.length}
            </span>
            <button
              className={`edit-toggle${wfEditMode ? ' active' : ''}`}
              onClick={() => { setWfEditMode((e) => !e); setWfEditingId(null) }}
              style={{ marginLeft: '0.5rem' }}
            >
              {wfEditMode ? '✓ Done' : '✏'}
            </button>
          </div>
        </div>
        <ul className="checklist">
          {editWorkflow.map((item, idx) => (
            <li
              key={item.id}
              className={['cl-item', item.checked ? 'is-checked' : '', wfEditMode ? 'is-editing' : ''].filter(Boolean).join(' ')}
            >
              {wfEditMode ? (
                <div className="cl-edit-row">
                  <div className="reorder-btns">
                    <button className="reorder-btn" disabled={idx === 0} onClick={() => moveWorkflowStep(idx, -1)} aria-label="Move up">▲</button>
                    <button className="reorder-btn" disabled={idx === editWorkflow.length - 1} onClick={() => moveWorkflowStep(idx, 1)} aria-label="Move down">▼</button>
                  </div>
                  {wfEditingId === item.id ? (
                    <input
                      className="cl-input"
                      value={wfEditingText}
                      onChange={(e) => setWfEditingText(e.target.value)}
                      onBlur={commitWfEdit}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') commitWfEdit()
                        if (e.key === 'Escape') { setWfEditingId(null); setWfEditingText('') }
                      }}
                      autoFocus
                    />
                  ) : (
                    <span className="cl-text" onClick={() => startWfEdit(item)}>{item.text}</span>
                  )}
                  <button className="pencil-btn" onClick={() => startWfEdit(item)} aria-label="Edit">✏</button>
                  <button className="delete-btn" onClick={() => deleteWorkflowStep(item.id)} aria-label="Delete">✕</button>
                </div>
              ) : (
                <label className="cl-label">
                  <input type="checkbox" checked={item.checked} onChange={() => toggleWorkflowStep(item.id)} />
                  <span className="cl-checkmark" aria-hidden="true" />
                  <span className="cl-text">{item.text}</span>
                </label>
              )}
            </li>
          ))}
        </ul>
        <div className="add-item-row">
          <input
            className="cl-input"
            placeholder="Add a new workflow step…"
            value={newStepText}
            onChange={(e) => setNewStepText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addWorkflowStep() }}
          />
          <button className="add-item-btn" onClick={addWorkflowStep} aria-label="Add step">+</button>
        </div>
        <div className="card-footer-row">
          <button className="reset-btn" onClick={resetWorkflow}>Reset Workflow Checks</button>
        </div>
      </section>

      {/* ── Editing Lab: Asset Bucket ── */}
      <section className="phase-card editing-lab-card">
        <div className="phase-header shot-list-header">
          <div className="phase-header-left">
            <p className="phase-kicker">Editing Lab</p>
            <h2 className="phase-name">Asset Bucket</h2>
            <p className="phase-sub">Quick-view reference cards — essential edit assets</p>
          </div>
        </div>
        <div className="asset-bucket-grid">
          {assetBucket.map((card) => (
            <div key={card.id} className="asset-card">
              <button
                className="asset-card-delete"
                onClick={() => deleteAsset(card.id)}
                aria-label={`Remove ${card.title}`}
              >✕</button>
              <span className="asset-card-title">{card.title}</span>
              <p className="asset-card-desc">{card.desc}</p>
            </div>
          ))}
        </div>
        <div className="add-item-row add-asset-row">
          <input
            className="cl-input"
            placeholder="Asset name…"
            value={newAssetTitle}
            onChange={(e) => setNewAssetTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addAsset() }}
          />
          <input
            className="cl-input"
            placeholder="Description…"
            value={newAssetDesc}
            onChange={(e) => setNewAssetDesc(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addAsset() }}
          />
          <button className="add-item-btn" onClick={addAsset} aria-label="Add asset">+</button>
        </div>
      </section>

      {/* ── Editing Lab: Speed Editor Cheat Sheet (God-Mode trigger) ── */}
      <section className="app-section editing-lab-card">
        <button
          className="se-ref-toggle"
          onClick={() => setShowGodMode(true)}
          aria-label="Open Speed Editor God-Mode cheat sheet"
        >
          <div>
            <p className="section-title" style={{ marginBottom: '0.2rem' }}>Speed Editor Cheat Sheet</p>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>3 God-Mode buttons — tap to open quick-access overlay</p>
          </div>
          <span className="god-mode-badge">God Mode</span>
        </button>
      </section>

      {/* ── Footer ── */}
      <footer className="app-footer">
        <p className="footer-note">
          Auto-saved to LocalStorage — progress survives closing Safari on iPad.
        </p>
        <button className="reset-btn" onClick={resetChecks}>
          Reset {nightOps ? 'Night Ops' : 'Day Game'} Checks
        </button>
      </footer>

      </>}{/* End Tab 2 Studio */}

      {/* ── Bottom Tab Navigation ── */}
      <nav className="tab-nav" role="tablist">
        {[
          { label: 'FIELD PREP', id: 0 },
          { label: 'SYNC LAB',   id: 1 },
          { label: 'STUDIO',     id: 2 },
        ].map(({ label, id }) => (
          <button
            key={id}
            className={`tab-btn${activeTab === id ? ' active' : ''}`}
            onClick={() => setActiveTab(id)}
            role="tab"
            aria-selected={activeTab === id}
          >
            <span className="tab-label">{label}</span>
          </button>
        ))}
      </nav>

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
                  ['Lens Mode', activeCamera.lens],
                  ['Bitrate', activeCamera.bitrate],
                  ['Day ISO Max', activeCamera.isoDay],
                  ['Night ISO / Protocol', activeCamera.isoNight],
                  ['Storage', activeCamera.storage],
                  ['Power', activeCamera.power],
                  ['SD Card', activeCamera.card],
                  ['Record Time', activeCamera.recordTime],
                ].map(([label, value]) => (
                  <div key={label} className="spec-row">
                    <span className="spec-label">{label}</span>
                    <strong className="spec-value">{value}</strong>
                  </div>
                ))}
              </div>
              {activeCamera.autoFps && (
                <div className="shared-settings-block">
                  <p className="shared-settings-title">iPhone Settings — Horizontal Pro Video</p>
                  {[
                    ['Format', activeCamera.videoFormat],
                    ['Record Video', activeCamera.res],
                    ['Auto FPS', activeCamera.autoFps],
                    ['Lock White Balance', activeCamera.lockWB],
                    ['Night Mode', activeCamera.nightMode],
                  ].map(([label, value]) => (
                    <div key={label} className="spec-row" style={{ marginBottom: '0.35rem' }}>
                      <span className="spec-label">{label}</span>
                      <strong className="spec-value">{value}</strong>
                    </div>
                  ))}
                </div>
              )}
              <div className="shared-settings-block">
                <p className="shared-settings-title">Shared Settings (All Cameras)</p>
                {SHARED_CAM_SETTINGS.map(([label, value]) => (
                  <div key={label} className="spec-row" style={{ marginBottom: '0.35rem' }}>
                    <span className="spec-label">{label}</span>
                    <strong className="spec-value">{value}</strong>
                  </div>
                ))}
              </div>
              <p className="popover-notes">{activeCamera.notes}</p>
              <div className="shared-settings-block">
                <p className="shared-settings-title">Your Field Notes</p>
                <textarea
                  className="cam-note-area"
                  placeholder="Add notes for this camera…"
                  value={camNotes[activeCamera.id] || ''}
                  onChange={(e) => updateCamNote(activeCamera.id, e.target.value)}
                  rows={3}
                  aria-label={`Notes for ${activeCamera.name}`}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── God-Mode Modal ── */}
      {showGodMode && (
        <div
          className="popover-overlay"
          onClick={() => setShowGodMode(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Speed Editor God-Mode Cheat Sheet"
        >
          <div className="popover-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="popover-header">
              <div>
                <h3 className="popover-name">God-Mode Buttons</h3>
                <p className="popover-role">Speed Editor — 3 Essential Controls</p>
              </div>
              <button className="popover-close" onClick={() => setShowGodMode(false)} aria-label="Close">✕</button>
            </div>
            <div className="popover-body">
              <div className="godmode-grid">
                {SE_GODMODE.map(({ key, desc }) => (
                  <div key={key} className="godmode-card">
                    <span className="godmode-key">{key}</span>
                    <p className="godmode-desc">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}