import { createMusicBoxProjectExport, downloadMusicBoxProject } from './project-export'
import type { MusicBoxProject } from './project-format'

export type MusicBoxProjectShareResult = 'shared' | 'downloaded'

type ShareNavigator = Pick<Navigator, 'share' | 'canShare'>

export function createMusicBoxProjectShareFile(project: MusicBoxProject): File {
  const exported = createMusicBoxProjectExport(project)
  return new File([exported.json], exported.filename, { type: 'application/json' })
}

export async function shareMusicBoxProjectFile(
  project: MusicBoxProject,
  navigatorLike: ShareNavigator | undefined = typeof navigator === 'undefined' ? undefined : navigator,
): Promise<MusicBoxProjectShareResult> {
  const file = createMusicBoxProjectShareFile(project)
  const shareData: ShareData = {
    title: project.metadata.title,
    files: [file],
  }

  if (navigatorLike?.share && navigatorLike.canShare?.(shareData)) {
    await navigatorLike.share(shareData)
    return 'shared'
  }

  downloadMusicBoxProject(project)
  return 'downloaded'
}
