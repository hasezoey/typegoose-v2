# Typegoose-v2 (Working Title)

 <sub>(These badges are from hasezoey:master)</sub>  
[![Build Status](https://travis-ci.com/hasezoey/typegoose-v2.svg?branch=master)](https://travis-ci.com/hasezoey/typegoose-v2)
<!--[![npm](https://img.shields.io/npm/dt/@hasezoey/typegoose-v2-v2.svg)](https://www.npmjs.com/package/@hasezoey/typegoose-v2) -->
[![Coverage Status](https://coveralls.io/repos/github/hasezoey/typegoose-v2/badge.svg?branch=master)](https://coveralls.io/github/hasezoey/typegoose-v2?branch=master)

Mongoose reinterpreted

**Please know that this is not an finished product and please know that i can abandon this at any time**

## Basic usage

```ts
// this example is not working, it is just to show how this package should work when finished
import { ModelOptions, Prop, Connection, Model, changeOptions } from '@hasezoey/typegoose-v2';
import * as mongoose from 'mongoose';

@ModelOptions({}) // default options
class Kitten extends Model {
  @Prop({ required: true })
  public name: string;

  @ArrayProp({ items: Kitten })
  public babies: Kitten[];
}

// const NewKitten = changeOptions(Kitten, {options});

(async () => {
  const connection = createConnection('mongodb://localhost:27017/test');
  // or the un-managed version
  const connection = new Connection('mongodb://localhost:27017/test')

  changeOptions({ connection: connection }, Kitten);

  const { _id: id } = await UserModel.create({ name: 'Kitty' });
  const kittys = await UserModel.findById(id).exec();

  console.log(kittys);
  // should print { _id: 59218f686409d670a97e53e0, name: 'Kitty', babies: undefined __v: 0 }
})();
```

## Requirements

* TypeScript 3.7+
* Node 12+
* `emitDecoratorMetadata` and `experimentalDecorators` must be enabled in `tsconfig.json`
* `class-validator` is a required peer-dependencie

## Install

`npm i -s @hasezoey/typegoose-v2` (its currently not an npm package)

## Testing

`npm test`

## Versioning

`Major.Minor.Fix` (or how npm expresses it `Major.Minor.Patch`)  
(This Project should comply with [Semver](https://semver.org))

## Join Our Discord Server

To ask questions or just talk with us [join our Discord Server](https://discord.gg/BpGjTTD)

## Integration

### class-validator

This Project works with `class-validator` & uses it internally

-> Please note, that if you dont want to use `class-validator`, there is currently a [known "warning message" of `No metadata found`](https://github.com/typestack/class-validator/issues/279)

### class-transformer

This Project should not have any issues with `class-transformer`

## Additonal Infos

Please know that this is a side project, that tries to reinterpret mongoose into typescript (extended typegoose)  
And please know that this project should not be considered stable  

This Project (typegoose-v2) is not compatible with mongoose or typegoose
