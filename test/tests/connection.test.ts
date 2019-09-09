// import { expect } from "chai";
import { LogLevels, setLogLevel } from "../../src";
import { Connection } from "../../src/connectionHandler";
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
    const con = new Connection(`mongodb://${config.IP}:${config.Port}/${config.DataBase}`, options);
    await con.connect();
    await con.disconnect();
  });
}
