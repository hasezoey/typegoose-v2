import { EventEmitter } from "events";
import { merge } from "lodash";
import { CollectionCreateOptions, Db, MongoClient } from "mongodb";
import { ConnectionState } from "./constants/connectionState";
import { GenericError } from "./errors/genericError";
import { connections } from "./internal/data";
import { assert, isNullOrUndefined, promisifyEvent } from "./internal/utils";
import { logger } from "./logSettings";
import { IConnectionConfig } from "./types/connectionStateTypes";

export class Connection extends EventEmitter {
	public get config(): IConnectionConfig {
		return this._config;
	}
	public set config(i) {
		assert(
			this._state === ConnectionState.disconnected
			|| this._state === ConnectionState.uninitialized,
			new GenericError("Cannot set Config after already connecting!")
		);
		merge(this._config, i);
	}

	public get state(): ConnectionState {
		return this._state;
	}

	public readonly mongoClient: MongoClient;
	private _config: IConnectionConfig = {
		useNewUrlParser: true,
		useUnifiedTopology: true
	};

	private _state: ConnectionState = ConnectionState.uninitialized;
	private db?: Db;

	constructor(uri: string, config?: IConnectionConfig) {
		super();

		this.config = typeof config === "object" ? config : {};
		assert(typeof uri === "string", new GenericError("URI must be a string, got \"%s\""));

		// The Block below is for config & its validation
		{
			const mongoOptions = Object.assign({}, this.config);

			this.mongoClient = new MongoClient(uri, mongoOptions);
		}

		this.on("connected", () => this._state = ConnectionState.connected);
		this.on("disconnected", () => this._state = ConnectionState.disconnected);
		this.on("error", () => this._state = ConnectionState.error);

		logger.info("Created new Connection with %o", config);
	}

	/**
	 * Connect the Connection
	 */
	public async connect(): Promise<void> {
		assert(
			this._state === ConnectionState.uninitialized || this._state === ConnectionState.disconnected,
			new GenericError("\"%s\" is not a valid state for connecting!", this._state)
		);

		logger.info("calling mongoClient.connect");
		this._state = ConnectionState.connecting;
		await this.mongoClient.connect().catch((err) => {
			this._state = ConnectionState.error;
			throw err;
		});
		this.db = this.mongoClient.db();
		this.db.on("close", () => {
			logger.info("mongoClient close fired");
			this._state = ConnectionState.disconnected;
			this.emit("disconnected");
		});
		this.db.on("error", (err) => {
			logger.info("mongoClient error fired", err);
			this._state = ConnectionState.error;
			this.emit("error", err);
		});
		this.db.on("timeout", () => {
			logger.info("mongoClient timeout fired");
			this.emit("timeout");
		});

		this._state = ConnectionState.connected;
		this.emit("connected");
		logger.info("mongoClient.connect connected");

		return;
	}

	/**
	 * Disconnect the Connection
	 * @param force Force close, emitting no events (passing to MongoDB)
	 */
	public async disconnect(force?: boolean): Promise<void> {
		switch (this._state) {
			case ConnectionState.uninitialized:
			case ConnectionState.disconnected:
				return;
			case ConnectionState.disconnecting:
				return await promisifyEvent(this.once, "disconnected") as void;
			case ConnectionState.connecting:
				await promisifyEvent(this.once, "connected");

				return this.disconnect();
			case ConnectionState.connected:
				logger.info("disconnecting");
				this._state = ConnectionState.disconnecting;
				this.emit("disconnecting");

				return await this.mongoClient.close(force);
		}
	}

	/**
	 * Wrapper for this.db.createCollection
	 * Might be removed later
	 * @param name
	 * @param options
	 */
	public async createCollection(name: string, options?: CollectionCreateOptions): Promise<boolean> {
		if (!isNullOrUndefined(this.db)) {
			logger.info("createCollection called");
			const store = await this.db.createCollection(name, options);

			return !isNullOrUndefined(store);
		}

		logger.warn("createCollection was called, but \"this.db\" was undefined");

		return false;
	}

	public async dropCollection(name: string): Promise<boolean> {
		if (!isNullOrUndefined(this.db)) {
			logger.info("dropCollection called");

			return await this.db.dropCollection(name);
		}

		logger.warn("dropCollection was called, but \"this.db\" was undefined");

		return false;
	}

	public async dropDatabase(): Promise<boolean> {
		if (!isNullOrUndefined(this.db)) {
			logger.info("dropDatabase called");
			await this.db.dropDatabase();

			return true;
		}

		logger.warn("dropDatabase was called, but \"this.db\" was undefined");

		return false;
	}
}

/**
 * Connection Factory
 * @param uri
 * @param config
 */
export function createConnection(uri: string, config?: IConnectionConfig): Connection {
	const con = new Connection(uri, config);
	connections.push(con);

	return con;
}

/**
 * Disconnect all Stored Connections
 */
export async function disconnectAll(): Promise<void> {
	const promises: Promise<void>[] = [];
	for (const connection of connections) {
		promises.push(connection.disconnect());
	}

	await Promise.all(promises);

	return;
}
