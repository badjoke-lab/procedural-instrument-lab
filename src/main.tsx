import React, { useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import './styles.css'
import { messages } from './i18n/messages'
import {
  DEFAULT_MUSIC_BOX_CONFIG,
  compileTune,
  pinTouchesTine,
  tineContactPoint,
  type NoteEvent,
} from './instruments/music-box/mechanism'

const CONFIG = DEFAULT_MUSIC_BOX_CONFIG
const NOTES = CONFIG.notes
const TUNE: NoteEvent[] = [
  { note: 60, start: 0 }, { note: 62, start: 0.125 }, { note: 64, start: 0.25 },
  { note: 65, start: 0.375 }, { note: 67, start: 0.5 }, { note: 69, start: 0.625 },
  { note: 71, start: 0.75 }, { note: 72, start: 0.875 }
]

function midiToHz(note: number) {
  return 440 * Math.pow(2, (note - 69) / 12)
}

class MusicBoxAudio {
  ctx: AudioContext | null = null

  async pluck(note: number) {
    if (!this.ctx) this.ctx = new AudioContext()
    if (this.ctx.state === 'suspended') await this.ctx.resume()

    const t = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    const filter = this.ctx.createBiquadFilter()

    osc.type = 'sine'
    osc.frequency.value = midiToHz(note)
    filter.type = 'highpass'
    filter.frequency.value = 180
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(0.18, t + 0.005)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.5)

    osc.connect(filter).connect(gain).connect(this.ctx.destination)
    osc.start(t)
    osc.stop(t + 1.6)
  }
}

const audio = new MusicBoxAudio()

function Mechanism({ running, speed }: { running: boolean; speed: number }) {
  const cylinder = useRef<THREE.Group>(null)
  const crank = useRef<THREE.Group>(null)
  const tineRefs = useRef<(THREE.Mesh | null)[]>([])
  const phase = useRef(0)
  const touching = useRef(new Set<number>())
  const vibrations = useRef(NOTES.map(() => 0))
  const pins = useMemo(() => compileTune(TUNE, CONFIG), [])

  useFrame((_, dt) => {
    if (running) phase.current = (phase.current + dt * speed) % (Math.PI * 2)
    const currentPhase = phase.current

    if (cylinder.current) cylinder.current.rotation.z = -currentPhase
    if (crank.current) crank.current.rotation.z = -currentPhase * 2.5

    pins.forEach((pin, index) => {
      const inContact = pinTouchesTine(pin, currentPhase, CONFIG)

      if (inContact && !touching.current.has(index)) {
        touching.current.add(index)
        vibrations.current[pin.noteIndex] = 1
        void audio.pluck(NOTES[pin.noteIndex])
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
      <RoundedBox args={[7.6, 0.7, 4.8]} radius={0.12} smoothness={4} position={[0, -1.65, 0]}>
        <meshStandardMaterial color="#5c311e" roughness={0.65} />
      </RoundedBox>

      <group ref={cylinder} position={CONFIG.cylinderCenter}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[CONFIG.cylinderRadius, CONFIG.cylinderRadius, CONFIG.cylinderLength, 64]} />
          <meshStandardMaterial color="#9a7b4f" metalness={0.35} roughness={0.42} />
        </mesh>
        {pins.map((pin, index) => {
          const radius = CONFIG.cylinderRadius + CONFIG.pinLength / 2
          const x = Math.cos(pin.angle) * radius
          const y = Math.sin(pin.angle) * radius
          return (
            <mesh
              key={index}
              position={[x, y, pin.axialPosition]}
              rotation={[0, 0, pin.angle - Math.PI / 2]}
            >
              <cylinderGeometry args={[CONFIG.pinRadius, CONFIG.pinRadius, CONFIG.pinLength, 12]} />
              <meshStandardMaterial color="#d4c4a0" metalness={0.8} roughness={0.25} />
            </mesh>
          )
        })}
      </group>

      <group>
        <mesh position={[1.72, 0, 0]}>
          <boxGeometry args={[0.28, 0.28, 3.35]} />
          <meshStandardMaterial color="#b9aa8a" metalness={0.55} roughness={0.32} />
        </mesh>
        {NOTES.map((note, index) => {
          const contact = tineContactPoint(index, CONFIG)
          const anchorX = 1.58 + index * 0.045
          const length = anchorX - contact.x
          const centerX = contact.x + length / 2
          return (
            <group key={note}>
              <mesh
                ref={(mesh) => { tineRefs.current[index] = mesh }}
                position={[centerX, 0, contact.z]}
              >
                <boxGeometry args={[length, 0.075, 0.18]} />
                <meshStandardMaterial color="#d8d2c5" metalness={0.9} roughness={0.18} />
              </mesh>
              <mesh position={[contact.x, contact.y, contact.z]}>
                <sphereGeometry args={[CONFIG.contactTolerance * 0.32, 12, 12]} />
                <meshStandardMaterial color="#f0d58a" metalness={0.35} roughness={0.3} />
              </mesh>
            </group>
          )
        })}
      </group>

      <group ref={crank} position={[-2.45, 0, 0]}>
        <mesh>
          <cylinderGeometry args={[0.08, 0.08, 1.7, 20]} />
          <meshStandardMaterial color="#9e9e9e" metalness={0.9} roughness={0.22} />
        </mesh>
        <mesh position={[0.8, 0, 0]}>
          <boxGeometry args={[1.6, 0.18, 0.18]} />
          <meshStandardMaterial color="#9e9e9e" metalness={0.9} roughness={0.22} />
        </mesh>
        <mesh position={[1.58, 0, 0.28]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.5, 20]} />
          <meshStandardMaterial color="#3c2417" roughness={0.7} />
        </mesh>
      </group>
    </group>
  )
}

function App() {
  const [running, setRunning] = useState(false)
  const [speed, setSpeed] = useState(0.85)
  const t = messages.en

  return (
    <main>
      <header>
        <div><strong>PIL</strong><span>{t.subtitle}</span></div>
        <div className="controls">
          <button onClick={() => setRunning((value) => !value)}>{running ? t.stop : t.play}</button>
          <label>
            {t.speed}
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

      <Canvas camera={{ position: [7.5, 5.2, 7.5], fov: 42 }} shadows>
        <color attach="background" args={['#0c0c0d']} />
        <ambientLight intensity={0.75} />
        <directionalLight position={[5, 8, 5]} intensity={2.2} castShadow />
        <Mechanism running={running} speed={speed} />
        <gridHelper args={[18, 18, '#343434', '#1d1d1d']} position={[0, -2.02, 0]} />
        <OrbitControls makeDefault target={[0, -0.2, 0]} />
      </Canvas>

      <footer>{t.footer}</footer>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
