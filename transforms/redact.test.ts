// deno-lint-ignore-file no-explicit-any
import { assertEquals, assertStrictEquals } from "jsr:@std/assert";

import { redact, redacted, secret } from "./redact.ts";

Deno.test("redacts string literal from a shallow array", () => {
  const data = ["foo", "bar", "baz"];
  assertEquals(redact(data, { values: ["bar"] }), ["foo", redacted, "baz"]);
  assertEquals(data, ["foo", redacted, "baz"]);
});

Deno.test("redacts string match from a shallow array", () => {
  const data = ["foobarbaz"];
  assertEquals(redact(data, { values: ["bar"] }), ["fooredactedbaz"]);
  assertEquals(data, ["fooredactedbaz"]);
});

Deno.test("redacts regexp match from a shallow array", () => {
  const data = ["foo", "bar", "baz"];
  assertEquals(redact(data, { values: [/bar/] }), ["foo", redacted, "baz"]);
  assertEquals(data, ["foo", redacted, "baz"]);
});

Deno.test("redacts partial regexp match from a shallow array", () => {
  const data = ["foo", "barstool", "baz"];
  assertEquals(redact(data, { values: [/bar/] }), [
    "foo",
    "redactedstool",
    "baz",
  ]);
  assertEquals(data, ["foo", "redactedstool", "baz"]);
});

Deno.test("redacts partial string match from a shallow array", () => {
  const data = ["foo", "barstool", "baz"];
  assertEquals(redact(data, { values: ["bar"] }), [
    "foo",
    "redactedstool",
    "baz",
  ]);
  assertEquals(data, ["foo", "redactedstool", "baz"]);
});

Deno.test("secret marker", async ({ step }) => {
  await step("redacts and clears array when marker is found", () => {
    const data: any = ["foo", "bar", "baz"];
    Object.defineProperty(data, secret, {});
    assertStrictEquals(redact(data), redacted);
    assertEquals(data, []);
  });

  await step("redacts nested array when marker is found", () => {
    const data: any = ["foo", "bar", "baz", ["foo", "bar", "baz"]];
    Object.defineProperty(data[3], secret, {});
    assertEquals(redact(data), ["foo", "bar", "baz", redacted]);
    assertEquals(data, ["foo", "bar", "baz", redacted]);
  });

  await step("redacts and clears object when marker is found", () => {
    const data: any = { foo: "bar" };
    Object.defineProperty(data, secret, {});
    assertStrictEquals(redact(data), redacted);
    assertEquals(data, {});
  });

  await step("redacts nested object when marker is found", () => {
    const data: any = { foo: "bar", baz: { foo: "bar" } };
    Object.defineProperty(data.baz, secret, {});
    assertEquals(redact(data), { foo: "bar", baz: redacted });
    assertEquals(data, { foo: "bar", baz: redacted });
  });
});

Deno.test("redacts string property from object", () => {
  const data: any = { password: "this is secret" };
  assertEquals(redact(data, { properties: ["password"] }), {
    password: redacted,
  });
  assertEquals(data, { password: redacted });
});

Deno.test("redacts symbol property from object", () => {
  const data: any = { [Symbol.for("foo")]: "bar" };
  assertEquals(redact(data, { properties: [Symbol.for("foo")] }), {
    [Symbol.for("foo")]: redacted,
  });
  assertEquals(data, { [Symbol.for("foo")]: redacted });
});

Deno.test("redacts number property from object", () => {
  const data: any = { [0]: "bar" };
  assertEquals(redact(data, { properties: [0] }), { [0]: redacted });
  assertEquals(data, { [0]: redacted });
});

Deno.test("redacts symbol property from array", () => {
  const data: any = [];
  data[Symbol.for("foo")] = "bar";
  redact(data, { properties: [Symbol.for("foo")] });
  assertEquals(data[Symbol.for("foo")], redacted);
});

Deno.test("redacts number property from array", () => {
  const data: any = ["foo", "bar"];
  assertEquals(redact(data, { properties: [0] }), [redacted, "bar"]);
  assertEquals(data, [redacted, "bar"]);
});

Deno.test("redacts whole line regexp match", () => {
  const data = ["foo", "bar", "baz"];
  assertEquals(redact(data, { values: [/^bar$/] }), ["foo", redacted, "baz"]);
  assertEquals(data, ["foo", redacted, "baz"]);
});
