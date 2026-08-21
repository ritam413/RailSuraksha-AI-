// src/test-pipeline.ts
// Integration Test Suite for RailSuraksha AI Safety Pipeline

import { calculateKavachEbd } from './lib/agents/kavachBrakingAgent';
import { classifyIncidentSeverity } from './lib/agents/triageAgent';
import { calculatePlatformHoldState } from './lib/agents/sectionDispatchAgent';
import { buildExplainableDecisionLog } from './lib/agents/explainableLogger';
import { MOCK_INCIDENTS, MOCK_INTERLOCKING_STATE, MOCK_EBD_CALCULATION } from './lib/mockData';

console.log('----------------------------------------------------');
console.log('🚀 RUNNING RAILSURAKSHA AI INTEGRATION TEST SUITE');
console.log('----------------------------------------------------\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string) {
  totalTests++;
  if (condition) {
    console.log(`✅ [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`❌ [FAIL] ${testName}`);
  }
}

// TEST 1: Kavach RDSO Emergency Braking Physics Calculation
console.log('--- TEST GROUP 1: Kavach EBD Physics Engine ---');
const ebdResult = calculateKavachEbd({
  trainId: '12345 (Vande Bharat)',
  velocityKmh: 110,
  obstacleDistanceMeters: 340
});

assert(ebdResult.calculatedStoppingDistanceMeters === 410, 'Calculated stopping distance D_stop equals 410 meters for 110 km/h speed');
assert(ebdResult.isCollisionRisk === true, 'Collision risk correctly flagged when D_stop (410m) > D_obstacle (340m)');
assert(ebdResult.brakeState === 'EMERGENCY_SOLENOID_ACTUATED', 'Emergency brake solenoid correctly actuated');

// TEST 2: AI Triage Incident Severity Classifier
console.log('\n--- TEST GROUP 2: AI Triage Classifier ---');
const triageResult = classifyIncidentSeverity('BOULDER', 0.982, 340);
assert(triageResult.severityCategory === 'CRITICAL', 'Boulder obstacle at 340m distance classified as CRITICAL severity');
assert(triageResult.severityScore >= 0.85, 'Severity score above critical threshold 0.85');

// TEST 3: Section Dispatch Platform Hold & Crowd Density Agent
console.log('\n--- TEST GROUP 3: Section Dispatch Platform Hold Agent ---');
const holdResult = calculatePlatformHoldState('CSMT', 'PLATFORM_18', 'PLATFORM_17', 482, 252);
assert(holdResult.gatewayOccupancyIndex === 0.88, 'Crowd density index (rho) calculated correctly as 0.88 (88%)');
assert(holdResult.isMlExtensionActive === true, 'ML dynamic hold extension active due to overcrowding (rho > 0.80)');
assert(holdResult.status === 'HOLD_ACTIVE', 'Platform 18 signal hold status is HOLD_ACTIVE');

// TEST 4: Explainable Decision Log Builder
console.log('\n--- TEST GROUP 4: Auditor Decision Log Generator ---');
const decisionLog = buildExplainableDecisionLog(
  'RS-2048',
  '12345 (Vande Bharat Express)',
  'Section 14B — Up Main Line',
  'ADVISORY',
  'Boulder',
  340,
  410
);

assert(decisionLog.steps.length === 4, 'Decision log contains exactly 4 explainable safety steps');
assert(decisionLog.steps[0].agentName.includes('Vision Hazard Detector'), 'Step 1 originated from Vision Hazard Detector');
assert(decisionLog.steps[2].agentName.includes('Kavach Braking Agent'), 'Step 3 originated from Kavach Braking Agent');
assert(decisionLog.status === 'ACTION_CONFIRMED', 'Decision log action confirmed status set');

// TEST 5: Mock Data & Interface Schema Integrity
console.log('\n--- TEST GROUP 5: Mock Dataset & Schema Integrity ---');
assert(MOCK_INCIDENTS.length >= 3, 'Mock incidents queue dataset contains at least 3 test incidents');
assert(MOCK_INTERLOCKING_STATE.circuits.length === 5, 'Track interlocking state contains 5 block circuits');
assert(MOCK_EBD_CALCULATION.trainId !== '', 'Mock EBD dataset properly defined');

console.log('\n----------------------------------------------------');
console.log(`🎯 INTEGRATION TEST RESULTS: ${passedTests}/${totalTests} PASSED`);
console.log('----------------------------------------------------');

if (passedTests === totalTests) {
  console.log('🎉 ALL SYSTEMS GO! CODEBASE IS 100% READY FOR GITHUB PUSH.');
} else {
  console.error('⚠️ SOME TESTS FAILED. CHECK LOGS ABOVE.');
  process.exit(1);
}
