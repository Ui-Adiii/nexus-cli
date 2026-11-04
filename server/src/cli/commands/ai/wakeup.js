import chalk from "chalk";
import { Command } from "commander";
import yoctoSpinner from "yocto-spinner";
import { getStoredToken } from "../auth/login.js";
import { select } from "@clack/prompts";
import { startChat } from "../../chat/chat-with-ai.js";
import { startToolChat } from "../../chat/chat-with-ai-tool.js";
// import { startAgentChat } from "../../chat/chat-with-ai-agent.js";


import { db } from "../../../lib/db.js"


const wakeUpAction = async () => {
  const token = await getStoredToken();

  if (!token?.access_token) {
    console.log(chalk.red("Not Authenticated. please Login"));
    return;
  }

  const spinner = yoctoSpinner({ text: "Fetching user information..." });
  spinner.start();
const user = await db
  .collection("session")
  .aggregate([
    {
      $match: {
        token: token.access_token,
      },
    },
    {
      $addFields: {
        userId: { $toObjectId: "$userId" },
      },
    },
    {
      $lookup: {
        from: "user",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: "$user",
    },
    {
      $replaceRoot: {
        newRoot: "$user",
      },
    },
  ])
  .next();



  spinner.stop();

  if (!user) {
    console.log(chalk.red("User not found."));
    return;
  }

  console.log(chalk.green(`Welcome back, ${user.name}!\n`));

  const choice = await select({
    message: "Select an Option:",
    options: [
      {
        value: "chat",
        label: "Chat",
        hint: "Simple chat with AI",
      },
      {
        value: "tool",
        label: "Tool Calling",
        hint: "Chat with tools (Google Search, Code Execution)",
      },
      {
        value: "agent",
        label: "Agentic Mode",
        hint: "Advanced AI agent (Coming soon)",
      },
    ],
  });

  switch (choice) {
    case "chat":
      // console.log(chalk.yellow("Chat mode is currently under development."));
      await startChat();
      break;
    case "tool":
      await startToolChat();
      break;
    case "agent":
      // await startAgentChat();
      break;
  }
};

export const wakeUp = new Command("wakeup")
  .description("Wake up the ai")
  .action(wakeUpAction);
