import { EJSON, ObjectID } from "bson";
import { validateOrReject, ValidatorOptions } from "class-validator";
import { get, set } from "lodash";
import { Collection, FilterQuery, FindOneOptions } from "mongodb";
import { Connection } from "./connectionHandler";
import { ReflectKeys } from "./constants/reflectKeys";
import { Prop } from "./decorators/prop.decorator";
import { GenericError } from "./errors/genericError";
import { getGlobalOptions } from "./globalOptions";
import { assert, getAllGetters, getClassName, isNullOrUndefined, validateProp } from "./internal/utils";
import { logger } from "./logSettings";
import { IModelDecoratorOptions } from "./types/modelDecoratorTypes";
import { IPropDecoratorOptions } from "./types/propDecoratorTypes";
import { IObjectStringAny } from "./types/utilityTypes";

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

export type CreateOptions<T extends Base<any>> = WritablePart<NonFunctionProperties<MakeSomeOptional<T, "_id" | "isNew">>>;

export type Query<T extends Base<any>> = WritablePart<NonFunctionProperties<T>>;

// End of magic types

/*
 * Note:
 * "get" & "set" from lodash are used, because otherwise typescript would complain in strict mode
 */

export abstract class Base<T extends Base<any>> {
	/**
	 * Run a findOne query an return undefined or an instance of this class
	 * @param query The Query
	 */
	public static async findOne<T extends Base<any>>(
		this: Pick<typeof Base, keyof typeof Base> & (new (...a: any[]) => T),
		query: FilterQuery<Query<T>>,
		options?: FindOneOptions
	): Promise<T | undefined> {
		logger.debug("findOne called on %s", this.name);

		const con = getConnection(this);
		const coll = con.mongoClient.db().collection(getCollectionName(this));

		const result = await coll.findOne(query, options);

		logger.debug("hello result", result);

		return new this(result, false);
	}

	/**
	 * Run a findMany query and return an array (empty or instances of this class)
	 * @param query The Query
	 */
	public static findMany(query: object): void {
		return;
	}

	/**
	 * Create an Document and save it
	 * QoL function
	 * @param value
	 */
	public static async create<T extends Base<any>>(
		this: new (...a: any[]) => T,
		value: CreateOptions<T>
	): Promise<T> {
		const doc = new this(value);
		await doc.save();

		return doc;
	}

	@Prop()
	public _id!: ObjectID;

	public readonly isNew: boolean;

	constructor(value: CreateOptions<T>, isNew: boolean = true) {
		logger.debug("Constructing %s", this.constructor.name, isNew);
		this.isNew = isNew;

		forAllProps(this, (prop) => {
			logger.debug("Assigning Values to Properties for %s", prop);
			// Initialize all the @Prop's with undefined, if not existing
			set(this, prop, get(this, prop) ?? undefined);

			const propOptions = getPropOptions(this, prop);
			if ("default" in propOptions) {
				set(this, prop, propOptions.default);
			}
		});

		Object.assign(this, value);
	}

	/**
	 * Saves the Document
	 */
	public async save(): Promise<void> {
		logger.debug("save called on %s", getClassName(this));
		const coll = await this.createCollection();
		const result = await coll.insertOne(this.serialize());
		if (!(result.insertedId instanceof ObjectID)) {
			throw new GenericError("Expected \"insertedId\" to be an instance of ObjectID!");
		}
		this._id = result.insertedId;

		return;
	}

	/**
	 * Stringify-serialize
	 */
	public toString(getters?: boolean): string {
		return JSON.stringify(this.serialize(getters));
	}

	/**
	 * Serialize the current class to a BSON object
	 * Please note that this function does NOT call .validate
	 * Please also note that this function ONLY serializes properties that have `@Prop` called on them!
	 * @param getters Include getters?
	 */
	public serialize(getters?: boolean): object {
		const copy: IObjectStringAny = {};

		if (getters) {
			const keys = getAllGetters(this);
			keys.forEach((key) => {
				copy[key] = get(this, key);
			});
		}

		/**
		 * To get all the properties to map over to apply Prop-Options
		 */
		forAllProps(this, (prop) => {
			// this commented out code is for later use
			// const options = Reflect.getMetadata(ReflectKeys.PropOptions, this, prop) ?? {};
			copy[prop] = get(this, prop);
		});

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
		const allProps = getAllProps(this);
		for (const key of Object.keys(this)) {
			if (allProps.has(key)) {
				const Type: unknown = Reflect.getMetadata(ReflectKeys.Type, this, key);
				promiseCollection.push(
					validateProp(this, key, Type, get(this, key))
						.catch((err) => err)
						.then((out) =>
							typeof out === "boolean" ? void 0 : out)
				);
			} else {
				logger.info("\"%s\" is not in AllProps", key);
			}
		}

		promiseCollection.push(
			// push class-validator's validator to the array, to apply the same transformation
			validateOrReject(this, classValidatorOptions)
				.catch((err) => err)
		);

		return new Promise(async (res, rej) => {
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

	/**
	 * Check if the collection exists
	 */
	protected async createCollection(): Promise<Collection> {
		const con = getConnection(this);
		try {
			return con.mongoClient.db().collection(getCollectionName(this), { strict: true });
		} catch (err) {
			const coll = con.mongoClient.db().collection(getCollectionName(this));
			// apply indexes

			return coll;
		}
	}
}

/**
 * Get Model Options (or empty object)
 * (Auto Detects if .constructor should be used)
 */
function getModelOptions(cl: Base<any> | typeof Base): IModelDecoratorOptions {
	if (cl instanceof Base) {
		return Reflect.getMetadata(ReflectKeys.PropOptions, cl.constructor) ?? {};
	}

	return Reflect.getMetadata(ReflectKeys.PropOptions, cl) ?? {};
}

/**
 * Check for an Connection & return it
 */
function getConnection(cl: Base<any> | typeof Base): Connection | never {
	const con: Connection | undefined = getModelOptions(cl).connection;
	assert(con instanceof Connection, new GenericError("Expected to have an Connection assigned!"));

	return con;
}

/**
 * Get the Collection name
 */
function getCollectionName(cl: Base<any> | typeof Base): string {
	const collection: string | undefined = getModelOptions(cl).collection;

	const glob = getGlobalOptions();
	if (isNullOrUndefined(collection)) {
		assert(glob.allowClassNameAsCollection, new GenericError("Collection is undefined and \"allowClassNameAsCollection\" is false! Model: %s", getClassName(cl)));

		return getClassName(cl);
	}

	return collection;
}

/**
 * Run cb for each Prop in [Meta]AllProps
 * @param target Target class
 * @param cb callback to call for each prop in AllProps
 */
function forAllProps(target: object, cb: (prop: string) => void): void {
	const allProps = getAllProps(target);
	for (const prop of allProps) {
		cb(prop);
	}
}

/**
 * Get All the Prop's options (or return empty object)
 * QoL function
 * @param target Target class
 * @param key Target Key
 */
function getPropOptions(target: object, key: string): IPropDecoratorOptions {
	return Reflect.getMetadata(ReflectKeys.PropOptions, target, key) ?? {};
}

/**
 * Get All Prop's
 * @param target Target Class
 */
function getAllProps(target: object): Set<string> {
	return Reflect.getMetadata(ReflectKeys.AllProps, target) ?? new Set();
}
