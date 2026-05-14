'use strict';

// ─── Character definitions ────────────────────────────────────────────────────

function makeAttacks(dmgMult, kbMult, speedMult) {
  const d = (v) => Math.round(v * dmgMult);
  const k = (v) => +(v * kbMult).toFixed(2);
  const su = (v) => Math.max(2, Math.round(v / speedMult));

  return {
    jab:           { startup: su(3),  active: 4,  recovery: 7,  damage: d(3),  knockback: { power: k(0.5),  angle: 25  }, hitbox: { xOff: 48, yOff: 12, w: 28, h: 24 }, airOk: false, chargeMin: 0,  chargeMax: 0,  effectColor: '#ff9999', effectShape: 'rect'   },
    tiltSide:      { startup: su(7),  active: 5,  recovery: 12, damage: d(8),  knockback: { power: k(0.7),  angle: 20  }, hitbox: { xOff: 52, yOff: 8,  w: 40, h: 32 }, airOk: false, chargeMin: 0,  chargeMax: 0,  effectColor: '#ff6b6b', effectShape: 'rect'   },
    tiltUp:        { startup: su(8),  active: 5,  recovery: 14, damage: d(7),  knockback: { power: k(0.65), angle: 85  }, hitbox: { xOff: 10, yOff:-36, w: 36, h: 36 }, airOk: false, chargeMin: 0,  chargeMax: 0,  effectColor: '#ff8888', effectShape: 'arc'    },
    tiltDown:      { startup: su(9),  active: 4,  recovery: 16, damage: d(6),  knockback: { power: k(0.6),  angle: 275 }, hitbox: { xOff: 30, yOff: 52, w: 44, h: 20 }, airOk: false, chargeMin: 0,  chargeMax: 0,  effectColor: '#cc3333', effectShape: 'rect'   },
    smashSide:     { startup: su(16), active: 4,  recovery: 24, damage: d(18), knockback: { power: k(1.4),  angle: 15  }, hitbox: { xOff: 54, yOff: 6,  w: 52, h: 36 }, airOk: false, chargeMin: 20, chargeMax: 60, effectColor: '#ffcc00', effectShape: 'rect'   },
    smashUp:       { startup: su(14), active: 5,  recovery: 22, damage: d(16), knockback: { power: k(1.3),  angle: 80  }, hitbox: { xOff: 4,  yOff:-48, w: 44, h: 52 }, airOk: false, chargeMin: 20, chargeMax: 60, effectColor: '#ffcc00', effectShape: 'arc'    },
    smashDown:     { startup: su(18), active: 4,  recovery: 28, damage: d(14), knockback: { power: k(1.2),  angle: 265 }, hitbox: { xOff: 0,  yOff: 36, w: 52, h: 36 }, airOk: false, chargeMin: 20, chargeMax: 60, effectColor: '#ffcc00', effectShape: 'rect'   },
    aerialNeutral: { startup: su(5),  active: 6,  recovery: 10, damage: d(6),  knockback: { power: k(0.6),  angle: 50  }, hitbox: { xOff:-20, yOff:-20, w: 90, h: 90 }, airOk: true,  chargeMin: 0,  chargeMax: 0,  effectColor: '#ffaaaa', effectShape: 'circle' },
    aerialForward: { startup: su(8),  active: 5,  recovery: 16, damage: d(10), knockback: { power: k(0.85), angle: 30  }, hitbox: { xOff: 48, yOff: 0,  w: 44, h: 40 }, airOk: true,  chargeMin: 0,  chargeMax: 0,  effectColor: '#ff6b6b', effectShape: 'rect'   },
    aerialBack:    { startup: su(7),  active: 6,  recovery: 14, damage: d(12), knockback: { power: k(0.9),  angle: 165 }, hitbox: { xOff:-60, yOff: 0,  w: 44, h: 40 }, airOk: true,  chargeMin: 0,  chargeMax: 0,  effectColor: '#ff4444', effectShape: 'rect'   },
    aerialUp:      { startup: su(6),  active: 8,  recovery: 12, damage: d(8),  knockback: { power: k(0.75), angle: 90  }, hitbox: { xOff: 0,  yOff:-52, w: 52, h: 44 }, airOk: true,  chargeMin: 0,  chargeMax: 0,  effectColor: '#ffbbbb', effectShape: 'arc'    },
    aerialDown:    { startup: su(12), active: 4,  recovery: 20, damage: d(14), knockback: { power: k(1.1),  angle: 275 }, hitbox: { xOff: 4,  yOff: 56, w: 44, h: 36 }, airOk: true,  chargeMin: 0,  chargeMax: 0,  effectColor: '#cc0000', effectShape: 'rect'   },
    specialNeutral:{ startup: su(10), active: 20, recovery: 15, damage: d(5),  knockback: { power: k(0.5),  angle: 20  }, hitbox: { xOff: 56, yOff: 16, w: 24, h: 24 }, airOk: true,  chargeMin: 0,  chargeMax: 0,  effectColor: '#ffff55', effectShape: 'circle' },
    specialSide:   { startup: su(6),  active: 30, recovery: 18, damage: d(8),  knockback: { power: k(0.8),  angle: 10  }, hitbox: { xOff: 52, yOff: 12, w: 32, h: 28 }, airOk: true,  chargeMin: 0,  chargeMax: 0,  effectColor: '#ff8800', effectShape: 'rect'   },
    specialUp:     { startup: su(4),  active: 12, recovery: 20, damage: d(4),  knockback: { power: k(0.4),  angle: 75  }, hitbox: { xOff: 4,  yOff:-60, w: 44, h: 64 }, airOk: true,  chargeMin: 0,  chargeMax: 0,  effectColor: '#ffcc88', effectShape: 'arc'    },
    specialDown:   { startup: su(14), active: 6,  recovery: 22, damage: d(12), knockback: { power: k(1.0),  angle: 90  }, hitbox: { xOff: 0,  yOff: 0,  w: 52, h: 64 }, airOk: true,  chargeMin: 0,  chargeMax: 0,  effectColor: '#cc6600', effectShape: 'rect'   },
  };
}

