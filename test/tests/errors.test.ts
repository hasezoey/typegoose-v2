import { assert, expect } from "chai";
import { Model } from "../../src/decorators/model.decorator";
import { Prop } from "../../src/decorators/prop.decorator";
import { WrongOptionError, WrongTypeError } from "../../src/errors/propErrors";

// tslint:disable:no-unused-variable

export function ErrorTests() {
  it("should throw an TypeError when @Prop is tried to be used as a class decorator", () => {
    try {
      @Prop()
      class ErrorPropAsModel { }
      assert.fail("expected to throw an Error!");
    } catch (err) {
      expect(err).to.be.an.instanceOf(TypeError);
    }
  });

  it("should throw an TypeError when @Model is tried to be used as a non-class decorator", () => {
    try {
      class ErrorModelAsProp {
        @Model()
        public t;
      }
      assert.fail("expected to throw an Error!");
    } catch (err) {
      expect(err).to.be.an.instanceOf(TypeError);
    }
  });

  it("should throw an WrongOptionError when @Model is tried to be used with a wrong option", () => {
    try {
      // @ts-ignore
      @Model({ autoIndex: "notOK" })
      class ErrorWrongModelOption { }
      assert.fail("expected to throw an WrongOptionError!");
    } catch (err) {
      expect(err).to.be.an.instanceOf(WrongOptionError);
    }
  });

  it("should throw if a Type is null or undefined", () => {
    // Test for NULL
    try {
      class ErrorTypeAsNull {
        @Prop()
        public t: null;
      }
      assert.fail("expected to throw an WrongTypeError!");
    } catch (err) {
      expect(err).to.be.an.instanceOf(WrongTypeError);
    }

    // Test for UNDEFINED
    try {
      class ErrorTypeAsUndefined {
        @Prop()
        public t: undefined;
      }
      assert.fail("expected to throw an WrongTypeError!");
    } catch (err) {
      expect(err).to.be.an.instanceOf(WrongTypeError);
    }
  });
}
