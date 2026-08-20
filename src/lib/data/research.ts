import type { PlanetId, RdDef } from './types';

// --- GLOBALES : payées en EL (Lune), effet sur tout l'empire ---
// --- LOCALES : payées dans la devise de la planète concernée, effet limité à celle-ci ---
export const RD_DEFS: readonly RdDef[] = [
  {
    key: 'condensateurs',
    name: 'Condensateurs de Flux',
    desc: 'Double la puissance du clic sur tous les mondes.',
    cost: 250,
    scope: 'global',
  },
  {
    key: 'nanorobots',
    name: "Nanorobots d'Assemblage",
    desc: '-15% sur le coût de toutes les infrastructures.',
    cost: 600,
    scope: 'global',
  },
  { key: 'exo', name: 'Exosquelette de Forage', desc: 'Double à nouveau la puissance du clic manuel.', cost: 3000, scope: 'global' },
  { key: 'fusion', name: 'Fusion Polarisée', desc: '+50% production passive globale.', cost: 4000, scope: 'global' },
  {
    key: 'neural',
    name: 'Synchronisation Neurale',
    desc: 'Chaque clic ajoute 25% de la production/s de la planète active.',
    cost: 15000,
    scope: 'global',
  },
  { key: 'distorsion', name: 'Moteur à Distorsion', desc: 'Divise par 2 le coût de déblocage des planètes.', cost: 20000, scope: 'global' },
  {
    key: 'quantum',
    name: 'Amplificateur Quantique',
    desc: 'Triple une nouvelle fois la puissance du clic manuel.',
    cost: 60000,
    scope: 'global',
  },

  { key: 'moonDrill', name: 'Foreuse Renforcée', desc: 'Production locale ×2 sur la Lune.', cost: 1200, scope: 'local', planetId: 'moon' },
  {
    key: 'moonClick',
    name: 'Poigne Lunaire',
    desc: 'Puissance de clic locale ×2 sur la Lune.',
    cost: 2500,
    scope: 'local',
    planetId: 'moon',
  },

  {
    key: 'marsAtmo',
    name: 'Stabilisateur Atmosphérique',
    desc: 'Production locale ×2 sur Mars.',
    cost: 9000,
    scope: 'local',
    planetId: 'mars',
  },
  {
    key: 'marsRover2',
    name: 'Essaim de Rovers',
    desc: 'Puissance de clic locale ×2 sur Mars.',
    cost: 16000,
    scope: 'local',
    planetId: 'mars',
  },

  {
    key: 'europaThermal',
    name: 'Amplification Hydrothermale',
    desc: 'Production locale ×2 sur Europe.',
    cost: 14000,
    scope: 'local',
    planetId: 'europa',
  },
  {
    key: 'europaSonar',
    name: 'Sonar Profond',
    desc: 'Puissance de clic locale ×2 sur Europe.',
    cost: 26000,
    scope: 'local',
    planetId: 'europa',
  },

  {
    key: 'encGeyser',
    name: 'Geysers Canalisés',
    desc: 'Production locale ×2 sur Encelade.',
    cost: 40000,
    scope: 'local',
    planetId: 'enceladus',
  },
  {
    key: 'encCryo',
    name: 'Cryo-Injecteurs',
    desc: 'Puissance de clic locale ×2 sur Encelade.',
    cost: 70000,
    scope: 'local',
    planetId: 'enceladus',
  },

  {
    key: 'titanMethane',
    name: 'Raffinage Catalytique',
    desc: 'Production locale ×2 sur Titan.',
    cost: 300000,
    scope: 'local',
    planetId: 'titan',
  },
  {
    key: 'titanGate2',
    name: 'Stabilisateur de Portail',
    desc: 'Puissance de clic locale ×2 sur Titan.',
    cost: 550000,
    scope: 'local',
    planetId: 'titan',
  },
];

export const LOCAL_PASSIVE_RD_BY_PLANET: Record<PlanetId, string> = {
  moon: 'moonDrill',
  mars: 'marsAtmo',
  europa: 'europaThermal',
  enceladus: 'encGeyser',
  titan: 'titanMethane',
};
export const LOCAL_CLICK_RD_BY_PLANET: Record<PlanetId, string> = {
  moon: 'moonClick',
  mars: 'marsRover2',
  europa: 'europaSonar',
  enceladus: 'encCryo',
  titan: 'titanGate2',
};
