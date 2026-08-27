import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Canvas, type ThreeEvent, useFrame } from '@react-three/fiber'
import { ContactShadows, OrbitControls, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import './styles.css'
import { defaultLocale, messages, type Locale } from './i18n/messages'
import { MusicBoxAudio } from './instruments/music-box/audio'
import {
  DEFAULT_MUSIC_BOX_CONFIG,
  compileTune,
  cylinderGearRadius,
  driveKinematics,
  pinTineEngagement,
  tineContactPoint,
  validateMusicBoxConfig,
  type MusicBoxConfig,
  type NoteEvent,
} from './instruments/music-box/mechanism'

const TUNE: NoteEvent[] = [
  { note: 60, start: 0 }, { note: 62, start: 0.125 }, { note: 64, start: 0.25 },
  { note: 65, start: 0.375 }, { note: 67, start: 0.5 }, { note: 69, start: 0.625 },
  { note: 71, start: 0.75 }, { note: 72, start: 0.875 }
]

const audio = new MusicBoxAudio()
const inspirationUrl = 'https://x.com/McGreenBeats/status/2092243021777580466'
const TINE_LOAD_ANGLE = 0.15
const TINE_VIBRATION_ANGLE = 0.095

const brass = { color: '#b8924f', metalness: 0.82, roughness: 0.24 }
const steel = { color: '#b8bcc1', metalness: 0.92, roughness: 0.16 }
const darkSteel = { color: '#5d6268', metalness: 0.88, roughness: 0.2 }

function Gear({ radius, teeth }: { radius: number; teeth: number }) {
  const toothDepth = radius * 0.12
  const rimRadius = radius * 0.88
  const hubRadius = Math.max(0.12, radius * 0.22)
  const spokeCount = teeth >= 35 ? 6 : 5

  return (
    <group>
      <mesh castShadow>
        <cylinderGeometry args={[rimRadius, rimRadius, 0.12, Math.max(36, teeth * 2)]} />
        <meshStandardMaterial {...brass} />
      </mesh>
      <mesh castShadow>
        <cylinderGeometry args={[hubRadius, hubRadius, 0.24, 32]} />
        <meshStandardMaterial {...brass} roughness={0.19} />
      </mesh>
      <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[rimRadius * 0.94, radius * 0.065, 10, Math.max(36, teeth * 2)]} />
        <meshStandardMaterial {...brass} roughness={0.2} />
      </mesh>
      {Array.from({ length: spokeCount }, (_, index) => {
        const angle = (index / spokeCount) * Math.PI * 2
        const spokeLength = rimRadius * 0.7
        const spokeCenter = hubRadius + spokeLength / 2
        return (
          <mesh key={`spoke-${index}`} castShadow position={[Math.cos(angle) * spokeCenter, Math.sin(angle) * spokeCenter, 0]} rotation={[0, 0, angle]}>
            <boxGeometry args={[spokeLength, radius * 0.085, 0.13]} />
            <meshStandardMaterial {...brass} />
          </mesh>
        )
      })}
      {Array.from({ length: teeth }, (_, index) => {
        const angle = (index / teeth) * Math.PI * 2
        const r = radius + toothDepth * 0.32
        return (
          <mesh castShadow key={`tooth-${index}`} position={[Math.cos(angle) * r, Math.sin(angle) * r, 0]} rotation={[0, 0, angle]}>
            <boxGeometry args={[toothDepth, Math.max(0.035, radius * 0.065), 0.16]} />
            <meshStandardMaterial {...brass} roughness={0.21} />
          </mesh>
        )
      })}
    </group>
  )
}

function BearingStand({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <RoundedBox args={[0.62, 1.45, 0.3]} radius={0.08} smoothness={3} position={[0, -0.73, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#6d5738" metalness={0.12} roughness={0.48} />
      </RoundedBox>
      <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.34, 32]} />
        <meshStandardMaterial {...darkSteel} />
      </mesh>
      <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.2, 0.045, 10, 28]} />
        <meshStandardMaterial {...steel} />
      </mesh>
    </group>
  )
}

