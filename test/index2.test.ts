import { connect, disconnect } from "./utils/autoConnect";

/**
 * This is the collection for Tests that use / need auto-connection
 */
export function AutoConnectTests() {
  before(connect);
  after(disconnect);

  // nothing
}
