import type { Locale } from './messages'

export type MusicBoxCompatibilityCopy = {
  title: string
  intro: string
  fits: string
  needsFit: string
  supported: string
  blocking: string
  review: string
  range: string
  simultaneous: string
  density: string
  pinSpacing: string
}

export const musicBoxCompatibilityCopy: Record<Locale, MusicBoxCompatibilityCopy> = {
  en: {
    title: 'Music box compatibility',
    intro: 'Checks the editable melody against the current comb and cylinder constraints. This report does not change any notes.',
    fits: 'Fits current mechanism',
    needsFit: 'Needs fitting before reliable mechanical playback',
    supported: 'Notes on current comb',
    blocking: 'Blocking conflicts',
    review: 'Review warnings',
    range: 'Out of range',
    simultaneous: 'Simultaneous starts',
    density: 'Dense repeated notes',
    pinSpacing: 'Pin spacing conflicts',
  },
  ja: {
    title: 'オルゴール適合チェック',
    intro: '編集データを現在の櫛歯とシリンダーの制約に照らして確認します。このチェックだけで音は変更しません。',
    fits: '現在の機構で再生可能',
    needsFit: '安定した機械再生にはフィット調整が必要',
    supported: '現在の櫛歯で鳴らせる音',
    blocking: '再生を妨げる競合',
    review: '要確認',
    range: '音域外',
    simultaneous: '同時開始',
    density: '同音の高密度配置',
    pinSpacing: 'ピン間隔の競合',
  },
}
