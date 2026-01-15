import inquirer from "inquirer";
import readline from "readline";

/**
 * Wrapper for inquirer.prompt that handles cancellation gracefully
 * Allows both Ctrl+C and Escape key to cancel prompts
 * @param {Array} questions - Array of question objects for inquirer
 * @returns {Promise<Object>} - Resolves with answers or throws on cancellation
 */
export async function promptWithCancellation(questions) {
  // Create a promise that can be rejected on Escape key
  let cleanup = () => {}; // Placeholder for cleanup function

  const escapePromise = new Promise((_, reject) => {
    // Enable keypress events on stdin
    readline.emitKeypressEvents(process.stdin);

    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }

    const onKeypress = (str, key) => {
      if (key && key.name === "escape") {
        process.stdin.off("keypress", onKeypress);
        if (process.stdin.isTTY) {
          process.stdin.setRawMode(false);
        }
        reject(new Error("ESCAPE_PRESSED"));
      }
    };

    process.stdin.on("keypress", onKeypress);

    // Set up cleanup function
    cleanup = () => {
      process.stdin.off("keypress", onKeypress);
      if (process.stdin.isTTY) {
        process.stdin.setRawMode(false);
      }
    };
  });

  // Clean up the listener when the promise is settled
  escapePromise.finally(cleanup);

  try {
    // Race between the prompt and escape key detection
    const answers = await Promise.race([
      inquirer.prompt(questions),
      escapePromise,
    ]);
    return answers;
  } catch (error) {
    // Handle both Inquirer cancellation and our custom Escape handling
    if (
      error.message === "ESCAPE_PRESSED" ||
      error.isTtyError ||
      error.message.includes("cancelled") ||
      error.name === "ExitPromptError"
    ) {
      console.log("\nOperation cancelled.");
      process.exit(0);
    }
    throw error;
  }
}
