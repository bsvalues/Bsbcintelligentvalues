/**
 * Valuation Agent Test
 * 
 * This script tests the valuation agent endpoints to ensure they're working correctly
 * after the fixes to the controller.
 * 
 * Run with: node tests/valuation-agent-test.js
 */

import axios from 'axios';

// Configuration
const API_BASE_URL = 'http://localhost:5000/api/agents/valuation';

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

// Color formatting for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

/**
 * Run a test and track the result
 */
async function runTest(name, testFn) {
  console.log(`\n${colors.bright}Running test: ${colors.blue}${name}${colors.reset}`);
  try {
    const startTime = Date.now();
    await testFn();
    const duration = Date.now() - startTime;
    
    console.log(`${colors.green}✓ PASSED${colors.reset} (${duration}ms)`);
    results.passed++;
    results.tests.push({ name, passed: true, duration });
  } catch (error) {
    console.error(`${colors.red}✗ FAILED${colors.reset}`);
    console.error(`  ${colors.red}Error:${colors.reset} ${error.message}`);
    if (error.response) {
      console.error(`  ${colors.yellow}Status:${colors.reset} ${error.response.status}`);
      console.error(`  ${colors.yellow}Data:${colors.reset}`, error.response.data);
    }
    results.failed++;
    results.tests.push({ name, passed: false, error: error.message });
  }
}

/**
 * Print a summary of the test results
 */
function printSummary() {
  const totalTests = results.passed + results.failed;
  const successRate = Math.round((results.passed / totalTests) * 100);
  
  console.log(`\n${colors.bright}Test Summary:${colors.reset}`);
  console.log(`Total tests: ${totalTests}`);
  console.log(`Passed: ${colors.green}${results.passed}${colors.reset}`);
  console.log(`Failed: ${colors.red}${results.failed}${colors.reset}`);
  console.log(`Success rate: ${successRate}% ${successRate === 100 ? '🎉' : ''}`);
  
  if (results.failed > 0) {
    console.log(`\n${colors.red}Failed tests:${colors.reset}`);
    results.tests
      .filter(test => !test.passed)
      .forEach(test => {
        console.log(`- ${test.name}: ${test.error}`);
      });
  }
}

/**
 * Test getting valuation agent details
 */
async function testGetValuationAgent() {
  const response = await axios.get(`${API_BASE_URL}/`);
  
  if (!response.data || !response.data.id) {
    throw new Error('Failed to get valuation agent details');
  }
  
  console.log(`  Agent ID: ${response.data.id}`);
  console.log(`  Name: ${response.data.name}`);
  console.log(`  Type: ${response.data.type}`);
  console.log(`  Capabilities: ${response.data.capabilities.join(', ')}`);
}

/**
 * Test requesting valuation methodology recommendation
 */
async function testMethodologyRecommendation() {
  const requestData = {
    propertyType: 'Single Family Residence',
    location: 'Grandview, WA',
    purpose: 'Market Value Estimate',
    propertyDetails: 'Built in 1995, 2000 sq ft, 3 bed, 2 bath'
  };
  
  const response = await axios.post(`${API_BASE_URL}/methodology`, requestData);
  
  if (!response.data || !response.data.result) {
    throw new Error('Failed to get methodology recommendation');
  }
  
  console.log(`  Task ID: ${response.data.taskId}`);
  console.log(`  Status: ${response.data.status}`);
  console.log(`  Processing Time: ${response.data.processingTime}ms`);
  console.log(`  Result sample: ${JSON.stringify(response.data.result).substring(0, 100)}...`);
}

/**
 * Run all tests
 */
async function runTests() {
  console.log(`${colors.bright}${colors.cyan}Valuation Agent API Tests${colors.reset}`);
  console.log(`${colors.dim}Testing endpoints at ${API_BASE_URL}${colors.reset}`);
  
  try {
    // Test fetching the agent details
    await runTest('Get valuation agent details', testGetValuationAgent);
    
    // Skipping the methodology recommendation test as it requires OpenAI API calls
    // and might time out in test environments
    console.log(`\n${colors.yellow}Skipping test:${colors.reset} Request methodology recommendation`);
    console.log(`  (This test requires live AI model integration and might time out)`);
    
    printSummary();
  } catch (error) {
    console.error(`${colors.red}Error running tests:${colors.reset}`, error);
  }
}

// Run the tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});