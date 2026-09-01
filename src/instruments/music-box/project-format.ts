import { validateMusicBoxConfig, type MusicBoxConfig } from './mechanism'
import { validateTuneDocument, type TuneDocument } from './tune-document'

export const MUSIC_BOX_PROJECT_FORMAT = 'procedural-instrument-lab.music-box-project' as const
export const MUSIC_BOX_PROJECT_VERSION = 1 as const

export type MusicBoxProjectMetadata = {
  title: string
  description?: string
}

export type MusicBoxProject = {
  format: typeof MUSIC_BOX_PROJECT_FORMAT
  version: typeof MUSIC_BOX_PROJECT_VERSION
  instrument: 'music-box'
  metadata: MusicBoxProjectMetadata
  tune: TuneDocument
  config: MusicBoxConfig
}

export function validateMusicBoxProject(project: MusicBoxProject): string[] {
  const issues: string[] = []

  if (project.format !== MUSIC_BOX_PROJECT_FORMAT) issues.push('unsupported project format')
  if (project.version !== MUSIC_BOX_PROJECT_VERSION) issues.push('unsupported project version')
  if (project.instrument !== 'music-box') issues.push('unsupported instrument')
  if (project.metadata.title.trim().length === 0) issues.push('metadata.title must not be empty')

  issues.push(...validateTuneDocument(project.tune).map((issue) => `tune: ${issue}`))
  issues.push(...validateMusicBoxConfig(project.config).map((issue) => `config: ${issue}`))

  return issues
}

export function assertMusicBoxProject(project: MusicBoxProject): void {
  const issues = validateMusicBoxProject(project)
  if (issues.length > 0) throw new Error(`Invalid Music Box Project: ${issues.join('; ')}`)
}

export function createMusicBoxProject({
  tune,
  config,
  metadata,
}: {
  tune: TuneDocument
  config: MusicBoxConfig
  metadata?: Partial<MusicBoxProjectMetadata>
}): MusicBoxProject {
  const project: MusicBoxProject = {
    format: MUSIC_BOX_PROJECT_FORMAT,
    version: MUSIC_BOX_PROJECT_VERSION,
    instrument: 'music-box',
    metadata: {
      title: metadata?.title?.trim() || tune.title,
      ...(metadata?.description === undefined ? {} : { description: metadata.description }),
    },
    tune: structuredClone(tune),
    config: structuredClone(config),
  }

  assertMusicBoxProject(project)
  return project
}
