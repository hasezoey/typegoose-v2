import { createConnection } from "../src/connectionHandler";
import { config } from "./utils/config";

describe("ConnectionTest", () => {
	it("should normally connect and disconnect", async () => {
		const options = {};
		if (config.Auth.User.length > 0) {
			Object.assign(options, {
				user: config.Auth.User,
				pass: config.Auth.Passwd,
				authSource: config.Auth.DB
			});
		}

		const con = createConnection(`mongodb://${config.IP}:${config.Port}/${config.DataBase + "1"}`, options);
		await con.connect();
		expect(await con.createCollection("test")).toBeTrue();
		expect(await con.dropCollection("test")).toBeTrue();
		expect(await con.dropDatabase()).toBeTrue();
		await con.disconnect();
	});
});
