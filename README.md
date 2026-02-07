# Aifeels Conformance Test Suite

> Language-agnostic conformance testing for Aifeels implementations

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Spec Version](https://img.shields.io/badge/Spec-v0.1.0-green.svg)](https://github.com/aifeels-org/aifeels-spec)

## Purpose

This repository provides the **official conformance test suite** for the [Aifeels specification v0.1.0](https://github.com/aifeels-org/aifeels-spec).

Any implementation claiming "Aifeels v0.1 compliant" **MUST** pass all tests in this suite.

### What This Suite Provides

- ✅ **Machine-readable test vectors** - Language-agnostic test cases in JSON
- ✅ **Reference validators** - Python and JavaScript validators
- ✅ **Standard report format** - Conformance reporting template
- ✅ **Certification-ready** - Pass tests to get certified

## Quick Start

### Python Validator
```bash
git clone https://github.com/aifeels-org/aifeels-conformance-suite.git
cd aifeels-conformance-suite/validators/python
pip install -r requirements.txt
python validate.py /path/to/your/implementation
```

### JavaScript Validator
```bash
cd validators/javascript
npm install
node validate.js /path/to/your/implementation
```

## Test Coverage

The suite includes **10 required tests** covering:

| Test ID | Focus Area | Spec Section |
|---------|-----------|--------------|
| conformance-1 | Initialization | 3.4.2 |
| conformance-2 | Event Application | 4.2 |
| conformance-3 | Decay Calculation | 5.1 |
| conformance-4 | Action Selection | 6.3 |
| conformance-5 | Value Clamping (Upper) | 3.3 |
| conformance-6 | Value Clamping (Lower) | 3.3 |
| conformance-7 | Multiple Events | 4.3 |
| conformance-8 | Multi-Interval Decay | 5.1 |
| conformance-9 | Action Precedence (Handoff) | 6.3 |
| conformance-10 | Action Precedence (Pause) | 6.3 |

**All 10 tests must pass for certification.**

## Test Vectors

Test vectors are in [`test-vectors/test-vectors.json`](test-vectors/test-vectors.json).

Each test includes:
- **setup**: Initial state configuration
- **steps**: Operations to perform (events, time advances)
- **assertions**: Expected outcomes with tolerances

Example test structure:
```json
{
  "id": "conformance-1",
  "name": "Initialization",
  "spec_section": "3.4.2",
  "setup": {"action": "initialize"},
  "assertions": [
    {"path": "frustration", "expected": 0.0, "type": "equals"}
  ]
}
```

## Creating a Validator

To create a validator for a new language:

1. **Parse** `test-vectors/test-vectors.json`
2. **For each test:**
   - Initialize state (or use provided initial_state)
   - Execute steps (process_event, apply_decay)
   - Validate assertions against expected values
3. **Report results** in standard format (see `reports/REPORT_FORMAT.md`)
4. **Exit codes:** 0 if all pass, 1 if any fail

See [`validators/python/validate.py`](validators/python/validate.py) for reference implementation.

## Conformance Reports

Generate a conformance report after running tests:
```json
{
  "implementation": "aifeels-python",
  "version": "0.1.0",
  "spec_version": "0.1.0",
  "test_results": {
    "total": 10,
    "passed": 10,
    "failed": 0
  },
  "certification_date": "2025-02-07",
  "maintainer": "Aifeels Maintainers <hello@aifeels.org>"
}
```

See [`reports/example-report.json`](reports/example-report.json) for complete format.

## Certification

Implementations that pass all tests can apply for certification:

1. **Pass all 10 tests** (100% required)
2. **Generate conformance report**
3. **Submit to** [aifeels-spec/implementations/](https://github.com/aifeels-org/aifeels-spec/tree/main/implementations)

See [CERTIFICATION.md](https://github.com/aifeels-org/aifeels-spec/blob/main/CERTIFICATION.md) for process.

## Contributing

### Adding Test Cases

Found a conformance issue? Open an issue or PR to add test coverage.

**Requirements for new tests:**
- Must reference specific spec section
- Must be deterministic
- Must be language-agnostic
- Must include rationale

### Improving Validators

Contributions to validators welcome! Especially:
- Go validator
- Rust validator
- Java validator

## Specification

Tests validate conformance to [Aifeels Specification v0.1.0](https://github.com/aifeels-org/aifeels-spec/blob/main/SPEC.md).

## License

Apache 2.0 - See [LICENSE](LICENSE)

## Contact

- **Issues:** https://github.com/aifeels-org/aifeels-conformance-suite/issues
- **Discussions:** https://github.com/aifeels-org/aifeels-spec/discussions
- **Email:** certification@aifeels.org
