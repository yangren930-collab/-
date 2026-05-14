'use strict';

// ─── Virtual gamepad layout (logical 1280×720) ────────────────────────────────
const VPAD = {
  // D-pad center
  dpadCX: 160, dpadCY: 570,
  dpadArmW: 70, dpadArmH: 55,

  // Face buttons (right side)
  jump:    { x: 1060, y: 460, r: 44, label: 'J' },
  attack:  { x: 1160, y: 520, r: 44, label: 'A' },
  special: { x: 1060, y: 580, r: 38, label: 'S' },
  shield:  { x: 1160, y: 460, r: 38, label: 'D' },
};

class InputManager {
  constructor(canvasEl) {
    this.canvas = canvasEl;
    this.scaleX = 1;
    this.scaleY = 1;
    this.offsetX = 0;
    this.offsetY = 0;

    // Raw state (updated by events)
    this._raw = this._emptyRaw();

    // Previous frame (for justPressed detection)
    this._prev = this._emptyRaw();

    // Smash timing
    this._dirPressFrame   = { left: -999, right: -999, up: -999, down: -999 };
    this._attackPressFrame = -999;
    this._frameCount = 0;

    this._bindKeyboard();
    this._bindTouch();
  }

  updateScale(scaleX, scaleY, offsetX, offsetY) {
    this.scaleX  = scaleX;
    this.scaleY  = scaleY;
    this.offsetX = offsetX || 0;
    this.offsetY = offsetY || 0;
  }

  // Called once at start of each frame
  pollFrame() {
    this._frameCount++;
    this._prev = Object.assign({}, this._raw);
  }

  getSnapshot(playerIndex) {
    if (playerIndex !== 0) return this._emptySnap();

    const r = this._raw;
    const p = this._prev;
    const f = this._frameCount;

    const SMASH_WINDOW = 4; // frames

    const jumpJP    = r.jump    && !p.jump;
    const attackJP  = r.attack  && !p.attack;
    const specialJP = r.special && !p.special;
    const shieldJP  = r.shield  && !p.shield;

    if (r.left  && !p.left)  this._dirPressFrame.left  = f;
    if (r.right && !p.right) this._dirPressFrame.right = f;
    if (r.up    && !p.up)    this._dirPressFrame.up    = f;
    if (r.down  && !p.down)  this._dirPressFrame.down  = f;
    if (attackJP) this._attackPressFrame = f;

    const smashRight = r.right && (f - this._dirPressFrame.right <= SMASH_WINDOW) && attackJP;
    const smashLeft  = r.left  && (f - this._dirPressFrame.left  <= SMASH_WINDOW) && attackJP;
    const smashUp    = r.up    && (f - this._dirPressFrame.up    <= SMASH_WINDOW) && attackJP;
    const smashDown  = r.down  && (f - this._dirPressFrame.down  <= SMASH_WINDOW) && attackJP;

    return {
      left:   r.left,
      right:  r.right,
      up:     r.up,
      down:   r.down,
      jump:   r.jump,
      jumpJustPressed:   jumpJP,
      attack: r.attack,
      attackJustPressed: attackJP,
      special: r.special,
      specialJustPressed: specialJP,
      shield: r.shield,
      shieldJustPressed: shieldJP,
      smashLeft,
      smashRight,
      smashUp,
      smashDown,
      smashHeld: r.attack && !attackJP,
    };
  }

  getVirtualGamepadRenderData() {
    return { vpad: VPAD, raw: Object.assign({}, this._raw) };
  }

  // ── Keyboard ─────────────────────────────────────────────────────────────────

  _bindKeyboard() {
    const map = {
      ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down',
      z: 'jump', Z: 'jump',
      x: 'attack', X: 'attack',
      c: 'special', C: 'special',
      v: 'shield', V: 'shield',
    };

    window.addEventListener('keydown', (e) => {
      if (map[e.key] !== undefined) {
        this._raw[map[e.key]] = true;
        e.preventDefault();
      }
    });
    window.addEventListener('keyup', (e) => {
      if (map[e.key] !== undefined) {
        this._raw[map[e.key]] = false;
      }
    });
  }

  // ── Touch ─────────────────────────────────────────────────────────────────────

  _bindTouch() {
    const el = this.canvas;

    const onTouch = (e) => {
      e.preventDefault();
      const newState = {
        left: false, right: false, up: false, down: false,
        jump: false, attack: false, special: false, shield: false,
      };

      for (const t of e.touches) {
        const lx = (t.clientX - this.offsetX) / this.scaleX;
        const ly = (t.clientY - this.offsetY) / this.scaleY;
        this._classifyTouch(lx, ly, newState);
      }

      // Preserve keyboard state, merge touch
      this._raw.left    = newState.left    || this._kbRaw('left');
      this._raw.right   = newState.right   || this._kbRaw('right');
      this._raw.up      = newState.up      || this._kbRaw('up');
      this._raw.down    = newState.down    || this._kbRaw('down');
      this._raw.jump    = newState.jump    || this._kbRaw('jump');
      this._raw.attack  = newState.attack  || this._kbRaw('attack');
      this._raw.special = newState.special || this._kbRaw('special');
      this._raw.shield  = newState.shield  || this._kbRaw('shield');
    };

    el.addEventListener('touchstart',  onTouch, { passive: false });
    el.addEventListener('touchmove',   onTouch, { passive: false });
    el.addEventListener('touchend',    onTouch, { passive: false });
    el.addEventListener('touchcancel', onTouch, { passive: false });
  }

  _classifyTouch(lx, ly, state) {
    const v = VPAD;

    // D-pad zone (left half)
    if (lx < 640) {
      const dx = lx - v.dpadCX;
      const dy = ly - v.dpadCY;
      const deadR = 28;
      if (Math.abs(dx) > deadR || Math.abs(dy) > deadR) {
        if (Math.abs(dx) >= Math.abs(dy)) {
          if (dx > 0) state.right = true;
          else        state.left  = true;
        } else {
          if (dy > 0) state.down = true;
          else        state.up   = true;
        }
        // Allow diagonal
        if (Math.abs(dx) > deadR) {
          if (dx > 0) state.right = true;
          else        state.left  = true;
        }
        if (Math.abs(dy) > deadR) {
          if (dy > 0) state.down = true;
          else        state.up   = true;
        }
      }
      return;
    }

    // Button zone (right half)
    for (const [key, btn] of Object.entries({
      jump: v.jump, attack: v.attack,
      special: v.special, shield: v.shield,
    })) {
      const dist = Math.sqrt((lx - btn.x) ** 2 + (ly - btn.y) ** 2);
      if (dist <= btn.r + 16) {
        state[key] = true;
      }
    }
  }

  // Stubs — keyboard state is tracked via _raw directly
  _kbRaw(key) { return false; }

  _emptyRaw() {
    return {
      left: false, right: false, up: false, down: false,
      jump: false, attack: false, special: false, shield: false,
    };
  }

  _emptySnap() {
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
}
