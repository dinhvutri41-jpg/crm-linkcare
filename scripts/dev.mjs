import { execFileSync, spawn } from "node:child_process";
import { cwd } from "node:process";

const projectRoot = cwd();
const port = "3000";

function command(args) {
  try {
    return execFileSync(args[0], args.slice(1), { encoding: "utf8" }).trim();
  } catch {
    return "";
  }
}

const listeningPids = command(["lsof", "-tiTCP:3000", "-sTCP:LISTEN"])
  .split(/\s+/)
  .filter(Boolean);

for (const pid of listeningPids) {
  const processName = command(["ps", "-p", pid, "-o", "command="]);
  const processCwd = command(["lsof", "-a", "-p", pid, "-d", "cwd", "-Fn"])
    .split("\n")
    .find((line) => line.startsWith("n"))
    ?.slice(1);

  if (!processName.includes("next-server") || processCwd !== projectRoot) {
    console.error(`Port ${port} is already used by another process.`);
    process.exit(1);
  }

  process.kill(Number(pid), "SIGTERM");
}

const server = spawn("next", ["dev", "--port", port], {
  cwd: projectRoot,
  stdio: "inherit",
  shell: process.platform === "win32",
});

server.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 0);
});
