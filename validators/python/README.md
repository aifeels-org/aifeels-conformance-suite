# Python Conformance Validator

Validates Aifeels implementations (Python) against the official test suite.

## Requirements

- Python 3.9+
- Implementation following Aifeels spec v0.1.0

## Installation

```bash
pip install -r requirements.txt
```

## Usage

```bash
python validate.py <implementation_module>
```

### Example

```bash
# Validate aifeels-reference implementation
python validate.py aifeels

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

Your implementation must provide an `EmotionalState` class with this interface:

```python
class EmotionalState:
    """Aifeels emotional state implementation."""
    
    def __init__(self):
        """Initialize with all primitives at 0.0"""
        pass
        
    def process_event(self, event_type: str):
        """
        Process an event and update state.
        
        Args:
            event_type: Event name (e.g., 'task_failed', 'task_started')
        """
        pass
        
    def apply_decay(self):
        """Apply temporal decay (one 300-second interval)."""
        pass
        
    def recommended_action(self) -> str:
        """
        Get recommended action based on thresholds.
        
        Returns:
            Action name (e.g., 'cooldown_required', 'handoff_to_human')
        """
        pass
    
    # Required readable properties
    frustration: float  # [0.0, 1.0]
    trust: float        # [0.0, 1.0]
    urgency: float      # [0.0, 1.0]
    stress: float       # [0.0, 1.0]
    caution: float      # [0.0, 1.0]
```

### Optional Methods

If your implementation supports `advance_time(seconds: int)`, the validator will use it. Otherwise, it will call `apply_decay()` multiple times based on 300-second intervals.

## Conformance Report

After running tests, a conformance report is generated at `conformance-report.json`:

```json
{
  "implementation": {
    "name": "aifeels",
    "version": "0.1.0",
    "language": "Python"
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

Ensure your implementation is importable:

```bash
# Add to PYTHONPATH
export PYTHONPATH=/path/to/your/implementation:$PYTHONPATH
python validate.py your_module_name
```

### Attribute Errors

The validator expects specific attributes on `EmotionalState`. Check:
- All five primitives are accessible as properties
- `process_event()`, `apply_decay()`, and `recommended_action()` methods exist

### Test Failures

Review test output for specific assertion failures. Each test references a spec section - verify your implementation follows that section exactly.

## Contact

- **Issues:** https://github.com/aifeels-org/aifeels-conformance-suite/issues
- **Spec:** https://github.com/aifeels-org/aifeels-spec
