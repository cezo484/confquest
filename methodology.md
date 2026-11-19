# ConfQuest methodology

## The idea

The hackathon asks for an event mini-game. A conference floor works well for that: everyone at an event knows what a floor map is, and collecting badges gives the player a clear goal. The game had to be playable in two to three minutes, in a browser, with no install and no account.

The loop is short. Walk into a room, answer one question, earn a badge, move on. Six rooms fill the three minutes without rushing the player. One question per room keeps each stop under twenty seconds.

## Design decisions

The floor is a single canvas, 800 by 500 pixels. Six rooms sit around the edges and the lobby sits in the middle, so the player crosses the open floor between rooms. Rooms are plain colored rectangles with names. The player is a green circle marked YOU. No sprites and no art assets keep the project small and the page fast to load.

Movement is free, with arrow keys or WASD on a keyboard and on-screen buttons on touch screens. The player can walk anywhere on the floor, including through rooms. Collision with room walls would have added code and made the game slower to play, so rooms are open zones. Entering a room is a deliberate action: the player presses E or taps Enter Room, and only then does the question open. That keeps questions from popping up while the player just walks past a room.

The timer runs for 180 seconds and pauses while a question is open. Reading a question is part of the game, and the pause keeps the clock fair. A wrong answer earns nothing but the room stays open, so a wrong answer costs time and leaves the badge to be won later. The score is 100 points per badge, plus one point per second left when all six badges are collected. The time bonus rewards fast play without punishing a player who takes time to read.

Questions are general tech trivia, hard-coded in `src/game.js`. Hard-coded questions keep the game fully offline and make the tests deterministic. Each question has four options and one right answer.

## How the code is organized

The game logic lives in `src/game.js` and uses no browser APIs. The page (`web/index.html`) imports it for rendering and input, and the test suite (`test/game.test.js`) imports it for checks. One module serves both, so a rule change in the logic shows up in the page and in the tests at the same time.

`src/game.js` holds the floor size, the six room definitions with their questions, and the state functions: `createGame`, `movePlayer`, `roomAt`, `tryEnterRoom`, `answerQuestion`, `closeQuestion`, `tick`, `score`, and `formatTime`. State is a plain object, and each function mutates it in place and returns what the caller needs. That shape is easy to test: a test builds a game, moves the player, answers a question, and checks the fields.

The server (`serve.js`) is a small static file server on the Node.js standard library. It serves the project root so the page can import `src/game.js` with a relative path. The project has no dependencies at all: no framework, no build step, no bundler. `node serve.js` is the whole demo setup.

## Testing

`npm test` runs 21 tests with the built-in `node:test` runner. The tests cover movement clamping on all four edges, room detection, opening a question only inside an uncollected room, right and wrong answers, out-of-range answers, and answering with no open question. They also cover the win condition after six badges, the timer counting down and ending the game at zero, and the timer doing nothing after the game ends. They cover scoring with and without the time bonus, and the shape of every room definition. Every test runs offline and finishes in well under a second.

The browser page was checked by serving it locally and opening it at http://localhost:8080. Keyboard movement, the Enter Room button, the question panel, the timer, and the end screen were all exercised by hand in a round.

## JetBrains tooling: honest status

This build was written outside a JetBrains IDE, in a plain editor environment. No JetBrains tool was used to write, run, or test this code so far. The project does not claim otherwise.

The hackathon requires at least one JetBrains tool, so the builder does a final review and refactor pass in a JetBrains IDE before submitting. The registration for this hackathon includes a 2-month JetBrains All Products Pack code, and that code covers the IDE used below. The pass below is the real JetBrains step of this project, and it happens before the demo video is recorded.

Exact steps:

1. Redeem the 2-month All Products Pack code on the JetBrains site and sign in with the JetBrains account.
2. Install WebStorm from the JetBrains site or through the JetBrains Toolbox App. IntelliJ IDEA Ultimate also works.
3. Open this project folder in the IDE. Let the IDE index the project.
4. Run the IDE code inspection on the whole project (Code, Inspect Code). Read each finding and fix the real ones. The likely findings are minor style and naming notes.
5. Do a short refactor pass by hand: check the function names in `src/game.js`, remove any dead code, and confirm the comments still match the code. Use the IDE rename and extract method actions for any change that touches more than one place.
6. Optional: use Junie inside the IDE to review `src/game.js` and `web/index.html` and to suggest small cleanups. Read each suggestion before accepting it, and keep the ones that make the code clearer.
7. Run the tests from the IDE terminal: `npm test`. Confirm all 21 tests pass.
8. Run the demo from the IDE terminal: `node serve.js`. Open http://localhost:8080 and play one full round.
9. Commit the result with a message that names the pass, for example "Review pass in WebStorm: inspection fixes and cleanup". Push to the public repo.
10. Record the demo video after this pass, so the video shows the submitted code.

### Review pass record (19 November 2026)

The pass ran with WebStorm 2026.3, headless, using the IDE Inspect Code
command. It found three small real issues (two in this file, one type nit
in the page) and all three were fixed; a full browser round found one more
cosmetic issue (the last room label) and that was fixed too. Two weak
warnings remain and are documented false positives. Full notes:
docs/JETBRAINS-REVIEW.md. The IDE was not activated during this pass: the
All Products Pack code needs a JetBrains account sign-in in a browser, so
activation and the optional Junie step are still open for the author to do
on their own machine.

## Limits and next steps

The questions are fixed, so a second round repeats them. A question bank with random picks would fix that. The game also has no sound and no saved high score. Both are small additions: a high score in local storage, and a short beep on a right answer. Neither is needed for the submission, and both are left out to keep the project simple.
