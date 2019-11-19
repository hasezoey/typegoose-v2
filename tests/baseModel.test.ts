import { Contains } from "class-validator";
import { ObjectId } from "mongodb";
import { Base, changeOptions, Connection, LogLevels, Model, Prop, setLogLevel } from "../src";
import { assert, isNullOrUndefined } from "../src/internal/utils";
import { logger } from "../src/logSettings";
import { config } from "./utils/config";

describe("BasicModelTest", () => {
	it("should output the right to JSON for normal classes", () => {
		class BasicModelBasicJSON extends Base<BasicModelBasicJSON> {
			@Prop()
			public hello1!: string;

			@Prop()
			public hello2!: number;

			public get thisShouldNotBeIncluded(): number {
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

			public get IDK(): number {
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
			public something!: string;
		}

		const doc = new BasicModelValidation({ something: "hi" });

		try {
			await doc.validate();
		} catch (err) {
			expect(err).toBeArray();
			expect(err).toBeArrayOfSize(2);
		}
	});

	describe("Tests with default connection", () => {
		let con: Connection;
		beforeAll(async () => {
			con = new Connection(`mongodb://${config.IP}:${config.Port}/${config.DataBase}`);
			await con.connect();
		});
		afterAll(async () => {
			await con.disconnect();
		});

		it("should create & save a document", async () => {
			expect.assertions(6);
			@Model({
				connection: con,
				dropOnCreate: true
			})
			class BasicCreateAndSave extends Base<BasicCreateAndSave> {
				@Prop()
				public hello!: string;
			}

			const doc = new BasicCreateAndSave({ hello: "Hi" });
			expect(doc.hello).toEqual("Hi");
			expect(doc._id).toEqual(undefined);
			expect(doc.isNew).toEqual(true);

			await doc.save();
			expect(doc.hello).toEqual("Hi");
			expect(doc._id).toBeInstanceOf(ObjectId);
			expect(doc.isNew).toEqual(false);
		});

		it("should make use of \".create\"", async () => {
			expect.assertions(3);
			@Model({
				connection: con,
				dropOnCreate: true
			})
			class BasicCreateQoL extends Base<BasicCreateQoL> {
				@Prop()
				public hello!: string;
			}

			const doc = await BasicCreateQoL.create({ hello: "Hi" });
			expect(doc.hello).toEqual("Hi");
			expect(doc._id).toBeInstanceOf(ObjectId);
			expect(doc.isNew).toEqual(false);
		});

		it("should make use of \".findOne\"", async () => {
			expect.assertions(3);
			@Model({
				connection: con,
				dropOnCreate: true
			})
			class BasicFindOne extends Base<BasicFindOne> {
				@Prop()
				public hello!: string;
			}

			const doc = await BasicFindOne.create({ hello: "Hi" });

			const found = await BasicFindOne.findOne({ hello: doc.hello }); // not testing _id, because this will be in findById
			assert(!isNullOrUndefined(found));
			expect(found.hello).toEqual("Hi");
			expect(found._id).toBeInstanceOf(ObjectId);
			expect(found.isNew).toEqual(false);
		});

		it("should make use of \".findById\"", async () => {
			expect.assertions(3);
			@Model({
				connection: con,
				dropOnCreate: true
			})
			class BasicFindById extends Base<BasicFindById> {
				@Prop()
				public hello!: string;
			}

			const doc = await BasicFindById.create({ hello: "Hi" });

			const found = await BasicFindById.findById(doc._id);
			assert(!isNullOrUndefined(found));
			expect(found.hello).toEqual("Hi");
			expect(found._id).toBeInstanceOf(ObjectId);
			expect(found.isNew).toEqual(false);
		});

		it("should make use of \".findMany\"", async () => {
			expect.assertions(8);
			@Model({
				connection: con,
				dropOnCreate: true
			})
			class BasicFindMany extends Base<BasicFindMany> {
				@Prop()
				public hello!: string;
			}

			await BasicFindMany.create({ hello: "Hi1" });
			await BasicFindMany.create({ hello: "Hi2" });

			const found = await BasicFindMany.findMany({});

			expect(found).toBeArray();
			expect(found).toBeArrayOfSize(2);

			expect(found[0].hello).toEqual("Hi1");
			expect(found[0]._id).toBeInstanceOf(ObjectId);
			expect(found[0].isNew).toEqual(false);

			expect(found[1].hello).toEqual("Hi2");
			expect(found[1]._id).toBeInstanceOf(ObjectId);
			expect(found[1].isNew).toEqual(false);
		});
	});

	it("testy", async () => {
		setLogLevel(LogLevels.TRACE);

		const con = new Connection(`mongodb://${config.IP}:${config.Port}/${config.DataBase}`);
		await con.connect();

		@Model({
			// connection: con
		})
		class Testing extends Base<Testing> {
			public get test3(): string {
				return "";
			}
			public set test3(input) {
				"";
			}

			public static test2(): void {
				// hello
			}

			@Prop()
			public something!: string;

			@Prop({ default: "Hello from Prop" })
			public defaulting?: string;

			public test1(): void {
				// hello
			}
		}

		changeOptions({ connection: con }, Testing);

		// const doc = await Testing.create({ something: "hi", test3: "hi" });
		// logger.debug("modleoptions", Reflect.getMetadata(ReflectKeys.PropOptions, Testing));
		const doc = new Testing({ something: "hi", test3: "hi" });
		logger.info("validate", await doc.validate().catch((o) => o));
		logger.info("serialize", doc.serialize(true));
		// logger.info("toString before", doc.toString());

		await doc.save();

		// logger.info("toString after", doc.toString());

		const found = await Testing.findOne({ _id: doc._id });
		// const created = await Testing.create({ something: "hi", test3: "hi" });

		logger.info("found", found);

		// const foundbyid = await Testing.findById(doc._id);

		// logger.info("foundbyid", foundbyid);

		await con.disconnect();
	}, 10000);
});
