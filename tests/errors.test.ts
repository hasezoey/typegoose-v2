import { Model, Prop } from "../src";
import { WrongOptionError, WrongTypeError } from "../src/errors/propErrors";
// tslint:disable:no-unused-variable

describe("ErrorTests", () => {
	it("should throw an TypeError when @Prop is tried to be used as a class decorator", () => {
		expect.assertions(1);
		try {
			@Prop()
			class ErrorPropAsModel { }
		} catch (err) {
			expect(err).toBeInstanceOf(TypeError);
		}
	});

	it("should throw an TypeError when @Model is tried to be used as a non-class decorator", () => {
		expect.assertions(1);
		try {
			class ErrorModelAsProp {
				@Model({})
				public t: undefined;
			}
		} catch (err) {
			expect(err).toBeInstanceOf(TypeError);
		}
	});

	it("should throw an WrongOptionError when @Model is tried to be used with a wrong option", () => {
		expect.assertions(1);
		try {
			// @ts-ignore
			@Model({ autoIndex: "notOK" })
			class ErrorWrongModelOption { }
		} catch (err) {
			expect(err).toBeInstanceOf(WrongOptionError);
		}
	});

	it("should throw if a Type is null or undefined", () => {
		expect.assertions(2);
		// Test for NULL
		try {
			class ErrorTypeAsNull {
				@Prop()
				public t!: null;
			}
		} catch (err) {
			expect(err).toBeInstanceOf(WrongTypeError);
		}

		// Test for UNDEFINED
		try {
			class ErrorTypeAsUndefined {
				@Prop()
				public t: undefined;
			}
		} catch (err) {
			expect(err).toBeInstanceOf(WrongTypeError);
		}
	});
});
