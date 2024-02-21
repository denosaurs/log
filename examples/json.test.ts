import { assert } from "jsr:@std/assert";
import { assertIsLog, createJSONLineStream } from "./utils.ts";

Deno.test("deno", async () => {
  const { success, stdout } = await new Deno.Command("deno", {
    args: ["run", "--quiet", "--no-npm", "json.js"],
    cwd: import.meta.dirname,
  }).output();
  assert(success);
  for await (const line of createJSONLineStream(stdout)) {
    assertIsLog(line);
  }
});

Deno.test("bun", async () => {
  const { success, stdout } = await new Deno.Command("bun", {
    args: ["json.js"],
    cwd: import.meta.dirname,
  }).output();
  assert(success);
  for await (const line of createJSONLineStream(stdout)) {
    assertIsLog(line);
  }
});

Deno.test("node", async () => {
  const { success, stdout } = await new Deno.Command("node", {
    args: ["json.js"],
    cwd: import.meta.dirname,
  }).output();
  assert(success);
  for await (const line of createJSONLineStream(stdout)) {
    assertIsLog(line);
  }
});
