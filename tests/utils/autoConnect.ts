import { Connection } from "../../src";
import { config } from "./config";

const options = {
	useNewUrlParser: true
	// useFindAndModify: true,
	// useCreateIndex: true,
	// dbName: config.DataBase,
	// autoIndex: true
};
if (config.Auth.User.length > 0) {
	Object.assign(options, {
		user: config.Auth.User,
		pass: config.Auth.Passwd,
		authSource: config.Auth.DB
	});
}

const currentConnection = new Connection(`mongodb://${config.IP}:${config.Port}/${config.DataBase}`, options);

/** is it the First time connecting in this test run? */
let isFirst = true;

/**
 * Make a Connection to MongoDB
 */
export async function connect(): Promise<void> {
	await currentConnection.connect();

	if (isFirst) {
		return await firstConnect();
	}

	return;
}

/**
 * Disconnect from MongoDB
 * @returns when it is disconnected
 */
export async function disconnect(): Promise<void> {
	await currentConnection.disconnect();

	return;
}

/**
 * Only execute this function when the tests were not started
 */
async function firstConnect() {
	isFirst = false;
	await currentConnection.dropDatabase(); // to always have a clean database

	// await Promise.all( // recreate the indexes that were dropped
	//   Object.keys(mongoose.models).map(async (modelName) => {
	//     await mongoose.models[modelName].ensureIndexes();
	//   })
	// );
}
