import { flatMap, toArray } from "./utils";
import conditionsMeet from "./conditionsMeet";

export default function applicableActions(rules, formData, predicate) {
  // console.log(
  //   "applicableActions: Received predicate keys:",
  //   predicate ? Object.keys(predicate) : "undefined"
  // );
  return flatMap(rules, ({ conditions, event }) => {
    if (conditionsMeet(conditions, formData, predicate)) {
      return toArray(event);
    } else {
      return [];
    }
  });
}
