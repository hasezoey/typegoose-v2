import { EJSON, ObjectID } from "bson";
import { validateOrReject, ValidatorOptions } from "class-validator";
import { Collection } from "mongodb";
import { Connection } from "./connectionHandler";
import { ReflectKeys } from "./constants/reflectKeys";
import { Prop } from "./decorators/prop.decorator";
import { GenericError } from "./errors/genericError";
import { getGlobalOptions } from "./globalOptions";
import { assert, getAllGetters, isNullOrUndefined, validateProp } from "./internal/utils";
import { logger } from "./logSettings";
import { ModelDecoratorOptions } from "./types/modelDecoratorTypes";

// Please dont try to touch the following types, it will just break everything

// the 2 types below, are Copy-Pastes from Typescript's docs
// tslint:disable-next-line:ban-types
type NonFunctionPropertyNames<T> = { [K in keyof T]: T[K] extends Function ? never : K }[keyof T];
type NonFunctionProperties<T> = Pick<T, NonFunctionPropertyNames<T>>;

export type MakeSomeOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// the following 3 types are CP from https://stackoverflow.com/a/52473108/8944059
type IfEquals<X, Y, A, B> =
  (<T>() => T extends X ? 1 : 2) extends
  (<T>() => T extends Y ? 1 : 2) ? A : B;

type WritableKeysOf<T> = {
  [P in keyof T]: IfEquals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] }, P, never>
}[keyof T];
type WritablePart<T> = Pick<T, WritableKeysOf<T>>;

export type CreateOptions<T extends Base<any>> = WritablePart<NonFunctionProperties<MakeSomeOptional<T, "_id">>>;

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
   * Check for an Connection & return it
   */
  protected getConnection(): Connection | never {
    const con: Connection | undefined = this.getModelOptions().connection;
    assert(con instanceof Connection, new GenericError("Expected to have an Connection assigned!"));

    return con;
  }

  /**
   * Get Model Options (or empty object)
   */
  protected getModelOptions(): ModelDecoratorOptions {
    const ref = Reflect.getMetadata(ReflectKeys.PropOptions, this.constructor) ?? {};

    return ref;
  }

  /**
   * Returns the class name
   * QoL method
   */
  protected getName(): string {
    return this.constructor.name;
  }

  /**
   * Check if the collection exists
   */
  protected async createCollection(): Promise<Collection> {
    const con = this.getConnection();
    try {
      return con.mongoClient.db().collection(this.getCollectionName(), { strict: true });
    } catch (err) {
      const coll = con.mongoClient.db().collection(this.getCollectionName());
      // apply indexes

      return coll;
    }
  }

  /**
   * Get the Collection name
   */
  public getCollectionName(): string {
    const collection: string | undefined = this.getModelOptions().collection;

    const glob = getGlobalOptions();
    if (isNullOrUndefined(collection)) {
      assert(glob.allowClassNameAsCollection, new GenericError("Collection is undefined and \"allowClassNameAsCollection\" is false! Model: %s", this.getName()));

      return this.getName();
    }

    return collection;
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

  /**
   * Saves the Document
   */
  public async save() {
    await this.createCollection();
    const coll = await this.createCollection();
    await coll.insertOne(this.serialize());

    return;
  }

  /**
   * Stringify-serialize
   */
  public toString(): string {
    return JSON.stringify(this.serialize());
  }

  /**
   * Serialize the current class to a BSON object
   * @param getters Include getters?
   */
  public serialize(getters?: boolean): object {
    const copy: any = Object.assign({}, this);

    if (getters) {
      const keys = getAllGetters(this);
      keys.forEach((key) => {
        copy[key] = (this as any)[key];
      });
    }

    return EJSON.serialize(copy);
  }

  /**
   * Validate the current instance
   * @param classValidatorOptions Options passed to class-validator
   * @returns true - if successful
   * @throws Error[] - if not
   */
  public async validate(classValidatorOptions?: ValidatorOptions): Promise<boolean> {
    const promiseCollection: Promise<void | Error>[] = [];
    for (const key of Object.keys(this)) {
      const Type: unknown = Reflect.getMetadata(ReflectKeys.Type, this, key);
      promiseCollection.push(
        validateProp(this, key, Type, this[key])
          .catch((err) => err)
          .then((out) => {
            return typeof out === "boolean" ? void 0 : out;
          })
      );
    }

    promiseCollection.push(
      // push class-validator's validator to the array, to apply the same transformation
      validateOrReject(this, classValidatorOptions)
        .catch((err) => err)
    );

    return new Promise(async (res, rej) => {
      // await validateOrReject(this, classValidatorOptions);
      await Promise.all(promiseCollection).then((out) => {
        out = out.filter((v) => !isNullOrUndefined(v)).flat();
        logger.debug("hello", out);
        if (out.length <= 0) {
          res(true);
        } else {
          rej(out as Error[]);
        }
      });
    });
  }
}
