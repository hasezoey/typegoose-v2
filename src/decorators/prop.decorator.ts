import { format, isNullOrUndefined } from "util";
import { ReflectKeys } from "../constants/reflectKeys";
import { log } from "../logSettings";
import { PropDecoratorOptions } from "../types/propDecoratorTypes";

export function Prop(options?: PropDecoratorOptions) {
  return (target: object, ...args: any[]) => {
    if (isNullOrUndefined(args) || (Array.isArray(args) && args.length <= 0)) {
      throw new TypeError(format("\"@Prop\" got called as an class Decorator, which isnt supported\n"
        + `Happend on class %o`, target));
    }
    const key: string = args[0];
    log.info("Decorator @Prop called for", target, key);
    log.info("hi", Reflect.getMetadata(ReflectKeys.Type, target, key));
  };
}
