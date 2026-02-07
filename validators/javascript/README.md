# JavaScript Conformance Validator

Validates Aifeels implementations (JavaScript/TypeScript) against the official test suite.

## Requirements

- Node.js 14.0+
- Implementation following Aifeels spec v0.1.0

## Installation

```bash
npm install
```

## Usage

```bash
node validate.js <implementation_path>
```

### Example

```bash
# Validate aifeels-reference implementation
node validate.js ./aifeels.js

# Output:
# Aifeels Conformance Test Suite v0.1.0
# Spec version: 0.1.0
# Testing implementation: aifeels
# ============================================================
# 
# Running conformance-1: Initialization...
# ✓ conformance-1: Initialization - PASSED
# ...
# ============================================================
# Results: 10 passed, 0 failed out of 10 total
# ✓ CONFORMANT: Implementation passes all tests!
```

## Expected Implementation Interface

Your implementation must export an `EmotionalState` class with this interface:

```javascript
class EmotionalState {
  /**
   * Initialize with all primitives at 0.0
   */
  constructor() {
    this.frustration = 0.0;
    this.trust = 0.0;
    this.urgency = 0.0;
    this.stress = 0.0;
    this.caution = 0.0;
  }

  /**
   * Process an event and update state.
   * @param {string} eventType - Event name (e.g., 'task_failed', 'task_started')
   */
  processEvent(eventType) {
    // Implementation
  }

  /**
   * Apply temporal decay (one 300-second interval).
   */
  applyDecay() {
    // Implementation
  }

  /**
   * Get recommended action based on thresholds.
   * @returns {string} Action name (e.g., 'cooldown_required', 'handoff_to_human')
   */
  recommendedAction() {
    // Implementation
  }
}

module.exports = { EmotionalState };
```

### TypeScript Support

For TypeScript implementations, compile to JavaScript first or use `ts-node`:

```bash
# Compile TypeScript
tsc aifeels.ts

# Or use ts-node
ts-node validate.js ./aifeels.ts
```

### Optional Methods

If your implementation supports `advanceTime(seconds)`, the validator will use it. Otherwise, it will call `applyDecay()` multiple times based on 300-second intervals.

## Conformance Report

After running tests, a conformance report is generated at `conformance-report.json`:

```json
{
  "implementation": {
    "name": "aifeels",
    "version": "0.1.0",
    "language": "JavaScript"
  },
  "spec_version": "0.1.0",
  "test_results": {
    "total": 10,
    "passed": 10,
    "failed": 0,
    "pass_rate": 100.0
  },
  "test_details": [...]
}
```

Submit this report when applying for [certification](https://github.com/aifeels-org/aifeels-spec/blob/main/CERTIFICATION.md).

## Troubleshooting

### Module Not Found

Ensure your implementation exports the required class:

```javascript
// CommonJS
module.exports = { EmotionalState };

// ES6 (requires .mjs extension or "type": "module" in package.json)
export { EmotionalState };
```

### Missing Methods

The validator expects:
- `processEvent(eventType)` - Process events
- `applyDecay()` - Apply decay
- `recommendedAction()` - Get recommended action
- Properties: `frustration`, `trust`, `urgency`, `stress`, `caution`

### Test Failures

Review test output for specific assertion failures. Each test references a spec section - verify your implementation follows that section exactly.

## Contact

- **Issues:** https://github.com/aifeels-org/aifeels-conformance-suite/issues
- **Spec:** https://github.com/aifeels-org/aifeels-spec
