

import { ensureString, getMaxKeyFromMap, analyzeColorDistribution_ } from "./Utils-bundle"


test('getMaxKeyFromMap', () => {
  expect(getMaxKeyFromMap({
    "ee": 38,
    "f": 12,
    "a": 20,
    "b": 46,
    "c": 35,
    "d": 0,
    "u": -120
  })).toBe("b");
});

test('analyzeColorDistribution_', () => {
  const backgrounds = [
    [
      "", "#bbbbbb", "#cccccc", "#ffffff", "#ffffff",
    ],
    [
      "#ffffff", null, "#ffffff", "#ffffff", "#ffffff",
    ],
    [
      "#aaaaaa", "#cccccc", "#cccccc", "#bbbbbb", "#ffffff",
    ],
    [
      "#dddddd", "#dddddd", "#dddddd", "#dddddd", "#dddddd",
    ]
  ];

  expect(analyzeColorDistribution_(backgrounds, 3)).toEqual({
    "#aaaaaa": 1,
    "#bbbbbb": 2,
    "#cccccc": 3,
  });

  expect(analyzeColorDistribution_()).toEqual({});
  expect(analyzeColorDistribution_([])).toEqual({});

  expect(getMaxKeyFromMap(analyzeColorDistribution_(backgrounds))).toEqual("#dddddd");
  expect(getMaxKeyFromMap(analyzeColorDistribution_(backgrounds, 2))).toEqual("#bbbbbb"); // picks one of the highest
});

test.each([
  [null, ""],
  [undefined, ""],
  ["", ""],
  [0, "0"],
  ["0", "0"],
  ["\n", "\n"],
  ["string", "string"],
  [String(), ""]
])('$input asString', (input, expected ) => {
  expect(ensureString(input)).toBe(expected);
});
