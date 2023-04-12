import { getWeekDaysNames, getMonthsNames } from "./Utils-bundle"


test('getWeekDaysNames', () => {
  expect(getWeekDaysNames()).toHaveLength(7);
})

test('getMonthsNames', () => {
  expect(getMonthsNames()).toHaveLength(12);
})