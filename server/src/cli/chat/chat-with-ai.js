import chalk from "chalk";
import boxen from "boxen";
import { text, isCancel, intro, outro } from "@clack/prompts";
import yoctoSpinner from "yocto-spinner";
import { marked } from "marked";
import { markedTerminal } from "marked-terminal";

import { AIService } from "../ai/google-service.js";
import { ChatService } from "../../services/chat.service.js";
import { getStoredToken } from "../commands/auth/login.js";
import { db } from "../../lib/db.js";
marked.use(
  markedTerminal({
    code: chalk.cyan,
    blockquote: chalk.gray.italic,
    heading: chalk.green.bold,
    firstHeading: chalk.magenta.underline.bold,
    hr: chalk.reset,
    listitem: chalk.reset,
    list: chalk.reset,
    paragraph: chalk.reset,
    strong: chalk.bold,
    em: chalk.italic,
    codespan: chalk.yellow.bgBlack,
    del: chalk.dim.gray.strikethrough,
    link: chalk.blue.underline,
    href: chalk.blue.underline,
  }),
);

const aiService = new AIService();
const chatService = new ChatService();

// Get authenticated user using MongoDB aggregation
async function getUserFromToken() {
  const token = await getStoredToken();

  if (!token?.access_token) {
    throw new Error("Not authenticated. Please run 'nexus login' first.");
  }

  const spinner = yoctoSpinner({
    text: "Authenticating...",
  }).start();

  try {
    const user = await db
      .collection("session")
      .aggregate([
        {
          $match: {
            token: token.access_token,
            expiresAt: { $gt: new Date() },
          },
        },
        {
          $lookup: {
            from: "user",
            let: { userId: "$userId" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: [{ $toString: "$_id" }, { $toString: "$$userId" }],
                  },
                },
              },
              {
                $project: {
                  _id: 0,
                  id: {
                    $ifNull: ["$id", { $toString: "$_id" }],
                  },
                  name: 1,
                  email: 1,
                  image: 1,
                },
              },
            ],
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
        {
          $limit: 1,
        },
      ])
      .next();

    if (!user) {
      spinner.error("User not found");
      throw new Error("User not found. Please login again.");
    }

    spinner.success(`Welcome back, ${user.name}!`);

    return user;
  } catch (error) {
    spinner.error("Authentication failed");
    throw error;
  }
}

// Initialize conversation
async function initConversation(userId, conversationId = null, mode = "chat") {
  const spinner = yoctoSpinner({
    text: "Loading conversation...",
  }).start();

  const conversation = await chatService.getOrCreateConversation(
    userId,
    conversationId,
    mode,
  );

  spinner.success("Conversation Loaded");

  const conversationInfo = boxen(
    `${chalk.bold("Conversation")}: ${conversation.title}\n` +
      `${chalk.gray("ID: " + conversation.id)}\n` +
      `${chalk.gray("Mode: " + conversation.mode)}`,
    {
      padding: 1,
      margin: { top: 1, bottom: 1 },
      borderStyle: "round",
      borderColor: "cyan",
      title: "💬 Chat Session",
      titleAlignment: "center",
    },
  );

  console.log(conversationInfo);

  if (conversation.messages?.length > 0) {
    console.log(chalk.yellow("📜 Previous messages:\n"));
    displayMessages(conversation.messages);
  }

  return conversation;
}

// Display previous messages
function displayMessages(messages) {
  messages.forEach((msg) => {
    const content =
      typeof msg.content === "string"
        ? msg.content
        : JSON.stringify(msg.content);

    if (msg.role === "user") {
      const userBox = boxen(chalk.white(content), {
        padding: 1,
        margin: { left: 2, bottom: 1 },
        borderStyle: "round",
        borderColor: "blue",
        title: "👤 You",
        titleAlignment: "left",
      });

      console.log(userBox);
    } else {
      const renderedContent = marked.parse(content);

      const assistantBox = boxen(renderedContent.trim(), {
        padding: 1,
        margin: { left: 2, bottom: 1 },
        borderStyle: "round",
        borderColor: "green",
        title: "🤖 Assistant",
        titleAlignment: "left",
      });

      console.log(assistantBox);
    }
  });
}

