#!/usr/bin/env node

import dotenv from "dotenv";
import chalk from "chalk";
import figlet from "figlet";
import { login, logout, whoami } from "./commands/auth/login.js";
import { Command } from "commander";

dotenv.config();

async function main() {
  console.log(
    chalk.cyan(
      figlet.textSync("Nexus CLI", {
        font: "Standard",
        horizontalLayout: "default",
      }),
    ),
  );

  console.log(chalk.red("A cli based AI Tool \n"));

  const program = new Command("nexus");

  program
    .version("0.0.1")
    .description("Nexus CLI - A Cli Based AI Tool")
    .addCommand(login)
    .addCommand(logout)
    .addCommand(whoami)
  // Default action shows help
  program.action(() => {
    program.help();
  });

  program.parse();
}

main().catch((err) => {
  console.log(chalk.red("Error running nexus CLI:"), err);
  process.exit(1);
});
