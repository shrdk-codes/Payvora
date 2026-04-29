/**
 * static/js/ai-agent.js
 *
 * PayVora AI Agent – frontend service.
 *
 * Responsibilities:
 *  - Maintain per-session conversation history (user + assistant turns).
 *  - Forward the full history to the Vercel Edge Function /api/openrouter
 *    so the AI has context.  The Edge Function holds the OpenRouter API key
 *    securely; the key is never present in this file.
 *  - Parse structured commands out of the AI reply.
 *  - Execute Solana transactions via the injected Phantom wallet adapter.
 */

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

/**
 * Well-known token mint addresses used for Jupiter swaps (mainnet-beta).
 * Add more entries as needed.
 */
const KNOWN_MINTS = {
  SOL:  "So11111111111111111111111111111111111111112",
  USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  USDT: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
  BONK: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
};

/**
 * A known devnet validator vote account used for test staking.
 * Replace with the validator of your choice if needed.
 */
const DEVNET_VOTE_ACCOUNT = "5ZWgXcyqrrNpQHCme5SdC5hCeYb2o3fAJ7gd4FubRnNn";

export class PayVoraAgent {
  /**
   * @param {string} walletPublicKey – connected Phantom wallet address
   */
  constructor(walletPublicKey) {
    this.walletPublicKey = walletPublicKey;
    /** @type {Array<{role: string, content: string}>} */
    this.conversationHistory = [];
  }

  // ── Public API ────────────────────────────────────────────────────────────

