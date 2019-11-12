import { fail } from "assert";
import { Model, Prop } from "../src";
import { WrongOptionError, WrongTypeError } from "../src/errors/propErrors";
// tslint:disable:no-unused-variable

describe("ErrorTests", () => {
  it("should throw an TypeError when @Prop is tried to be used as a class decorator", () => {
    try {
      @Prop()
      class ErrorPropAsModel { }
      fail("expected to throw an Error!");
    } catch (err) {
      expect(err).toBeInstanceOf(TypeError);
    }
  });

  it("should throw an TypeError when @Model is tried to be used as a non-class decorator", () => {
    try {
      class ErrorModelAsProp {
        @Model({})
        public t;
      }
      fail("expected to throw an Error!");
    } catch (err) {
      expect(err).toBeInstanceOf(TypeError);
    }
  });

  it("should throw an WrongOptionError when @Model is tried to be used with a wrong option", () => {
    try {
      // @ts-ignore
      @Model({ autoIndex: "notOK" })
      class ErrorWrongModelOption { }
      fail("expected to throw an WrongOptionError!");
    } catch (err) {
      expect(err).toBeInstanceOf(WrongOptionError);
    }
  });

  it("should throw if a Type is null or undefined", () => {
    // Test for NULL
    try {
      class ErrorTypeAsNull {
        @Prop()
        public t: null;
      }
      fail("expected to throw an WrongTypeError!");
    } catch (err) {
      expect(err).toBeInstanceOf(WrongTypeError);
    }

    // Test for UNDEFINED
    try {
      class ErrorTypeAsUndefined {
        @Prop()
        public t: undefined;
      }
      fail("expected to throw an WrongTypeError!");
    } catch (err) {
      expect(err).toBeInstanceOf(WrongTypeError);
    }
  });
});
