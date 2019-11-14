import { getClassName } from "../internal/utils";
import { GenericError } from "./genericError";

export class WrongOptionError extends GenericError {
	constructor(option: string, expected: any, got: any) {
		super(`Wrong Option for "${option}" expected "${expected}", got: "${got}"`);
	}
}

export class WrongTypeError extends GenericError {
	constructor(target: any, key: string, currentType: unknown) {
		super(`"${getClassName(target)}.${key}"'s Type cannot be accepted! (Type is "${currentType}")`);
	}
}
