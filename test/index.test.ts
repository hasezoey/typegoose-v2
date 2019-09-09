import { use } from "chai";
import * as cap from "chai-as-promised";

import { ConnectionTest } from "./tests/connection.test";
import { ErrorTests } from "./tests/errors.test";

// import { connect, disconnect } from './utils/mongooseConnect';

use(cap);

describe("Typegoose", () => {
  // before(connect);
  // after(disconnect);

  describe("Errors", ErrorTests.bind(this));

  describe("Connection", ConnectionTest.bind(this));
});
