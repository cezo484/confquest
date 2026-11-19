# ConfQuest

A browser mini-game for a tech conference or event. You walk a conference floor, visit six rooms, answer one trivia question in each, and collect talk badges before the day ends. A full round takes about two to three minutes.

Built for the Cloud9 x JetBrains: Sky's The Limit Hackathon 2026 on Devpost, category 3 (event mini-game).

## Run it

Node.js 20 or newer. No dependencies, nothing to install.

```
git clone <repo>
cd confquest
node serve.js
```

Then open http://localhost:8080. To use another port:

```
PORT=3000 node serve.js
```

## How to play

You start in the lobby with 3 minutes on the clock.

- Move with the arrow keys or WASD. On a touch screen, use the buttons under the floor map.
- Walk into a room and press E (or tap Enter Room) to open its trivia question.
- A right answer earns that room badge. A wrong answer earns nothing, and you can try the room again.
- Collect all six badges before the timer ends to finish the day.
- Esc or "Skip for now" closes a question without answering. The timer pauses while a question is open.

Scoring: 100 points per badge. If you collect all six badges, each second left on the clock adds one point.

## Tests

```
npm test
```

21 tests, all offline. They cover movement bounds, badge collection, question checking, the timer, and scoring. The game logic lives in `src/game.js`, a pure module with no DOM access, so the browser page and the tests import the same code.

## Layout

```
src/
  game.js       pure game logic: rooms, questions, movement, timer, scoring
web/
  index.html    single page game: canvas floor, HUD, question panel, touch controls
test/
  game.test.js  node:test suite for src/game.js
serve.js        zero dependency static server
methodology.md  design and build notes, plus the JetBrains tooling plan
```

## Submission notes

- Public repo: push this folder to a public GitHub repo before submitting. The demo video and the Devpost entry link to that repo.
- JetBrains tooling: this build was written outside a JetBrains IDE. Before submitting, do the final review and refactor pass in a JetBrains IDE as described in methodology.md. That pass is what satisfies the "use at least one JetBrains tool" rule, so do it before the video and the submission.
- Demo video: record a round under 3 minutes. Show the start screen, one or two rooms with a right and a wrong answer, and the final score screen.
- Deadline: 12 January 2027, 22:00 TRT.

## License

MIT. See LICENSE.
