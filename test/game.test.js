import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FLOOR_WIDTH,
  FLOOR_HEIGHT,
  PLAYER_RADIUS,
  GAME_SECONDS,
  ROOMS,
  createGame,
  movePlayer,
  roomAt,
  hasBadge,
  tryEnterRoom,
  answerQuestion,
  closeQuestion,
  tick,
  score,
  formatTime,
  roomById,
} from '../src/game.js';

test('new game starts in the middle with no badges and full time', () => {
  const game = createGame();
  assert.equal(game.player.x, FLOOR_WIDTH / 2);
  assert.equal(game.player.y, FLOOR_HEIGHT / 2);
  assert.deepEqual(game.badges, []);
  assert.equal(game.timeLeft, GAME_SECONDS);
  assert.equal(game.status, 'playing');
  assert.equal(game.currentRoomId, null);
});

test('movement stays inside the floor on all four edges', () => {
  const game = createGame();
  movePlayer(game, -10000, 0);
  assert.equal(game.player.x, PLAYER_RADIUS);
  movePlayer(game, 10000, 0);
  assert.equal(game.player.x, FLOOR_WIDTH - PLAYER_RADIUS);
  movePlayer(game, 0, -10000);
  assert.equal(game.player.y, PLAYER_RADIUS);
  movePlayer(game, 0, 10000);
  assert.equal(game.player.y, FLOOR_HEIGHT - PLAYER_RADIUS);
});

test('small moves change position by the given amount', () => {
  const game = createGame();
  const startX = game.player.x;
  const startY = game.player.y;
  movePlayer(game, 10, -5);
  assert.equal(game.player.x, startX + 10);
  assert.equal(game.player.y, startY - 5);
});

test('roomAt finds the room under the player and null in the hallway', () => {
  const game = createGame();
  game.player = { x: 100, y: 100 };
  assert.equal(roomAt(game).id, 'keynote');
  game.player = { x: 400, y: 250 };
  assert.equal(roomAt(game), null);
});

test('tryEnterRoom opens a question only inside an uncollected room', () => {
  const game = createGame();
  game.player = { x: 400, y: 250 };
  assert.equal(tryEnterRoom(game), null);
  game.player = { x: 100, y: 100 };
  const room = tryEnterRoom(game);
  assert.equal(room.id, 'keynote');
  assert.equal(game.currentRoomId, 'keynote');
});

test('tryEnterRoom refuses a second question while one is open', () => {
  const game = createGame();
  game.player = { x: 100, y: 100 };
  tryEnterRoom(game);
  assert.equal(tryEnterRoom(game), null);
});

test('a right answer collects the badge', () => {
  const game = createGame();
  game.player = { x: 100, y: 100 };
  tryEnterRoom(game);
  assert.equal(answerQuestion(game, 0), true);
  assert.equal(hasBadge(game, 'keynote'), true);
  assert.equal(game.currentRoomId, null);
  assert.deepEqual(game.lastAnswer, { roomId: 'keynote', correct: true });
});

test('a wrong answer collects no badge and the room stays open', () => {
  const game = createGame();
  game.player = { x: 100, y: 100 };
  tryEnterRoom(game);
  assert.equal(answerQuestion(game, 2), false);
  assert.equal(hasBadge(game, 'keynote'), false);
  assert.equal(game.currentRoomId, null);
  assert.equal(tryEnterRoom(game).id, 'keynote');
});

test('an out of range answer counts as wrong', () => {
  const game = createGame();
  game.player = { x: 100, y: 100 };
  tryEnterRoom(game);
  assert.equal(answerQuestion(game, 9), false);
  assert.equal(game.badges.length, 0);
});

test('answering with no open question does nothing', () => {
  const game = createGame();
  assert.equal(answerQuestion(game, 0), false);
  assert.equal(game.badges.length, 0);
});

test('a collected room cannot be entered again', () => {
  const game = createGame();
  game.player = { x: 100, y: 100 };
  tryEnterRoom(game);
  answerQuestion(game, 0);
  assert.equal(tryEnterRoom(game), null);
});

test('closeQuestion clears the open question without a badge', () => {
  const game = createGame();
  game.player = { x: 100, y: 100 };
  tryEnterRoom(game);
  closeQuestion(game);
  assert.equal(game.currentRoomId, null);
  assert.equal(game.badges.length, 0);
});

test('collecting all six badges wins the game', () => {
  const game = createGame();
  for (const room of ROOMS) {
    game.player = { x: room.x + 10, y: room.y + 10 };
    tryEnterRoom(game);
    assert.equal(answerQuestion(game, room.answerIndex), true);
  }
  assert.equal(game.badges.length, 6);
  assert.equal(game.status, 'won');
});

test('tick counts time down and loses the game at zero', () => {
  const game = createGame();
  tick(game, 30);
  assert.equal(game.timeLeft, GAME_SECONDS - 30);
  assert.equal(game.status, 'playing');
  tick(game, 150);
  assert.equal(game.timeLeft, 0);
  assert.equal(game.status, 'lost');
});

test('tick never drops time below zero', () => {
  const game = createGame();
  tick(game, 9999);
  assert.equal(game.timeLeft, 0);
});

test('tick does nothing after the game ends', () => {
  const game = createGame();
  game.status = 'won';
  game.timeLeft = 42;
  tick(game, 10);
  assert.equal(game.timeLeft, 42);
});

test('losing closes an open question', () => {
  const game = createGame();
  game.player = { x: 100, y: 100 };
  tryEnterRoom(game);
  tick(game, GAME_SECONDS);
  assert.equal(game.status, 'lost');
  assert.equal(game.currentRoomId, null);
});

test('score is 100 per badge plus leftover time only on a win', () => {
  const game = createGame();
  assert.equal(score(game), 0);
  game.player = { x: 100, y: 100 };
  tryEnterRoom(game);
  answerQuestion(game, 0);
  game.timeLeft = 120;
  assert.equal(score(game), 100);
  game.status = 'won';
  assert.equal(score(game), 220);
});

test('every room has four options and a valid answer index', () => {
  assert.equal(ROOMS.length, 6);
  const ids = new Set();
  for (const room of ROOMS) {
    assert.equal(room.options.length, 4);
    assert.ok(room.answerIndex >= 0 && room.answerIndex < 4);
    assert.ok(!ids.has(room.id));
    ids.add(room.id);
    assert.ok(room.x >= 0 && room.y >= 0);
    assert.ok(room.x + room.w <= FLOOR_WIDTH);
    assert.ok(room.y + room.h <= FLOOR_HEIGHT);
  }
});

test('roomById returns the room or null', () => {
  assert.equal(roomById('web').name, 'Web Room');
  assert.equal(roomById('nope'), null);
});

test('formatTime renders minutes and seconds', () => {
  assert.equal(formatTime(180), '3:00');
  assert.equal(formatTime(65), '1:05');
  assert.equal(formatTime(9), '0:09');
  assert.equal(formatTime(0), '0:00');
  assert.equal(formatTime(-5), '0:00');
});
