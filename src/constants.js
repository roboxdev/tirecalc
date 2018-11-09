export const oneKmInMm = 1000 * 1000;

export const WIDTH_OPTIONS = [
  135,
  145,
  155,
  165,
  175,
  185,
  195,
  205,
  215,
  225,
  235,
  245,
  255,
  265,
  275,
  285,
  295,
  305,
  315,
  325,
  335,
  345,
  355,
  365,
  375,
  385,
  395,
];

export const HEIGHT_OPTIONS = [
  25,
  30,
  35,
  40,
  45,
  50,
  55,
  60,
  65,
  70,
  75,
  80,
  85,
  90,
  95,
  100,
];

export const DIAMETER_OPTIONS = [
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  20,
  21,
  22,
  22.5,
  23,
  24,
];

export const WIDTH_SCORE_THRESHOLD = 0.35;

export const TABLE_DISPLAY_OPTIONS = [
  ['diff', 'Разница диаметров'],
  ['rideHeightDiff', 'Разница в дорожном просвете'],
];

export const COLORS = {
  meh: opacity => `hsla(0,0%,80%, ${opacity})`,
  good: opacity => `hsla(45,100%,50%,  ${opacity})`,
  best: opacity => `hsla(120,100%,50%,  ${opacity})`,
};
