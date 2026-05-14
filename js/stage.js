'use strict';

const STAGE_DEFS = {
  battlefield: {
    id: 'battlefield',
    name: 'バトルフィールド',
    bgColor: '#1a1a2e',
    bgAccent: '#16213e',
    blastZones: { left: -200, right: 1480, top: -300, bottom: 900 },
    platforms: [
      // Main floor (solid)
      { x: 240, y: 520, w: 800, h: 25, solid: true,  color: '#6a4c17' },
      // Left soft
      { x: 180, y: 370, w: 240, h: 18, solid: false, color: '#8a6c27' },
      // Center soft
      { x: 520, y: 300, w: 240, h: 18, solid: false, color: '#8a6c27' },
      // Right soft
      { x: 860, y: 370, w: 240, h: 18, solid: false, color: '#8a6c27' },
    ],
    spawnPoints: [
      { x: 480, y: 480 },
      { x: 800, y: 480 },
    ],
  },

  final: {
    id: 'final',
    name: 'ファイナルデスティネーション',
    bgColor: '#0d0d1a',
    bgAccent: '#1a0d2e',
    blastZones: { left: -200, right: 1480, top: -300, bottom: 900 },
    platforms: [
      { x: 200, y: 500, w: 880, h: 30, solid: true, color: '#2a1a6a' },
    ],
    spawnPoints: [
      { x: 500, y: 460 },
      { x: 780, y: 460 },
    ],
  },
};

function getStage(id) {
  return STAGE_DEFS[id] || STAGE_DEFS.battlefield;
}
