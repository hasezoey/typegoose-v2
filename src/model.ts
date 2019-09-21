import { ObjectID } from "bson";
import { ReflectKeys } from "./constants/reflectKeys";
import { Prop } from "./decorators/prop.decorator";
import { logger } from "./logSettings";
import { ModelToJSONOptions } from "./types/modelTypes";

// Please dont try to touch the following types, it will just break everything

// the 2 types below, are Copy-Pastes from Typescript's docs
// tslint:disable-next-line:ban-types
type NonFunctionPropertyNames<T> = { [K in keyof T]: T[K] extends Function ? never : K }[keyof T];
type NonFunctionProperties<T> = Pick<T, NonFunctionPropertyNames<T>>;

type MakeSomeOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// the following 3 types are CP from https://stackoverflow.com/a/52473108/8944059
type IfEquals<X, Y, A, B> =
  (<T>() => T extends X ? 1 : 2) extends
  (<T>() => T extends Y ? 1 : 2) ? A : B;

type WritableKeysOf<T> = {
  [P in keyof T]: IfEquals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] }, P, never>
}[keyof T];
type WritablePart<T> = Pick<T, WritableKeysOf<T>>;

type CreateOptions<T extends Base<any>> = WritablePart<NonFunctionProperties<MakeSomeOptional<T, "_id">>>;

export abstract class Base<T extends Base<any>> {
  @Prop()
  public _id!: ObjectID;

  constructor(value: CreateOptions<T>) {
    logger.debug("Constructing %s", this.constructor.name);

    const allProps = Reflect.getMetadata(ReflectKeys.AllProps, this) || new Set();
    for (const prop of allProps) {
      logger.debug("Assigning Values to Properties for %s", prop);
      this[prop] = undefined;

      const propOptions = Reflect.getMetadata(ReflectKeys.PropOptions, this, prop) || {};
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
    value: CreateOptions<T>
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
  public toJSON(options?: ModelToJSONOptions): object {
    logger.debug("toJSON called for %s", this.constructor.name);
    options = typeof options === "object" ? options : {};

    const theObject = Object.assign({}, this);

    /** Shorthand for "this.constructor.prototype" */
    const proto = this.constructor.prototype;
    for (const key of Object.getOwnPropertyNames(proto)) {
      // return if the key is included in the following regex, because these types are not needed
      if (key.match(/^(constructor)$/)) {
        continue;
      }

      const descriptor = Object.getOwnPropertyDescriptor(proto, key);
      if (options.virtuals) {
        if (typeof descriptor.get === "function") {
          theObject[key] = descriptor.get();
        }
      }
    }

    return theObject;
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