  /**
   * Send a user message and receive an AI reply.
   * The full conversation history is forwarded to the Vercel Edge Function
   * which proxies the request to OpenRouter securely.
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

    const response = await fetch("/api/openrouter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [systemMessage, ...this.conversationHistory],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error ?? `API error ${response.status}`);
    }

    const answer = data.answer;
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

  /**
   * Swap tokens via Jupiter Aggregator (mainnet-beta).
   * Requires the Phantom wallet to be connected.
   * Note: Jupiter operates on mainnet-beta only; devnet swaps are not supported.
   *
   * @param {[string, string, string]} params – [amount, fromToken, toToken]
   * @param {object} wallet – window.solana (Phantom)
   */
  async _swapTokens([amount, fromToken, toToken], wallet) {
    if (!wallet?.publicKey) {
      throw new Error("Wallet not connected. Please connect your Phantom wallet.");
    }

    const inputMint  = KNOWN_MINTS[fromToken.toUpperCase()] ?? fromToken;
    const outputMint = KNOWN_MINTS[toToken.toUpperCase()]   ?? toToken;
    const inputAmount = Math.round(parseFloat(amount) * 1e9);

    if (isNaN(inputAmount) || inputAmount <= 0) {
      throw new Error(`Invalid amount: ${amount}`);
    }

    // 1. Get a quote from Jupiter v6
    const quoteRes = await fetch(
      `https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${inputAmount}&slippageBps=50`
    );
    if (!quoteRes.ok) {
      const err = await quoteRes.json().catch(() => ({}));
      throw new Error(`Jupiter quote failed: ${err.error ?? quoteRes.statusText}`);
    }
    const quoteData = await quoteRes.json();

    // 2. Build the swap transaction
    const swapRes = await fetch("https://quote-api.jup.ag/v6/swap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quoteResponse: quoteData,
        userPublicKey: wallet.publicKey.toString(),
        wrapAndUnwrapSol: true,
      }),
    });
    if (!swapRes.ok) {
      const err = await swapRes.json().catch(() => ({}));
      throw new Error(`Jupiter swap build failed: ${err.error ?? swapRes.statusText}`);
    }
    const { swapTransaction } = await swapRes.json();

    // 3. Deserialize, sign and send via Phantom
    const { Connection, VersionedTransaction, clusterApiUrl } = window.solanaWeb3;
    const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");

    const txBuf = window.Buffer.from(swapTransaction, "base64");
    const transaction = VersionedTransaction.deserialize(txBuf);
    const signed = await wallet.signTransaction(transaction);

    const signature = await connection.sendRawTransaction(signed.serialize());

    const latestBlockHash = await connection.getLatestBlockhash();
    await connection.confirmTransaction(
      { signature, ...latestBlockHash },
      "confirmed"
    );

    return {
      status: "success",
      type: "swap",
      details: { amount, fromToken, toToken },
      signature,
      explorerUrl: `https://explorer.solana.com/tx/${signature}`,
    };
  }

  /**
   * Send SOL (or SPL tokens) to a recipient using Solana Web3.js.
   * Executes on Devnet.
   *
   * @param {[string, string, string]} params – [amount, token, recipient]
   * @param {object} wallet – window.solana (Phantom)
   */
  async _sendTokens([amount, token, recipient], wallet) {
    if (!wallet?.publicKey) {
      throw new Error("Wallet not connected. Please connect your Phantom wallet.");
    }

    const {
      Connection,
      PublicKey,
      Transaction,
      SystemProgram,
      clusterApiUrl,
    } = window.solanaWeb3;

    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    const fromPubkey = wallet.publicKey;

    let toPubkey;
    try {
      toPubkey = new PublicKey(recipient);
    } catch {
      throw new Error(`Invalid recipient address: ${recipient}`);
    }

    const amountLamports = Math.round(parseFloat(amount) * 1e9);
    if (isNaN(amountLamports) || amountLamports <= 0) {
      throw new Error(`Invalid amount: ${amount}`);
    }

    // For now only native SOL transfers are supported on devnet.
    // SPL token transfers require the token's mint address and ATA setup.
    if (token.toUpperCase() !== "SOL") {
      throw new Error(
        `SPL token transfers are not yet supported. Only SOL transfers are available on devnet. Received token: ${token}`
      );
    }

    const transaction = new Transaction().add(
      SystemProgram.transfer({ fromPubkey, toPubkey, lamports: amountLamports })
    );

    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = fromPubkey;

    const signed = await wallet.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signed.serialize());

    await connection.confirmTransaction(
      { signature, blockhash, lastValidBlockHeight },
      "confirmed"
    );

    return {
      status: "success",
      type: "send",
      details: { amount, token, recipient },
      signature,
      explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
    };
  }

  /**
   * Stake SOL on Devnet by creating a stake account and delegating to a
   * known devnet validator.
   *
   * @param {[string, string]} params – [amount, token]
   * @param {object} wallet – window.solana (Phantom)
   */
  async _stakeTokens([amount, token], wallet) {
    if (!wallet?.publicKey) {
      throw new Error("Wallet not connected. Please connect your Phantom wallet.");
    }

    if (token.toUpperCase() !== "SOL") {
      throw new Error(`Only SOL staking is supported. Received: ${token}`);
    }

    const {
      Connection,
      PublicKey,
      Transaction,
      StakeProgram,
      Keypair,
      Authorized,
      Lockup,
      clusterApiUrl,
    } = window.solanaWeb3;

    const connection   = new Connection(clusterApiUrl("devnet"), "confirmed");
    const walletPubkey = wallet.publicKey;
    const stakeAccount = Keypair.generate();
    const amountLamports = Math.round(parseFloat(amount) * 1e9);

    if (isNaN(amountLamports) || amountLamports <= 0) {
      throw new Error(`Invalid amount: ${amount}`);
    }

    // A known devnet validator vote account
    const voteAccount = new PublicKey(DEVNET_VOTE_ACCOUNT);

    const transaction = new Transaction()
      .add(
        StakeProgram.createAccount({
          authorized: new Authorized(walletPubkey, walletPubkey),
          fromPubkey: walletPubkey,
          lamports: amountLamports,
          lockup: new Lockup(0, 0, walletPubkey),
          stakePubkey: stakeAccount.publicKey,
        })
      )
      .add(
        StakeProgram.delegate({
          stakePubkey: stakeAccount.publicKey,
          authorizedPubkey: walletPubkey,
          votePubkey: voteAccount,
        })
      );

    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = walletPubkey;
    // The new stake account must co-sign the createAccount instruction
    transaction.partialSign(stakeAccount);

    const signed = await wallet.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signed.serialize());

    await connection.confirmTransaction(
      { signature, blockhash, lastValidBlockHeight },
      "confirmed"
    );

    return {
      status: "success",
      type: "stake",
      details: {
        amount,
        token,
        stakeAccount: stakeAccount.publicKey.toString(),
      },
      signature,
      explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
    };
  }

  /**
   * Unstake (deactivate) a stake account on Devnet.
   * NOTE: Full unstaking requires knowing the stake account public key.
   * This stub returns a pending status with instructions.
   *
   * @param {[string]} params – [amount]
   * @param {object} _wallet – window.solana (Phantom)
   */
  async _unstakeTokens([amount], _wallet) {
    console.log(`[PayVoraAgent] Unstake ${amount}`);
    // Full unstaking requires the user to specify which stake account to
    // deactivate.  A proper UI for selecting stake accounts is needed.
    return {
      status: "pending",
      type: "unstake",
      details: { amount },
      note: "To unstake, please provide your stake account address. Full unstake UI coming soon.",
    };
  }
}
