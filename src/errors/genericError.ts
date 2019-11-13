import { format } from "util";

/**
 * A Generic Typegoose Error (all Typegoose Errors extend it)
 */
export class GenericError extends Error {
	constructor(msg: string, ...args: any[]) {
		super(format(msg, ...args));
	}
}
