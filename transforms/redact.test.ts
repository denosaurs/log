import { assertEquals } from "jsr:@std/assert";
import { redact, redacted } from "./redact.ts";

Deno.test("redact", async ({ step }) => {
  await step("redacts string literal from a shallow array", () => {
    const data = ["foo", "bar", "baz"];
    redact(data, { values: ["bar"] });
    assertEquals(data, ["foo", redacted, "baz"]);
  });

  await step("redacts string match from a shallow array", () => {
    const data = ["foobarbaz"];
    redact(data, { values: ["bar"] });
    assertEquals(data, ["fooredactedbaz"]);
  });

  await step("redacts regexp match from a shallow array", () => {
    const data = ["foo", "bar", "baz"];
    redact(data, { values: [/bar/] });
    assertEquals(data, ["foo", redacted, "baz"]);
  });

  await step("redacts partial regexp match from a shallow array", () => {
    const data = ["foo", "barstool", "baz"];
    redact(data, { values: [/bar/] });
    assertEquals(data, ["foo", "redactedstool", "baz"]);
  });
});
