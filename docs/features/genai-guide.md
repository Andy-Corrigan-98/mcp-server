# GenAI Integration Guide

This guide covers the Google GenAI integration that powers our AI reasoning capabilities, including conversational tools and advanced reasoning features.

## Overview

Instead of implementing complex reasoning algorithms in TypeScript, we leverage Google's Generative AI models (Gemini) to provide sophisticated reasoning capabilities through two main approaches:

### 🗣️ **Conversational Tools** - Natural dialogue interface
- Ask questions directly without complex formatting
- Built-in security with prompt injection detection
- Two modes: single Q&A and multi-turn conversations

### 🧠 **Advanced Reasoning** - Structured analysis and thinking
- Sequential thinking with AI-powered step-by-step analysis
- Complex problem decomposition and insight generation
- Multi-step reasoning with branching and revision capabilities

## Architecture Benefits

- **Simpler codebase** - No complex reasoning algorithms to maintain
- **More powerful reasoning** - Google's AI models provide advanced analytical capabilities  
- **AI-to-AI collaboration** - Multiple AI instances can use the same reasoning backend
- **Automatic improvements** - As Google improves their models, our reasoning gets better
- **Built-in security** - Comprehensive protection against prompt injection and abuse

## Configuration

### Environment Variables
- `GOOGLE_GENAI_API_KEY` - Your Google AI Studio API key (required)

### Configuration Parameters
| Parameter | Default | Description |
|-----------|---------|-------------|
| `genai.api_key` | `""` | API key (prefer environment variable) |
| `genai.model_name` | `"gemini-pro"` | Gemini model to use |
| `genai.max_prompt_length` | `8000` | Maximum prompt length |
| `genai.response_timeout_ms` | `30000` | API timeout in milliseconds |
| `genai.enable_fallback` | `true` | Fall back to traditional reasoning on failure |

## Available Tools

### Conversational Tools

#### `genai_converse`
Direct conversation with Gemini for reasoning and analysis.

```typescript
// Example usage
const result = await genai_converse({
  question: "How can I optimize database queries for better performance?",
  context: "Working with a Node.js app using Prisma ORM"
});
```

#### `genai_reasoning_chat`
Multi-turn conversation maintaining context across exchanges.

```typescript
// Example usage
const result = await genai_reasoning_chat({
  question: "How does this relate to caching strategies?",
  history: [
    { question: "Previous question...", response: "Previous response..." }
  ]
});
```

### Advanced Reasoning Tools

#### `sequential_thinking`
AI-powered sequential thinking for complex problem analysis.

```typescript
// Example usage
const result = await sequential_thinking({
  thought: "Analyze the performance bottlenecks in our authentication system",
  thought_number: 1,
  total_thoughts: 3,
  next_thought_needed: true
});
```

## Security Features

### 🔒 **Built-in Protection**
- **Prompt Injection Detection**: Pattern matching for common attack vectors
- **Content Sanitization**: Output filtering to prevent data leakage  
- **Input Validation**: Length limits and character encoding checks
- **Rate Limiting**: Automatic protection against DoS attempts

### 🛡️ **Best Practices**
- All prompts are sanitized before sending to Gemini
- Responses are filtered for sensitive information
- API keys are securely managed through environment variables
- Fallback mechanisms ensure system stability

## Response Formats

### Conversational Responses
```typescript
{
  response: string;           // AI response text
  confidence: number;         // Confidence score (0-1)
  model_used: string;        // Which Gemini model was used
  safety_filtered: boolean;   // Whether content was filtered
}
```

### Sequential Thinking Responses
```typescript
{
  analysis: string;           // Deep analysis of the thinking step
  insights: string[];         // Key insights discovered
  next_steps: string[];       // Suggested next thinking steps
  confidence: number;         // Analysis confidence (0-1)
  reasoning_quality: string;  // Quality assessment
}
```

## Error Handling

The system includes comprehensive error handling:

- **API failures**: Automatic retry with exponential backoff
- **Rate limiting**: Graceful degradation with queuing
- **Invalid responses**: Fallback to traditional reasoning when configured
- **Network issues**: Timeout handling and connection pooling

## Usage Examples

### Simple Question
```typescript
const result = await genai_converse({
  question: "What's the best approach for handling user authentication in a microservices architecture?"
});
```

### Complex Analysis
```typescript
const result = await sequential_thinking({
  thought: "Design a scalable chat system for 1M+ users",
  thought_number: 1,
  total_thoughts: 5,
  next_thought_needed: true
});
```

### Multi-turn Conversation
```typescript
const result = await genai_reasoning_chat({
  question: "How would this scale to handle peak traffic?",
  history: [
    {
      question: "Design a chat system architecture",
      response: "I'd recommend a microservices approach with WebSockets..."
    }
  ]
});
```

## Implementation Notes

### Functional Architecture
All GenAI tools follow the single-responsibility functional architecture:
- **Shared infrastructure** for client management, security, and validation
- **Pure functions** for prompt building and response processing
- **Clean composition** with clear separation of concerns

### Performance Considerations
- **Connection pooling** for efficient API usage
- **Response caching** for repeated queries (when appropriate)
- **Parallel processing** for multiple reasoning steps
- **Graceful degradation** when AI services are unavailable

For detailed implementation examples and advanced configuration, see the [Development Guide](../development/development.md). 