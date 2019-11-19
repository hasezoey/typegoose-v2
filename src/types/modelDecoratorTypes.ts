import { Connection } from "../connectionHandler";

// tslint:disable:max-line-length
export interface IModelDecoratorOptions {
	autoIndex?: boolean;
	collection?: string;
	capped?: number;
	autoCreate?: boolean;
	writeConcern?: IModelDecoratorOptionsWriteConcern;
	keys?: IModelDecoratorOptionsKeys;
	connection?: Connection;
	/**
	 * Drop Collection on first Write?
	 * For Testing Purposes ONLY
	 */
	dropOnCreate?: boolean;
}

export interface IModelDecoratorOptionsKeys {
	versionKey?: string;
	discriminatorKey?: string;
	timestamps?: boolean;
}

export interface IModelDecoratorOptionsWriteConcern {
	/**
	 * The w option requests acknowledgment that the write operation has propagated to a specified number of mongod instances or to mongod instances with specified tags.
	 */
	w: number | "majority" | string;
	/**
	 * The j option requests acknowledgment from MongoDB that the write operation has been written to the on-disk journal.
	 */
	j: boolean;
	/**
	 * This option specifies a time limit, in milliseconds, for the write concern. wtimeout is only applicable for w values greater than 1.
	 * wtimeout causes write operations to return with an error after the specified limit, even if the required write concern will eventually succeed. When these write operations return, MongoDB does not undo successful data modifications performed before the write concern exceeded the wtimeout time limit.
	 */
	wtimeout: number;
}
