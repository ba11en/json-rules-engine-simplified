import Engine from "../../src";
import { listInvalidFields } from "../../src/validation";

test("support $ single level of nesting", () => {
  const rules = [
    {
      conditions: {
        address$zip: { less: 1000 },
      },
      event: {
        type: "match",
      },
    },
  ];
  const engine = new Engine(rules);
  return engine.run({ address: { zip: 10 } }).then((events) => {
    expect(events.length).toEqual(1);
    expect(events[0]).toEqual({ type: "match" });
  });
});

test("support $ double level of nesting", () => {
  const rules = [
    {
      conditions: {
        person$address$zip: { less: 1000 },
      },
      event: {
        type: "match",
      },
    },
  ];
  const engine = new Engine(rules);
  return engine.run({ person: { address: { zip: 10 } } }).then((events) => {
    expect(events.length).toEqual(1);
    expect(events[0]).toEqual({ type: "match" });
  });
});

test("support $ during validation", () => {
  const schema = {
    type: "object",
    properties: {
      address: {
        type: "object",
        properties: {
          zip: { type: "number" },
        },
      },
    },
  };
  const conditions = [
    {
      address$zip: { less: 1000 },
    },
  ];
  expect(listInvalidFields(conditions, schema)).toEqual([]);
});
