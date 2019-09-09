import { isNullOrUndefined } from "util";

export async function promisifyEvent(func: (..._: any) => any, event: string | symbol) {
  return new Promise((res) => {
    func(event, () => {
      res();
    });
  });
}

type TypeOF = "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function";
export function typeCheck(value: any, check: TypeOF) {
  return !isNullOrUndefined(value) && typeof value !== check;
}
