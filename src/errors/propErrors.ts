export class WrongOptionError extends TypeError {
  constructor(option: string, expected: any, got: any) {
    super(`Wrong Option for "${option}" expected "${expected}", got: "${got}"`);
  }
}

export class WrongTypeError extends TypeError {
  constructor(target: any, key: string, currentType: unknown) {
    super(`"${target}.${key}"'s Type cannot be accepted! (Type is "${currentType}")`);
  }
}
