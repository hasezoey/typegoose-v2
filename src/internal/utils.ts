import { ReflectKeys } from "../constants/reflectKeys";

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

// /**
//  * Apply a Class to another class
//  * Copy-Paste from Typescript site itself
//  * @param derivedCtor The Class to apply onto
//  * @param baseCtors The Classes that should be applied
//  */
// export function applyMixins(derivedCtor: any, baseCtors: any[]) {
//   baseCtors.forEach((baseCtor) => {
//     Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
//       Object.defineProperty(derivedCtor.prototype, name, Object.getOwnPropertyDescriptor(baseCtor.prototype, name));
//     });
//   });
// }

/**
 * Merge value & existing Metadata & Save it to the class
 * Difference with "mergeMetadata" is that this one DOES save it to the class
 * @param rkey Metadata key
 * @param value Raw value
 * @param cl The constructor
 * @internal
 */
export function assignMetadata(rkey: ReflectKeys, value: unknown, cl: object, key?: string): any {
  if (isNullOrUndefined(value)) {
    return value;
  }

  const newValue = mergeMetadata(rkey, value, cl, key);
  if (typeof key === "string") {
    Reflect.defineMetadata(rkey, newValue, cl, key);
  } else {
    Reflect.defineMetadata(rkey, newValue, cl);
  }

  return newValue;
}

/**
 * Merge value & existing Metadata
 * Difference with "assignMetadata" is that this one DOES NOT save it to the class
 * @param rkey Metadata key
 * @param value Raw value
 * @param cl The constructor
 * @internal
 */
export function mergeMetadata(rkey: ReflectKeys, value: unknown, cl: object, key?: string): any {
  if (typeof rkey !== "string") {
    throw new TypeError(`"${rkey}"(key) is not a string! (assignMetadata)`);
  }

  let current: object;

  if (typeof key === "string") {
    current = Reflect.getMetadata(rkey, cl, key) || {};
  } else {
    current = Reflect.getMetadata(rkey, cl) || {};
  }

  if (isNullOrUndefined(value)) {
    return current;
  }

  return Object.assign(current, value);
}