function Mechanism({
  running,
  speed,
  config,
  onManualStart,
  onManualEnd,
}: {
  running: boolean
  speed: number
  config: MusicBoxConfig
  onManualStart: () => void
  onManualEnd: () => void
}) {
  const cylinder = useRef<THREE.Group>(null)
  const crank = useRef<THREE.Group>(null)
  const driverGear = useRef<THREE.Group>(null)
  const drivenGear = useRef<THREE.Group>(null)
  const tineRefs = useRef<(THREE.Group | null)[]>([])
  const driveAngle = useRef(0.08)
  const engagedPins = useRef(new Set<number>())
  const vibrations = useRef(config.notes.map(() => 0))
  const lastCylinderPhase = useRef(0)
  const motionDirection = useRef(-1)
  const lastPointerX = useRef<number | null>(null)
  const pins = useMemo(() => compileTune(TUNE, config), [config])
  const drivenRadius = cylinderGearRadius(config)
  const gearZ = -config.cylinderLength / 2 - 0.22
  const oppositeSupportZ = config.cylinderLength / 2 + 0.18
  const drivenCenter: [number, number, number] = [config.cylinderCenter[0], config.cylinderCenter[1], gearZ]
  const driverCenter: [number, number, number] = [
    config.cylinderCenter[0] - config.driverGearRadius - drivenRadius,
    config.cylinderCenter[1],
    gearZ,
  ]

  const beginManualCrank = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation()
    lastPointerX.current = event.nativeEvent.clientX
    const target = event.target as HTMLElement
    target.setPointerCapture?.(event.pointerId)
    onManualStart()
  }

  const moveManualCrank = (event: ThreeEvent<PointerEvent>) => {
    if (lastPointerX.current === null) return
    event.stopPropagation()
    const nextX = event.nativeEvent.clientX
    const deltaX = nextX - lastPointerX.current
    lastPointerX.current = nextX
    driveAngle.current += deltaX * 0.018
  }

  const endManualCrank = (event: ThreeEvent<PointerEvent>) => {
    if (lastPointerX.current === null) return
    event.stopPropagation()
    lastPointerX.current = null
    const target = event.target as HTMLElement
    target.releasePointerCapture?.(event.pointerId)
    onManualEnd()
  }

  useFrame((_, dt) => {
    if (running) driveAngle.current += dt * speed
    const drive = driveKinematics(driveAngle.current, config)
    const phaseDelta = drive.cylinderPhase - lastCylinderPhase.current
    if (Math.abs(phaseDelta) > 1e-6) motionDirection.current = Math.sign(phaseDelta)
    lastCylinderPhase.current = drive.cylinderPhase

    if (crank.current) crank.current.rotation.z = drive.crankAngle
    if (driverGear.current) driverGear.current.rotation.z = drive.driverGearAngle
    if (drivenGear.current) drivenGear.current.rotation.z = drive.cylinderGearAngle
    if (cylinder.current) cylinder.current.rotation.z = drive.cylinderPhase

    const frameDeflections = config.notes.map(() => 0)

    pins.forEach((pin, index) => {
      const engagement = pinTineEngagement(pin, drive.cylinderPhase, config)
      if (engagement.engaged) {
        engagedPins.current.add(index)
        frameDeflections[pin.noteIndex] = Math.max(frameDeflections[pin.noteIndex], engagement.deflection)
      } else if (engagedPins.current.has(index)) {
        engagedPins.current.delete(index)
        vibrations.current[pin.noteIndex] = 1
        void audio.pluck(config.notes[pin.noteIndex])
      }
    })

    vibrations.current = vibrations.current.map((value, index) => {
      const next = Math.max(0, value - dt * 2.3)
      const tine = tineRefs.current[index]
      if (tine) {
        const loaded = frameDeflections[index]
        const loadAngle = motionDirection.current * loaded * TINE_LOAD_ANGLE
        const vibrationAngle = loaded > 0 ? 0 : Math.sin((1 - next) * 55) * next * TINE_VIBRATION_ANGLE
        tine.rotation.z = loadAngle + vibrationAngle
      }
      return next
    })
  })

  return (
    <group>
      <RoundedBox args={[7.6, 0.7, 4.8]} radius={0.12} smoothness={4} position={[0, -1.65, 0]} receiveShadow castShadow>
        <meshStandardMaterial color="#552c1d" roughness={0.62} />
      </RoundedBox>
      <RoundedBox args={[7.15, 0.08, 4.35]} radius={0.05} smoothness={3} position={[0, -1.27, 0]} receiveShadow>
        <meshStandardMaterial color="#7a422a" roughness={0.55} />
      </RoundedBox>

      <BearingStand x={config.cylinderCenter[0]} z={oppositeSupportZ} />
      <BearingStand x={config.cylinderCenter[0]} z={gearZ} />

      <mesh castShadow position={[config.cylinderCenter[0], 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.085, 0.085, config.cylinderLength + 0.75, 24]} />
        <meshStandardMaterial {...steel} />
      </mesh>

      <group ref={cylinder} position={config.cylinderCenter}>
        <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[config.cylinderRadius, config.cylinderRadius, config.cylinderLength, 72]} />
          <meshStandardMaterial color="#a9854d" metalness={0.58} roughness={0.29} />
        </mesh>
        {[-1, 1].map((side) => (
          <group key={side} position={[0, 0, side * config.cylinderLength / 2]}>
            <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[config.cylinderRadius * 1.015, config.cylinderRadius * 1.015, 0.075, 72]} />
              <meshStandardMaterial {...brass} roughness={0.22} />
            </mesh>
            <mesh castShadow rotation={[Math.PI / 2, 0, 0]} position={[0, 0, side * 0.055]}>
              <cylinderGeometry args={[0.18, 0.18, 0.11, 28]} />
              <meshStandardMaterial {...darkSteel} />
            </mesh>
          </group>
        ))}
        {pins.map((pin, index) => {
          const radius = config.cylinderRadius + config.pinLength / 2
          const x = Math.cos(pin.angle) * radius
          const y = Math.sin(pin.angle) * radius
          const tipRadius = config.cylinderRadius + config.pinLength
          const tipX = Math.cos(pin.angle) * tipRadius
          const tipY = Math.sin(pin.angle) * tipRadius
          return (
            <group key={index}>
              <mesh castShadow position={[x, y, pin.axialPosition]} rotation={[0, 0, pin.angle - Math.PI / 2]}>
                <cylinderGeometry args={[config.pinRadius, config.pinRadius * 0.92, config.pinLength, 16]} />
                <meshStandardMaterial {...steel} roughness={0.13} />
              </mesh>
              <mesh castShadow position={[tipX, tipY, pin.axialPosition]}>
                <sphereGeometry args={[config.pinRadius * 1.04, 16, 12]} />
                <meshStandardMaterial {...steel} roughness={0.12} />
              </mesh>
            </group>
          )
        })}
      </group>

      <group>
        <RoundedBox args={[0.48, 0.38, Math.max(3.5, config.cylinderLength + 0.28)]} radius={0.055} smoothness={3} position={[1.69, -0.03, 0]} castShadow>
          <meshStandardMaterial {...darkSteel} roughness={0.23} />
        </RoundedBox>
        <RoundedBox args={[0.34, 0.14, Math.max(3.35, config.cylinderLength + 0.13)]} radius={0.035} smoothness={3} position={[1.5, 0.08, 0]} castShadow>
          <meshStandardMaterial {...steel} roughness={0.18} />
        </RoundedBox>
        {[-1, 1].map((side) => (
          <mesh key={side} castShadow position={[1.53, 0.17, side * Math.min(1.42, config.cylinderLength * 0.43)]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.09, 0.09, 0.08, 20]} />
            <meshStandardMaterial {...darkSteel} />
          </mesh>
        ))}
        {config.notes.map((note, index) => {
          const contact = tineContactPoint(index, config)
          const anchorX = 1.53 + index * 0.042
          const length = anchorX - contact.x
          const tineWidth = 0.16 - index * 0.005
          return (
            <group key={note}>
              <group ref={(group) => { tineRefs.current[index] = group }} position={[anchorX, 0.23, contact.z]}>
                <mesh castShadow position={[-length / 2, 0, 0]}>
                  <boxGeometry args={[length, 0.055, Math.max(0.105, tineWidth)]} />
                  <meshStandardMaterial color="#d7d9dc" metalness={0.96} roughness={0.12} />
                </mesh>
                <mesh castShadow position={[-0.08, -0.035, 0]}>
                  <boxGeometry args={[0.16, 0.1, Math.max(0.105, tineWidth)]} />
                  <meshStandardMaterial {...darkSteel} />
                </mesh>
              </group>
              <mesh position={[contact.x, contact.y, contact.z]}>
                <sphereGeometry args={[config.contactTolerance * 0.24, 12, 12]} />
                <meshStandardMaterial color="#f0d58a" emissive="#5b4312" emissiveIntensity={0.2} metalness={0.35} roughness={0.3} />
              </mesh>
            </group>
          )
        })}
      </group>

      <group position={[config.cylinderCenter[0], 0, gearZ]}>
        <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.24, 0.24, 0.32, 28]} />
          <meshStandardMaterial {...darkSteel} />
        </mesh>
      </group>
      <group ref={drivenGear} position={drivenCenter} rotation={[Math.PI / 2, 0, 0]}>
        <Gear radius={drivenRadius} teeth={config.cylinderGearTeeth} />
      </group>
      <group ref={driverGear} position={driverCenter} rotation={[Math.PI / 2, 0, 0]}>
        <Gear radius={config.driverGearRadius} teeth={config.driverGearTeeth} />
      </group>

      <group position={[driverCenter[0], -0.68, gearZ]}>
        <RoundedBox args={[0.62, 1.25, 0.34]} radius={0.07} smoothness={3} castShadow>
          <meshStandardMaterial color="#6d5738" metalness={0.12} roughness={0.48} />
        </RoundedBox>
      </group>

      <group ref={crank} position={driverCenter}>
        <mesh castShadow position={[0, 0, -0.38]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.76, 24]} />
          <meshStandardMaterial {...steel} />
        </mesh>
        <mesh castShadow position={[0, 0, -0.78]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.19, 0.19, 0.12, 28]} />
          <meshStandardMaterial {...darkSteel} />
        </mesh>
        <RoundedBox args={[1.08, 0.18, 0.14]} radius={0.055} smoothness={3} position={[0.54, 0, -0.88]} castShadow>
          <meshStandardMaterial {...steel} roughness={0.18} />
        </RoundedBox>
        <mesh castShadow position={[1.08, 0, -1.08]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.085, 0.085, 0.42, 20]} />
          <meshStandardMaterial {...steel} />
        </mesh>
        <mesh
          castShadow
          position={[1.08, 0, -1.34]}
          rotation={[Math.PI / 2, 0, 0]}
          onPointerDown={beginManualCrank}
          onPointerMove={moveManualCrank}
          onPointerUp={endManualCrank}
          onPointerCancel={endManualCrank}
          onPointerOver={() => { document.body.style.cursor = 'grab' }}
          onPointerOut={() => { if (lastPointerX.current === null) document.body.style.cursor = '' }}
        >
          <cylinderGeometry args={[0.17, 0.15, 0.6, 24]} />
          <meshStandardMaterial color="#4a2819" roughness={0.55} />
        </mesh>
      </group>
    </group>
  )
}

