import { validateConditionFields, validatePredicates } from "./validation";
import applicableActions from "./applicableActions";
import { isDevelopment, isObject, toArray, toError } from "./utils";
import defaultPredicate from "predicate"; // Import the default predicate

const validate = (schema, predicate) => {
  const isSchemaDefined = schema !== undefined && schema !== null;
  if (isDevelopment() && isSchemaDefined) {
    if (!isObject(schema)) {
      toError(`Expected valid schema object, but got - ${schema}`);
    }
    return (rule) => {
      validatePredicates([rule.conditions], schema, predicate);
      validateConditionFields([rule.conditions], schema);
    };
  } else {
    return () => {};
  }
};

class Engine {
  constructor(rules, schema) {
    this.rules = [];
    this.predicate = { ...defaultPredicate }; // Initialize with a copy of default predicates
    this.validate = validate(schema, this.predicate);

    if (rules) {
      toArray(rules).forEach((rule) => this.addRule(rule));
    }
  }

  addRule = (rule) => {
    this.validate(rule);
    this.rules.push(rule);
  };

  addPredicate = (name, fn) => {
    if (typeof name !== "string" || !name) {
      throw new Error("Predicate name must be a non-empty string");
    }
    if (typeof fn !== "function") {
      throw new Error("Predicate must be a function");
    }
    this.predicate[name] = fn;
    // Update validate to use the new predicate instance
    this.validate = validate(this.validate.schema, this.predicate);
  };

  run = (formData) =>
    Promise.resolve(applicableActions(this.rules, formData, this.predicate));
}

export default Engine;
