# JetBrains review pass

Date: 19 November 2026. Tool: WebStorm 2026.3 (build WS-263.7307.202),
downloaded from JetBrains and SHA-256 verified, run headless under Xvfb with
the bundled JetBrains Runtime (JBR 25.0.4.1). The IDE was not activated
during this pass; see the activation note below.

## Method steps and what actually happened

1. Redeem the All Products Pack code and sign in: NOT DONE HERE. Redeeming
   the code needs a JetBrains account sign-in in a browser, and this
   environment has no browser sign-in and no JetBrains account credentials.
   The code was not entered anywhere on this machine.
2. Install WebStorm: done. Tarball from download.jetbrains.com, checksum
   matched, extracted to ~/apps/WebStorm-263.7307.202.
3. Open the project and index it: done headless. The inspect command opens
   the project folder and indexes it before running inspections.
4. Inspect Code on the whole project: done, 8 runs, Default profile. See
   the findings below.
5. Refactor pass by hand: done by reading every source file. No dead code
   found, no renames needed. Notes are in the refactor section below.
6. Junie review: NOT DONE. Junie needs an activated IDE, a JetBrains
   account, and the AI Ultimate license, all through the interactive IDE.
   None of that was available headless, so this step is still open.
7. Run the tests: done. `npm test`, 21 of 21 pass, before and after the
   fixes.
8. Run the demo and play a full round: done in headless Chromium, driven
   over the DevTools protocol. Full round, all six badges, win screen,
   final score 770 with 2:50 left. One cosmetic issue found and fixed.
9. Commit and push: done after this pass. The commit message names the pass.
10. Demo video: not part of this pass. Record it after this pass, as the
    methodology says.

## Inspection findings

The inspect command ran 8 times. Five runs (1, 2, 4, 6, 8) agreed with each
other. Three runs (3, 5, 7) produced identical garbage: every export and
every CSS selector flagged as unused, plus a stale grammar note for a
sentence that no longer existed. Those three runs raced with indexing and
their output contradicts the code itself, so they were discarded. The two
runs on the final code (6 and 8) agree exactly.

Fixed, real findings:

- methodology.md: "JetBrains Toolbox app" corrected to "JetBrains Toolbox
  App" (Grazie grammar).
- methodology.md: one 68-word sentence split into three shorter sentences
  (Grazie style). The first split still left a 41-word sentence, so it was
  split again. Verified gone in the later runs.
- web/index.html, updateHud: `scoreEl.textContent = score(game)` assigned
  a number to a string property. Changed to `String(score(game))`.
  (JSValidateTypes, weak warning.)

Remaining warnings, both documented false positives:

- serve.js line 10: "Unresolved variable or type process". The headless IDE
  has no Node.js core library configured, so it does not know the Node
  global `process`. The code is correct Node.js. In a normal IDE session,
  enabling the Node.js Core library in Settings clears this.
- web/index.html line 243: "Assigned expression type T is not assignable
  to type string" for `button.textContent = option`. The IDE cannot infer
  the element type of `room.options` through the module boundary, so it
  falls back to a generic. At runtime `option` is always a string from the
  ROOMS data. No code change; the warning is an inference limit.

## Refactor pass notes (step 5)

Read in full: src/game.js, web/index.html, test/game.test.js, serve.js,
package.json. Function names are clear and match what the functions do.
No dead code: every export in game.js is imported by the page or the tests,
and every import in the page and the tests is used. Comments match the code
they sit next to. The duplicate "web" script in package.json is an alias
for "start" and was left alone on purpose. No rename or extract action was
needed, so none was done.

## Demo round (step 8)

The server ran with `node serve.js` and the game was played in headless
Chromium through the DevTools protocol: real key events for movement and
entering rooms, real clicks on the answer buttons. Route: Web Room, Data
Lab, Mobile Booth, Security Corner, Cloud Stage, Keynote Hall. All six
answers right on the first try. End screen: "All six badges collected",
score 770 (600 badge points plus 170 seconds left).

One cosmetic issue came out of the round: after the last badge, the final
room still showed "Trivia: 1 question" behind the end screen, because the
frame loop stops before repainting. Fix: `checkEnd()` now calls `draw()`
first, so the final state paints before the end screen shows. Verified by
playing a second full round and checking the screenshot: all six rooms
show "Badge collected".

## Activation note

Neither license code was redeemed or entered on this machine, and no code
value is written in this repo. To finish the JetBrains setup, the author
redeems the All Products Pack code in their JetBrains account at
jetbrains.com, signs in to the IDE with that account, and activates AI
Ultimate the same way. Junie (step 6) can run after that, on a machine with
a display.

## Files changed by this pass

- methodology.md: the two doc fixes above, plus a short record of this pass.
- web/index.html: `String(score(game))` in updateHud, and `draw()` at the
  start of checkEnd.
- docs/JETBRAINS-REVIEW.md: this file.
- .gitignore: added .idea/ and inspection-output/ (IDE working files from
  this pass, removed from the project folder before pushing).

## How to repeat the inspection

```
WEBIDE_VM_OPTIONS=~/apps/webstorm-user.vmoptions xvfb-run -a \
  ~/apps/WebStorm-263.7307.202/bin/webstorm.sh inspect \
  <project dir> "Default" <output dir>
```

Note the variable name: the launcher reads WEBIDE_VM_OPTIONS, not
WEBSTORM_VM_OPTIONS. The vmoptions file sets a consent flag and persistent
config and system paths under ~/apps. Expect some runs to come back with
the "everything unused" garbage; re-run and compare before trusting the
output.
