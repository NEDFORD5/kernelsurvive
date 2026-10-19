[README-2.md](https://github.com/user-attachments/files/33679487/README-2.md)
# Popcorn: Don't Get Popped

A fan-made, single-file browser game inspired by the Google Popcorn Doodle. It is not affiliated with Google and uses no Google code or assets.

## Play
Open `index.html` in any modern browser. No build step or dependencies. Keep `index.html`, `style.css` and `game.js` in the same folder.

## Controls
- Arrow keys: move
- Space: use your kernel's ability
- Catch & Throw: Space opens a short catch window. Touch a hazard to hold it, aim with the mouse (or your last move direction), then press Space or click to throw. It auto-throws after 4 seconds.

## Kernels
- **Shield:** a bubble that blocks and deflects hazards for 2 seconds
- **Catch & Throw:** catch hazards and fling them at rival kernels
- **Heal:** restore half a heart

Abilities recharge, so use them at the right moment.

Every kernel is drawn like a real corn kernel (rounded crown, pale tip, small dimple) with a slightly different size and tilt. By type: Shield is a chunky deep-amber kernel, Catch & Throw is a slim orange-gold one, and Heal is a round pale-yellow one.

## Difficulty
Pick Easy, Normal or Hard on the difficulty screen, then choose your kernel.
- **Easy:** fewer, slower and smaller hazards, and hits do half damage
- **Normal:** the standard game
- **Hard:** more, faster and bigger hazards, and you only get 1 heart back after each level

## Rules
Every kernel, you and the bots, has 2 hearts and a face. You face 23 bot kernels. You only see a large section of the map around your kernel, not the whole arena. The arena is a circle with the boss (butter, salt, fire, then the Microwave) in the middle. There is a short break between phases, and every surviving kernel gets its hearts back after each phase. In the Butter phase the butter slowly slides to a new spot every 10 seconds, then sits still. Survive four phases: Butter, Salt, Fire and the Microwave. Lose all your hearts and you pop into a piece of popcorn (the same happens to every other kernel). Survive, or outlast every bot, and you stay a kernel.

## Host it on GitHub Pages
1. Create a repository and upload `index.html`, `style.css`, `game.js` and `README.md`.
2. Go to Settings, then Pages.
3. Under Source, choose the main branch and the root folder, then save.
4. Your game will be live at `https://YOUR-USERNAME.github.io/REPO-NAME/`.
