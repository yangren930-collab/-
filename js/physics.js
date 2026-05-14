'use strict';

const Physics = {
  GRAVITY:         0.55,
  MAX_FALL_SPEED:  18.0,
  FRICTION_GROUND: 0.82,
  FRICTION_AIR:    0.96,
  HITSTUN_DECAY:   0.95,
  SHIELD_DECAY:    1.2,
  SHIELD_MAX_HP:   100.0,
  SHIELD_REGEN:    0.3,

  calcKnockback(damageDelt, targetPercentage, knockbackPower, angleDeg) {
    const magnitude = (damageDelt * 0.1 + 2) * (1 + targetPercentage / 100) * knockbackPower;
    const rad = angleDeg * Math.PI / 180;
    return {
      vx:  magnitude * Math.cos(rad),
      vy: -magnitude * Math.sin(rad),
    };
  },

  applyGravity(fighter) {
    if (!fighter.grounded) {
      fighter.vy += Physics.GRAVITY;
      if (fighter.vy > fighter.charDef.fallSpeed) {
        fighter.vy = fighter.charDef.fallSpeed;
      }
    }
  },

  applyFriction(fighter, hasHorizontalInput) {
    if (fighter.grounded && !hasHorizontalInput) {
      fighter.vx *= Physics.FRICTION_GROUND;
      if (Math.abs(fighter.vx) < 0.5) fighter.vx = 0;
    } else if (!fighter.grounded) {
      fighter.vx *= Physics.FRICTION_AIR;
    }
  },

  rectOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x &&
           a.y < b.y + b.h && a.y + a.h > b.y;
  },

  platformCollision(fighter, platforms) {
    let landed = false;
    let landedPlatform = null;

    const currBottom = fighter.y + fighter.h;
    const prevBottom = currBottom - fighter.vy;
    const currLeft   = fighter.x;
    const currRight  = fighter.x + fighter.w;
    const currTop    = fighter.y;
    const prevTop    = currTop - fighter.vy;

    for (const plat of platforms) {
      const platLeft  = plat.x;
      const platRight = plat.x + plat.w;
      const platTop   = plat.y;
      const platBot   = plat.y + plat.h;

      const hOverlap = currRight > platLeft && currLeft < platRight;
      if (!hOverlap) continue;

      if (plat.solid) {
        // Top surface
        if (prevBottom <= platTop + 1 && currBottom >= platTop && fighter.vy >= 0) {
          fighter.y  = platTop - fighter.h;
          fighter.vy = 0;
          landed = true;
          landedPlatform = plat;
        }
        // Ceiling
        if (prevTop >= platBot - 1 && currTop < platBot && fighter.vy < 0) {
          fighter.y  = platBot;
          fighter.vy = 0;
        }
        // Left wall
        const prevRight = currRight - fighter.vx;
        if (prevRight <= platLeft + 1 && currRight > platLeft) {
          const vOverlap = currBottom > platTop && currTop < platBot;
          if (vOverlap) {
            fighter.x  = platLeft - fighter.w;
            fighter.vx = 0;
          }
        }
        // Right wall
        const prevLeft = currLeft - fighter.vx;
        if (prevLeft >= platRight - 1 && currLeft < platRight) {
          const vOverlap = currBottom > platTop && currTop < platBot;
          if (vOverlap) {
            fighter.x  = platRight;
            fighter.vx = 0;
          }
        }
      } else {
        // One-way: only top surface when falling
        if (fighter.vy >= 0 && prevBottom <= platTop + 1 && currBottom >= platTop) {
          if (!fighter.droppingThrough) {
            fighter.y  = platTop - fighter.h;
            fighter.vy = 0;
            landed = true;
            landedPlatform = plat;
          }
        }
      }
    }

    return { landed, platform: landedPlatform };
  },

  blastZoneCheck(fighter, blastZones) {
    return fighter.x + fighter.w < blastZones.left  ||
           fighter.x             > blastZones.right  ||
           fighter.y + fighter.h < blastZones.top    ||
           fighter.y             > blastZones.bottom;
  },
};
