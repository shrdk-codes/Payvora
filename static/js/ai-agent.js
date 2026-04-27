/**
 * static/js/ai-agent.js
 *
 * PayVora AI Agent – frontend service.
 *
 * Responsibilities:
 *  - Maintain per-session conversation history (user + assistant turns).
 *  - Forward the full history to the Firebase Cloud Function `getAIResponse`
 *    so the AI has context.  The Cloud Function holds the OpenRouter API key
 *    securely; the key is never present in this file.
 *  - Parse structured commands out of the AI reply.
 *  - Execute Solana transactions via the injected Phantom wallet adapter.
 */

import { httpsCallable } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-functions.js";

/** System prompt sent as the first message in every conversation. */
const SYSTEM_PROMPT = `You are PayVora AI Agent – a helpful assistant for managing a Solana wallet.

When the user asks you to perform a transaction, respond with a single structured
command on its own line using EXACTLY this format (all lowercase, no extra text on
that line):

  COMMAND: swap <amount> <fromToken> to <toToken>
  COMMAND: send <amount> <token> to <recipientAddress>
  COMMAND: stake <amount> <token>
  COMMAND: unstake <amount>

Follow the command line with a brief, friendly explanation.

If no transaction is needed, just reply normally.
Keep responses concise (≤ 3 sentences).`;

export class PayVoraAgent {
  /**
   * @param {object} firebaseFunctions  – result of getFunctions(app)
   * @param {string} walletPublicKey    – connected Phantom wallet address
   */
  constructor(firebaseFunctions, walletPublicKey) {
    this._functions = firebaseFunctions;
    this.walletPublicKey = walletPublicKey;
    /** @type {Array<{role: string, content: string}>} */
    this.conversationHistory = [];
  }

  // ── Public API ────────────────────────────────────────────────────────────

  /**
   * Send a user message and receive an AI reply.
   * The full conversation history is forwarded so the model has context.
   *
   * @param {string} userMessage
   * @returns {Promise<string>} AI reply text
   */
  async chat(userMessage) {
    this.conversationHistory.push({ role: "user", content: userMessage });

    const systemMessage = {
      role: "system",
      content:
        SYSTEM_PROMPT +
        `\n\nUser's wallet address: ${this.walletPublicKey}`,
    };

    const getAIResponse = httpsCallable(this._functions, "getAIResponse");
    const result = await getAIResponse({
      messages: [systemMessage, ...this.conversationHistory],
    });

    const answer = result.data.answer;
    if (!answer) {
      throw new Error("Received an empty response from the AI.");
    }
    this.conversationHistory.push({ role: "assistant", content: answer });
    return answer;
  }

  /**
   * Parse the first COMMAND: line from an AI response.
   *
   * @param {string} aiText
   * @returns {{ type: string, params: string[] } | null}
   */
  parseCommand(aiText) {
    const commandLine = aiText
      .split("\n")
      .map((l) => l.trim())
      .find((l) => l.toUpperCase().startsWith("COMMAND:"));

    if (!commandLine) return null;

    const body = commandLine.replace(/^COMMAND:\s*/i, "").trim();

    const patterns = {
      swap: /^swap\s+(\d+(?:\.\d+)?)\s+(\w+)\s+to\s+(\w+)$/i,
      send: /^send\s+(\d+(?:\.\d+)?)\s+(\w+)\s+to\s+(\S+)$/i,
      stake: /^stake\s+(\d+(?:\.\d+)?)\s+(\w+)$/i,
      unstake: /^unstake\s+(\d+(?:\.\d+)?)$/i,
    };

    for (const [type, pattern] of Object.entries(patterns)) {
      const match = body.match(pattern);
      if (match) {
        return { type, params: match.slice(1) };
      }
    }
    return null;
  }

  /**
   * Execute a parsed command using the Phantom wallet adapter.
   *
   * @param {{ type: string, params: string[] }} command
   * @param {object} walletAdapter – window.solana (Phantom)
   * @returns {Promise<object>} result object
   */
  async executeCommand(command, walletAdapter) {
    switch (command.type) {
      case "swap":
        return this._swapTokens(command.params, walletAdapter);
      case "send":
        return this._sendTokens(command.params, walletAdapter);
      case "stake":
        return this._stakeTokens(command.params, walletAdapter);
      case "unstake":
        return this._unstakeTokens(command.params, walletAdapter);
      default:
        return { error: "Unknown command type: " + command.type };
    }
  }

  // ── Private transaction helpers ───────────────────────────────────────────
  // These are stubs that log intent and return a pending status.
  // Replace each with real Solana / Jupiter transaction logic as needed.

  async _swapTokens([amount, fromToken, toToken], _wallet) {
    console.log(`[PayVoraAgent] Swap ${amount} ${fromToken} → ${toToken}`);
    // TODO: integrate Jupiter swap API
    return {
      status: "pending",
      type: "swap",
      details: { amount, fromToken, toToken },
      note: "Swap via Jupiter – integration pending",
    };
  }

  async _sendTokens([amount, token, recipient], _wallet) {
    console.log(`[PayVoraAgent] Send ${amount} ${token} → ${recipient}`);
    // TODO: build and sign a Solana transfer transaction
    return {
      status: "pending",
      type: "send",
      details: { amount, token, recipient },
      note: "SPL token transfer – integration pending",
    };
  }

  async _stakeTokens([amount, token], _wallet) {
    console.log(`[PayVoraAgent] Stake ${amount} ${token}`);
    // TODO: call staking program
    return {
      status: "pending",
      type: "stake",
      details: { amount, token },
      note: "Staking – integration pending",
    };
  }

  async _unstakeTokens([amount], _wallet) {
    console.log(`[PayVoraAgent] Unstake ${amount}`);
    // TODO: call unstaking program
    return {
      status: "pending",
      type: "unstake",
      details: { amount },
      note: "Unstaking – integration pending",
    };
  }
}
