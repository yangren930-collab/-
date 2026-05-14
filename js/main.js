'use strict';

// ─── Game state ───────────────────────────────────────────────────────────────

const gameState = {
  screen:       'TITLE',
  p1CharIndex:  0,
  stageId:      'battlefield',
  winner:       null,
  resultTimer:  0,
  frameCount:   0,
};

// ─── Module instances ─────────────────────────────────────────────────────────

const canvas       = document.getElementById('gameCanvas');
const inputManager = new InputManager(canvas);
const renderer     = new Renderer(canvas, inputManager);

let fighters = [];
let stage    = null;

// ─── Fixed-timestep loop ──────────────────────────────────────────────────────

const STEP_MS   = 1000 / 60;
let accumulator = 0;
let lastTime    = 0;

function loop(timestamp) {
  const delta = Math.min(timestamp - lastTime, 100);
  lastTime    = timestamp;
  accumulator += delta;

  while (accumulator >= STEP_MS) {
    update();
    accumulator -= STEP_MS;
  }

  renderer.draw(gameState, fighters, stage);
  requestAnimationFrame(loop);
}

// ─── Update dispatch ──────────────────────────────────────────────────────────

function update() {
  gameState.frameCount++;
  inputManager.pollFrame();

  switch (gameState.screen) {
    case 'TITLE':       updateTitle();      break;
    case 'CHAR_SELECT': updateCharSelect(); break;
    case 'BATTLE':      updateBattle();     break;
    case 'RESULTS':     updateResults();    break;
  }
}

// ─── TITLE ────────────────────────────────────────────────────────────────────

function updateTitle() {
  const snap = inputManager.getSnapshot(0);
  if (snap.attackJustPressed || snap.jumpJustPressed || snap.specialJustPressed) {
    gameState.screen = 'CHAR_SELECT';
  }
}

// Title also responds to first touch anywhere
canvas.addEventListener('click', () => {
  if (gameState.screen === 'TITLE') gameState.screen = 'CHAR_SELECT';
});

// ─── CHAR SELECT ──────────────────────────────────────────────────────────────

function updateCharSelect() {
  const snap     = inputManager.getSnapshot(0);
  const numChars = Object.keys(CHARACTERS).length;

  if (snap.smashRight || (snap.right && !inputManager._prevRight)) {
    gameState.p1CharIndex = (gameState.p1CharIndex + 1) % numChars;
  }
  if (snap.smashLeft || (snap.left && !inputManager._prevLeft)) {
    gameState.p1CharIndex = (gameState.p1CharIndex - 1 + numChars) % numChars;
  }

  inputManager._prevRight = snap.right;
  inputManager._prevLeft  = snap.left;

  if (snap.attackJustPressed || snap.jumpJustPressed) {
    startBattle();
  }
}

// ─── BATTLE ───────────────────────────────────────────────────────────────────

function startBattle() {
  const charKeys = Object.keys(CHARACTERS);
  const p1Key    = charKeys[gameState.p1CharIndex];
  const cpuKey   = charKeys[Math.floor(Math.random() * charKeys.length)];

  stage = getStage(gameState.stageId);

  fighters = [
    new Fighter(p1Key,  0, stage.spawnPoints[0].x - CHARACTERS[p1Key].bodyW / 2,
                           stage.spawnPoints[0].y - CHARACTERS[p1Key].bodyH),
    new Fighter(cpuKey, 1, stage.spawnPoints[1].x - CHARACTERS[cpuKey].bodyW / 2,
                           stage.spawnPoints[1].y - CHARACTERS[cpuKey].bodyH),
  ];

  gameState.screen = 'BATTLE';
  gameState.winner = null;
}

function updateBattle() {
  const p1Snap  = inputManager.getSnapshot(0);
  const cpuSnap = AI.decide(fighters[1], fighters[0], stage, gameState.frameCount);

  const snaps = [p1Snap, cpuSnap];

  // Short-hop: if jump released within 6 frames, reduce jump velocity
  for (let i = 0; i < 2; i++) {
    const f  = fighters[i];
    const sn = snaps[i];
    if ((f.state === STATE.JUMP || f.state === STATE.DOUBLE_JUMP) &&
        f.vy < 0 && !sn.jump &&
        gameState.frameCount - f.jumpPressedFrame <= 6 &&
        gameState.frameCount - f.jumpPressedFrame > 0) {
      f.vy = Math.max(f.vy, f.charDef.shortHopPower);
    }
  }

  // Update fighters
  for (let i = 0; i < 2; i++) {
    fighters[i].update(snaps[i], fighters[1 - i], stage);
  }

  // Hit detection
  checkHits(fighters[0], fighters[1]);
  checkHits(fighters[1], fighters[0]);

  // Physics
  for (const f of fighters) {
    if (f.state !== STATE.DEAD && f.state !== STATE.RESPAWN) {
      f.applyPhysics(stage);
    }

    if (f.state !== STATE.DEAD &&
        f.state !== STATE.RESPAWN &&
        Physics.blastZoneCheck(f, stage.blastZones)) {
      f.die();
    }
  }

  // Respawn
  for (let i = 0; i < 2; i++) {
    const f = fighters[i];
    if (f.state === STATE.DEAD && f.deathTimer <= 0 && f.stocks > 0) {
      f.respawn(stage.spawnPoints[i]);
    }
  }

  // Win check
  const dead = fighters.filter(f => f.stocks <= 0);
  if (dead.length > 0) {
    gameState.winner = fighters.find(f => f.stocks > 0) || null;
    gameState.resultTimer = 0;
    gameState.screen = 'RESULTS';
  }
}

function checkHits(attacker, defender) {
  if (attacker.state !== STATE.ATTACK) return;
  const hitbox = attacker.getActiveHitbox();
  if (!hitbox) return;
  if (attacker.hitEntities.has(defender)) return;

  const hurtbox = defender.getHurtbox();
  if (!hurtbox) return;

  if (Physics.rectOverlap(hitbox, hurtbox)) {
    attacker.hitEntities.add(defender);

    const attack     = attacker.charDef.attacks[attacker.currentAttackId];
    const shielded   = defender.state === STATE.SHIELD;

    if (shielded) {
      defender.shieldHP -= attack.damage * 0.8;
      // Push attacker back slightly
      attacker.vx = attacker.facingRight ? -3 : 3;
    } else {
      defender.takeDamage(
        attack,
        attacker.facingRight,
        attacker.chargeFrames,
        attack.chargeMax
      );
      // Attacker hitStop
      attacker.hitStop = Math.min(8, Math.floor(attack.damage * 0.3 + 2));
    }
  }
}

// ─── RESULTS ──────────────────────────────────────────────────────────────────

function updateResults() {
  gameState.resultTimer++;

  if (gameState.resultTimer > 120) {
    const snap = inputManager.getSnapshot(0);
    if (snap.attackJustPressed || snap.jumpJustPressed || snap.specialJustPressed) {
      // Rematch with same characters
      startBattle();
      return;
    }
  }
  if (gameState.resultTimer > 600) {
    // Auto back to title after 10s
    gameState.screen = 'TITLE';
  }
}

// Result tap
canvas.addEventListener('click', () => {
  if (gameState.screen === 'RESULTS' && gameState.resultTimer > 120) {
    startBattle();
  }
});

// ─── Resize ───────────────────────────────────────────────────────────────────

window.addEventListener('resize', () => renderer.resize());
window.addEventListener('orientationchange', () => {
  setTimeout(() => renderer.resize(), 100);
});

// ─── Boot ─────────────────────────────────────────────────────────────────────

stage = getStage('battlefield');
requestAnimationFrame(loop);
