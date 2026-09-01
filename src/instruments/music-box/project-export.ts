import { assertMusicBoxProject, type MusicBoxProject } from './project-format'

export type MusicBoxProjectExport = {
  filename: string
  json: string
}

function safeProjectStem(title: string) {
  const normalized = title
    .normalize('NFKC')
    .trim()
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/[. ]+$/g, '')
  return normalized || 'music-box-project'
}

export function createMusicBoxProjectExport(project: MusicBoxProject): MusicBoxProjectExport {
  assertMusicBoxProject(project)
  return {
    filename: `${safeProjectStem(project.metadata.title)}.musicbox.json`,
    json: `${JSON.stringify(project, null, 2)}\n`,
  }
}

export function downloadMusicBoxProject(project: MusicBoxProject): void {
  const exported = createMusicBoxProjectExport(project)
  const blob = new Blob([exported.json], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = exported.filename
  anchor.hidden = true
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
