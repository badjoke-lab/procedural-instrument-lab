import type { MusicBoxProject } from './project-format'

export type MusicBoxSharePreview = {
  title: string
  description: string
  noteCount: number
  tempoBpm: number
  durationSeconds: number
  lowestPitch: number | null
  highestPitch: number | null
}

export function createMusicBoxSharePreview(project: MusicBoxProject): MusicBoxSharePreview {
  const pitches = project.tune.notes.map((note) => note.pitch)
  const durationSeconds = (project.tune.lengthBeats * 60) / project.tune.tempoBpm
  const summary = `${project.tune.notes.length} notes · ${project.tune.tempoBpm} BPM · ${durationSeconds.toFixed(1)} s`

  return {
    title: project.metadata.title,
    description: project.metadata.description?.trim() || summary,
    noteCount: project.tune.notes.length,
    tempoBpm: project.tune.tempoBpm,
    durationSeconds,
    lowestPitch: pitches.length === 0 ? null : Math.min(...pitches),
    highestPitch: pitches.length === 0 ? null : Math.max(...pitches),
  }
}
