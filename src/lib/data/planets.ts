import type { PlanetDef, PlanetId } from './types';

// Terre : point de départ narratif (déjà colonisée, non jouable) — utilisée
// uniquement pour l'animation de décollage initiale.
export const EARTH_GRADIENT = 'radial-gradient(circle at 35% 32%, #4fb35a, #1c7ed6 70%)';
export const EARTH_GLOW = '#1c7ed6';
export const EARTH_NAME = 'Terre';

export const PLANET_DEFS: readonly PlanetDef[] = [
  {
    id: 'moon', name: 'Lune', currency: 'EL', clickMult: 1, unlockCost: 0, unlockFrom: null,
    habitability: "À seulement 384 400 km de la Terre, la Lune est l'étape la plus proche de toute expansion spatiale. Sa gravité 6 fois plus faible facilite les lancements, et de la glace d'eau a été détectée dans les cratères permanemment ombragés de ses pôles.",
    gradient: 'radial-gradient(circle at 35% 32%, #eaecef, #495057 70%)', glow: '#e9ecef',
    signature: 'massdriver',
    buildings: [
      { key: 'regolith', name: 'Foreuse à Régolithe', icon: '🪨', desc: "Broie la poussière lunaire pour en tirer des matériaux de construction bruts.", baseCost: 15, baseProd: 0.5 },
      { key: 'dome', name: 'Dôme Habitable', icon: '🛖', desc: "Bulle pressurisée qui protège les colons du vide et des radiations solaires.", baseCost: 100, baseProd: 3.0 },
      { key: 'dish', name: 'Antenne Radiotélescope', icon: '📡', desc: "Écoute l'espace profond depuis la face cachée, à l'abri des parasites terrestres.", baseCost: 600, baseProd: 15.0 },
      { key: 'railgun', name: 'Catapulte Magnétique', icon: '🚀', desc: "Rail électromagnétique qui propulse le matériel excédentaire directement vers l'orbite.", baseCost: 3500, baseProd: 60.0 },
      { key: 'village', name: 'Colonie Lunaire Autonome', icon: '🏘️', desc: "Cité entièrement creusée dans le régolithe, capable de vivre sans le moindre ravitaillement terrestre.", baseCost: 23000, baseProd: 400.0 }
    ]
  },
  {
    id: 'mars', name: 'Mars', currency: 'EM', clickMult: 3, unlockCost: 1200, unlockFrom: 'moon',
    habitability: "Mars possède un jour de 24h37, très proche du nôtre, et des calottes polaires riches en glace d'eau. C'est la cible la plus étudiée pour une colonisation humaine durable, malgré une atmosphère 100 fois plus fine que celle de la Terre.",
    gradient: 'radial-gradient(circle at 35% 32%, #f6624a, #a61c1c 70%)', glow: '#ff922b',
    signature: 'terraform',
    buildings: [
      { key: 'greenhouse', name: 'Serre Pressurisée', icon: '🌱', desc: "Cultive les premières plantes terrestres sous une atmosphère entièrement contrôlée.", baseCost: 30, baseProd: 0.8 },
      { key: 'deepdrill', name: 'Foreuse Profonde', icon: '⛏️', desc: "Atteint les nappes de glace enfouies sous le sol martien pour en tirer de l'eau.", baseCost: 200, baseProd: 4.5 },
      { key: 'converter', name: 'Convertisseur Atmosphérique', icon: '🌫️', desc: "Épaissit lentement l'atmosphère martienne — l'effet est visible à l'œil nu sur la planète.", baseCost: 1100, baseProd: 20.0 },
      { key: 'rover', name: 'Rover Autonome', icon: '🤖', desc: "Explore la surface en continu et cartographie de nouveaux gisements à extraire.", baseCost: 6000, baseProd: 75.0 },
      { key: 'village', name: 'Cité-Dôme Autonome', icon: '🏙️', desc: "Métropole sous dôme où l'atmosphère transformée permet enfin l'agriculture à ciel ouvert.", baseCost: 39000, baseProd: 490.0 }
    ]
  },
  {
    id: 'europa', name: 'Europe', currency: 'EE', clickMult: 8, unlockCost: 18000, unlockFrom: 'mars',
    habitability: "Cette lune de Jupiter cache sous sa croûte de glace un océan liquide contenant probablement deux fois plus d'eau que tous les océans terrestres réunis. C'est l'un des meilleurs candidats du système solaire pour abriter une forme de vie.",
    gradient: 'radial-gradient(circle at 35% 32%, #eaf7ff, #1971c2 70%)', glow: '#22d3ee',
    signature: 'icecracks',
    buildings: [
      { key: 'cryodrill', name: 'Foreuse Cryogénique', icon: '🧊', desc: "Perce la banquise pour atteindre l'océan liquide qui dort sous la glace.", baseCost: 45, baseProd: 1.1 },
      { key: 'submarine', name: 'Sonde Sous-Glaciaire', icon: '🛸', desc: "Explore l'océan souterrain à la recherche de traces de vie microbienne.", baseCost: 280, baseProd: 6.0 },
      { key: 'vent', name: 'Station Hydrothermale', icon: '♨️', desc: "Capte la chaleur des cheminées volcaniques actives au fond de l'océan.", baseCost: 1500, baseProd: 26.0 },
      { key: 'seismic', name: 'Balise Sismique', icon: '📶', desc: "Cartographie par écholocation les failles profondes de la croûte glacée.", baseCost: 8000, baseProd: 90.0 },
      { key: 'village', name: 'Cité Sous-Glaciaire Autonome', icon: '🏛️', desc: "Cité immergée dans l'océan, alimentée par les cheminées hydrothermales, indépendante de la surface.", baseCost: 50000, baseProd: 570.0 }
    ]
  },
  {
    id: 'enceladus', name: 'Encelade', currency: 'EN', clickMult: 14, unlockCost: 90000, unlockFrom: 'europa',
    habitability: "Cette petite lune de Saturne projette depuis son pôle sud des geysers de vapeur d'eau chargés de composés organiques et de nanoparticules de silice — des indices d'une activité hydrothermale active dans son océan souterrain.",
    gradient: 'radial-gradient(circle at 35% 32%, #f5faff, #8aa8c2 70%)', glow: '#bfe6ff',
    signature: 'geysers',
    buildings: [
      { key: 'geyser', name: 'Capteur de Geyser', icon: '💦', desc: "Récolte les jets de vapeur d'eau émis par les fractures polaires, riches en composés organiques.", baseCost: 90, baseProd: 2.0 },
      { key: 'tigerdrill', name: 'Foreuse des Rayures de Tigre', icon: '❄️', desc: "Perce les fameuses « rayures de tigre » pour atteindre l'océan liquide sous la banquise sud.", baseCost: 550, baseProd: 11.0 },
      { key: 'nanoprobe', name: 'Nanosonde Silicatée', icon: '🔬', desc: "Analyse les nanoparticules de silice éjectées par les geysers, indice d'une activité hydrothermale.", baseCost: 3200, baseProd: 55.0 },
      { key: 'array', name: 'Réseau de Collecte Orbital', icon: '🛰️', desc: "Constellation de capteurs en orbite basse qui intercepte en continu les panaches de vapeur.", baseCost: 20000, baseProd: 210.0 },
      { key: 'village', name: 'Village des Geysers Autonome', icon: '🏘️', desc: "Communauté permanente installée près des rayures de tigre, vivant entièrement de la chaleur et de l'eau des geysers.", baseCost: 130000, baseProd: 1400.0 }
    ]
  },
  {
    id: 'titan', name: 'Titan', currency: 'ET', clickMult: 20, unlockCost: 400000, unlockFrom: 'enceladus',
    habitability: "Titan est la seule lune du système solaire dotée d'une atmosphère dense et de lacs liquides stables en surface — faits de méthane et d'éthane plutôt que d'eau. Sa chimie prébiotique fascine les scientifiques en quête d'indices sur l'origine de la vie.",
    gradient: 'radial-gradient(circle at 35% 32%, #ffc233, #d9480f 70%)', glow: '#ffd43b',
    signature: 'stargate',
    buildings: [
      { key: 'turbine', name: 'Éolienne Cryogénique', icon: '🌬️', desc: "Capte les vents d'azote glacial qui balaient la surface pour produire de l'énergie.", baseCost: 500, baseProd: 3.0 },
      { key: 'refinery', name: 'Raffinerie de Méthane', icon: '🔥', desc: "Transforme les lacs d'hydrocarbures liquides en carburant utilisable par la flotte.", baseCost: 4000, baseProd: 16.0 },
      { key: 'net', name: 'Filet Atmosphérique', icon: '🕸️', desc: "Collecte en haute atmosphère les particules organiques complexes propres à Titan.", baseCost: 24000, baseProd: 70.0 },
      { key: 'gate', name: 'Portail Stellaire', icon: '🌀', desc: "Prototype expérimental de porte spatiale — la promesse d'un au-delà du système solaire.", baseCost: 160000, baseProd: 260.0 },
      { key: 'village', name: 'Cité Autonome de Titan', icon: '🏙️', desc: "Métropole flottante sur les lacs de méthane, dernière étape d'une colonisation totalement indépendante de la Terre.", baseCost: 960000, baseProd: 1560.0 }
    ]
  }
];

export function planetDefById(id: PlanetId): PlanetDef {
  const def = PLANET_DEFS.find((p) => p.id === id);
  if (!def) throw new Error(`Unknown planet id: ${id}`);
  return def;
}

export const HOME_PLANET_ID: PlanetId = PLANET_DEFS[0]!.id;
