import { format } from "util";
import { ReflectKeys } from "../constants/reflectKeys";
import { WrongTypeError } from "../errors/propErrors";
import { assert, assignMetadata, isNullOrUndefined } from "../internal/utils";
import { logger } from "../logSettings";
import { PropDecoratorOptions } from "../types/propDecoratorTypes";

export function Prop(options?: PropDecoratorOptions) {
  return (target: object, ...args: any[]) => {
    if (isNullOrUndefined(args) || (Array.isArray(args) && args.length <= 0)) {
      throw new TypeError(format("\"@Prop\" got called as an class Decorator OR Type is null | undefined, which isnt supported\n"
        + `Happend on class %o`, target));
    }
    const key: string = args[0];
    const Type: unknown = Reflect.getMetadata(ReflectKeys.Type, target, key);
    if (isNullOrUndefined(Type)) {
      throw new WrongTypeError(target, key, Type);
    }
    logger.info("Decorator @Prop called for", target, key);

    {
      // always creating a new Set, because otherwise with extending a class, would be ALWAYS the same Set
      const current = new Set(Reflect.getMetadata(ReflectKeys.AllProps, target));
      current.add(key);
      Reflect.defineMetadata(ReflectKeys.AllProps, current, target);
    }

    options = typeof options === "object" ? options : {};

    if ("r" in options) {
      options.required = options.r;
      delete options.r;
    }
    if (!("required" in options)) {
      options.required = false;
    }

    assignMetadata(ReflectKeys.PropOptions, options, target, key);
  };
}
