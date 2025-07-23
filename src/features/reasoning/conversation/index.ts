/**
 * Conversation Module for GenAI Interactions
 * Provides simple conversation and multi-turn chat functionality
 */

export { simpleConversation, type ConverseArgs, type ConverseResult } from './simple-conversation.js';

export {
  multiTurnChat,
  type ReasoningChatArgs,
  type ReasoningChatResult,
  type ConversationExchange,
} from './multi-turn-chat.js';
