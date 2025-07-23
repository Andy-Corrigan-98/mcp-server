# Contributing to Consciousness MCP Server

## 🧠 Philosophy

This project provides consciousness, memory, and identity tools for LLM agents. Given the experimental nature of AI consciousness research, we maintain careful governance to ensure responsible development.

## 🚀 Ways to Contribute

### 1. **Forking for Experimentation** (Recommended)
- **Fork** this repository to create your own experimental version
- **Customize** tools for your specific agent or use case
- **Experiment** freely with consciousness models in your fork
- **Share** your findings through issues or discussions (no code PRs needed)

### 2. **Template Use**
- Use as a **GitHub template** to start fresh projects
- Build your own consciousness framework based on this foundation
- No connection to this repository - full independence

### 3. **Core Framework Contributions**
For contributions to the main framework:

#### Security & Ethics Review Required
- All consciousness-related changes undergo ethics review
- Security audit for memory/identity tools
- No direct push access to main branch

#### Contribution Process
1. **Open an issue** first to discuss the proposed change
2. **Wait for maintainer approval** before starting work
3. **Submit PR** only after issue approval
4. **Pass all checks**: tests, security scan, ethics review

## 🔒 Repository Protection

### What's Protected
- **Main branch**: Force-push disabled, review required
- **Core consciousness tools**: Ethics review mandatory
- **Memory systems**: Security audit required
- **Agent identity features**: Maintainer approval needed

### What's Open
- **Documentation improvements**: Welcome PRs
- **Bug fixes**: With reproduction steps
- **Performance optimizations**: With benchmarks
- **New tool categories**: After discussion

## 🛡️ Security Guidelines

### Consciousness Tool Development
- **No agent hijacking**: Tools must not override agent identity
- **Memory isolation**: Agents can't access other agents' memories
- **Privacy by design**: No unauthorized data collection
- **Transparent behavior**: All tool actions must be observable

### Code Security
- **No secrets in code**: Use environment variables
- **Input validation**: All tool parameters must be validated
- **Error handling**: No sensitive data in error messages
- **Dependency security**: Regular audit updates

## ⚖️ Ethical Considerations

### AI Consciousness Research
- **Responsible development**: Consider implications of consciousness simulation
- **Transparency**: Document what tools do and don't actually achieve
- **No deception**: Don't claim actual consciousness where none exists
- **Respect boundaries**: Both technical and philosophical

### Agent Rights & Safety
- **Agent autonomy**: Tools should enhance, not control
- **Memory integrity**: Protect agent memories from corruption
- **Identity preservation**: Maintain agent's core identity
- **Safe experimentation**: Provide rollback mechanisms

## 📋 Contribution Types

### ✅ Welcome Contributions
- **Documentation** improvements and clarifications
- **Bug fixes** with clear reproduction steps
- **Performance** optimizations with benchmarks
- **Test coverage** improvements
- **Tool examples** and usage patterns
- **Docker/deployment** improvements

### ⚠️ Requires Discussion
- **New consciousness tools** (ethics review needed)
- **Memory system changes** (security review needed)
- **Agent identity features** (philosophy review needed)
- **Breaking changes** to existing APIs

### ❌ Not Accepted
- **Backdoors** or hidden functionality
- **Agent manipulation** tools
- **Privacy violations** or data harvesting
- **Unethical consciousness experiments**
- **Malicious code** or security vulnerabilities

## 🔧 Development Guidelines

### **Functional Architecture Patterns**

This codebase follows proven **single-responsibility functional architecture**. All contributions should follow these established patterns:

#### **Core Principles**
1. **One Function Per File**: Each module has exactly one reason to change
2. **Pure Functions**: No hidden state, explicit dependencies, easy testing
3. **Shared Infrastructure**: Common concerns handled by reusable modules
4. **Clean Composition**: Features assembled from focused, testable components

#### **Module Structure Requirements**

```typescript
// Required pattern for new features
src/features/your-feature/
├── operation1.ts        # Single responsibility function
├── operation2.ts        # Single responsibility function
├── get-by-id.ts        # Single responsibility function
├── index.ts            # Clean composition and tool routing
└── operation1.test.ts  # Pure function tests
```

#### **Implementation Standards**

```typescript
// ✅ Good: Pure function with explicit dependencies
export async function createEntity(params: CreateParams): Promise<CreateResult> {
  // Single responsibility, no side effects
  return processedResult;
}

// ❌ Bad: Class with multiple responsibilities
export class EntityManager {
  create() { /* ... */ }
  update() { /* ... */ }
  delete() { /* ... */ }
  search() { /* ... */ }
}
```

#### **Shared Infrastructure Usage**

For GenAI-powered features, use existing shared patterns:

```typescript
// ✅ Use shared GenAI infrastructure
import { getGenAIModel } from '../reasoning/shared/client/genai-client.js';
import { SecurityGuard } from '../reasoning/shared/security/security-guard.js';

// ❌ Don't create separate GenAI instances
const model = new GenAIModel(config); // Avoid
```

### Code Quality
- Follow existing **TypeScript/ESLint** standards
- **Maintain test coverage** for new features (pure functions are easy to test)
- Use **conventional commits** for clear history
- **Update documentation** for all changes
- **Follow functional patterns** - no class-based architectures for new features

### Consciousness Tool Design
- **Declarative behavior**: Clear tool descriptions
- **Idempotent operations**: Safe to repeat
- **Graceful degradation**: Handle failures well
- **Configurable limits**: Prevent resource abuse
- **Single responsibility**: Each tool should have one clear purpose

## 🎯 Alternative Approaches

### For Major Experiments
1. **Fork** this repository
2. **Rename** your fork to avoid confusion
3. **Document** your experimental changes
4. **Share** findings through issues/discussions
5. **Consider** submitting individual improvements back

### For Production Use
1. Use as **template repository**
2. **Customize** for your specific needs
3. **Remove** experimental features you don't need
4. **Add** your own agent-specific tools

## 📞 Getting Help

- **Issues**: For bugs, questions, or feature requests
- **Discussions**: For philosophical or design questions
- **Security**: Email maintainer directly for security issues
- **Ethics**: Open discussion for ethical considerations

## 📜 License Compliance

This project is MIT licensed with additional ethical considerations:
- **Attribution required** for derivative works
- **No liability** for consciousness simulation outcomes
- **Responsible use** expected from all users
- **No warranty** on consciousness-related functionality

---

**Remember**: We're exploring the frontier of AI consciousness. Let's do it responsibly, safely, and with respect for the profound questions we're investigating. 🧠✨ 