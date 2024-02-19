import { assert } from "jsr:@std/assert";
import { assertIsLog, createJSONLineStream } from "../../utils/test.ts";

assert(
  (await new Deno.Command("npm", {
    args: ["install"],
    cwd: import.meta.dirname,
  }).spawn().status).success,
);

Deno.test("deno", async () => {
  const { success, stdout } = await new Deno.Command("deno", {
    args: ["run", "--quiet", "--no-npm", "main.js"],
    cwd: import.meta.dirname,
  }).output();
  assert(success);
  for await (const line of createJSONLineStream(stdout)) {
    assertIsLog(line);
  }
});

Deno.test("bun", async () => {
  const { success, stdout } = await new Deno.Command("bun", {
    args: ["main.js"],
    cwd: import.meta.dirname,
  }).output();
  assert(success);
  for await (const line of createJSONLineStream(stdout)) {
    assertIsLog(line);
  }
});

Deno.test("node", async () => {
  const { success, stdout } = await new Deno.Command("node", {
    args: ["main.js"],
    cwd: import.meta.dirname,
  }).output();
  assert(success);
  for await (const line of createJSONLineStream(stdout)) {
    assertIsLog(line);
  }
});
