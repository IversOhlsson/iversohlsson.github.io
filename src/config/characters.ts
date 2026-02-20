export type CharacterConfig = {
  id: string
  label: string
  modelPath?: string
  animationName?: string
  animationIndex?: number
  animationSpeed?: number
  playAnimation?: boolean
  scale?: number
  yOffset?: number
}

export const characterConfigs: CharacterConfig[] = [
  {
    id: 'fallback',
    label: 'Fallback Scribble Character',
  },
  {
    id: 'futuristic-flying-robot',
    label: 'Futuristic Flying Robot',
    modelPath: '/characters/models/futuristic_flying_animated_robot_-_low_poly.glb',
    animationName: 'Scene',
    animationIndex: 0,
    animationSpeed: 1,
    playAnimation: true,
    scale: 1,
    yOffset: 0,
  },
]
/* CHANGE HERE - - - - - - - - - - - - - - - - */
export const ACTIVE_CHARACTER_ID = 'futuristic-flying-robot'
/* You can also set this directly to a file name, e.g. 'my-character.glb' */
/* - - - - - - - - - - - - - - - - - - - - - - */

export function getActiveCharacterConfig(): CharacterConfig {
  const fromConfig = characterConfigs.find((character) => character.id === ACTIVE_CHARACTER_ID)
  if (fromConfig) {
    return fromConfig
  }

  if (ACTIVE_CHARACTER_ID.endsWith('.glb')) {
    const normalizedPath = ACTIVE_CHARACTER_ID.startsWith('/')
      ? ACTIVE_CHARACTER_ID
      : `/characters/models/${ACTIVE_CHARACTER_ID}`

    return {
      id: `direct-${ACTIVE_CHARACTER_ID}`,
      label: `Direct Character: ${ACTIVE_CHARACTER_ID}`,
      modelPath: normalizedPath,
      animationIndex: 0,
      animationSpeed: 1,
      playAnimation: true,
      scale: 1,
      yOffset: 0,
    }
  }

  return characterConfigs[0]
}
