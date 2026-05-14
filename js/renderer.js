'use strict';

const LOGICAL_W = 1280;
const LOGICAL_H = 720;

class Renderer {
  constructor(canvasEl, inputManager) {
    this.canvas = canvasEl;
    this.ctx    = canvasEl.getContext('2d');
    this.inputManager = inputManager;
    this.resize();
  }

  resize() {
    const sw = window.innerWidth;
    const sh = window.innerHeight;
    const scale = Math.min(sw / LOGICAL_W, sh / LOGICAL_H);
    const cssW  = Math.floor(LOGICAL_W * scale);
    const cssH  = Math.floor(LOGICAL_H * scale);
    const offX  = Math.floor((sw - cssW) / 2);
    const offY  = Math.floor((sh - cssH) / 2);

    this.canvas.width  = LOGICAL_W;
    this.canvas.height = LOGICAL_H;
    this.canvas.style.width  = cssW + 'px';
    this.canvas.style.height = cssH + 'px';
    this.canvas.style.left   = offX + 'px';
    this.canvas.style.top    = offY + 'px';

    this.inputManager.updateScale(scale, scale, offX, offY);
  }

  draw(gameState, fighters, stage) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, LOGICAL_W, LOGICAL_H);

    switch (gameState.screen) {
      case 'TITLE':       this._drawTitle(gameState);             break;
      case 'CHAR_SELECT': this._drawCharSelect(gameState);        break;
      case 'BATTLE':      this._drawBattle(fighters, stage);      break;
      case 'RESULTS':     this._drawResults(gameState, fighters); break;
    }
  }

  // ── Title ─────────────────────────────────────────────────────────────────────

  _drawTitle(gs) {
    const ctx = this.ctx;
    this._drawGradientBg('#0a0a1a', '#1a0a2e');

    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font      = 'bold 96px sans-serif';
    ctx.fillText('SmashJS', LOGICAL_W / 2, 280);

    ctx.font      = 'bold 28px sans-serif';
    ctx.fillStyle = '#aaaaff';
    ctx.fillText('Xperia 横画面 専用', LOGICAL_W / 2, 340);

    const blink = Math.floor(Date.now() / 500) % 2 === 0;
    if (blink) {
      ctx.fillStyle = '#ffffff';
      ctx.font      = '36px sans-serif';
      ctx.fillText('タップしてスタート', LOGICAL_W / 2, 460);
    }
    ctx.restore();
  }

  // ── Char select ───────────────────────────────────────────────────────────────

  _drawCharSelect(gs) {
    const ctx = this.ctx;
    this._drawGradientBg('#0d1117', '#161b22');

    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font      = 'bold 48px sans-serif';
    ctx.fillText('キャラ選択', LOGICAL_W / 2, 80);

    ctx.font      = '24px sans-serif';
    ctx.fillStyle = '#888888';
    ctx.fillText('P1 で選択 / CPU はランダム', LOGICAL_W / 2, 120);

    const charKeys = Object.keys(CHARACTERS);
    const boxW = 240, boxH = 320;
    const totalW = charKeys.length * (boxW + 40) - 40;
    const startX = (LOGICAL_W - totalW) / 2;

    charKeys.forEach((key, i) => {
      const cd  = CHARACTERS[key];
      const bx  = startX + i * (boxW + 40);
      const by  = 180;
      const sel = gs.p1CharIndex === i;

      // Box
      ctx.fillStyle = sel ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)';
      this._roundRect(ctx, bx, by, boxW, boxH, 16, true, false);

      if (sel) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth   = 3;
        this._roundRect(ctx, bx, by, boxW, boxH, 16, false, true);
      }

      // Character preview
      this._drawCharacterShape(ctx, cd, bx + boxW / 2 - cd.bodyW / 2, by + 50, true);

      ctx.fillStyle = '#ffffff';
      ctx.font      = 'bold 22px sans-serif';
      ctx.fillText(cd.name, bx + boxW / 2, by + boxH - 90);

      ctx.fillStyle = '#aaaaaa';
      ctx.font      = '16px sans-serif';
      ctx.fillText(`重: ${cd.weight}  速: ${cd.runSpeed}`, bx + boxW / 2, by + boxH - 60);
    });

    // Touch hint
    ctx.fillStyle = '#ffffff';
    ctx.font      = '22px sans-serif';
    ctx.fillText('← →  で選択  |  攻撃ボタンで決定', LOGICAL_W / 2, LOGICAL_H - 40);
    ctx.restore();
  }

  // ── Battle ────────────────────────────────────────────────────────────────────

  _drawBattle(fighters, stage) {
    this._drawBackground(stage);
    this._drawStage(stage);

    for (const f of fighters) {
      const rd = f.getRenderData();
      this._drawFighter(rd);
      for (const eff of rd.pendingEffects) {
        this._drawHitEffect(eff);
      }
    }

    this._drawHUD(fighters);
    this._drawVirtualGamepad();
  }

  _drawBackground(stage) {
    this._drawGradientBg(stage.bgColor, stage.bgAccent);
  }

  _drawStage(stage) {
    const ctx = this.ctx;
    for (const plat of stage.platforms) {
      ctx.fillStyle = plat.color;
      this._roundRect(ctx, plat.x, plat.y, plat.w, plat.h, 6, true, false);

      // Top highlight
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      ctx.fillRect(plat.x + 4, plat.y + 2, plat.w - 8, 4);
    }
  }

  _drawFighter(rd) {
    const ctx = this.ctx;
    if (rd.state === STATE.DEAD) return;

    ctx.save();

    // Respawn blink
    if (rd.invincible && rd.respawnTimer > 0) {
      const blink = Math.floor(rd.frameCount / 4) % 2 === 0;
      ctx.globalAlpha = blink ? 0.4 : 1.0;
    }

    this._drawCharacterShape(ctx, rd.charDef, rd.x, rd.y, rd.facingRight);

    // Shield
    if (rd.state === STATE.SHIELD) {
      const r = 50 * (rd.shieldHP / 100);
      const cx = rd.x + rd.w / 2;
      const cy = rd.y + rd.h / 2;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle   = 'rgba(100,180,255,0.35)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(180,220,255,0.85)';
      ctx.lineWidth   = 3;
      ctx.stroke();
    }

    // Hitbox (debug-style — semi-transparent)
    if (rd.activeHitbox) {
      const hb = rd.activeHitbox;
      ctx.strokeStyle = 'rgba(255, 50, 50, 0.75)';
      ctx.lineWidth   = 2;
      ctx.strokeRect(hb.x, hb.y, hb.w, hb.h);
      ctx.fillStyle   = 'rgba(255, 50, 50, 0.18)';
      ctx.fillRect(hb.x, hb.y, hb.w, hb.h);
    }

    ctx.restore();
  }

  _drawCharacterShape(ctx, cd, x, y, facingRight) {
    ctx.save();

    const cx = x + cd.bodyW / 2;

    if (!facingRight) {
      ctx.translate(cx * 2, 0);
      ctx.scale(-1, 1);
    }

    // Body
    ctx.fillStyle = cd.colorBody;
    this._roundRect(ctx, x, y + cd.bodyH * 0.28, cd.bodyW, cd.bodyH * 0.72, 8, true, false);

    // Head
    const headR = cd.bodyW * 0.38;
    const headCX = x + cd.bodyW / 2;
    const headCY = y + cd.bodyH * 0.22;
    ctx.fillStyle = cd.colorHead;
    ctx.beginPath();
    ctx.arc(headCX, headCY, headR, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    const eyeOffX = headR * 0.35;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(headCX + eyeOffX, headCY - headR * 0.1, headR * 0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#111111';
    ctx.beginPath();
    ctx.arc(headCX + eyeOffX + 2, headCY - headR * 0.1, headR * 0.11, 0, Math.PI * 2);
    ctx.fill();

    // Fist (attack arm)
    const fistR = cd.bodyW * 0.18;
    const fistX = x + cd.bodyW + fistR * 0.5;
    const fistY = y + cd.bodyH * 0.55;
    ctx.fillStyle = cd.colorDetail;
    ctx.beginPath();
    ctx.arc(fistX, fistY, fistR, 0, Math.PI * 2);
    ctx.fill();

    // Leg hint
    ctx.fillStyle = cd.colorDetail;
    ctx.fillRect(x + 4,           y + cd.bodyH - 12, cd.bodyW * 0.35, 12);
    ctx.fillRect(x + cd.bodyW * 0.55, y + cd.bodyH - 12, cd.bodyW * 0.35, 12);

    ctx.restore();
  }

  _drawHitEffect(eff) {
    const ctx  = this.ctx;
    const prog = eff.life / eff.maxLife;
    const r    = eff.r * prog;
    ctx.save();
    ctx.globalAlpha = prog * 0.85;
    ctx.fillStyle   = eff.color;
    ctx.beginPath();
    ctx.arc(eff.x, eff.y, r, 0, Math.PI * 2);
    ctx.fill();
    // Spiky ring
    ctx.strokeStyle = eff.color;
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.arc(eff.x, eff.y, r * 1.4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  _drawHUD(fighters) {
    const ctx = this.ctx;

    fighters.forEach((f, i) => {
      const rd = f.getRenderData();
      const isLeft = i === 0;
      const bx = isLeft ? 20 : LOGICAL_W - 250;
      const by = LOGICAL_H - 120;
      const w  = 230, h = 110;

      // Background panel
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      this._roundRect(ctx, bx, by, w, h, 10, true, false);

      // Border in char color
      ctx.strokeStyle = rd.charDef.colorBody;
      ctx.lineWidth   = 2;
      this._roundRect(ctx, bx, by, w, h, 10, false, true);

      // Name
      ctx.fillStyle = rd.charDef.colorBody;
      ctx.font      = 'bold 16px sans-serif';
      ctx.textAlign = isLeft ? 'left' : 'right';
      const nameX   = isLeft ? bx + 10 : bx + w - 10;
      ctx.fillText(rd.charDef.name + (i === 0 ? '  P1' : '  CPU'), nameX, by + 22);

      // Percentage
      ctx.fillStyle = rd.percentage >= 100 ? '#ff4444' : '#ffffff';
      ctx.font      = `bold ${rd.percentage >= 100 ? 52 : 58}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(Math.floor(rd.percentage) + '%', bx + w / 2, by + 76);

      // Stocks (circles)
      const stockSpacing = 22;
      const totalSW = rd.stocks * stockSpacing - 4;
      const sx = bx + (w - totalSW) / 2;
      for (let s = 0; s < rd.stocks; s++) {
        ctx.fillStyle = rd.charDef.colorBody;
        ctx.beginPath();
        ctx.arc(sx + s * stockSpacing + 7, by + 98, 7, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Center — stage name / frame count (optional debug)
    // Uncomment for debug: this._drawDebugInfo(fighters);
  }

  _drawVirtualGamepad() {
    const ctx  = this.ctx;
    const data = this.inputManager.getVirtualGamepadRenderData();
    const vp   = data.vpad;
    const raw  = data.raw;

    ctx.save();
    ctx.globalAlpha = 0.45;

    // D-pad arms
    const dCX = vp.dpadCX, dCY = vp.dpadCY;
    const aw  = vp.dpadArmW, ah = vp.dpadArmH;

    const dpadParts = [
      { key: 'left',  rx: dCX - aw - 8,  ry: dCY - ah / 2, rw: aw, rh: ah },
      { key: 'right', rx: dCX + 8,        ry: dCY - ah / 2, rw: aw, rh: ah },
      { key: 'up',    rx: dCX - ah / 2,   ry: dCY - aw - 8, rw: ah, rh: aw },
      { key: 'down',  rx: dCX - ah / 2,   ry: dCY + 8,      rw: ah, rh: aw },
    ];

    for (const part of dpadParts) {
      ctx.fillStyle = raw[part.key] ? '#ffffff' : '#666666';
      this._roundRect(ctx, part.rx, part.ry, part.rw, part.rh, 6, true, false);
    }

    // Center nub
    ctx.fillStyle = '#444444';
    this._roundRect(ctx, dCX - ah / 2, dCY - ah / 2, ah, ah, 6, true, false);

    // Face buttons
    const btns = [
      { cfg: vp.jump,    label: 'J',  color: '#44cc44' },
      { cfg: vp.attack,  label: 'A',  color: '#cc4444' },
      { cfg: vp.special, label: 'S',  color: '#4444cc' },
      { cfg: vp.shield,  label: 'D',  color: '#cccc44' },
    ];
    const rawKeys = ['jump', 'attack', 'special', 'shield'];

    btns.forEach((btn, i) => {
      const pressed = raw[rawKeys[i]];
      ctx.fillStyle = pressed ? btn.color : '#555555';
      ctx.beginPath();
      ctx.arc(btn.cfg.x, btn.cfg.y, btn.cfg.r, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font      = `bold ${btn.cfg.r * 0.7}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(btn.cfg.label, btn.cfg.x, btn.cfg.y);
    });

    ctx.textBaseline = 'alphabetic';
    ctx.restore();
  }

  // ── Results ───────────────────────────────────────────────────────────────────

  _drawResults(gs, fighters) {
    this._drawGradientBg('#0a0a0a', '#1a1a1a');
    const ctx = this.ctx;

    ctx.save();
    ctx.textAlign = 'center';

    if (gs.winner) {
      const cd = gs.winner.charDef;
      ctx.fillStyle = cd.colorBody;
      ctx.font      = 'bold 72px sans-serif';
      ctx.fillText(cd.name + ' の勝利！', LOGICAL_W / 2, 280);

      // Draw winner character
      this._drawCharacterShape(ctx, cd,
        LOGICAL_W / 2 - cd.bodyW / 2,
        320, true);
    }

    const blink = Math.floor(Date.now() / 600) % 2 === 0;
    if (blink && gs.resultTimer < 180) {
      ctx.fillStyle = '#ffffff';
      ctx.font      = '32px sans-serif';
      ctx.fillText('タップでもう一度', LOGICAL_W / 2, LOGICAL_H - 60);
    }

    ctx.restore();
  }

  // ── Utilities ─────────────────────────────────────────────────────────────────

  _drawGradientBg(topColor, bottomColor) {
    const ctx  = this.ctx;
    const grad = ctx.createLinearGradient(0, 0, 0, LOGICAL_H);
    grad.addColorStop(0, topColor);
    grad.addColorStop(1, bottomColor);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);
  }

  _roundRect(ctx, x, y, w, h, r, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    if (fill)   ctx.fill();
    if (stroke) ctx.stroke();
  }
}
