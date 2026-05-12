// @ts-nocheck
import { existsSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";
import { cloudflare } from "@cloudflare/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { LOCAL_DEV_AUTH_NAME_HEADER } from "./src/auth/identity";
import { LOCAL_DEV_SUPERUSER_EMAILS_HEADER } from "./src/auth/superusers";

function parseDotEnvFile(filePath: string): Record<string, string> {
  const output: Record<string, string> = {};

  for (const rawLine of readFileSync(filePath, "utf8").split(/\r?\n/u)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex <= 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'")) ||
      (value.startsWith("`") && value.endsWith("`"))
    ) {
      value = value.slice(1, -1);
    }

    if (key) {
      output[key] = value;
    }
  }

  return output;
}

function readLocalWorkerVars() {
  const devVarsPath = path.resolve(process.cwd(), ".dev.vars");
  if (!existsSync(devVarsPath)) {
    return {};
  }

  return parseDotEnvFile(devVarsPath);
}

function removeGeneratedDevVars(outputRoot: string) {
  const candidatePaths = [
    path.join(outputRoot, "fashion_lms", ".dev.vars"),
    path.join(outputRoot, "fashion_lms", ".dev.vars.local")
  ];

  for (const candidatePath of candidatePaths) {
    if (existsSync(candidatePath)) {
      rmSync(candidatePath, { force: true });
    }
  }
}

export default defineConfig(({ command }) => {
  const localWorkerVars = command === "serve" ? readLocalWorkerVars() : {};

  return {
    plugins: [
      react(),
      {
        name: "local-dev-worker-auth-bridge",
        configureServer(server) {
          server.middlewares.use((req, _res, next) => {
            const host = req.headers.host?.split(":")[0]?.toLowerCase();
            if (host !== "localhost" && host !== "127.0.0.1") {
              next();
              return;
            }

            const existingAccessEmail = req.headers["cf-access-authenticated-user-email"];
            if (!existingAccessEmail && localWorkerVars.DEV_AUTH_EMAIL) {
              req.headers["cf-access-authenticated-user-email"] = localWorkerVars.DEV_AUTH_EMAIL;
              if (localWorkerVars.DEV_AUTH_NAME) {
                req.headers[LOCAL_DEV_AUTH_NAME_HEADER] = localWorkerVars.DEV_AUTH_NAME;
              }
            }

            if (localWorkerVars.SUPERUSER_EMAILS) {
              req.headers[LOCAL_DEV_SUPERUSER_EMAILS_HEADER] = localWorkerVars.SUPERUSER_EMAILS;
            }

            next();
          });
        }
      },
      {
        name: "strip-generated-dev-vars",
        closeBundle() {
          if (command !== "build") {
            return;
          }

          removeGeneratedDevVars(path.resolve(process.cwd(), "dist"));
        }
      },
      cloudflare({
        configPath: "./wrangler.jsonc",
        config: (workerConfig) => ({
          vars: {
            ...(workerConfig.vars ?? {}),
            ...localWorkerVars
          }
        })
      })
    ]
  };
});
