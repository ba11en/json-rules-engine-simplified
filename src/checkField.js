import { isObject } from "./utils";
import { AND, NOT, OR } from "./constants";
import defaultPredicate from "predicate"; // Fallback

const doCheckField = (fieldVal, rule, predicate = defaultPredicate) => {
  if (!predicate) {
    predicate = defaultPredicate;
  }
  if (isObject(rule)) {
    return Object.keys(rule).every((p) => {
      const subRule = rule[p];
      if (p === OR || p === AND) {
        if (Array.isArray(subRule)) {
          if (p === OR) {
            return subRule.some((rule) =>
              doCheckField(fieldVal, rule, predicate)
            );
          } else {
            return subRule.every((rule) =>
              doCheckField(fieldVal, rule, predicate)
            );
          }
        } else {
          return false;
        }
      } else if (p === NOT) {
        return !doCheckField(fieldVal, subRule, predicate);
      } else if (predicate[p]) {
        return predicate[p](fieldVal, subRule);
      } else {
        return false;
      }
    });
  } else {
    if (!predicate[rule]) {
      return false;
    }
    return predicate[rule](fieldVal);
  }
};

export default function checkField(fieldVal, rule, predicate) {
  return doCheckField(fieldVal, rule, predicate);
}