const CHARACTERS = {
  BRAWLER: {
    name: 'ブロウラー',
    colorBody:    '#e63946',
    colorDetail:  '#c1121f',
    colorHead:    '#e63946',
    weight:       110,
    walkSpeed:    4.0,
    runSpeed:     7.5,
    airSpeed:     5.5,
    jumpPower:   -14.0,
    shortHopPower: -8.5,
    doubleJumpPower: -12.0,
    fallSpeed:    16.0,
    bodyW: 48, bodyH: 60,
    attacks: makeAttacks(1.0, 1.0, 1.0),
  },
  SWIFT: {
    name: 'スウィフト',
    colorBody:    '#2196f3',
    colorDetail:  '#0d47a1',
    colorHead:    '#42a5f5',
    weight:       80,
    walkSpeed:    5.5,
    runSpeed:     10.0,
    airSpeed:     7.0,
    jumpPower:   -15.5,
    shortHopPower: -9.5,
    doubleJumpPower: -14.0,
    fallSpeed:    14.0,
    bodyW: 40, bodyH: 52,
    attacks: makeAttacks(0.7, 0.75, 1.35),
  },
  HEAVY: {
    name: 'ヘビー',
    colorBody:    '#4caf50',
    colorDetail:  '#1b5e20',
    colorHead:    '#66bb6a',
    weight:       140,
    walkSpeed:    2.5,
    runSpeed:     4.5,
    airSpeed:     3.5,
    jumpPower:   -11.0,
    shortHopPower: -7.0,
    doubleJumpPower: -10.0,
    fallSpeed:    20.0,
    bodyW: 60, bodyH: 72,
    attacks: makeAttacks(1.4, 1.35, 0.7),
  },
};

const CHAR_KEYS = Object.keys(CHARACTERS);

