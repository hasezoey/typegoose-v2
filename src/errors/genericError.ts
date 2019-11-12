import { format } from "util";

export class GenericError extends Error {
  constructor(msg: string, ...args: any[]) {
    super(format(msg, ...args));
  }
}