function LocaleSwitch({ locale, setLocale }: { locale: Locale; setLocale: (locale: Locale) => void }) {
  const t = messages[locale]
  return (
    <div className="locale-switch" role="group" aria-label={t.language}>
      <button aria-pressed={locale === 'en'} onClick={() => setLocale('en')}>EN</button>
      <button aria-pressed={locale === 'ja'} onClick={() => setLocale('ja')}>JA</button>
    </div>
  )
}

function InfoPage({ page, locale, setLocale }: { page: 'how-to-use' | 'about'; locale: Locale; setLocale: (locale: Locale) => void }) {
  const t = messages[locale]
  const homeHref = window.location.pathname

  return (
    <main className="info-shell">
      <header className="info-header">
        <div className="brand"><strong>{t.productName}</strong></div>
        <LocaleSwitch locale={locale} setLocale={setLocale} />
      </header>
      <nav className="page-nav" aria-label="Page navigation">
        <a href={homeHref}>{t.backToMusicBox}</a>
        <a aria-current={page === 'how-to-use' ? 'page' : undefined} href="?page=how-to-use">{t.howToUse}</a>
        <a aria-current={page === 'about' ? 'page' : undefined} href="?page=about">{t.about}</a>
      </nav>
      <article className="info-page">
        {page === 'how-to-use' ? (
          <>
            <h1>{t.howToUse}</h1>
            <p className="lede">{t.howToUseIntro}</p>
            <section><h2>{t.howPlayTitle}</h2><p>{t.howPlayBody}</p></section>
            <section><h2>{t.howViewTitle}</h2><p>{t.howViewBody}</p></section>
            <section><h2>{t.howCrankTitle}</h2><p>{t.howCrankBody}</p></section>
            <section><h2>{t.howCustomizeTitle}</h2><p>{t.howCustomizeBody}</p></section>
            <section><h2>{t.howMechanismTitle}</h2><p>{t.howMechanismBody}</p></section>
          </>
        ) : (
          <>
            <h1>{t.about}</h1>
            <p className="lede">{t.aboutIntro}</p>
            <section><h2>{t.aboutCausalityTitle}</h2><p>{t.aboutCausalityBody}</p></section>
            <section>
              <h2>{t.inspirationTitle}</h2>
              <p>{t.inspirationBody}</p>
              <p><a href={inspirationUrl} target="_blank" rel="noreferrer">{t.inspirationLink}</a></p>
            </section>
          </>
        )}
      </article>
    </main>
  )
}