// ─── Fighter states ───────────────────────────────────────────────────────────

const STATE = {
  IDLE:         'IDLE',
  WALK:         'WALK',
  RUN:          'RUN',
  JUMP:         'JUMP',
  DOUBLE_JUMP:  'DOUBLE_JUMP',
  FALL:         'FALL',
  ATTACK:       'ATTACK',
  HITSTUN:      'HITSTUN',
  SHIELD:       'SHIELD',
  DODGE:        'DODGE',
  DEAD:         'DEAD',
  RESPAWN:      'RESPAWN',
};

// ─── Fighter class ────────────────────────────────────────────────────────────

class Fighter {
  constructor(charId, playerIndex, x, y) {
    this.charId      = charId;
    this.playerIndex = playerIndex;
    this.charDef     = CHARACTERS[charId];

    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.facingRight = playerIndex === 0;

    this.state    = STATE.IDLE;
    this.grounded = false;
    this.percentage  = 0;
    this.stocks      = 3;
    this.shieldHP    = Physics.SHIELD_MAX_HP;

    this.currentAttackId = null;
    this.attackFrame     = 0;
    this.chargeFrames    = 0;
    this.chargingSmash   = false;
    this.hitEntities     = new Set();

    this.hasDoubleJump     = true;
    this.droppingThrough   = false;
    this.dropTimer         = 0;

    this.hitstunFrames = 0;
    this.dodgeFrames   = 0;
    this.invincible    = false;
    this.jumpPressedFrame   = -999;
    this.lastJumpFrame      = -999;

    this.deathTimer   = 0;
    this.respawnTimer = 0;

    this.pendingEffects = [];
    this.hitStop        = 0;

    this.frameCount = 0;
  }

  get w() { return this.charDef.bodyW; }
  get h() { return this.charDef.bodyH; }

  // ── Main update ──────────────────────────────────────────────────────────────
  update(input, opponent, stage) {
    this.frameCount++;

    if (this.hitStop > 0) {
      this.hitStop--;
      this._tickEffects();
      return;
    }

    // Drop-through timer
    if (this.dropTimer > 0) {
      this.dropTimer--;
      if (this.dropTimer <= 0) this.droppingThrough = false;
    }

    switch (this.state) {
      case STATE.IDLE:         this._handleIdle(input); break;
      case STATE.WALK:         this._handleWalk(input); break;
      case STATE.RUN:          this._handleRun(input);  break;
      case STATE.JUMP:
      case STATE.DOUBLE_JUMP:  this._handleAir(input);  break;
      case STATE.FALL:         this._handleAir(input);  break;
      case STATE.ATTACK:       this._handleAttack(input); break;
      case STATE.HITSTUN:      this._handleHitstun();   break;
      case STATE.SHIELD:       this._handleShield(input); break;
      case STATE.DODGE:        this._handleDodge();     break;
      case STATE.DEAD:         this._handleDead();      break;
      case STATE.RESPAWN:      this._handleRespawn();   break;
    }

    this._tickEffects();
  }

  // ── State handlers ───────────────────────────────────────────────────────────

  _handleIdle(input) {
    if (input.shieldJustPressed) { this._transitionTo(STATE.SHIELD); return; }
    if (input.jumpJustPressed)   { this._startJump(input); return; }
    if (this._tryAttack(input))  return;

    if (input.left || input.right) {
      this._transitionTo(STATE.WALK);
    }
    if (input.down && this.grounded) {
      this._tryDropThrough();
    }
  }

