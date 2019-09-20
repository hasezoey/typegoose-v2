import { expect } from "chai";
import { LogLevels, setLogLevel } from "../../src";
import { createConnection } from "../../src/connectionHandler";
import { config } from "../utils/config";

export function ConnectionTest() {
  it("should normally connect and disconnect", async () => {
    const options = {};
    if (config.Auth.User.length > 0) {
      Object.assign(options, {
        user: config.Auth.User,
        pass: config.Auth.Passwd,
        authSource: config.Auth.DB
      });
    }
    setLogLevel(LogLevels.TRACE);
    const con = createConnection(`mongodb://${config.IP}:${config.Port}/${config.DataBase}`, options);
    await con.connect();
    expect(await con.createCollection("test")).to.equal(true);
    expect(await con.dropCollection("test")).to.equal(true);
    expect(await con.dropDatabase()).to.equal(true);
    await con.disconnect();
  });
}
