import type { Locale } from './messages'

export type MusicBoxAutoFitCopy = {
  title: string
  intro: string
  octaveMoves: string
  octaveHelp: string
  nearestNote: string
  nearestHelp: string
  quantize: string
  quantizeOff: string
  quarterBeat: string
  halfBeat: string
  simplify: string
  simplifyHelp: string
  generate: string
  proposalReady: string
  changes: string
  blocking: string
  octaveCount: string
  nearestCount: string
  quantizeCount: string
  removedCount: string
}

export const musicBoxAutoFitCopy: Record<Locale, MusicBoxAutoFitCopy> = {
  en: {
    title: 'Auto Fit to Music Box',
    intro: 'Choose transformations, then generate a fit proposal. The proposal does not change the editable melody or cylinder until a later acceptance step.',
    octaveMoves: 'Move pitches by octaves where possible',
    octaveHelp: 'Keeps the pitch class and moves only by 12-semitone octaves to a note on the current comb.',
    nearestNote: 'Map remaining pitches to nearest comb note',
    nearestHelp: 'Uses the nearest available note only when an exact octave move cannot fit the pitch.',
    quantize: 'Timing quantization',
    quantizeOff: 'Off',
    quarterBeat: '1/4 beat',
    halfBeat: '1/2 beat',
    simplify: 'Remove repeated-note pin collisions',
    simplifyHelp: 'Drops later repeated notes only when the current cylinder cannot keep enough pin spacing.',
    generate: 'Generate fit proposal',
    proposalReady: 'Fit proposal ready',
    changes: 'Changes',
    blocking: 'Blocking conflicts',
    octaveCount: 'Octave moves',
    nearestCount: 'Nearest-note mappings',
    quantizeCount: 'Timing changes',
    removedCount: 'Removed notes',
  },
  ja: {
    title: 'オルゴールにAuto Fit',
    intro: '変換方法を選んでフィット候補を生成します。この段階では編集データやシリンダーを変更せず、採用は後の確認工程で行います。',
    octaveMoves: '可能な音はオクターブ移動する',
    octaveHelp: '音名を保ったまま12半音単位で移動し、現在の櫛歯にある音へ合わせます。',
    nearestNote: '残った音を最も近い櫛歯の音へ合わせる',
    nearestHelp: 'オクターブ移動だけでは入らない音を、現在の櫛歯で最も近い音へ移します。',
    quantize: 'タイミングの量子化',
    quantizeOff: 'なし',
    quarterBeat: '1/4拍',
    halfBeat: '1/2拍',
    simplify: '同音のピン衝突を簡略化する',
    simplifyHelp: '現在のシリンダーで必要なピン間隔を取れない同音だけ、後の音を削除します。',
    generate: 'フィット候補を生成',
    proposalReady: 'フィット候補を生成しました',
    changes: '変更数',
    blocking: '再生を妨げる競合',
    octaveCount: 'オクターブ移動',
    nearestCount: '近い音への移動',
    quantizeCount: 'タイミング変更',
    removedCount: '削除した音',
  },
}
