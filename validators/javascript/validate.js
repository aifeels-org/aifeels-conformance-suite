#!/usr/bin/env node
/**
 * Aifeels Conformance Test Suite - JavaScript Validator
 * Validates JavaScript/TypeScript implementations against official test vectors.
 */

const fs = require('fs');
const path = require('path');

class ConformanceValidator {
  /**
   * Initialize validator.
   * @param {string} testVectorsPath - Path to test-vectors.json
   * @param {string} implementationPath - Path to implementation module
   */
  constructor(testVectorsPath, implementationPath) {
    this.testData = JSON.parse(fs.readFileSync(testVectorsPath, 'utf8'));
    this.implementation = require(implementationPath);
    this.results = [];
  }

  /**
   * Get nested value using dot notation (e.g., 'metadata.trend').
   * @param {object} obj - Object to traverse
   * @param {string} path - Dot-separated path
   * @returns {*} Value at path
   */
  getNestedValue(obj, path) {
    const keys = path.split('.');
    let value = obj;
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        throw new Error(`Cannot access '${key}' in object`);
      }
    }
    return value;
  }

  /**
   * Check if assertion passes.
   * @param {object} state - State object to check
   * @param {object} assertion - Assertion definition
   * @returns {boolean} True if assertion passes
   */
  assertValue(state, assertion) {
    const { path, expected, type, tolerance = 0.001 } = assertion;

    let actual;
    try {
      actual = this.getNestedValue(state, path);
    } catch (e) {
      console.log(`  ✗ Cannot access ${path}: ${e.message}`);
      return false;
    }

    if (type === 'equals') {
      if (actual !== expected) {
        console.log(`  ✗ ${path}: expected ${expected}, got ${actual}`);
        return false;
      }
    } else if (type === 'approximately') {
      if (Math.abs(actual - expected) > tolerance) {
        console.log(`  ✗ ${path}: expected ~${expected}, got ${actual} (tolerance: ${tolerance})`);
        return false;
      }
    } else {
      console.log(`  ✗ Unknown assertion type: ${type}`);
      return false;
    }

    return true;
  }

  /**
   * Run a single conformance test.
   * @param {object} test - Test definition
   * @returns {boolean} True if test passes
   */
  runTest(test) {
    const { id, name, setup, steps, assertions } = test;

    console.log(`\nRunning ${id}: ${name}...`);

    try {
      // Setup
      let state;
      if (setup.action === 'initialize') {
        state = new this.implementation.EmotionalState();
        if (setup.initial_state) {
          // Set initial state values
          for (const [key, value] of Object.entries(setup.initial_state)) {
            state[key] = value;
          }
        }
      } else {
        console.log(`  ✗ Unknown setup action: ${setup.action}`);
        return false;
      }

      // Execute steps
      for (const step of steps) {
        const { action } = step;

        if (action === 'process_event') {
          state.processEvent(step.event);
        } else if (action === 'advance_time') {
          const seconds = step.seconds;
          // Try advance_time, otherwise fall back to apply_decay
          if (typeof state.advanceTime === 'function') {
            state.advanceTime(seconds);
          } else {
            // Calculate intervals and apply decay
            const intervals = Math.floor(seconds / 300);
            for (let i = 0; i < intervals; i++) {
              state.applyDecay();
            }
          }
        } else if (action === 'get_recommended_action') {
          // Store for assertion checking
          state._recommendedAction = state.recommendedAction();
        } else {
          console.log(`  ✗ Unknown step action: ${action}`);
          return false;
        }
      }

      // Check assertions
      let allPassed = true;
      for (const assertion of assertions) {
        // Handle recommended_action specially
        if (assertion.path === 'recommended_action') {
          if (!('_recommendedAction' in state)) {
            console.log(`  ✗ recommended_action not set`);
            allPassed = false;
            continue;
          }
          const actual = state._recommendedAction;
          const expected = assertion.expected;
          if (actual !== expected) {
            console.log(`  ✗ recommended_action: expected ${expected}, got ${actual}`);
            allPassed = false;
          }
          continue;
        }

        if (!this.assertValue(state, assertion)) {
          allPassed = false;
        }
      }

      if (allPassed) {
        console.log(`✓ ${id}: ${name} - PASSED`);
        return true;
      } else {
        console.log(`✗ ${id}: ${name} - FAILED`);
        return false;
      }

    } catch (e) {
      console.log(`✗ ${id}: ${name} - ERROR: ${e.message}`);
      console.error(e.stack);
      return false;
    }
  }

  /**
   * Run all conformance tests.
   * @returns {boolean} True if all tests pass
   */
  runAllTests() {
    console.log(`Aifeels Conformance Test Suite v${this.testData.version}`);
    console.log(`Spec version: ${this.testData.spec_version}`);
    console.log(`Testing implementation: ${this.implementation.name || 'unknown'}`);
    console.log('='.repeat(60));

    let passed = 0;
    let failed = 0;

    for (const test of this.testData.tests) {
      const result = this.runTest(test);
      this.results.push({
        id: test.id,
        name: test.name,
        status: result ? 'PASSED' : 'FAILED'
      });

      if (result) {
        passed++;
      } else {
        failed++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`Results: ${passed} passed, ${failed} failed out of ${passed + failed} total`);

    if (failed === 0) {
      console.log('✓ CONFORMANT: Implementation passes all tests!');
      return true;
    } else {
      console.log('✗ NON-CONFORMANT: Implementation failed one or more tests.');
      return false;
    }
  }

  /**
   * Generate conformance report JSON.
   * @param {string} outputPath - Path to write report
   */
  generateReport(outputPath) {
    const total = this.results.length;
    const passed = this.results.filter(r => r.status === 'PASSED').length;
    const failed = total - passed;

    const report = {
      implementation: {
        name: this.implementation.name || 'unknown',
        version: this.implementation.version || 'unknown',
        language: 'JavaScript',
        license: 'Apache-2.0'
      },
      spec_version: this.testData.spec_version,
      test_suite_version: this.testData.version,
      test_results: {
        total,
        passed,
        failed,
        errors: 0,
        pass_rate: total > 0 ? (passed / total * 100) : 0
      },
      test_details: this.results,
      conformance_statement: (
        `This implementation is ${failed === 0 ? 'fully conformant' : 'NOT conformant'} ` +
        `with the Aifeels Specification v${this.testData.spec_version}.`
      )
    };

    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    console.log(`\nReport written to: ${outputPath}`);
  }
}

function main() {
  if (process.argv.length < 3) {
    console.log('Usage: node validate.js <implementation_path>');
    console.log('Example: node validate.js ./aifeels.js');
    process.exit(1);
  }

  const implementationPath = path.resolve(process.argv[2]);

  // Find test vectors
  const scriptDir = __dirname;
  const testVectorsPath = path.join(scriptDir, '..', '..', 'test-vectors', 'test-vectors.json');

  if (!fs.existsSync(testVectorsPath)) {
    console.error(`Error: test-vectors.json not found at ${testVectorsPath}`);
    process.exit(1);
  }

  // Run validation
  const validator = new ConformanceValidator(testVectorsPath, implementationPath);
  const success = validator.runAllTests();

  // Generate report
  const reportPath = path.join(scriptDir, 'conformance-report.json');
  validator.generateReport(reportPath);

  process.exit(success ? 0 : 1);
}

if (require.main === module) {
  main();
}

module.exports = { ConformanceValidator };
