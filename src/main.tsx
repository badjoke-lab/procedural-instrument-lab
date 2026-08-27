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
  pinTouchesTine,
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

function Gear({ radius, teeth }: { radius: number; teeth: number }) {
  const toothDepth = radius * 0.13
  return (
    <group>
      <mesh castShadow>
        <cylinderGeometry args={[radius, radius, 0.18, Math.max(24, teeth * 2)]} />
        <meshStandardMaterial color="#c9a45d" metalness={0.78} roughness={0.28} />
      </mesh>
      {Array.from({ length: teeth }, (_, index) => {
        const angle = (index / teeth) * Math.PI * 2
        const r = radius + toothDepth / 2
        return (
          <mesh castShadow key={index} position={[Math.cos(angle) * r, Math.sin(angle) * r, 0]} rotation={[0, 0, angle]}>
            <boxGeometry args={[toothDepth, radius * 0.11, 0.2]} />
            <meshStandardMaterial color="#c9a45d" metalness={0.78} roughness={0.28} />
          </mesh>
        )
      })}
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
  const tineRefs = useRef<(THREE.Mesh | null)[]>([])
  const driveAngle = useRef(0)
  const touching = useRef(new Set<number>())
  const vibrations = useRef(config.notes.map(() => 0))
  const lastPointerX = useRef<number | null>(null)
  const pins = useMemo(() => compileTune(TUNE, config), [config])
  const drivenRadius = cylinderGearRadius(config)
  const gearZ = -config.cylinderLength / 2 - 0.22
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

    if (crank.current) crank.current.rotation.z = drive.crankAngle
    if (driverGear.current) driverGear.current.rotation.z = drive.driverGearAngle
    if (drivenGear.current) drivenGear.current.rotation.z = drive.cylinderGearAngle
    if (cylinder.current) cylinder.current.rotation.z = drive.cylinderPhase

    pins.forEach((pin, index) => {
      const inContact = pinTouchesTine(pin, drive.cylinderPhase, config)
      if (inContact && !touching.current.has(index)) {
        touching.current.add(index)
        vibrations.current[pin.noteIndex] = 1
        void audio.pluck(config.notes[pin.noteIndex])
      }
      if (!inContact) touching.current.delete(index)
    })

    vibrations.current = vibrations.current.map((value, index) => {
      const next = Math.max(0, value - dt * 2.3)
      const mesh = tineRefs.current[index]
      if (mesh) mesh.rotation.z = Math.sin((1 - next) * 55) * next * 0.09
      return next
    })
  })

  return (
    <group>
      <RoundedBox args={[7.6, 0.7, 4.8]} radius={0.12} smoothness={4} position={[0, -1.65, 0]} receiveShadow>
        <meshStandardMaterial color="#5a301d" roughness={0.72} />
      </RoundedBox>

      <group ref={cylinder} position={config.cylinderCenter}>
        <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[config.cylinderRadius, config.cylinderRadius, config.cylinderLength, 64]} />
          <meshStandardMaterial color="#a18559" metalness={0.38} roughness={0.36} />
        </mesh>
        {pins.map((pin, index) => {
          const radius = config.cylinderRadius + config.pinLength / 2
          const x = Math.cos(pin.angle) * radius
          const y = Math.sin(pin.angle) * radius
          return (
            <mesh castShadow key={index} position={[x, y, pin.axialPosition]} rotation={[0, 0, pin.angle - Math.PI / 2]}>
              <cylinderGeometry args={[config.pinRadius, config.pinRadius, config.pinLength, 12]} />
              <meshStandardMaterial color="#d8c9a5" metalness={0.82} roughness={0.2} />
            </mesh>
          )
        })}
      </group>

      <group>
        <mesh castShadow position={[1.72, 0, 0]}>
          <boxGeometry args={[0.28, 0.28, Math.max(3.35, config.cylinderLength + 0.15)]} />
          <meshStandardMaterial color="#b9aa8a" metalness={0.58} roughness={0.28} />
        </mesh>
        {config.notes.map((note, index) => {
          const contact = tineContactPoint(index, config)
          const anchorX = 1.58 + index * 0.045
          const length = anchorX - contact.x
          const centerX = contact.x + length / 2
          return (
            <group key={note}>
              <mesh castShadow ref={(mesh) => { tineRefs.current[index] = mesh }} position={[centerX, 0, contact.z]}>
                <boxGeometry args={[length, 0.075, 0.18]} />
                <meshStandardMaterial color="#ddd8cd" metalness={0.9} roughness={0.16} />
              </mesh>
              <mesh position={[contact.x, contact.y, contact.z]}>
                <sphereGeometry args={[config.contactTolerance * 0.32, 12, 12]} />
                <meshStandardMaterial color="#f0d58a" emissive="#5b4312" emissiveIntensity={0.25} metalness={0.35} roughness={0.3} />
              </mesh>
            </group>
          )
        })}
      </group>

      <group ref={drivenGear} position={drivenCenter} rotation={[Math.PI / 2, 0, 0]}>
        <Gear radius={drivenRadius} teeth={config.cylinderGearTeeth} />
      </group>
      <group ref={driverGear} position={driverCenter} rotation={[Math.PI / 2, 0, 0]}>
        <Gear radius={config.driverGearRadius} teeth={config.driverGearTeeth} />
      </group>

      <group ref={crank} position={driverCenter}>
        <mesh castShadow position={[0, 0, 0.48]}>
          <cylinderGeometry args={[0.07, 0.07, 0.96, 20]} />
          <meshStandardMaterial color="#a8a8a8" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh castShadow position={[0.55, 0, 0.95]}>
          <boxGeometry args={[1.1, 0.16, 0.16]} />
          <meshStandardMaterial color="#a8a8a8" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh
          castShadow
          position={[1.08, 0, 1.18]}
          rotation={[Math.PI / 2, 0, 0]}
          onPointerDown={beginManualCrank}
          onPointerMove={moveManualCrank}
          onPointerUp={endManualCrank}
          onPointerCancel={endManualCrank}
          onPointerOver={() => { document.body.style.cursor = 'grab' }}
          onPointerOut={() => { if (lastPointerX.current === null) document.body.style.cursor = '' }}
        >
          <cylinderGeometry args={[0.15, 0.15, 0.52, 20]} />
          <meshStandardMaterial color="#4b2c1b" roughness={0.68} />
        </mesh>
      </group>
    </group>
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

  return (
    <main>
      <header>
        <div><strong>PIL</strong><span>{t.appSubtitle}</span></div>
        <div className="controls">
          <button aria-pressed={running} onClick={() => setRunning((value) => !value)}>{running ? t.stop : t.play}</button>
          <label htmlFor="speed-control">
            {t.speed}
            <input id="speed-control" type="range" min="0.25" max="2" step="0.05" value={speed} onChange={(event) => setSpeed(Number(event.target.value))} />
          </label>
          <button onClick={() => setCameraKey((value) => value + 1)}>{t.resetView}</button>
          <div className="locale-switch" role="group" aria-label={t.language}>
            <button aria-pressed={locale === 'en'} onClick={() => setLocale('en')}>EN</button>
            <button aria-pressed={locale === 'ja'} onClick={() => setLocale('ja')}>JA</button>
          </div>
        </div>
      </header>

      <section className="workspace">
        <aside className="builder-panel" aria-label={t.builder}>
          <strong>{t.builder}</strong>
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
          <p id="crank-hint">{t.crankHint}</p>
        </aside>

        <div className="scene" aria-describedby="crank-hint">
          <Canvas key={cameraKey} camera={{ position: [7.5, 5.2, 7.5], fov: 42 }} shadows dpr={[1, 1.75]}>
            <color attach="background" args={['#0c0c0d']} />
            <ambientLight intensity={0.45} />
            <hemisphereLight args={['#d8e0ef', '#2a1710', 0.8]} />
            <directionalLight position={[5, 8, 5]} intensity={2.6} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
            <pointLight position={[-4, 2.5, -3]} intensity={18} distance={12} decay={2} />
            <Mechanism
              running={running}
              speed={speed}
              config={config}
              onManualStart={() => { setRunning(false); setOrbitEnabled(false); document.body.style.cursor = 'grabbing' }}
              onManualEnd={() => { setOrbitEnabled(true); document.body.style.cursor = '' }}
            />
            <ContactShadows position={[0, -1.98, 0]} opacity={0.28} scale={10} blur={2.5} far={4.5} />
            <gridHelper args={[18, 18, '#343434', '#1d1d1d']} position={[0, -2.02, 0]} />
            <OrbitControls makeDefault enabled={orbitEnabled} target={[0, -0.2, 0]} />
          </Canvas>
        </div>
      </section>

      <footer>{t.footer}</footer>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