  _handleWalk(input) {
    if (input.shieldJustPressed) { this._transitionTo(STATE.SHIELD); return; }
    if (input.jumpJustPressed)   { this._startJump(input); return; }
    if (this._tryAttack(input))  return;

    const cd = this.charDef;
    if (input.right) {
      this.vx = Math.min(this.vx + 1.5, cd.walkSpeed);
      this.facingRight = true;
      if (this.vx >= cd.runSpeed * 0.85 && input.right) {
        this._transitionTo(STATE.RUN);
      }
    } else if (input.left) {
      this.vx = Math.max(this.vx - 1.5, -cd.walkSpeed);
      this.facingRight = false;
      if (this.vx <= -cd.runSpeed * 0.85 && input.left) {
        this._transitionTo(STATE.RUN);
      }
    } else {
      this._transitionTo(STATE.IDLE);
    }
    if (input.down && this.grounded) this._tryDropThrough();
  }

  _handleRun(input) {
    if (input.shieldJustPressed) { this._transitionTo(STATE.SHIELD); return; }
    if (input.jumpJustPressed)   { this._startJump(input); return; }
    if (this._tryAttack(input))  return;

    const cd = this.charDef;
    if (input.right) {
      this.vx = Math.min(this.vx + 2.0, cd.runSpeed);
      this.facingRight = true;
    } else if (input.left) {
      this.vx = Math.max(this.vx - 2.0, -cd.runSpeed);
      this.facingRight = false;
    } else {
      this._transitionTo(STATE.IDLE);
    }
    if (input.down && this.grounded) this._tryDropThrough();
  }

  _handleAir(input) {
    if (input.jumpJustPressed && this.hasDoubleJump &&
        this.state !== STATE.DOUBLE_JUMP) {
      this._startDoubleJump();
      return;
    }

    // Air dodge
    if (input.shieldJustPressed) {
      this._startDodge(input.left ? 'left' : input.right ? 'right' : 'none');
      return;
    }

    if (this._tryAttack(input)) return;

    const cd = this.charDef;
    if (input.right) {
      this.vx = Math.min(this.vx + 1.2, cd.airSpeed);
      this.facingRight = true;
    } else if (input.left) {
      this.vx = Math.max(this.vx - 1.2, -cd.airSpeed);
      this.facingRight = false;
    }

    if (this.vy > 0) this._transitionTo(STATE.FALL);
  }

  _handleAttack(input) {
    const attack = this.charDef.attacks[this.currentAttackId];

    // Hold charge
    if (this.chargingSmash && input.smashHeld) {
      this.chargeFrames++;
      if (this.chargeFrames >= attack.chargeMax) {
        this.chargingSmash = false;
      }
      return;
    }
    this.chargingSmash = false;

    this.attackFrame++;
    const total = attack.startup + attack.active + attack.recovery;
    if (this.attackFrame >= total) {
      this.hitEntities.clear();
      this._transitionTo(this.grounded ? STATE.IDLE : STATE.FALL);
    }
  }

  _handleHitstun() {
    this.hitstunFrames--;
    this.vx *= Physics.HITSTUN_DECAY;
    if (this.hitstunFrames <= 0) {
      this._transitionTo(this.grounded ? STATE.IDLE : STATE.FALL);
    }
  }

  _handleShield(input) {
    if (!input.shield) {
      this.shieldHP = Math.min(Physics.SHIELD_MAX_HP,
                               this.shieldHP + Physics.SHIELD_REGEN);
      this._transitionTo(STATE.IDLE);
      return;
    }

    this.shieldHP -= Physics.SHIELD_DECAY;

    if (input.left || input.right) {
      this._startDodge(input.left ? 'left' : 'right');
      return;
    }

    if (this.shieldHP <= 0) {
      this.shieldHP = 0;
      this.hitstunFrames = 120;
      this._transitionTo(STATE.HITSTUN);
    }
  }

  _handleDodge() {
    this.dodgeFrames--;
    if (this.dodgeFrames <= 6) this.invincible = false;
    this.vx *= 0.78;
    if (this.dodgeFrames <= 0) {
      this._transitionTo(this.grounded ? STATE.IDLE : STATE.FALL);
    }
  }

  _handleDead() {
    this.deathTimer--;
  }

