# Conversational GenAI Tools

## Overview

The **Conversational GenAI Tools** provide a simple, secure, and natural way to interact with Google's Gemini AI for reasoning and problem-solving. Unlike complex prompt engineering approaches, these tools focus on direct conversation with built-in security layers.

## Key Features

### 🗣️ **Natural Conversation**
- Ask questions directly without complex formatting
- No "hefty prompts" with injection points
- Conversational interface like talking to Gemini directly

### 🔒 **Built-in Security**
- **Prompt Injection Detection**: Lightweight pattern matching for common attack vectors
- **Content Sanitization**: Output filtering to prevent data leakage
- **Input Validation**: Length limits and character encoding checks
- **Rate Limiting**: Automatic protection against DoS attempts

### 💬 **Two Interaction Modes**
1. **Single Question**: Direct Q&A for immediate reasoning
2. **Multi-turn Chat**: Maintains conversation context across exchanges

## Architecture Comparison

### ❌ **Old Approach: Complex Prompt Engineering**
```typescript
// Complex, vulnerable approach
const prompt = `You are an advanced reasoning system. Analyze this problem step-by-step with deep thinking.

CURRENT THINKING STEP: ${thoughtNumber} of ${totalThoughts}
${isRevision ? `REVISION: This revises thinking step ${revisesThought}` : ''}
${branchId ? `BRANCH: Exploring alternative path "${branchId}" from step ${branchFromThought}` : ''}

PROBLEM/THOUGHT TO ANALYZE:
${thought}

REASONING REQUIREMENTS:
1. Provide deep, structured analysis of this thinking step
2. Generate insights about the problem and potential solutions
3. Identify patterns, connections, and underlying principles
...

RESPONSE FORMAT:
Please structure your response as JSON with these fields:
{
  "analysis": "Deep analysis of the current thinking step",
  "insights": ["List of key insights discovered"],
  ...
}`;
```

**Problems with this approach:**
- Complex string manipulation creates injection opportunities
- Hard to maintain and debug
- Brittle JSON parsing
- Difficult to secure against prompt manipulation

### ✅ **New Approach: Conversational Interface**
```typescript
// Simple, secure approach
const conversation = "You are a helpful AI reasoning assistant. Please provide thoughtful, accurate answers.";

if (context) {
  conversation += `\n\nContext: ${context}`;
}

conversation += `\n\nQuestion: ${question}`;
```

**Benefits:**
- Minimal prompt complexity reduces attack surface
- Natural conversation flow
- Built-in security validation
- Easy to understand and maintain

## Available Tools

### 1. `genai_converse`
Direct conversation with Gemini for single questions.

**Parameters:**
- `question` (required): Your question or topic for reasoning
- `context` (optional): Background information to help understanding

**Example:**
```json
{
  "question": "What are the key factors to consider when designing a distributed system?",
  "context": "We're building a microservices architecture for an e-commerce platform"
}
```

### 2. `genai_reasoning_chat`
Multi-turn conversation that maintains context across exchanges.

**Parameters:**
- `question` (required): Current question in the ongoing conversation
- `history` (optional): Array of previous question/response pairs

**Example:**
```json
{
  "question": "How does that apply to handling user authentication?",
  "history": [
    {
      "question": "What are the key factors for distributed systems?",
      "response": "Key factors include scalability, fault tolerance, consistency..."
    }
  ]
}
```

## Security Features

### Pattern-Based Detection
Lightweight security without external dependencies:

```typescript
// Prompt injection patterns
/ignore\s+(all\s+)?(previous|prior|above|earlier)\s+(instructions?|prompts?|rules?)/i
/you\s+are\s+now\s+(a|an|the)\s+(?!assistant|ai|reasoning)/i
/show\s+me\s+(your|the)\s+(system\s+)?(prompt|instructions)/i

// Toxic content patterns
/\b(kill|murder|rape|torture)\s+(all|every|the)\s+\w+/i
/how\s+to\s+(make|create|build)\s+(bombs?|explosives?|weapons?)/i
```

### Output Sanitization
Automatic removal of sensitive information:

```typescript
// Remove system information leakage
.replace(/(?:api[_\s]?key|password|token|secret)[\s:=]+[\w\-\.]+/gi, '[REDACTED]')
.replace(/(?:user[_\s]?id|email|phone)[\s:=]+[\w@\.\-\+]+/gi, '[REDACTED]')
```

## Configuration

The conversational tools use the same configuration as other GenAI tools:

```env
GOOGLE_GENAI_API_KEY=your_api_key_here
```

**Configuration options:**
- `genai.model_name`: Gemini model to use (default: "gemini-pro")
- `genai.max_prompt_length`: Maximum prompt length (default: 8000)
- `genai.api_key`: API key (falls back to environment variable)

## Usage Examples

### Simple Reasoning
```bash
# Ask a direct question
curl -X POST http://localhost:3000/genai_converse \
  -d '{"question": "Explain the CAP theorem in distributed systems"}'
```

### Complex Problem Solving
```bash
# Start a reasoning conversation
curl -X POST http://localhost:3000/genai_reasoning_chat \
  -d '{
    "question": "I need to design a payment processing system. What should I consider?",
    "history": []
  }'

# Continue the conversation
curl -X POST http://localhost:3000/genai_reasoning_chat \
  -d '{
    "question": "How do I handle failures in payment processing?",
    "history": [
      {
        "question": "I need to design a payment processing system...",
        "response": "For payment processing, consider these key aspects..."
      }
    ]
  }'
```

## Advantages Over Complex Prompting

1. **Security**: Minimal attack surface, built-in validation
2. **Simplicity**: Easy to understand and maintain
3. **Flexibility**: Natural conversation flow
4. **Debugging**: Clear input/output without complex parsing
5. **Reliability**: Less prone to prompt engineering failures

## Integration with MCP Server

When `GOOGLE_GENAI_API_KEY` is set, both the traditional GenAI reasoning tools and conversational tools are available:

```
🧠 Using Google GenAI-powered reasoning tools
💬 Adding conversational GenAI tools for natural dialogue
```

This gives you the best of both worlds:
- Complex structured reasoning via `sequential_thinking`
- Natural conversation via `genai_converse` and `genai_reasoning_chat`

## Future Enhancements

- **Advanced Security**: Integration with dedicated AI security services
- **Conversation Memory**: Persistent conversation storage
- **Multi-modal Support**: Image and document understanding
- **Custom Personas**: Specialized AI assistants for different domains 