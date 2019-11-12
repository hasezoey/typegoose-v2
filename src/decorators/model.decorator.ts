import { format } from "util";
import { ReflectKeys } from "../constants/reflectKeys";
import { GenericError } from "../errors/genericError";
import { WrongOptionError } from "../errors/propErrors";
import { assert, isNullOrUndefined, typeCheck } from "../internal/utils";
import { logger } from "../logSettings";
import { ModelDecoratorOptions } from "../types/modelDecoratorTypes";

export function Model(options: ModelDecoratorOptions) {
  return (target: any, ...args: any[]) => {
    if (Array.isArray(args) && args.length > 0) {
      throw new TypeError(format("\"@Model\" got called as an non-class Decorator, which isnt supported\n"
        + `Happend on class "%s.%s"`, target, args[0]));
    }
    logger.info("Decorator @Model called for", target);
    assert(typeof options === "object", new GenericError("Expected Options to be an object!"));

    {
      if (typeCheck(options.autoIndex, "boolean")) {
        throw new WrongOptionError("Model.autoIndex", "boolean", typeof options.autoIndex);
      }
      if (typeCheck(options.collection, "string")) {
        throw new WrongOptionError("Model.collection", "string", typeof options.collection);
      }
      if (typeCheck(options.capped, "number")) {
        throw new WrongOptionError("Model.capped", "number", typeof options.capped);
      }
      if (typeCheck(options.autoCreate, "boolean")) {
        throw new WrongOptionError("Model.autoCreate", "boolean", typeof options.autoCreate);
      }

      // block-scope for "options.writeConcern"
      {
        if (typeCheck(options.writeConcern, "object")) {
          throw new WrongOptionError("Model.writeConcern", "object", typeof options.writeConcern);
        }
        if (!isNullOrUndefined(options.writeConcern) && typeof options.writeConcern === "object") {
          if (typeof options.writeConcern.j !== "boolean") {
            throw new WrongOptionError("Model.writeConcern.j", "boolean", typeof options.writeConcern.j);
          }
          if (typeof options.writeConcern.wtimeout !== "boolean") {
            throw new WrongOptionError("Model.writeConcern.wtimeout", "number", typeof options.writeConcern.wtimeout);
          }
          if (
            typeof options.writeConcern.w !== "number" &&
            typeof options.writeConcern.w !== "string"
          ) {
            throw new WrongOptionError("Model.writeConcern.w", "number | string", typeof options.writeConcern.w);
          }
        }
      }
      // block-scope for "options.keys"
      {
        if (typeCheck(options.keys, "object")) {
          throw new WrongOptionError("Model.keys", "object", typeof options.keys);
        }
        if (!isNullOrUndefined(options.keys) && typeof options.keys === "object") {
          if (typeCheck(options.keys.versionKey, "string")) {
            throw new WrongOptionError("Model.keys.versionKey", "string", typeof options.keys.versionKey);
          }
          if (typeCheck(options.keys.discriminatorKey, "string")) {
            throw new WrongOptionError("Model.keys.discriminatorKey", "string", typeof options.keys.discriminatorKey);
          }
          if (typeCheck(options.keys.timestamps, "boolean")) {
            throw new WrongOptionError("Model.keys.timestamps", "boolean", typeof options.keys.timestamps);
          }
        }
      }
    }

    Reflect.defineMetadata(ReflectKeys.PropOptions, options, target);
  };
}
