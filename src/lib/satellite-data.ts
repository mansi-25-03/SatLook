export interface Satellite {
  noradId: number;
  name: string;
  operator: string;
  band: string;
  slotLongitude: number;
  status: 'operational' | 'spare' | 'other';
  elevation?: number;
}

export const SATELLITES: Satellite[] = [
  // North America
  { noradId: 41866, name: 'GOES 16 (East)', operator: 'NOAA/NASA', band: 'Ka/S/UHF', slotLongitude: -75.2, status: 'operational' },
  { noradId: 44876, name: 'GOES 18 (West)', operator: 'NOAA/NASA', band: 'Ka/S/UHF', slotLongitude: -137.2, status: 'operational' },
  { noradId: 28882, name: 'Anik F1R', operator: 'Telesat', band: 'Ku/C', slotLongitude: -107.3, status: 'operational' },
  { noradId: 39258, name: 'Sirius XM-6', operator: 'Sirius XM', band: 'S', slotLongitude: -116.1, status: 'operational' },
  { noradId: 26916, name: 'DirecTV-5', operator: 'DirecTV', band: 'Ku', slotLongitude: -110.0, status: 'spare' },
  { noradId: 36516, name: 'Galaxy 17', operator: 'Intelsat', band: 'Ku/C', slotLongitude: -91.0, status: 'operational' },
  { noradId: 40942, name: 'Echostar 19', operator: 'Dish Network', band: 'Ka', slotLongitude: -97.1, status: 'operational' },
  
  // South America
  { noradId: 39282, name: 'Star One C4', operator: 'Embratel', band: 'Ku/C', slotLongitude: -70.0, status: 'operational' },
  { noradId: 39078, name: 'Amazonas 3', operator: 'Hispamar', band: 'Ku/Ka/C', slotLongitude: -61.0, status: 'operational' },

  // Europe, Africa, Middle East (EUMETSAT)
  { noradId: 41382, name: 'Meteosat 11 (IODC)', operator: 'EUMETSAT', band: 'L', slotLongitude: 45.5, status: 'operational' },
  { noradId: 38749, name: 'Meteosat 10', operator: 'EUMETSAT', band: 'L', slotLongitude: 9.5, status: 'operational' },
  { noradId: 29642, name: 'Meteosat 9', operator: 'EUMETSAT', band: 'L', slotLongitude: 3.5, status: 'operational' },
  { noradId: 33287, name: 'Astra 2F', operator: 'SES', band: 'Ku', slotLongitude: 28.2, status: 'operational' },
  { noradId: 37851, name: 'Eutelsat 16A', operator: 'Eutelsat', band: 'Ku/Ka', slotLongitude: 16.0, status: 'operational' },
  { noradId: 28628, name: 'Arabsat-2B', operator: 'Arabsat', band: 'C/Ku', slotLongitude: 30.5, status: 'spare' },

  // Asia-Pacific
  { noradId: 42931, name: 'Himawari 9', operator: 'JMA', band: 'Ka/S/UHF', slotLongitude: 140.7, status: 'operational' },
  { noradId: 37233, name: 'INSAT-4G (GSAT-8)', operator: 'ISRO', band: 'Ku/C', slotLongitude: 55.0, status: 'operational' },
  { noradId: 38046, name: 'Koreasat 5A', operator: 'KT Sat', band: 'Ku', slotLongitude: 113.0, status: 'operational' },
  { noradId: 40313, name: 'LaoSat 1', operator: 'LAOSAT', band: 'C/Ku', slotLongitude: 128.5, status: 'operational' },
  { noradId: 25924, name: 'Optus C1', operator: 'Optus', band: 'Ku/Ka', slotLongitude: 156.0, status: 'operational' },
];
