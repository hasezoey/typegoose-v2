import { MongoClientOptions } from "mongodb";

// export interface ConnectionConfig {
//   [key: string]: any; // so that options that are not listed here can be applied
//   useNewUrlParser?: boolean;
//   auth?: ConnectionConfigAuth;
//   port?: number;
//   reconnectTries?: number;
//   reconnectInterval?: number;
//   poolSize?: number;
//   /** Set this to 0, when no buffering should be used */
//   bufferMaxEntries?: number;
//   bufferCommands?: boolean; // idk if this is needed
//   connectTimeoutMS?: number;
//   socketTimeoutMS?: number;
// }

// export interface ConnectionConfigAuth {
//   user: string;
//   password: string;
//   authSource?: string;
// }

// tslint:disable-next-line:no-empty-interface
export interface IConnectionConfig extends MongoClientOptions { }
