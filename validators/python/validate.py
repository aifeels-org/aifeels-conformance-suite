#!/usr/bin/env python3
"""
Aifeels Conformance Test Suite - Python Validator
Validates Python implementations against official test vectors.
"""

import json
import sys
import importlib
import os
from pathlib import Path
from typing import Any, Dict, List, Optional


class ConformanceValidator:
    """Validates Aifeels implementations against test vectors."""
    
    def __init__(self, test_vectors_path: str, implementation_module: str):
        """
        Initialize validator.
        
        Args:
            test_vectors_path: Path to test-vectors.json
            implementation_module: Python module name to test
        """
        with open(test_vectors_path, 'r') as f:
            self.test_data = json.load(f)
        
        self.implementation = importlib.import_module(implementation_module)
        self.results = []
        
    def get_nested_value(self, obj: Any, path: str) -> Any:
        """Get nested value using dot notation (e.g., 'metadata.trend')."""
        keys = path.split('.')
        value = obj
        for key in keys:
            if hasattr(value, key):
                value = getattr(value, key)
            elif isinstance(value, dict):
                value = value[key]
            else:
                raise AttributeError(f"Cannot access '{key}' in {type(value)}")
        return value
    
    def assert_value(self, state: Any, assertion: Dict) -> bool:
        """Check if assertion passes."""
        path = assertion['path']
        expected = assertion['expected']
        assert_type = assertion['type']
        
        try:
            actual = self.get_nested_value(state, path)
        except (AttributeError, KeyError) as e:
            print(f"  ✗ Cannot access {path}: {e}")
            return False
        
        if assert_type == 'equals':
            if actual != expected:
                print(f"  ✗ {path}: expected {expected}, got {actual}")
                return False
        elif assert_type == 'approximately':
            tolerance = assertion.get('tolerance', 0.001)
            if abs(actual - expected) > tolerance:
                print(f"  ✗ {path}: expected ~{expected}, got {actual} (tolerance: {tolerance})")
                return False
        else:
            print(f"  ✗ Unknown assertion type: {assert_type}")
            return False
        
        return True
    
    def run_test(self, test: Dict) -> bool:
        """Run a single conformance test."""
        test_id = test['id']
        test_name = test['name']
        
        print(f"\nRunning {test_id}: {test_name}...")
        
        try:
            # Setup
            setup = test['setup']
            if setup['action'] == 'initialize':
                state = self.implementation.EmotionalState()
                if 'initial_state' in setup:
                    # Set initial state values
                    init_state = setup['initial_state']
                    for key, value in init_state.items():
                        setattr(state, key, value)
            else:
                print(f"  ✗ Unknown setup action: {setup['action']}")
                return False
            
            # Execute steps
            for step in test['steps']:
                action = step['action']
                
                if action == 'process_event':
                    event = step['event']
                    state.process_event(event)
                elif action == 'advance_time':
                    seconds = step['seconds']
                    # Assuming implementation has advance_time or similar
                    if hasattr(state, 'advance_time'):
                        state.advance_time(seconds)
                    else:
                        # Calculate intervals and apply decay
                        intervals = seconds // 300
                        for _ in range(intervals):
                            state.apply_decay()
                elif action == 'get_recommended_action':
                    # Store for assertion checking
                    state._recommended_action = state.recommended_action()
                else:
                    print(f"  ✗ Unknown step action: {action}")
                    return False
            
            # Check assertions
            all_passed = True
            for assertion in test['assertions']:
                # Handle recommended_action specially
                if assertion['path'] == 'recommended_action':
                    if not hasattr(state, '_recommended_action'):
                        print(f"  ✗ recommended_action not set")
                        all_passed = False
                        continue
                    actual = state._recommended_action
                    expected = assertion['expected']
                    if actual != expected:
                        print(f"  ✗ recommended_action: expected {expected}, got {actual}")
                        all_passed = False
                    continue
                
                if not self.assert_value(state, assertion):
                    all_passed = False
            
            if all_passed:
                print(f"✓ {test_id}: {test_name} - PASSED")
                return True
            else:
                print(f"✗ {test_id}: {test_name} - FAILED")
                return False
                
        except Exception as e:
            print(f"✗ {test_id}: {test_name} - ERROR: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    def run_all_tests(self) -> bool:
        """Run all conformance tests."""
        print(f"Aifeels Conformance Test Suite v{self.test_data['version']}")
        print(f"Spec version: {self.test_data['spec_version']}")
        print(f"Testing implementation: {self.implementation.__name__}")
        print("=" * 60)
        
        passed = 0
        failed = 0
        
        for test in self.test_data['tests']:
            result = self.run_test(test)
            self.results.append({
                'id': test['id'],
                'name': test['name'],
                'status': 'PASSED' if result else 'FAILED'
            })
            
            if result:
                passed += 1
            else:
                failed += 1
        
        print("\n" + "=" * 60)
        print(f"Results: {passed} passed, {failed} failed out of {passed + failed} total")
        
        if failed == 0:
            print("✓ CONFORMANT: Implementation passes all tests!")
            return True
        else:
            print("✗ NON-CONFORMANT: Implementation failed one or more tests.")
            return False
    
    def generate_report(self, output_path: str):
        """Generate conformance report JSON."""
        total = len(self.results)
        passed = sum(1 for r in self.results if r['status'] == 'PASSED')
        failed = total - passed
        
        report = {
            "implementation": {
                "name": self.implementation.__name__,
                "version": getattr(self.implementation, '__version__', 'unknown'),
                "language": "Python",
                "license": "Apache-2.0"
            },
            "spec_version": self.test_data['spec_version'],
            "test_suite_version": self.test_data['version'],
            "test_results": {
                "total": total,
                "passed": passed,
                "failed": failed,
                "errors": 0,
                "pass_rate": (passed / total * 100) if total > 0 else 0
            },
            "test_details": self.results,
            "conformance_statement": (
                f"This implementation is {'fully conformant' if failed == 0 else 'NOT conformant'} "
                f"with the Aifeels Specification v{self.test_data['spec_version']}."
            )
        }
        
        with open(output_path, 'w') as f:
            json.dump(report, f, indent=2)
        
        print(f"\nReport written to: {output_path}")


def main():
    """Main entry point."""
    if len(sys.argv) < 2:
        print("Usage: python validate.py <implementation_module>")
        print("Example: python validate.py aifeels")
        sys.exit(1)
    
    implementation_module = sys.argv[1]
    
    # Find test vectors
    script_dir = Path(__file__).parent
    test_vectors_path = script_dir.parent.parent / 'test-vectors' / 'test-vectors.json'
    
    if not test_vectors_path.exists():
        print(f"Error: test-vectors.json not found at {test_vectors_path}")
        sys.exit(1)
    
    # Run validation
    validator = ConformanceValidator(str(test_vectors_path), implementation_module)
    success = validator.run_all_tests()
    
    # Generate report
    report_path = script_dir / 'conformance-report.json'
    validator.generate_report(str(report_path))
    
    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()
