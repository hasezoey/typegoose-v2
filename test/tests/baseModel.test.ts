import { expect } from "chai";
import { LogLevels, setLogLevel } from "../../src";
import { Model } from "../../src/decorators/model.decorator";
import { Prop } from "../../src/decorators/prop.decorator";
import { logger } from "../../src/logSettings";
import { Base } from "../../src/model";

export function BasicModelTest() {
  it("should output the right to JSON for normal classes", () => {
    class BasicModelBasicJSON extends Base<BasicModelBasicJSON> {
      @Prop()
      public hello1!: string;

      @Prop()
      public hello2!: number;
    }

    const doc = new BasicModelBasicJSON({ hello1: "Hello 1", hello2: 2 });

    expect(doc.toJSON()).to.deep.equal({ hello1: "Hello 1", hello2: 2, _id: undefined });
  });

  it("should output the right to JSON with getter classes", () => {
    class BasicModelGettersJSON extends Base<BasicModelGettersJSON> {
      @Prop()
      public hello1!: string;

      public get IDK() {
        return 5;
      }
    }

    const doc = new BasicModelGettersJSON({ hello1: "Hello 1" });

    expect(doc.toJSON({ virtuals: true })).to.deep.equal({ hello1: "Hello 1", IDK: 5, _id: undefined });
  });

  it.skip("TEST", async () => {
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
    logger.info("toJSON", doc.toJSON({ virtuals: true }));
    // validateProp(Testing, "something", String, "Hello", false);
    // validateProp(Testing, "something", String, 0, false);
    logger.info("return", await doc.validate(false));
  });
}
