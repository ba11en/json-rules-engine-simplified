import { isObject, toError, selectRef } from "./utils";
import checkField from "./checkField";
import { OR, AND, NOT } from "./constants";

export function toRelCondition(refCondition, formData) {
  if (Array.isArray(refCondition)) {
    return refCondition.map((cond) => toRelCondition(cond, formData));
  } else if (isObject(refCondition)) {
    return Object.keys(refCondition).reduce((agg, field) => {
      agg[field] = toRelCondition(refCondition[field], formData);
      return agg;
    }, {});
  } else if (typeof refCondition === "string" && refCondition.startsWith("$")) {
    return selectRef(refCondition.substr(1), formData);
  } else {
    return refCondition;
  }
}

export default function conditionsMeet(condition, formData, predicate) {
  if (!isObject(condition) || !isObject(formData)) {
    toError(
      `Rule ${JSON.stringify(condition)} with ${formData} can't be processed`
    );
    return false;
  }
  return Object.keys(condition).every((ref) => {
    const refCondition = condition[ref];
    if (ref === OR) {
      return refCondition.some((rule) =>
        conditionsMeet(rule, formData, predicate)
      );
    } else if (ref === AND) {
      return refCondition.every((rule) =>
        conditionsMeet(rule, formData, predicate)
      );
    } else if (ref === NOT) {
      return !conditionsMeet(refCondition, formData, predicate);
    } else {
      const refVal = selectRef(ref, formData);
      if (Array.isArray(refVal)) {
        const condMeatOnce = refVal.some((val) =>
          isObject(val) ? conditionsMeet(refCondition, val, predicate) : false
        );
        // It's either true for an element in an array or for the whole array
        return (
          condMeatOnce ||
          checkField(refVal, toRelCondition(refCondition, formData), predicate)
        );
      } else {
        return checkField(
          refVal,
          toRelCondition(refCondition, formData),
          predicate
        );
      }
    }
  });
}
