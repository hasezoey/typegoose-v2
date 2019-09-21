import { format } from "util";
import { ReflectKeys } from "../constants/reflectKeys";
import { WrongTypeError } from "../errors/propErrors";
import { isNullOrUndefined, assignMetadata } from "../internal/utils";
import { logger } from "../logSettings";
import { PropDecoratorOptions } from "../types/propDecoratorTypes";

export function Prop(options?: PropDecoratorOptions) {
  return (target: object, ...args: any[]) => {
    if (isNullOrUndefined(args) || (Array.isArray(args) && args.length <= 0)) {
      throw new TypeError(format("\"@Prop\" got called as an class Decorator, which isnt supported\n"
        + `Happend on class %o`, target));
    }
    const key: string = args[0];
    const Type: unknown = Reflect.getMetadata(ReflectKeys.Type, target, key);
    if (isNullOrUndefined(Type)) {
      throw new WrongTypeError(target, key, Type);
    }

    {
      const current = Reflect.getMetadata(ReflectKeys.AllProps, target) || new Set();
      current.add(key);
      Reflect.defineMetadata(ReflectKeys.AllProps, current, target);
    }

    options = typeof options === "object" ? options : {};

    logger.info("Decorator @Prop called for", target, key);
    logger.info("hi", Reflect.getMetadata(ReflectKeys.Type, target, key));
    if ("default" in options) {
      logger.info("options default");
    }

    assignMetadata(ReflectKeys.PropOptions, options, target, key);
  };
}
