# Test Vectors

This directory contains the official conformance test vectors for Aifeels v0.1.0.

## Format

Test vectors are defined in [`test-vectors.json`](test-vectors.json) using a language-agnostic JSON format.

## Test Structure

Each test contains:

```json
{
  "id": "conformance-X",
  "name": "Descriptive Name",
  "spec_section": "X.X.X",
  "description": "What this test validates",
  "setup": {
    "action": "initialize",
    "initial_state": { /* optional predefined state */ }
  },
  "steps": [
    {"action": "process_event", "event": "event_name"},
    {"action": "advance_time", "seconds": 300}
  ],
  "assertions": [
    {
      "path": "primitive_name",
      "expected": 0.5,
      "type": "equals" | "approximately",
      "tolerance": 0.001,
      "note": "Optional explanation"
    }
  ]
}
```

## Actions

### setup.action
- **initialize**: Create fresh state with all primitives at 0.0
- If `initial_state` is provided, initialize to those values instead

### steps.action
- **process_event**: Apply the named event's effects to state
- **advance_time**: Advance time by N seconds and apply decay
- **get_recommended_action**: Get recommended action based on thresholds

## Assertions

### Assertion Types
- **equals**: Exact match (for integers, strings, or floats with zero tolerance)
- **approximately**: Float comparison within tolerance (default 0.001)

### Path Format
Use dot notation to access nested values:
- `frustration` - Top-level primitive
- `metadata.trend` - Nested metadata field

## Events Referenced

Tests reference these canonical events from the spec:
- `task_failed`: frustration +0.3, trust -0.1
- `task_started`: stress +0.1
- `tool_error`: frustration +0.2, stress +0.1

See [SPEC.md Section 4](https://github.com/aifeels-org/aifeels-spec/blob/main/SPEC.md#4-event-processing) for complete event definitions.

## Validation Rules

1. **All assertions must pass** for a test to pass
2. **Floating-point comparisons** should respect tolerance values
3. **Value clamping** must occur before assertions (range [0.0, 1.0])
4. **Temporal decay** applies at 0.05 per 300-second interval

## Adding New Tests

When proposing new tests:

1. **Reference spec section** explicitly
2. **Make it deterministic** - same inputs always produce same outputs
3. **Keep it atomic** - test one specific behavior
4. **Include rationale** in description field
5. **Update total count** in main README

Submit via PR to [aifeels-conformance-suite](https://github.com/aifeels-org/aifeels-conformance-suite).

## Version

Current version: **0.1.0**

Test vectors track the specification version they validate.
