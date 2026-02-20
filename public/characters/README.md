# Character Assets

Drop your character models here.

## Folder
- Put models in `public/characters/models/`

## Supported format
- `.glb` (recommended)

## How to switch character
1. Open `src/config/characters.ts`
2. Add or edit a character entry:
   - `modelPath`: example `/characters/models/my-character.glb`
   - `animationName`: optional exact clip name like `Idle`, `Walk`, etc
   - `scale`, `yOffset`: optional fit controls
3. Set `ACTIVE_CHARACTER_ID` to the character id you want.

## Fallback behavior
- If loading fails or no model path is configured, the built-in basic character is used automatically.
