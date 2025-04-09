import conditionsMeet from '../src/conditionsMeet';

const obj = {
  medications: [
    { type: 'A', isLiquid: false },
    { type: 'B', isLiquid: true },
    { type: 'C', isLiquid: false },
  ],
};

test('conditions invalid wrong type', function () {
  const conditions = {
    medications: {
      type: { equal: 'D' },
    },
  };

  expect(conditionsMeet(conditions, obj)).toBeFalsy();
});

test('conditions invalid not liquid', function () {
  const conditions = {
    medications: {
      type: { equal: 'A' },
      isLiquid: { equal: true },
    },
  };

  expect(conditionsMeet(conditions, obj)).toBeFalsy();
});

test('conditions valid just type', function () {
  const conditions = {
    medications: {
      type: { equal: 'A' },
    },
  };

  expect(conditionsMeet(conditions, obj)).toBeTruthy();
});

test('conditions valid type and liquidity', function () {
  const conditions = {
    medications: {
      type: { equal: 'A' },
      isLiquid: { equal: false },
    },
  };

  expect(conditionsMeet(conditions, obj)).toBeTruthy();
});
