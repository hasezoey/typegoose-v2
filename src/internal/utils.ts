/**
 * isNullOrUndefined, because deprecated in NodeJS
 * @param value The Value to check
 */
export function isNullOrUndefined(value: unknown) {
  return value === null || value === undefined;
}

export async function promisifyEvent(func: (..._: any) => any, event: string | symbol) {
  return new Promise((res) => {
    func(event, () => {
      res();
    });
  });
}

/** same as the returned values of a "typeof" call */
type TypeOF = "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function";
/**
 * Combine a typeof check & a isNullOrUndefined check
 * @param value Value to Check
 * @param check a value from "typeof"
 */
export function typeCheck(value: unknown, check: TypeOF) {
  return !isNullOrUndefined(value) && typeof value !== check;
}
