# Typegoose-v2

<sub>(These badges are from hasezoey:master)</sub>  
[![Build Status](https://travis-ci.com/hasezoey/typegoose-v2.svg?branch=master)](https://travis-ci.com/hasezoey/typegoose-v2)
[![Coverage Status](https://coveralls.io/repos/github/hasezoey/typegoose-v2/badge.svg?branch=master#feb282019)](https://coveralls.io/github/hasezoey/typegoose-v2?branch=master)
[![npm](https://img.shields.io/npm/dt/@hasezoey/typegoose-v2-v2.svg)](https://www.npmjs.com/package/@hasezoey/typegoose-v2)

Define Mongoose models using TypeScript classes.

## Basic usage

```ts
import { prop, getModelForClass } from 'typegoose';
import * as mongoose from 'mongoose';

mongoose.connect('mongodb://localhost:27017/test');

class User {
  @prop()
  name?: string;
}

const UserModel = getModelForClass(User);

// UserModel is a regular Mongoose Model with correct types
(async () => {
  const { _id: id } = await UserModel.create({ name: 'JohnDoe' });
  const user = await UserModel.findById(id).exec();

  console.log(user);
  // prints { _id: 59218f686409d670a97e53e0, name: 'JohnDoe', __v: 0 }
})();
```

## Requirements

* TypeScript 3.2+
* Node 8+
* `emitDecoratorMetadata` and `experimentalDecorators` must be enabled in `tsconfig.json`

## Install

`npm i -s @hasezoey/typegoose-v2`

## Testing

`npm test`

## Versioning

`Major.Minor.Fix` (or how npm expresses it `Major.Minor.Patch`)  
(This Project should comply with [Semver](https://semver.org))

## Join Our Discord Server

To ask questions or just talk with us [join our Discord Server](https://discord.gg/BpGjTTD)

## Additonal Infos

Please know that this is a side project, that tries to reinterpret mongoose into typescript (extended typegoose)
and please know that this project should not be considered stable

This Project (typegoose-v2) is not compatible with mongoose or typegoose
