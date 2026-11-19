// ConfQuest game logic. Pure functions, no DOM access, so the same module
// runs in the browser page and in the node:test suite.

export const FLOOR_WIDTH = 800;
export const FLOOR_HEIGHT = 500;
export const PLAYER_RADIUS = 14;
export const PLAYER_SPEED = 220;
export const GAME_SECONDS = 180;
export const POINTS_PER_BADGE = 100;

// Six rooms on the conference floor. Each room has one trivia question and
// one badge. x, y, w, h are in floor pixels.
export const ROOMS = [
  {
    id: 'keynote',
    name: 'Keynote Hall',
    color: '#e8b4b8',
    x: 40, y: 40, w: 200, h: 130,
    question: 'What does HTTP stand for?',
    options: [
      'HyperText Transfer Protocol',
      'High Transfer Text Process',
      'Hyperlink Text Tool Protocol',
      'Host Transfer Terminal Program',
    ],
    answerIndex: 0,
  },
  {
    id: 'web',
    name: 'Web Room',
    color: '#a8d5ba',
    x: 300, y: 40, w: 200, h: 130,
    question: 'Which language runs natively in every modern web browser?',
    options: ['Python', 'JavaScript', 'Rust', 'Go'],
    answerIndex: 1,
  },
  {
    id: 'data',
    name: 'Data Lab',
    color: '#a9c6e8',
    x: 560, y: 40, w: 200, h: 130,
    question: 'In SQL, which keyword reads rows from a table?',
    options: ['FETCH ALL', 'GET', 'SELECT', 'READ'],
    answerIndex: 2,
  },
  {
    id: 'cloud',
    name: 'Cloud Stage',
    color: '#e8d5a3',
    x: 40, y: 330, w: 200, h: 130,
    question: 'What does CPU stand for?',
    options: [
      'Central Processing Unit',
      'Computer Personal Unit',
      'Central Program Utility',
      'Core Processing Utility',
    ],
    answerIndex: 0,
  },
  {
    id: 'security',
    name: 'Security Corner',
    color: '#d3b8e8',
    x: 300, y: 330, w: 200, h: 130,
    question: 'What does 2FA add to a login?',
    options: [
      'A second username',
      'A second verification step',
      'A second password database',
      'A second account',
    ],
    answerIndex: 1,
  },
  {
    id: 'mobile',
    name: 'Mobile Booth',
    color: '#f2b880',
    x: 560, y: 330, w: 200, h: 130,
    question: 'Which company makes the Android operating system?',
    options: ['Apple', 'Microsoft', 'Samsung', 'Google'],
    answerIndex: 3,
  },
];

export function roomById(id) {
  return ROOMS.find((room) => room.id === id) || null;
}

export function createGame() {
  return {
    player: { x: FLOOR_WIDTH / 2, y: FLOOR_HEIGHT / 2 },
    badges: [],
    timeLeft: GAME_SECONDS,
    status: 'playing',
    currentRoomId: null,
    lastAnswer: null,
  };
}

// Move the player by dx, dy pixels, clamped inside the floor. The player
// center stays at least PLAYER_RADIUS away from each edge.
export function movePlayer(state, dx, dy) {
  const x = state.player.x + dx;
  const y = state.player.y + dy;
  state.player.x = Math.min(Math.max(x, PLAYER_RADIUS), FLOOR_WIDTH - PLAYER_RADIUS);
  state.player.y = Math.min(Math.max(y, PLAYER_RADIUS), FLOOR_HEIGHT - PLAYER_RADIUS);
  return state.player;
}

export function roomAt(state) {
  const { x, y } = state.player;
  return ROOMS.find(
    (room) => x >= room.x && x <= room.x + room.w && y >= room.y && y <= room.y + room.h,
  ) || null;
}

export function hasBadge(state, roomId) {
  return state.badges.includes(roomId);
}

// Open the trivia question for the room the player stands in. Returns the
// room, or null when there is no question to open.
export function tryEnterRoom(state) {
  if (state.status !== 'playing' || state.currentRoomId) return null;
  const room = roomAt(state);
  if (!room || hasBadge(state, room.id)) return null;
  state.currentRoomId = room.id;
  return room;
}

// Answer the open question. choiceIndex is the picked option. Returns true
// when the answer is right. A right answer collects the room badge. When
// all six badges are collected the game is won.
export function answerQuestion(state, choiceIndex) {
  if (state.status !== 'playing' || !state.currentRoomId) return false;
  const room = roomById(state.currentRoomId);
  if (!room) return false;
  const correct = Number.isInteger(choiceIndex) && choiceIndex === room.answerIndex;
  state.lastAnswer = { roomId: room.id, correct };
  state.currentRoomId = null;
  if (correct && !hasBadge(state, room.id)) {
    state.badges.push(room.id);
    if (state.badges.length === ROOMS.length) {
      state.status = 'won';
    }
  }
  return correct;
}

export function closeQuestion(state) {
  state.currentRoomId = null;
}

// Advance the clock by dt seconds. When time runs out before all badges
// are collected, the game is lost.
export function tick(state, dt) {
  if (state.status !== 'playing') return state.status;
  state.timeLeft = Math.max(0, state.timeLeft - dt);
  if (state.timeLeft <= 0) {
    state.status = 'lost';
    state.currentRoomId = null;
  }
  return state.status;
}

// Score: 100 points per badge, plus one point per second left when the
// player collects all six badges before the timer ends.
export function score(state) {
  let points = state.badges.length * POINTS_PER_BADGE;
  if (state.status === 'won') points += Math.ceil(state.timeLeft);
  return points;
}

export function formatTime(seconds) {
  const total = Math.max(0, Math.ceil(seconds));
  const minutes = Math.floor(total / 60);
  const secs = total % 60;
  return minutes + ':' + String(secs).padStart(2, '0');
}
