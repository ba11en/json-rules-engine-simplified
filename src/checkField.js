import { isObject } from "./utils";
import { AND, NOT, OR } from "./constants";
import selectn from "selectn";

const doCheckField = (fieldVal, rule, predicate) => {
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
        console.error(`Predicate '${p}' not found`);
        return false;
      }
    });
  } else {
    if (!predicate[rule]) {
      console.error(`Predicate '${rule}' not found`);
      return false;
    }
    return predicate[rule](fieldVal);
  }
};

export default function checkField(field, rule, formData, predicate) {
  const fieldVal = selectn(field)(formData);
  return doCheckField(fieldVal, rule, predicate);
}