  _handleRespawn() {
    this.respawnTimer--;
    if (this.respawnTimer <= 0) {
      this.invincible = false;
      this._transitionTo(STATE.IDLE);
    }
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  _transitionTo(newState) {
    this.state = newState;
  }

  _startJump(input) {
    this.lastJumpFrame = this.frameCount;
    this.jumpPressedFrame = this.frameCount;
    this.vy = this.charDef.jumpPower;
    this.grounded = false;
    this._transitionTo(STATE.JUMP);
  }

  _startDoubleJump() {
    this.hasDoubleJump = false;
    this.vy = this.charDef.doubleJumpPower;
    this._transitionTo(STATE.DOUBLE_JUMP);
  }

  _startDodge(direction) {
    this.dodgeFrames = 24;
    this.invincible  = true;
    if (direction === 'right') this.vx =  9;
    else if (direction === 'left') this.vx = -9;
    else this.vx *= 0.3;
    this._transitionTo(STATE.DODGE);
  }

  _tryDropThrough() {
    this.droppingThrough = true;
    this.dropTimer = 12;
    this.vy = 2;
  }

  _tryAttack(input) {
    if (!input.attackJustPressed && !input.specialJustPressed) return false;

    const airborne = !this.grounded;
    let attackId = null;

    if (input.specialJustPressed) {
      if (input.up)         attackId = 'specialUp';
      else if (input.down)  attackId = 'specialDown';
      else if (input.left || input.right) attackId = 'specialSide';
      else                  attackId = 'specialNeutral';
    } else {
      // Smash detection
      if (input.smashRight || input.smashLeft) attackId = 'smashSide';
      else if (input.smashUp)                  attackId = 'smashUp';
      else if (input.smashDown)                attackId = 'smashDown';
      // Tilt / aerial
      else if (airborne) {
        if (input.up)         attackId = 'aerialUp';
        else if (input.down)  attackId = 'aerialDown';
        else if ((input.right && !this.facingRight) || (input.left && this.facingRight))
                              attackId = 'aerialBack';
        else if (input.left || input.right) attackId = 'aerialForward';
        else                  attackId = 'aerialNeutral';
      } else {
        if (input.up)         attackId = 'tiltUp';
        else if (input.down)  attackId = 'tiltDown';
        else if (input.left || input.right) attackId = 'tiltSide';
        else                  attackId = 'jab';
      }
    }

    if (!attackId) return false;

    const attack = this.charDef.attacks[attackId];
    if (airborne && !attack.airOk) return false;

    this.currentAttackId = attackId;
    this.attackFrame     = 0;
    this.chargeFrames    = 0;
    this.chargingSmash   = attack.chargeMin > 0 && (input.smashHeld || true);
    this.hitEntities.clear();

    // Smash direction adjustment
    if (attackId === 'smashSide') {
      if (input.smashLeft) this.facingRight = false;
      if (input.smashRight) this.facingRight = true;
    }

    this._transitionTo(STATE.ATTACK);
    return true;
  }

  _tickEffects() {
    for (let i = this.pendingEffects.length - 1; i >= 0; i--) {
      this.pendingEffects[i].life--;
      if (this.pendingEffects[i].life <= 0) {
        this.pendingEffects.splice(i, 1);
      }
    }
  }

  // ── Public API ───────────────────────────────────────────────────────────────

  getActiveHitbox() {
    if (this.state !== STATE.ATTACK) return null;
    const attack = this.charDef.attacks[this.currentAttackId];
    const f = this.attackFrame;
    if (f < attack.startup || f >= attack.startup + attack.active) return null;

    const { xOff, yOff, w, h } = attack.hitbox;
    const x = this.facingRight
      ? this.x + xOff
      : this.x + this.w - xOff - w;
    return { x, y: this.y + yOff, w, h };
  }

  getHurtbox() {
    if (this.invincible) return null;
    return { x: this.x, y: this.y, w: this.w, h: this.h };
  }

  takeDamage(attackData, attackerFacingRight, chargeFrames, chargeMax) {
    const chargeMult = chargeMax > 0
      ? 1 + (Math.min(chargeFrames, chargeMax) / chargeMax) * 0.5
      : 1;
    const effectiveDmg = attackData.damage * chargeMult;

    this.percentage += effectiveDmg;

    const kb = Physics.calcKnockback(
      effectiveDmg,
      this.percentage,
      attackData.knockback.power,
      attackData.knockback.angle
    );

    const dirMult     = attackerFacingRight ? 1 : -1;
    const weightScale = 100 / this.charDef.weight;
    this.vx = kb.vx * dirMult * weightScale;
    this.vy = kb.vy * weightScale;

    const kbMag = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    this.hitstunFrames = Math.max(4, Math.floor(kbMag * 0.6 + 4));
    this.hitStop = Math.min(8, Math.floor(kbMag * 0.15 + 2));
    this.grounded = false;

    this.pendingEffects.push({
      x: this.x + this.w / 2,
      y: this.y + this.h / 2,
      r: 16 + effectiveDmg,
      color: attackData.effectColor,
      life: 18,
      maxLife: 18,
    });

    this._transitionTo(STATE.HITSTUN);
  }

  applyPhysics(stage) {
    Physics.applyGravity(this);

    const hasHInput = this.vx !== 0 &&
      (this.state === STATE.WALK || this.state === STATE.RUN ||
       this.state === STATE.JUMP || this.state === STATE.DOUBLE_JUMP ||
       this.state === STATE.FALL);
    Physics.applyFriction(this, hasHInput);

    this.x += this.vx;
    this.y += this.vy;

    const wasGrounded = this.grounded;
    this.grounded = false;

    const { landed } = Physics.platformCollision(this, stage.platforms);
    if (landed) {
      this.grounded = true;
      if (!wasGrounded) {
        this.hasDoubleJump = true;
        if (this.state === STATE.FALL || this.state === STATE.JUMP ||
            this.state === STATE.DOUBLE_JUMP || this.state === STATE.HITSTUN) {
          this._transitionTo(STATE.IDLE);
        }
      }
    }

    // Short-hop: release jump early → reduce jump height
    if ((this.state === STATE.JUMP || this.state === STATE.DOUBLE_JUMP) &&
        this.vy < 0 && this.frameCount - this.jumpPressedFrame <= 6) {
      // handled via input snapshot in main.js
    }
  }

  die() {
    this.stocks--;
    this.state = STATE.DEAD;
    this.deathTimer = 120;
    this.x = -9999;
    this.y = -9999;
    this.vx = 0;
    this.vy = 0;
  }

  respawn(point) {
    this.x = point.x - this.w / 2;
    this.y = point.y - this.h;
    this.vx = 0;
    this.vy = 0;
    this.percentage    = 0;
    this.hasDoubleJump = true;
    this.invincible    = true;
    this.respawnTimer  = 180;
    this.grounded      = false;
    this._transitionTo(STATE.RESPAWN);
  }

  getRenderData() {
    return {
      x: this.x, y: this.y,
      w: this.w, h: this.h,
      facingRight:     this.facingRight,
      state:           this.state,
      charId:          this.charId,
      charDef:         this.charDef,
      percentage:      this.percentage,
      stocks:          this.stocks,
      shieldHP:        this.shieldHP,
      invincible:      this.invincible,
      respawnTimer:    this.respawnTimer,
      activeHitbox:    this.getActiveHitbox(),
      pendingEffects:  this.pendingEffects,
      playerIndex:     this.playerIndex,
      frameCount:      this.frameCount,
    };
  }
}

// ─── AI Controller ────────────────────────────────────────────────────────────

const AI = (() => {
  let actionTimer = 0;
  let currentAction = null;

  function emptySnap() {
    return {
      left: false, right: false, up: false, down: false,
      jump: false, jumpJustPressed: false,
      attack: false, attackJustPressed: false,
      special: false, specialJustPressed: false,
      shield: false, shieldJustPressed: false,
      smashLeft: false, smashRight: false, smashUp: false, smashDown: false,
      smashHeld: false,
    };
  }

  function decide(cpu, player, stage, frameCount) {
    if (actionTimer > 0) {
      actionTimer--;
      return applyAction(currentAction, cpu, player);
    }

    const dist  = player.x - cpu.x;
    const absDist = Math.abs(dist);
    const goRight = dist > 0;

    // Recovery
    const mainFloor = stage.platforms[0];
    const onStage = cpu.x + cpu.w > mainFloor.x &&
                    cpu.x < mainFloor.x + mainFloor.w;
    if (!cpu.grounded && !onStage) {
      if (cpu.hasDoubleJump) {
        currentAction = 'jump';
        actionTimer = 10;
        return applyAction(currentAction, cpu, player);
      }
      currentAction = 'specialUp';
      actionTimer = 20;
      return applyAction(currentAction, cpu, player);
    }

    // Punish hitstun
    if (player.state === STATE.HITSTUN && absDist < 150) {
      currentAction = 'smashSide';
      actionTimer = 25;
      return applyAction(currentAction, cpu, player);
    }

    // Defend against incoming attack
    const hitbox = player.getActiveHitbox && player.getActiveHitbox();
    if (hitbox && absDist < 160) {
      if (Math.random() < 0.55) {
        currentAction = 'shield';
        actionTimer = 18;
      } else {
        currentAction = goRight ? 'dodgeLeft' : 'dodgeRight';
        actionTimer = 24;
      }
      return applyAction(currentAction, cpu, player);
    }

    // Approach & attack
    if (absDist > 250) {
      currentAction = goRight ? 'runRight' : 'runLeft';
      actionTimer = 12;
    } else if (absDist > 100) {
      currentAction = goRight ? 'walkRight' : 'walkLeft';
      actionTimer = 8;
      if (Math.random() < 0.03) {
        currentAction = 'jab';
        actionTimer = 20;
      }
    } else {
      const r = Math.random();
      if (r < 0.25) {
        currentAction = 'smashSide';
        actionTimer = 30;
      } else if (r < 0.45) {
        currentAction = goRight ? 'dodgeLeft' : 'dodgeRight';
        actionTimer = 24;
      } else if (r < 0.65) {
        currentAction = 'jump';
        actionTimer = 6;
      } else if (r < 0.80) {
        currentAction = 'tiltSide';
        actionTimer = 20;
      } else {
        currentAction = 'jab';
        actionTimer = 15;
      }
    }

    return applyAction(currentAction, cpu, player);
  }

  function applyAction(action, cpu, player) {
    const snap = emptySnap();
    const goRight = player.x > cpu.x;

    switch (action) {
      case 'runRight':
        snap.right = true; break;
      case 'runLeft':
        snap.left = true; break;
      case 'walkRight':
        snap.right = true; break;
      case 'walkLeft':
        snap.left = true; break;
      case 'jump':
        snap.jump = true; snap.jumpJustPressed = true; break;
      case 'jab':
        if (goRight) snap.right = true; else snap.left = true;
        snap.attack = true; snap.attackJustPressed = true; break;
      case 'tiltSide':
        if (goRight) snap.right = true; else snap.left = true;
        snap.attack = true; snap.attackJustPressed = true; break;
      case 'smashSide':
        if (goRight) { snap.right = true; snap.smashRight = true; }
        else         { snap.left  = true; snap.smashLeft  = true; }
        snap.attack = true; snap.attackJustPressed = true; break;
      case 'shield':
        snap.shield = true; snap.shieldJustPressed = true; break;
      case 'dodgeLeft':
        snap.shield = true; snap.left = true; snap.shieldJustPressed = true; break;
      case 'dodgeRight':
        snap.shield = true; snap.right = true; snap.shieldJustPressed = true; break;
      case 'specialUp':
        snap.up = true; snap.special = true; snap.specialJustPressed = true; break;
    }
    return snap;
  }

  return { decide };
})();
