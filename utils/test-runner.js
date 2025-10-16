class TestRunner {
  constructor() {
    this.tests = [];
    this.results = {passed: 0, failed: 0, errors: []};
  }

  test(name, fn) {
    this.tests.push({name, fn});
  }

  async run() {
    for (const {name, fn} of this.tests) {
      try {
        await fn();
        this.results.passed++;
      } catch (error) {
        this.results.failed++;
        this.results.errors.push({name, error: error.message});
      }
    }

    if (this.results.failed > 0) {
      console.log(`\n❌ Validation failed: ${this.results.failed} test(s) failed\n`);
      this.results.errors.forEach(({name, error}) => {
        console.log(`  ✗ ${name}`);
        console.log(`    ${error}`);
      });
      console.log('');
      return false;
    }

    console.log(`✓ Validation passed: ${this.results.passed} tests`);
    return true;
  }

  assert(condition, message) {
    if (!condition) {
      throw new Error(message);
    }
  }

  assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(`${message}\n  Expected: ${expected}\n  Actual: ${actual}`);
    }
  }

  assertGreaterThan(actual, threshold, message) {
    if (actual <= threshold) {
      throw new Error(`${message}\n  Expected > ${threshold}\n  Actual: ${actual}`);
    }
  }

  assertExists(value, message) {
    if (value === null || value === undefined) {
      throw new Error(message);
    }
  }

  assertMatches(value, pattern, message) {
    if (!pattern.test(value)) {
      throw new Error(`${message}\n  Pattern: ${pattern}\n  Value: ${value}`);
    }
  }
}

module.exports = {TestRunner};
