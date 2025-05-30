import Engine from "../src/Engine";

const EVENT = {
  type: "remove",
  params: {
    field: "password",
  },
};

const schema = {
  definitions: {
    hobby: {
      type: "object",
      properties: {
        name: { type: "string" },
        durationInMonth: { type: "integer" },
      },
    },
  },
  title: "A registration form",
  description: "A simple form example.",
  type: "object",
  required: ["firstName", "lastName"],
  properties: {
    firstName: {
      type: "string",
      title: "First name",
    },
    lastName: {
      type: "string",
      title: "Last name",
    },
    age: {
      type: "integer",
      title: "Age",
    },
    bio: {
      type: "string",
      title: "Bio",
    },
    country: {
      type: "string",
      title: "Country",
    },
    state: {
      type: "string",
      title: "State",
    },
    zip: {
      type: "string",
      title: "ZIP",
    },
    password: {
      type: "string",
      title: "Password",
      minLength: 3,
    },
    telephone: {
      type: "string",
      title: "Telephone",
      minLength: 10,
    },
    work: { $ref: "#/definitions/hobby" },
    hobbies: {
      type: "array",
      items: { $ref: "#/definitions/hobby" },
    },
  },
};

test("first example", () => {
  const rules = [
    {
      conditions: {
        firstName: "empty",
      },
      event: EVENT,
    },
  ];

  const engine = new Engine(rules, schema);
  expect.assertions(5);

  return Promise.all([
    engine.run({}).then((res) => expect(res).toEqual([EVENT])),
    engine.run({ firstName: null }).then((res) => expect(res).toEqual([EVENT])),
    engine.run({ firstName: "" }).then((res) => expect(res).toEqual([EVENT])),
    engine.run({ firstName: "  " }).then((res) => expect(res).toEqual([])),
    engine.run({ firstName: "some" }).then((res) => expect(res).toEqual([])),
  ]);
});

test("Conditionals with arguments", () => {
  const rules = [
    {
      conditions: {
        age: { less: 16 },
      },
      event: EVENT,
    },
  ];

  const engine = new Engine(rules, schema);
  expect.assertions(5);

  return Promise.all([
    engine.run({}).then((res) => expect(res).toEqual([])),
    engine.run({ age: null }).then((res) => expect(res).toEqual([EVENT])),
    engine.run({ age: 15 }).then((res) => expect(res).toEqual([EVENT])),
    engine.run({ age: 16 }).then((res) => expect(res).toEqual([])),
    engine.run({ age: 21 }).then((res) => expect(res).toEqual([])),
  ]);
});

test("AND", () => {
  const rules = [
    {
      conditions: {
        age: {
          greater: 16,
          less: 70,
        },
      },
      event: EVENT,
    },
  ];

  const engine = new Engine(rules, schema);
  expect.assertions(4);

  return Promise.all([
    engine.run({ age: 16 }).then((res) => expect(res).toEqual([])),
    engine.run({ age: 17 }).then((res) => expect(res).toEqual([EVENT])),
    engine.run({ age: 69 }).then((res) => expect(res).toEqual([EVENT])),
    engine.run({ age: 70 }).then((res) => expect(res).toEqual([])),
  ]);
});

test("NOT", () => {
  const rules = [
    {
      conditions: {
        age: {
          not: {
            greater: 16,
            less: 70,
          },
        },
      },
      event: EVENT,
    },
  ];

  const engine = new Engine(rules, schema);
  expect.assertions(4);

  return Promise.all([
    engine.run({ age: 16 }).then((res) => expect(res).toEqual([EVENT])),
    engine.run({ age: 17 }).then((res) => expect(res).toEqual([])),
    engine.run({ age: 69 }).then((res) => expect(res).toEqual([])),
    engine.run({ age: 70 }).then((res) => expect(res).toEqual([EVENT])),
  ]);
});

test("OR", () => {
  const rules = [
    {
      conditions: {
        age: {
          or: [{ lessEq: 16 }, { greaterEq: 70 }],
        },
      },
      event: EVENT,
    },
  ];

  const engine = new Engine(rules, schema);
  expect.assertions(4);

  return Promise.all([
    engine.run({ age: 16 }).then((res) => expect(res).toEqual([EVENT])),
    engine.run({ age: 17 }).then((res) => expect(res).toEqual([])),
    engine.run({ age: 69 }).then((res) => expect(res).toEqual([])),
    engine.run({ age: 70 }).then((res) => expect(res).toEqual([EVENT])),
  ]);
});

