export const messages = {
  en: {
    appSubtitle: 'music box / procedural builder',
    play: 'Play',
    stop: 'Stop',
    speed: 'Speed',
    resetView: 'Reset view',
    builder: 'Builder',
    cylinderLength: 'Cylinder length',
    tineSpacing: 'Tine spacing',
    driverTeeth: 'Driver teeth',
    cylinderTeeth: 'Cylinder teeth',
    crankHint: 'Drag the crank handle to rotate the mechanism.',
    invalidConfig: 'That configuration is not physically valid for the current parts.',
    footer: 'The crank, gears, cylinder, pin contact, tine motion and sound share one mechanical state.',
    language: 'Language',
    english: 'English',
    japanese: 'Japanese',
  },
  ja: {
    appSubtitle: 'オルゴール / プロシージャル・ビルダー',
    play: '再生',
    stop: '停止',
    speed: '速度',
    resetView: '視点をリセット',
    builder: 'ビルダー',
    cylinderLength: 'シリンダー長',
    tineSpacing: '櫛歯間隔',
    driverTeeth: '駆動ギア歯数',
    cylinderTeeth: 'シリンダーギア歯数',
    crankHint: 'クランクのハンドルをドラッグすると機構を回せます。',
    invalidConfig: '現在の部品構成では成立しない設定です。',
    footer: 'クランク、ギア、シリンダー、ピン接触、櫛歯の動き、音は同じ機械状態を共有します。',
    language: '言語',
    english: '英語',
    japanese: '日本語',
  },
} as const

export type Locale = keyof typeof messages
export type MessageKey = keyof (typeof messages)['en']

export const defaultLocale: Locale = 'en'

export function t(key: MessageKey, locale: Locale = defaultLocale): string {
  return messages[locale][key]
}
