/**
 * isNullOrUndefined, because deprecated in NodeJS
 * @param value The Value to check
 */
export function isNullOrUndefined(value: unknown) {
  return value === null || value === undefined;
}

/**
 * Make an Event as an Promise
 * @param func The Event function
 * @param event The Event Name
 * @example
 * ```ts
 * await promisifyEvent(this.once, "data");
 * ```
 */
export async function promisifyEvent(func: (..._: any) => any, event: string | symbol): Promise<unknown> {
  return new Promise((res) => {
    func(event, (...args) => {
      res(...args);
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
