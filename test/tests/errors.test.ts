import { serialize } from "bson";
import { assert, expect } from "chai";
import { LogLevels, setLogLevel } from "../../src";
import { ReflectKeys } from "../../src/constants/reflectKeys";
import { Model } from "../../src/decorators/model.decorator";
import { Prop } from "../../src/decorators/prop.decorator";
import { WrongOptionError, WrongTypeError } from "../../src/errors/propErrors";
import { logger } from "../../src/logSettings";
import { Base } from "../../src/model";

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

  it("TEST", async () => {
    setLogLevel(LogLevels.TRACE);

    @Model()
    class Testing extends Base<Testing> {
      @Prop()
      public something: string;

      @Prop({ default: "Hello from Prop" })
      public defaulting?: string;

      public test1() {
        // hello
      }

      public static test2() {
        // hello
      }

      public get test3() {
        return "";
      }
      public set test3(input) {
        "";
      }
    }

    const doc = await Testing.create({ something: "hi", test3: "hi" });
    logger.info("toJSON", doc.toJSON());
    doc.test();
  });
}
