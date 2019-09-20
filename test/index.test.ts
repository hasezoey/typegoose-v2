import { use } from "chai";
import * as cap from "chai-as-promised";

import { AutoConnectTests } from "./index2.test";
import { ConnectionTest } from "./tests/connection.test";
import { ErrorTests } from "./tests/errors.test";

use(cap);

describe("Typegoose", () => {
  describe("Errors", ErrorTests.bind(this));

  describe("Connection", ConnectionTest.bind(this));

  describe("AutoConnectTests", AutoConnectTests.bind(this));
});
