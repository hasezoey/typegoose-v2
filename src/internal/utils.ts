import * as assertN from "assert";
import { merge } from "lodash";
import { ReflectKeys } from "../constants/reflectKeys";
import { WrongTypeError } from "../errors/propErrors";
import { TypegooseValidationError } from "../errors/utilErrors";
import { logger } from "../logSettings";

/**
 * isNullOrUndefined, because deprecated in NodeJS
 * @param value The Value to check
 */
export function isNullOrUndefined(value: unknown): value is null | undefined {
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
		func(event, (...args: any[]) => {
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
export function typeCheck(value: unknown, check: TypeOF): boolean {
	return !isNullOrUndefined(value) && typeof value !== check;
}

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
		current = Reflect.getMetadata(rkey, cl, key) ?? {};
	} else {
		current = Reflect.getMetadata(rkey, cl) ?? {};
	}

	if (isNullOrUndefined(value)) {
		return current;
	}

	return merge({}, current, value);
}

/**
 * Run Validation on a Specific Property
 * @param target The Class the Property is on
 * @param key The Name of the Property
 * @param Type The Expected Type
 * @param value The Current Value
 */
export async function validateProp(
	target: object,
	key: string,
	Type: any,
	value: unknown
): Promise<boolean> {
	if (isNullOrUndefined(Type)) {
		throw new WrongTypeError(target, key, Type);
	}
	logger.debug("validateProp for %s %s %s (name, key, Type)", getClassName(target), key, getClassName(Type));

	function end(msg: string): never {
		throw new TypegooseValidationError(target, key, msg);
	}

	const propOptions = Reflect.getMetadata(ReflectKeys.PropOptions, target, key) || {};

	if ("required" in propOptions && typeof propOptions.required === "boolean") {
		if (propOptions.required && isNullOrUndefined(value)) {
			return end("Given value is required, but is null or undefined!");
		}

		if (!propOptions.required && isNullOrUndefined(value)) {
			// return if the value is not required and is null or undefined
			return true;
		}
	}

	if (Type.name.match(/^(String|Boolean|Number|Object)$/)) {
		if (typeof value !== Type.name.toLowerCase()) {
			return end("Given value is not of the proper Type\n"
				+ `expected: ${Type.name} \ngiven: ${value}`);
		}

		return true;
	}

	if (!(value instanceof Type)) {
		return end("Given value is not an instance of Type\n"
			+ `expected: ${Type.name} \ngiven: ${value}`);
	}

	if ("validate" in propOptions && typeof propOptions.validate === "function") {
		if (!await propOptions.validate()) {
			return end("Custom Validation returned false");
		}
	}

	return true;
}

/**
 * I hope this works
 * @param cl
 */
export function getClassName(cl: any): string {
	return cl?.constructor?.name === "Function" ? cl.name : cl.constructor.name;
}

/**
 * Proxy for assert (typescript)
 * @param cond
 * @param msg
 */
export function assert(cond: any, msg?: string | Error): asserts cond {
	assertN(cond, msg);
}

/**
 * Get all Getters from given OBJ
 * @param obj Where all getters come from
 */
export function getAllGetters(obj: object): string[] {
	/** Keys to for getters */
	let keys: string[] = [];

	traverseProto(obj, (proto) => {
		keys = keys.concat(
			Object.entries(Object.getOwnPropertyDescriptors(proto))
				.filter(([key, v]) =>
					!isNullOrUndefined(v.get)
					&& key[0] !== "_"
				)
				.map(([k, v]) => k)
		);
	});

	return keys;
}

/**
 * Traverse the prototype chain
 * @param obj The Object for the prototypes
 * @param cb Callback function to call when another prototype is found
 */
export function traverseProto(obj: object, cb: (proto: any) => void): void {
	/** Current Prototype to check */
	let proto = Object.getPrototypeOf(obj);

	// get all getters
	while (!isNullOrUndefined(proto)) {
		cb(proto);
		proto = Object.getPrototypeOf(proto);
	}
}
