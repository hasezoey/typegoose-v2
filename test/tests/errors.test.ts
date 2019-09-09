import { assert, expect } from "chai";
import { Model } from "../../src/decorators/model.decorator";
import { Prop } from "../../src/decorators/prop.decorator";
import { WrongOptionError } from "../../src/errors/propErrors";
import { setLogLevel, LogLevels } from "../../src";

export function ErrorTests() {
  it("should throw an TypeError when @Prop is tried to be used as a class decorator", async () => {
    try {
      @Prop()
      class T { }
      assert.fail("expected to throw an Error!");
    } catch (err) {
      expect(err).to.be.an.instanceOf(TypeError);
    }
  });

  it("should throw an TypeError when @Model is tried to be used as a non-class decorator", async () => {
    try {
      class T {
        @Model()
        public t;
      }
      assert.fail("expected to throw an Error!");
    } catch (err) {
      expect(err).to.be.an.instanceOf(TypeError);
    }
  });

  it("should throw an WrongOptionError when @Model is tried to be used with a wrong option", async () => {
    try {
      // @ts-ignore
      @Model({ autoIndex: "notOK" })
      class T { }
      assert.fail("expected to throw an WrongOptionError!");
    } catch (err) {
      expect(err).to.be.an.instanceOf(WrongOptionError);
    }
  });

  it("TEST", () => {
    setLogLevel(LogLevels.TRACE);
    class H { }

    class T {
      @Prop()
      public t: string;
      @Prop()
      public t1: undefined;
      @Prop()
      public t2: Buffer;
      @Prop()
      public t3: H;
    }
  });
}
