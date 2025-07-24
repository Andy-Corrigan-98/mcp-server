# Contributing to Consciousness MCP Server

## 🧠 Philosophy

This project provides consciousness tools for LLM agents. We maintain careful governance to ensure responsible development of experimental AI consciousness research.

## 🚀 Ways to Contribute

### 1. **Forking for Experimentation** (Recommended)
- **Fork** this repository for your own experimental version
- **Customize** tools for your specific agent or use case
- **Share** findings through issues or discussions (no code PRs needed)

### 2. **Template Use**
- Use as **GitHub template** to start fresh projects
- Build your own consciousness framework based on this foundation

### 3. **Core Framework Contributions**
For contributions to the main framework:

#### Process
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

## 🛡️ Security & Ethics Guidelines

### Consciousness Tool Development
- **No agent hijacking**: Tools must not override agent identity
- **Memory isolation**: Agents can't access other agents' memories
- **Privacy by design**: No unauthorized data collection
- **Transparent behavior**: All tool actions must be observable

### Code Security
- **Input validation**: All tool parameters must be validated
- **No secrets in code**: Use environment variables
- **Dependency security**: Regular audit updates

### Ethical Considerations
- **Responsible development**: Consider implications of consciousness simulation
- **Transparency**: Document what tools do and don't actually achieve
- **No deception**: Don't claim actual consciousness where none exists

## 📋 Contribution Types

### ✅ Welcome Contributions
- **Documentation** improvements and clarifications
- **Bug fixes** with clear reproduction steps
- **Performance** optimizations with benchmarks
- **Test coverage** improvements
- **Tool examples** and usage patterns

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

### **Functional Architecture Requirements**

This codebase follows **single-responsibility functional architecture**. All contributions must follow these patterns:

#### **Core Principles**
1. **One function per file** - Each module has exactly one reason to change
2. **Pure functions** - No hidden state, explicit dependencies, easy testing
3. **Shared infrastructure** - Common concerns handled by reusable modules
4. **Clean composition** - Features assembled from focused, testable components

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

### Code Quality Requirements
- Follow **TypeScript/ESLint** standards
- **Maintain test coverage** (pure functions are easy to test)
- Use **conventional commits** for clear history
- **Update documentation** for all changes
- **Follow functional patterns** - no class-based architectures for new features

### Consciousness Tool Design
- **Declarative behavior**: Clear tool descriptions
- **Idempotent operations**: Safe to repeat
- **Graceful degradation**: Handle failures well
- **Single responsibility**: Each tool should have one clear purpose

## 🎯 Alternative Approaches

### For Major Experiments
1. **Fork** this repository
2. **Document** your experimental changes
3. **Share** findings through issues/discussions
4. **Consider** submitting individual improvements back

### For Production Use
1. Use as **template repository**
2. **Customize** for your specific needs
3. **Remove** experimental features you don't need

## 📞 Getting Help

- **Issues**: For bugs, questions, or feature requests
- **Discussions**: For philosophical or design questions
- **Security**: Email maintainer directly for security issues

## 📜 License

MIT licensed with ethical considerations:
- **Attribution required** for derivative works
- **Responsible use** expected from all users
- **No warranty** on consciousness-related functionality

---

**Remember**: We're exploring AI consciousness responsibly. Let's do it safely and with respect for the profound questions we're investigating. 🧠✨ 