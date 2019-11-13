import { Contains } from "class-validator";
import { Base, changeOptions, Connection, LogLevels, Model, Prop, setLogLevel } from "../src";
import { logger } from "../src/logSettings";
import { config } from "./utils/config";

describe("BasicModelTest", () => {
	it("should output the right to JSON for normal classes", () => {
		class BasicModelBasicJSON extends Base<BasicModelBasicJSON> {
			@Prop()
			public hello1!: string;

			@Prop()
			public hello2!: number;

			public get thisShouldNotBeIncluded() {
				return 5;
			}
		}

		const doc = new BasicModelBasicJSON({ hello1: "Hello 1", hello2: 2 });

		expect(doc.serialize()).toStrictEqual({ hello1: "Hello 1", hello2: 2, _id: null });
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

		expect(doc.serialize(true)).toStrictEqual({ hello1: "Hello 1", IDK: 5, _id: null });
	});

	it("should reject with validation errors", async () => {
		expect.assertions(2);
		class BasicModelValidation extends Base<BasicModelValidation> {
			@Prop({ required: true }) // basic test for typegoose-validation
			public testreq?: string;

			@Prop() // basic test for class-validator validation
			@Contains("Hello")
			public something: string;
		}

		const doc = new BasicModelValidation({ something: "hi" });

		try {
			await doc.validate();
		} catch (err) {
			expect(err).toBeArray();
			expect(err).toBeArrayOfSize(2);
		}
	});

	it("testy", async () => {
		setLogLevel(LogLevels.TRACE);

		const con = new Connection(`mongodb://${config.IP}:${config.Port}/${config.DataBase}`);
		await con.connect();

		@Model({
			// connection: con
		})
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

		changeOptions({ connection: con }, Testing);

		// const doc = await Testing.create({ something: "hi", test3: "hi" });
		const doc = new Testing({ something: "hi", test3: "hi" });
		logger.info("validate", await doc.validate().catch((o) => o));
		logger.info("serialize", doc.serialize(true));
		// validateProp(Testing, "something", String, "Hello", false);
		// validateProp(Testing, "something", String, 0, false);

		await doc.save();

		await con.disconnect();
	}, 10000);
});
