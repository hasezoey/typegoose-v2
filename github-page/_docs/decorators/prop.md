---
title: "@Prop"
---

Usage:

```ts
class Hello extends Base {
  @Prop()
  public hello: string;
}
```

## Options

### default

Usage:

```ts
class Hello extends Base {
  @Prop({ default: "Hello" })
  public hello: string;
}
```

## Notes

### Why are all values decorated initalized with undefined?

This is needed for iterating over properties, [look here for why](https://github.com/microsoft/TypeScript/issues/12437)

## Why is there no minimize option?

For Type-Safety and to have a consitent collection structure (Please dont ask for this option)
