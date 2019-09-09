export class WrongOptionError extends TypeError {
  constructor(option: string, expected: any, got: any) {
    super(`Wrong Option for "${option}" expected "${expected}", got: "${got}"`);
  }
}
