import { validate, getGroupStatuses, isObjErrorFree } from "./Utils-bundle"


test.each([
  [undefined, false],
  [null, false],
  ["", false],
  ["yes", true],
])('validate notNull for $input', (input, expectNoError ) => {
  const errorMsg = {}
  let status = validate(errorMsg, input,{
    actions:['notNull'],
    actionObjs:[{}],
    actionErrors:[{ inputFieldErr: "*input field should be set!"}]
  });
  expect(isObjErrorFree(errorMsg)).toBe(expectNoError);
  expect(status).toBe(input);
});

test('validate notUnique', () => {
  const errorMsg = {}
  let status = validate(errorMsg, 'active',{
    actions:['notNull','notUnique'],
    actionObjs:[{},{uniqueArray: getGroupStatuses()}],
    actionErrors:[{ inputFieldErr: "*group status field should be set!"},{selectStatusErr:'*invalid group status'}]
  });
  expect(isObjErrorFree(errorMsg)).toBeTruthy();
  expect(status).toBe('active');

  status = validate(errorMsg, 'inbetween',{
    actions:['notNull','notUnique'],
    actionObjs:[{},{uniqueArray: getGroupStatuses()}],
    actionErrors:[{ inputFieldErr: "*group status field should be set!"},{selectStatusErr:'*invalid group status'}]
  });
  expect(isObjErrorFree(errorMsg)).toBeFalsy();
  expect(status).toBe('inbetween');
})