test("multi field default AND", () => {
  const rules = [
    {
      conditions: {
        age: { less: 70 },
        country: { is: "USA" },
      },
      event: EVENT,
    },
  ];

  const engine = new Engine(rules, schema);
  expect.assertions(5);

  return Promise.all([
    engine
      .run({ age: 16, country: "China" })
      .then((res) => expect(res).toEqual([])),
    engine
      .run({ age: 16, country: "Mexico" })
      .then((res) => expect(res).toEqual([])),
    engine
      .run({ age: 16, country: "USA" })
      .then((res) => expect(res).toEqual([EVENT])),
    engine
      .run({ age: 69, country: "USA" })
      .then((res) => expect(res).toEqual([EVENT])),
    engine
      .run({ age: 70, country: "USA" })
      .then((res) => expect(res).toEqual([])),
  ]);
});

test("multi field OR", () => {
  const rules = [
    {
      conditions: {
        or: [
          {
            age: { less: 70 },
            country: { is: "USA" },
          },
          {
            state: { is: "NY" },
          },
        ],
      },
      event: EVENT,
    },
  ];

  const engine = new Engine(rules, schema);
  expect.assertions(5);

  return Promise.all([
    engine
      .run({ age: 16, country: "China", state: "Beijing" })
      .then((res) => expect(res).toEqual([])),
    engine
      .run({ age: 16, country: "China", state: "NY" })
      .then((res) => expect(res).toEqual([EVENT])),
    engine
      .run({ age: 16, country: "USA" })
      .then((res) => expect(res).toEqual([EVENT])),
    engine
      .run({ age: 80, state: "NY" })
      .then((res) => expect(res).toEqual([EVENT])),
    engine
      .run({ age: 69, country: "USA" })
      .then((res) => expect(res).toEqual([EVENT])),
  ]);
});

test("multi field NOT", () => {
  const rules = [
    {
      conditions: {
        not: {
          or: [
            {
              age: { less: 70 },
              country: { is: "USA" },
            },
            {
              state: { is: "NY" },
            },
          ],
        },
      },
      event: EVENT,
    },
  ];

  const engine = new Engine(rules, schema);
  expect.assertions(5);

  return Promise.all([
    engine
      .run({ age: 16, country: "China", state: "Beijing" })
      .then((res) => expect(res).toEqual([EVENT])),
    engine
      .run({ age: 16, country: "China", state: "NY" })
      .then((res) => expect(res).toEqual([])),
    engine
      .run({ age: 16, country: "USA" })
      .then((res) => expect(res).toEqual([])),
    engine.run({ age: 80, state: "NY" }).then((res) => expect(res).toEqual([])),
    engine
      .run({ age: 69, country: "USA" })
      .then((res) => expect(res).toEqual([])),
  ]);
});

test("Nested object queries", () => {
  const rules = [
    {
      conditions: {
        "work.name": { is: "congressman" },
      },
      event: EVENT,
    },
  ];

  const engine = new Engine(rules, schema);
  expect.assertions(5);

  return Promise.all([
    engine.run({ work: {} }).then((res) => expect(res).toEqual([])),
    engine.run({}).then((res) => expect(res).toEqual([])),
    engine
      .run({ work: { name: "congressman" } })
      .then((res) => expect(res).toEqual([EVENT])),
    engine
      .run({ work: { name: "president" } })
      .then((res) => expect(res).toEqual([])),
    engine
      .run({ work: { name: "blacksmith" } })
      .then((res) => expect(res).toEqual([])),
  ]);
});

test("Nested arrays object queries", () => {
  const rules = [
    {
      conditions: {
        hobbies: {
          name: { is: "baseball" },
        },
      },
      event: EVENT,
    },
  ];

  const engine = new Engine(rules, schema);
  expect.assertions(5);

  return Promise.all([
    engine.run({ hobbies: [] }).then((res) => expect(res).toEqual([])),
    engine.run({}).then((res) => expect(res).toEqual([])),
    engine
      .run({ hobbies: [{ name: "baseball" }] })
      .then((res) => expect(res).toEqual([EVENT])),
    engine
      .run({
        hobbies: [
          { name: "reading" },
          { name: "jumping" },
          { name: "baseball" },
        ],
      })
      .then((res) => expect(res).toEqual([EVENT])),
    engine
      .run({ hobbies: [{ name: "reading" }, { name: "jumping" }] })
      .then((res) => expect(res).toEqual([])),
  ]);
});
