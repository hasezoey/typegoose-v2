import { EventEmitter } from "events";
import { CollectionCreateOptions, Db, MongoClient } from "mongodb";
import { ConnectionState } from "./constants/connectionState";
import { connections } from "./internal/data";
import { isNullOrUndefined, promisifyEvent } from "./internal/utils";
import { log } from "./logSettings";
import { ConnectionConfig } from "./types/connectionStateTypes";

export class Connection extends EventEmitter {
  public connectionState: ConnectionState;
  public readonly config: ConnectionConfig;

  private _state: ConnectionState = ConnectionState.uninitialized;
  private mongoClient: MongoClient;
  private db?: Db;

  public get state() {
    return this._state;
  }

  // public models: any[]; // TODO: change this when models are implemented

  constructor(uri: string, config?: ConnectionConfig) {
    super();
    if (typeof config !== "object") {
      config = {};
    }
    if (typeof uri !== "string") {
      throw new Error(`URI must be a string, got "${typeof uri}"`); // TODO: change this to a custom error
    }

    // The Block below is for config & its validation
    {
      const defaultConfig: ConnectionConfig = {
        useNewUrlParser: true,
        reconnectTries: 30,
        reconnectInterval: 1000,
        poolSize: 5,
        connectTimeoutMS: 30000,
        socketTimeoutMS: 30000,
        reCreateAfterDrop: true,
        useUnifiedTopology: true
      };
      this.config = Object.assign(defaultConfig, config); // rely on Typescript's definitions
      const mongoOptions = Object.assign({}, this.config);

      if (!isNullOrUndefined(mongoOptions.bufferCommands)) {
        delete mongoOptions.bufferCommands;
      }
      if (!isNullOrUndefined(mongoOptions.reCreateAfterDrop)) {
        delete mongoOptions.reCreateAfterDrop;
      }

      this.mongoClient = new MongoClient(uri, mongoOptions);
    }

    this.on("connected", () => this._state = ConnectionState.connected);
    this.on("disconnected", () => this._state = ConnectionState.disconnected);
    this.on("error", () => this._state = ConnectionState.error);

    log.info("Created new Connection with %o", config);
  }

  /**
   * Connect the Connection
   */
  public async connect() {
    // throw new Error("Not Implemented");
    if (this._state !== ConnectionState.disconnected && this._state !== ConnectionState.uninitialized) {
      log.info("Connnection.connect got called, but state was not \"disconnected\" or \"uninitialized\"");

      return;
    }

    log.info("calling mongoClient.connect");
    this._state = ConnectionState.connecting;
    await this.mongoClient.connect().catch((err) => {
      this._state = ConnectionState.error;
      throw err;
    });
    this.db = this.mongoClient.db();
    this.db.on("close", () => {
      log.info("mongoClient close fired");
      this._state = ConnectionState.disconnected;
      this.emit("disconnected");
    });
    this.db.on("error", (err) => {
      log.info("mongoClient error fired", err);
      this._state = ConnectionState.error;
      this.emit("error", err);
    });
    this.db.on("timeout", () => {
      log.info("mongoClient timeout fired");
      this.emit("timeout");
    });

    this._state = ConnectionState.connected;
    this.emit("connected");
    log.info("mongoClient.connect connected");

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
        log.info("disconnecting");
        this._state = ConnectionState.disconnecting;
        this.emit("disconnecting");

        return await this.mongoClient.close(force);
    }
  }

  public async createCollection(name: string, options?: CollectionCreateOptions): Promise<boolean> {
    if (!isNullOrUndefined(this.db)) {
      log.info("createCollection called");
      const store = await this.db.createCollection(name, options);

      return !isNullOrUndefined(store);
    } else {
      log.warn("createCollection was called, but \"this.db\" was undefined");

      return false;
    }
  }

  public async dropCollection(name: string): Promise<boolean> {
    if (!isNullOrUndefined(this.db)) {
      log.info("dropCollection called");

      return await this.db.dropCollection(name);
    } else {
      log.warn("dropCollection was called, but \"this.db\" was undefined");

      return false;
    }
  }

  public async dropDatabase(): Promise<boolean> {
    if (!isNullOrUndefined(this.db)) {
      log.info("dropDatabase called");
      await this.db.dropDatabase();

      return true;
    } else {
      log.warn("dropDatabase was called, but \"this.db\" was undefined");

      return false;
    }
  }
}

/**
 * Connection Factory
 * @param uri
 * @param config
 */
export function createConnection(uri: string, config?: ConnectionConfig) {
  const con = new Connection(uri, config);
  connections.push(con);

  return con;
}

/**
 * Disconnect all Stored Connections
 */
export async function disconnectAll() {
  const promises: Promise<void>[] = [];
  for (const connection of connections) {
    promises.push(connection.disconnect());
  }

  return Promise.all(promises);
}
