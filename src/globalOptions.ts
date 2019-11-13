import { merge } from "lodash";
import { globalOptions } from "./internal/data";
import { IGlobalOptions } from "./types/globalOptionTypes";

/**
 * Sets global options (new with old)
 * @param options Global Options to set
 */
export function setGlobalOptions(options: IGlobalOptions): IGlobalOptions {
	merge(globalOptions, options);

	return globalOptions;
}

/**
 * Get current global options
 */
export function getGlobalOptions(): IGlobalOptions {
	return globalOptions;
}
