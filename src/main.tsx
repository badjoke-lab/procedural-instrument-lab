import React, { useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { t } from './i18n/messages'
import './styles.css'

type NoteEvent = { note: number; start: number }
type Pin = { noteIndex: number; angle: number; axialPosition: number }

const NOTES = [60, 62, 64, 65, 67, 69, 71, 72]
const TUNE: NoteEvent[] = [
  { note: 60, start: 0 }, { note: 62, start: 0.125 }, { note: 64, start: 0.25 },
  { note: 65, start: 0.375 }, { note: 67, start: 0.5 }, { note: 69, start: 0.625 },
  { note: 71, start: 0.75 }, { note: 72, start: 0.875 }
]

function tuneToPins(events: NoteEvent[]): Pin[] {
  return events.map((event) => {
    const noteIndex = NOTES.indexOf(event.note)
    return {
      noteIndex,
      angle: event.start * Math.PI * 2,
      axialPosition: (noteIndex - (NOTES.length - 1) / 2) * 0.34,
    }
  }).filter((pin) => pin.noteIndex >= 0)
}

function midiToHz(note: number) {
  return 440 * Math.pow(2, (note - 69) / 12)
}

class MusicBoxAudio {
  ctx: AudioContext | null = null

  async pluck(note: number) {
    if (!this.ctx) this.ctx = new AudioContext()
    if (this.ctx.state === 'suspended') await this.ctx.resume()

    const time = this.ctx.currentTime
    const oscillator = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    const filter = this.ctx.createBiquadFilter()

    oscillator.type = 'sine'
    oscillator.frequency.value = midiToHz(note)
    filter.type = 'highpass'
    filter.frequency.value = 180
    gain.gain.setValueAtTime(0.0001, time)
    gain.gain.exponentialRampToValueAtTime(0.18, time + 0.005)
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 1.5)

    oscillator.connect(filter).connect(gain).connect(this.ctx.destination)
    oscillator.start(time)
    oscillator.stop(time + 1.6)
  }
}

const audio = new MusicBoxAudio()

function Mechanism({ running, speed }: { running: boolean; speed: number }) {
  const cylinder = useRef<THREE.Group>(null)
  const crank = useRef<THREE.Group>(null)
  const tineRefs = useRef<(THREE.Mesh | null)[]>([])
  const phase = useRef(0)
  const triggered = useRef(new Set<number>())
  const vibrations = useRef(NOTES.map(() => 0))
  const pins = useMemo(() => tuneToPins(TUNE), [])

  useFrame((_, deltaTime) => {
    if (running) phase.current = (phase.current + deltaTime * speed) % (Math.PI * 2)
    const currentPhase = phase.current

    if (cylinder.current) cylinder.current.rotation.x = currentPhase
    if (crank.current) crank.current.rotation.x = currentPhase * 2.5

    pins.forEach((pin, index) => {
      const delta = ((currentPhase - pin.angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI
      const inContact = Math.abs(delta) < 0.035

      if (inContact && !triggered.current.has(index)) {
        triggered.current.add(index)
        vibrations.current[pin.noteIndex] = 1
        void audio.pluck(NOTES[pin.noteIndex])
      }

      if (!inContact && Math.abs(delta) > 0.08) triggered.current.delete(index)
    })

    vibrations.current = vibrations.current.map((value, index) => {
      const next = Math.max(0, value - deltaTime * 2.3)
      const mesh = tineRefs.current[index]
      if (mesh) mesh.rotation.z = Math.sin((1 - next) * 55) * next * 0.09
      return next
    })
  })

  return (
    <group>
      <RoundedBox args={[7.6, 0.7, 4.8]} radius={0.12} smoothness={4} position={[0, -1.45, 0]}>
        <meshStandardMaterial color="#5c311e" roughness={0.65} />
      </RoundedBox>

      <group ref={cylinder} rotation={[0, 0, Math.PI / 2]} position={[-0.7, 0, 0]}>
        <mesh>
          <cylinderGeometry args={[1.05, 1.05, 3.2, 64]} />
          <meshStandardMaterial color="#9a7b4f" metalness={0.35} roughness={0.42} />
        </mesh>
        {pins.map((pin, index) => {
          const radius = 1.08
          const y = Math.cos(pin.angle) * radius
          const z = Math.sin(pin.angle) * radius
          return (
            <mesh key={index} position={[pin.axialPosition, y, z]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.045, 0.045, 0.18, 12]} />
              <meshStandardMaterial color="#d4c4a0" metalness={0.8} roughness={0.25} />
            </mesh>
          )
        })}
      </group>

      <group position={[1.25, 0.25, 0]}>
        <mesh position={[0, -0.15, 0]}>
          <boxGeometry args={[2.8, 0.22, 3.35]} />
          <meshStandardMaterial color="#b9aa8a" metalness={0.55} roughness={0.32} />
        </mesh>
        {NOTES.map((note, index) => {
          const z = (index - (NOTES.length - 1) / 2) * 0.34
          const length = 2.25 - index * 0.085
          return (
            <mesh
              key={note}
              ref={(mesh) => { tineRefs.current[index] = mesh }}
              position={[-0.2 + (2.3 - length) / 2, 0.06, z]}
            >
              <boxGeometry args={[length, 0.075, 0.18]} />
              <meshStandardMaterial color="#d8d2c5" metalness={0.9} roughness={0.18} />
            </mesh>
          )
        })}
      </group>

      <group ref={crank} position={[-2.65, 0, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.08, 0.08, 1.7, 20]} />
          <meshStandardMaterial color="#9e9e9e" metalness={0.9} roughness={0.22} />
        </mesh>
        <mesh position={[0, 0.8, 0]}>
          <boxGeometry args={[0.18, 0.2, 1.05]} />
          <meshStandardMaterial color="#9e9e9e" metalness={0.9} roughness={0.22} />
        </mesh>
        <mesh position={[0, 0.8, 0.58]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.5, 20]} />
          <meshStandardMaterial color="#3c2417" roughness={0.7} />
        </mesh>
      </group>

      <mesh position={[-2.05, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.36, 0.36, 0.2, 24]} />
        <meshStandardMaterial color="#c9a45d" metalness={0.72} roughness={0.3} />
      </mesh>
    </group>
  )
}

function App() {
  const [running, setRunning] = useState(false)
  const [speed, setSpeed] = useState(0.85)

  return (
    <main>
      <header>
        <div><strong>PIL</strong><span>{t('appSubtitle')}</span></div>
        <div className="controls">
          <button onClick={() => setRunning((value) => !value)}>{running ? t('stop') : t('play')}</button>
          <label>
            {t('speed')}
            <input
              type="range"
              min="0.25"
              max="2"
              step="0.05"
              value={speed}
              onChange={(event) => setSpeed(Number(event.target.value))}
            />
          </label>
        </div>
      </header>

      <Canvas camera={{ position: [8, 5, 8], fov: 42 }} shadows>
        <color attach="background" args={['#0c0c0d']} />
        <ambientLight intensity={0.75} />
        <directionalLight position={[5, 8, 5]} intensity={2.2} castShadow />
        <Mechanism running={running} speed={speed} />
        <gridHelper args={[18, 18, '#343434', '#1d1d1d']} position={[0, -1.82, 0]} />
        <OrbitControls makeDefault target={[0, -0.2, 0]} />
      </Canvas>

      <footer>{t('footer')}</footer>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
