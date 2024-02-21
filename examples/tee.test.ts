import { assert, assertStrictEquals } from "jsr:@std/assert";
import { assertCollectLogLines } from "../utils/test.ts";

async function assertStdout(stdout: Uint8Array) {
  const logs = await assertCollectLogLines(stdout);
  assertStrictEquals(logs.length, 5);
}

async function assertStderr(stderr: Uint8Array) {
  const logs = await assertCollectLogLines(stderr);
  assertStrictEquals(logs.length, 1);
  assertStrictEquals(logs[0].data[0], "This is going to stderr");
}

assert(
  (await new Deno.Command("npm", {
    args: ["install", "--force"],
    cwd: import.meta.dirname,
  }).spawn().status).success,
);

Deno.test("deno", async () => {
  const { success, stdout, stderr } = await new Deno.Command("deno", {
    args: ["run", "--quiet", "--no-npm", "tee.js"],
    cwd: import.meta.dirname,
  }).output();
  assert(success);
  await assertStdout(stdout);
  await assertStderr(stderr);
});

Deno.test("bun", async () => {
  const { success, stdout, stderr } = await new Deno.Command("bun", {
    args: ["tee.js"],
    cwd: import.meta.dirname,
  }).output();
  assert(success);
  await assertStdout(stdout);
  await assertStderr(stderr);
});

Deno.test("node", async () => {
  const { success, stdout, stderr } = await new Deno.Command("node", {
    args: ["tee.js"],
    cwd: import.meta.dirname,
  }).output();
  assert(success);
  await assertStdout(stdout);
  await assertStderr(stderr);
});
