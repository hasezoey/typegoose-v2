/**
 * This is the ENUM for Conenction States
 */
export enum ConnectionState {
  /**
   * connect() was not called yet
   */
  uninitialized,
  /**
   * connect() got called, but not connected yet
   */
  connecting,
  /**
   * connect() finished and is now connected
   */
  connected,
  /**
   * disconnect() got called, but not disconnected yet
   */
  disconnecting,
  /**
   * disconnect() finished and is now disconnected
   */
  disconnected,
  /**
   * reserved for future use
   */
  error
}
