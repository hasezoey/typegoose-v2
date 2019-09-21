export interface PropDecoratorOptions {
  /**
   * Set a default value
   */
  default?: any;
  /**
   * Set if the property is required
   */
  required?: boolean;
  /**
   * shorthand for required
   */
  r?: boolean;
  validate?(): boolean;
}
