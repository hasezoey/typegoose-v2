import { ObjectID } from "bson";
import { Prop } from "./decorators/prop.decorator";
import { logger } from "./logSettings";
import { ReflectKeys } from "./constants/reflectKeys";

// the 2 types below, are Copy-Pastes from Typescript's docs
// tslint:disable-next-line:ban-types
type NonFunctionPropertyNames<T> = { [K in keyof T]: T[K] extends Function ? never : K }[keyof T];
type NonFunctionProperties<T> = Pick<T, NonFunctionPropertyNames<T>>;

type MakeSomeOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export abstract class Base<T extends Base<any>> {
  @Prop()
  public _id!: ObjectID;

  constructor(value: NonFunctionProperties<MakeSomeOptional<T, "_id">>) {
    logger.debug("Constructing %s", this.constructor.name);
    const allProps = Reflect.getMetadata(ReflectKeys.AllProps, this) || new Set();
    for (const prop of allProps) {
      logger.debug("Assigning Values to Properties for %s", prop);
      this[prop] = undefined;
      const propOptions = Reflect.getMetadata(ReflectKeys.PropOptions, this, prop) || {};
      logger.info("propOptions for %s %o", prop, propOptions);
      if ("default" in propOptions) {
        this[prop] = propOptions.default;
      }
    }
    Object.assign(this, value);
  }

  public static findOne(query: object) {
    return;
  }

  public static findMany(query: object) {
    return;
  }

  /**
   * Create an Document and save it
   * @param value
   */
  public static async create<T extends Base<any>>(
    this: new (...a: any[]) => T,
    value: NonFunctionProperties<MakeSomeOptional<T, "_id">>
  ) {
    const doc = new this(value);
    await doc.save();

    return doc;
  }

  public async save() {
    return;
  }

  /**
   * Convert the Document to an Object / JSON
   */
  public toJSON(): object {
    return Object.assign({}, this);
  }

  /**
   * As toJSON only that it returns it stringifyed
   */
  public toString(): string {
    return JSON.stringify(this.toJSON());
  }

  public test() {
    logger.info("TEST", Object.keys(this.constructor.prototype));
  }
}

// export function getModel(cl: any) {
//   const copy = Object.assign({}, cl);
//   applyMixins(copy, [Base]);

//   return new copy();
// }
