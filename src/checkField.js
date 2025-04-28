import { isObject } from "./utils";
import { AND, NOT, OR } from "./constants";
import defaultPredicate from "predicate";

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
      } else if ((p === "some" || p === "every") && Array.isArray(fieldVal)) {
        if (!isObject(subRule)) {
          return false;
        }

        return Object.keys(subRule).some((field) => {
          const predicateCondition = subRule[field];
          if (!predicateCondition || typeof predicateCondition !== "object") {
            return false;
          }

          return Object.keys(predicateCondition).some((predicateName) => {
            // Handle logical operators (not, or, and) within some/every
            if (
              predicateName === OR ||
              predicateName === AND ||
              predicateName === NOT
            ) {
              const logicalResult = doCheckField(
                fieldVal,
                { [predicateName]: predicateCondition[predicateName] },
                predicate
              );
              if (p === "some") {
                return fieldVal.some((item) => {
                  if (!isObject(item)) {
                    return false;
                  }
                  const fieldValue = item[field]
                    ? String(item[field]).toLowerCase()
                    : "";
                  const subCondition = {
                    [predicateName]: predicateCondition[predicateName],
                  };
                  const result = doCheckField(
                    fieldValue,
                    subCondition,
                    predicate
                  );
                  console.log(
                    `Evaluating ${field}: ${fieldValue}, ${predicateName}: ${result}`
                  );
                  return result;
                });
              } else if (p === "every") {
                return fieldVal.every((item) => {
                  if (!isObject(item)) {
                    return false;
                  }
                  const fieldValue = item[field]
                    ? String(item[field]).toLowerCase()
                    : "";
                  const subCondition = {
                    [predicateName]: predicateCondition[predicateName],
                  };
                  const result = doCheckField(
                    fieldValue,
                    subCondition,
                    predicate
                  );
                  console.log(
                    `Evaluating ${field}: ${fieldValue}, ${predicateName}: ${result}`
                  );
                  return result;
                });
              }
              return logicalResult;
            }

            // Handle standard predicates (is, match, etc.)
            if (!predicate[predicateName]) {
              return false;
            }
            let predicateValue = predicateCondition[predicateName];

            // Special handling for match predicate to convert string to regex
            if (predicateName === "match") {
              predicateValue = new RegExp(
                String(predicateValue).toLowerCase(),
                "i"
              );
            } else {
              predicateValue = String(predicateValue).toLowerCase();
            }

            if (p === "some") {
              return fieldVal.some((item) => {
                if (!isObject(item)) {
                  return false;
                }
                const fieldValue = item[field]
                  ? String(item[field]).toLowerCase()
                  : "";
                const result = predicate[predicateName](
                  fieldValue,
                  predicateValue
                );
                console.log(
                  `Evaluating ${field}: ${fieldValue}, ${predicateName} ${predicateValue}: ${result}`
                );
                return result;
              });
            } else if (p === "every") {
              return fieldVal.every((item) => {
                if (!isObject(item)) {
                  return false;
                }
                const fieldValue = item[field]
                  ? String(item[field]).toLowerCase()
                  : "";
                const result = predicate[predicateName](
                  fieldValue,
                  predicateValue
                );
                console.log(
                  `Evaluating ${field}: ${fieldValue}, ${predicateName} ${predicateValue}: ${result}`
                );
                return result;
              });
            }
            return false;
          });
        });
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
