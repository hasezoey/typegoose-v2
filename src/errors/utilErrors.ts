import { getClassName } from "../internal/utils";

export class NoValidClass extends TypeError {
  constructor(cl: any) {
    super(`"${cl}" is not a function(/constructor)!`);
  }
}

export class TypegooseValidationError extends Error {
  constructor(target: object, key: string, reason: string) {
    super(`"${getClassName(target)}.${key}"'s validation failed, reason: ${reason}`);
  }
}