function App() {
  const [running, setRunning] = useState(false)
  const [speed, setSpeed] = useState(0.85)
  const [orbitEnabled, setOrbitEnabled] = useState(true)
  const [cameraKey, setCameraKey] = useState(0)
  const [configError, setConfigError] = useState(false)
  const [locale, setLocale] = useState<Locale>(defaultLocale)
  const [config, setConfig] = useState<MusicBoxConfig>(() => ({
    ...DEFAULT_MUSIC_BOX_CONFIG,
    notes: [...DEFAULT_MUSIC_BOX_CONFIG.notes],
  }))
  const t = messages[locale]
  const pageParam = new URLSearchParams(window.location.search).get('page')
  const page = pageParam === 'how-to-use' || pageParam === 'about' ? pageParam : null

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const updateConfig = (patch: Partial<MusicBoxConfig>) => {
    setConfig((current) => {
      const next = { ...current, ...patch }
      const issues = validateMusicBoxConfig(next)
      if (issues.length > 0) {
        setConfigError(true)
        return current
      }
      setConfigError(false)
      return next
    })
  }

  if (page) return <InfoPage page={page} locale={locale} setLocale={setLocale} />

  return (
    <main className="app-shell">
      <header>
        <div className="brand"><strong>{t.productName}</strong><span>{t.productSummary}</span></div>
        <div className="controls">
          <button aria-pressed={running} onClick={() => setRunning((value) => !value)}>{running ? t.stop : t.play}</button>
          <label htmlFor="speed-control">
            {t.speed}
            <input id="speed-control" type="range" min="0.25" max="2" step="0.05" value={speed} onChange={(event) => setSpeed(Number(event.target.value))} />
          </label>
          <button onClick={() => setCameraKey((value) => value + 1)}>{t.resetView}</button>
          <LocaleSwitch locale={locale} setLocale={setLocale} />
        </div>
      </header>

      <nav className="page-nav primary-actions" aria-label="Page navigation">
        <a className="primary-link" href="#customize">{t.customize}</a>
        <a href="?page=how-to-use">{t.howToUse}</a>
        <a href="?page=about">{t.about}</a>
      </nav>

      <section className="workspace">
        <aside id="customize" className="builder-panel" aria-label={t.customize}>
          <div className="customize-heading"><strong>{t.customize}</strong><span>{t.customizeIntro}</span></div>
          <label htmlFor="cylinder-length">
            {t.cylinderLength}
            <input id="cylinder-length" type="range" min="2.8" max="4.4" step="0.1" value={config.cylinderLength} onChange={(event) => updateConfig({ cylinderLength: Number(event.target.value) })} />
            <output htmlFor="cylinder-length">{config.cylinderLength.toFixed(1)}</output>
          </label>
          <label htmlFor="tine-spacing">
            {t.tineSpacing}
            <input id="tine-spacing" type="range" min="0.26" max="0.46" step="0.01" value={config.tineSpacing} onChange={(event) => updateConfig({ tineSpacing: Number(event.target.value) })} />
            <output htmlFor="tine-spacing">{config.tineSpacing.toFixed(2)}</output>
          </label>
          <label htmlFor="driver-teeth">
            {t.driverTeeth}
            <select id="driver-teeth" value={config.driverGearTeeth} onChange={(event) => updateConfig({ driverGearTeeth: Number(event.target.value) })}>
              <option value="30">30</option><option value="40">40</option><option value="50">50</option>
            </select>
          </label>
          <label htmlFor="cylinder-teeth">
            {t.cylinderTeeth}
            <select id="cylinder-teeth" value={config.cylinderGearTeeth} onChange={(event) => updateConfig({ cylinderGearTeeth: Number(event.target.value) })}>
              <option value="20">20</option><option value="25">25</option><option value="30">30</option>
            </select>
          </label>
          {configError && <p className="builder-error" role="alert">{t.invalidConfig}</p>}
        </aside>

        <div className="scene" aria-describedby="scene-hint">
          <Canvas key={cameraKey} camera={{ position: [7.5, 5.2, -7.5], fov: 42 }} shadows dpr={[1, 1.75]}>
            <color attach="background" args={['#0c0c0d']} />
            <ambientLight intensity={0.42} />
            <hemisphereLight args={['#d9e2f0', '#26140d', 0.75]} />
            <directionalLight position={[5, 8, 5]} intensity={2.8} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
            <pointLight position={[-4, 2.5, -3]} intensity={16} distance={12} decay={2} />
            <pointLight position={[3.5, 2.8, 2.5]} intensity={8} distance={9} decay={2} />
            <Mechanism
              running={running}
              speed={speed}
              config={config}
              onManualStart={() => { setRunning(false); setOrbitEnabled(false); document.body.style.cursor = 'grabbing' }}
              onManualEnd={() => { setOrbitEnabled(true); document.body.style.cursor = '' }}
            />
            <ContactShadows position={[0, -1.98, 0]} opacity={0.3} scale={10} blur={2.2} far={4.5} />
            <gridHelper args={[18, 18, '#343434', '#1d1d1d']} position={[0, -2.02, 0]} />
            <OrbitControls makeDefault enabled={orbitEnabled} target={[0, -0.25, 0]} />
          </Canvas>
          <div id="scene-hint" className="scene-hint">{t.crankHint}</div>
        </div>
      </section>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(<App />)