// Save message
async function saveMessage(conversationId, role, content) {
  return await chatService.addMessage(conversationId, role, content);
}

// Generate AI response
async function getAIResponse(conversationId) {
  const spinner = yoctoSpinner({
    text: "AI is thinking...",
    color: "cyan",
  }).start();

  try {
    const dbMessages = await chatService.getMessages(conversationId);

    const aiMessages = chatService.formatMessagesForAI(dbMessages);

    let fullResponse = "";
    let isFirstChunk = true;

    const result = await aiService.sendMessage(aiMessages, (chunk) => {
      if (isFirstChunk) {
        spinner.stop();

        console.log("\n");
        console.log(chalk.green.bold("🤖 Assistant:"));
        console.log(chalk.gray("─".repeat(60)));

        isFirstChunk = false;
      }

      fullResponse += chunk;
    });

    // Handle an empty response
    if (isFirstChunk) {
      spinner.stop();
    }

    console.log("\n");

    const renderedMarkdown = marked.parse(fullResponse);

    console.log(renderedMarkdown);
    console.log(chalk.gray("─".repeat(60)));
    console.log("\n");

    return result.content;
  } catch (error) {
    spinner.error("Failed to get AI response");
    throw error;
  }
}

// Update conversation title
async function updateConversationTitle(
  conversationId,
  userInput,
  messageCount,
) {
  if (messageCount === 1) {
    const title = userInput.slice(0, 50) + (userInput.length > 50 ? "..." : "");

    await chatService.updateTitle(conversationId, title);
  }
}

// Main chat loop
async function chatLoop(conversation) {
  const helpBox = boxen(
    `${chalk.gray("• Type your message and press Enter")}\n` +
      `${chalk.gray("• Markdown formatting is supported in responses")}\n` +
      `${chalk.gray('• Type "exit" to end conversation')}\n` +
      `${chalk.gray("• Press Ctrl+C to quit anytime")}`,
    {
      padding: 1,
      margin: { bottom: 1 },
      borderStyle: "round",
      borderColor: "gray",
      dimBorder: true,
    },
  );

  console.log(helpBox);

  while (true) {
    const userInput = await text({
      message: chalk.blue("Your message"),
      placeholder: "Type your message...",
      validate(value) {
        if (!value || value.trim().length === 0) {
          return "Message cannot be empty";
        }
      },
    });

    if (isCancel(userInput)) {
      const exitBox = boxen(chalk.yellow("Chat session ended. Goodbye! 👋"), {
        padding: 1,
        margin: 1,
        borderStyle: "round",
        borderColor: "yellow",
      });
      console.log(conversation.id);

      console.log(exitBox);
      process.exit(0);
    }

    if (userInput.toLowerCase() === "exit") {
      const exitBox = boxen(chalk.yellow("Chat session ended. Goodbye! 👋"), {
        padding: 1,
        margin: 1,
        borderStyle: "round",
        borderColor: "yellow",
      });
      console.log(conversation.id);
      console.log(exitBox);
      break;
    }

    // Save user message
    await saveMessage(conversation.id, "user", userInput);

    // Get message count
    const messages = await chatService.getMessages(conversation.id);

    // Generate AI response
    const aiResponse = await getAIResponse(conversation.id);

    // Save assistant response
    await saveMessage(conversation.id, "assistant", aiResponse);

    // Update title for first message
    await updateConversationTitle(conversation.id, userInput, messages.length);
  }
}

// Start chat
export async function startChat(mode = "chat", conversationId = null) {
  try {
    intro(
      boxen(chalk.bold.cyan("nexus AI Chat"), {
        padding: 1,
        borderStyle: "double",
        borderColor: "cyan",
      }),
    );

    const user = await getUserFromToken();

    const conversation = await initConversation(user.id, conversationId, mode);

    await chatLoop(conversation);

    outro(chalk.green("✨ Thanks For Chatting"));
  } catch (error) {
    const errorBox = boxen(chalk.red(`❌ Error: ${error.message}`), {
      padding: 1,
      margin: 1,
      borderStyle: "round",
      borderColor: "red",
    });

    console.log(errorBox);
    process.exit(1);
  }
}
