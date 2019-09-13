---
title: "Examples"
---

Please know that these Examples are currently just goals, how it should work

```ts
@Model()
class Kitten {
  @Prop({ required: true })
  public name: string;

  @ArrayProp({ items: Kitten })
  public babies: Kitten[];
}
```

OR

```ts
class Kitten extends Model {
  @Prop({ required: true })
  public name: string;

  @ArrayProp({ items: Kitten })
  public babies: Kitten[];
}
```

OR

```ts
@ModelOptions()
class Kitten extends Model {
  @Prop({ required: true })
  public name: string;

  @ArrayProp({ items: Kitten })
  public babies: Kitten[];
}
```

---

```ts
enum HairTypes {
  "Black"
  "Orange"
}

@Model() // is needed everywhere
class Hair {
  @Prop({ required: true, enum: HairTypes })
  public type: string;
}

@Model()
class Kitten {
  @Prop({ required: true })
  public name: string;

  @Prop({ required: true })
  public hair: Hair;

  @ArrayProp({ items: Kitten })
  public babies: Kitten[];
}
```

OR

```ts
enum HairTypes {
  "Black"
  "Orange"
}

class Hair extends Model { // is needed everywhere
  @Prop({ required: true, enum: HairTypes })
  public type: string;
}

class Kitten extends Model {
  @Prop({ required: true })
  public name: string;

  @Prop({ required: true })
  public hair: Hair;

  @ArrayProp({ items: Kitten })
  public babies: Kitten[];
}
```

OR

```ts
enum HairTypes {
  "Black"
  "Orange"
}

@ModelOptions()
class Hair extends Model { // is needed everywhere
  @Prop({ required: true, enum: HairTypes })
  public type: string;
}

@ModelOptions()
class Kitten extends Model {
  @Prop({ required: true })
  public name: string;

  @Prop({ required: true })
  public hair: Hair;

  @ArrayProp({ items: Kitten })
  public babies: Kitten[];
}
```

---

I'm not fully sure which of these approches are usable / which i decide to use
