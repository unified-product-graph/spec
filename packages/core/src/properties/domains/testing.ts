/**
 * UPG Property Schemas: QA & Testing Domain.
 * TestPlan, TestSuite, TestCase, QaSession, RegressionTest, TestCoverageReport,
 * TestEnvironment, TestResult.
 * https://unifiedproductgraph.org/spec | MIT
 */

import type { ISODate, ISODateTime, Priority } from '../primitives.js'

// ---------------------------------------------------------------------------
// QA & TESTING
// ---------------------------------------------------------------------------

/** Test plan: the QA verification procedure for a product or release.
 *
 * Re-homed validation → QA in. A `test_plan` defines HOW the team
 * verifies the software works — the scope under test, the environments it runs
 * in, the entry/exit (pass) criteria — and groups the `test_suite`s that carry
 * it out. Its former validation-planning role (designing an experiment for a
 * hypothesis) is now carried by `experiment_plan`.
 *
 * @example
 * const properties: TestPlanProperties = {
 *   test_scope: 'Checkout, billing settlement, and refund flows.',
 *   plan_type: 'release',
 *   environments: ['staging', 'production_mirror'],
 *   entry_criteria: 'Build deployed to staging; seed data loaded.',
 *   pass_criteria: 'All P0/P1 suites green; no open blocker bugs.',
 * }
 */
export interface TestPlanProperties {
  /** What the plan covers (e.g. "checkout flow", "auth module", "release 2.4"). */
  test_scope?: string
  /** Kind of verification effort this plan governs. */
  plan_type?: 'release' | 'regression' | 'integration' | 'acceptance' | 'smoke' | 'exploratory'
  /** Environments the plan exercises (mirrors `TestEnvironmentProperties.env_type`). */
  environments?: Array<'local' | 'ci' | 'staging' | 'sandbox' | 'production_mirror'>
  /** Conditions that must hold before execution may begin. */
  entry_criteria?: string
  /** Exit / pass criteria determining whether the plan succeeds. */
  pass_criteria?: string
}

/** Test suite.
 *
 * @example
 * const properties: TestSuiteProperties = {
 *   suite_type: 'unit',
 *   pass_rate: 42,
 *   last_run: '2026-04-10T02:00:00Z',
 * }
 */
export interface TestSuiteProperties {
  /** Category of test suite */
  suite_type?: 'unit' | 'integration' | 'e2e' | 'performance' | 'security' | 'accessibility'
  /** Number of tests in the suite */
  test_count?: number
  /** Percentage of tests passing (0-100) */
  pass_rate?: number
  /** ISO date of last execution */
  last_run?: string
  /** Total execution time for the last run, in milliseconds */
  total_duration_ms?: number
  /** Number of tests that failed in the last run */
  failed_count?: number
  /** Number of tests that were skipped in the last run */
  skipped_count?: number
  /** Number of tests that passed only on retry (flaky) in the last run */
  flaky_count?: number
}

/** Test case.
 *
 * @example
 * const properties: TestCaseProperties = {
 *   execution_type: 'manual',
 *   priority: 'high',
 *   preconditions: ['User is logged in', 'At least one product exists in the workspace'],
 *   steps: ['Open the product', 'Click the delete button', 'Confirm the dialog'],
 * }
 */
export interface TestCaseProperties {
  /** How the test is executed */
  execution_type?: 'manual' | 'automated' | 'exploratory'
  /** Test importance */
  priority?: Priority
  /** Conditions required before running the test */
  preconditions?: string[]
  /** Ordered steps to execute the test */
  steps?: string[]
  /** What a passing result looks like */
  expected_result?: string
  /** Result of the most recent execution */
  last_result?: 'not_run' | 'pass' | 'fail' | 'blocked' | 'skipped'
  /** Hierarchical grouping within the parent suite (e.g. "Checkout / Payment") */
  section?: string
  /** Test case template applied (e.g. "BDD", "Given-When-Then", "exploratory charter") */
  template?: string
  /** Links to requirements, tickets, or external documentation */
  references?: string[]
  /**
   * Automation status. Closed set so coverage dashboards can group test cases
   * by automation maturity. Pair with `automation_tool` for the specific
   * framework (e.g. Playwright, Cypress) when automated.
   */
  automation_status?:
    | 'manual'
    | 'automated'
    | 'partially_automated'
    | 'planned'
    | 'other'
  /**
   * Automation tool or framework (e.g. `'Playwright'`, `'Cypress'`, `'Jest'`).
   * Free-text; the universe of tools is open. Pairs with `automation_status`
   * per audit recommendation (#40).
   */
  automation_tool?: string
}

/** QA session.
 *
 * @example
 * const properties: QaSessionProperties = {
 *   session_type: 'exploratory',
 *   duration_minutes: 45,
 *   bugs_found: 42,
 * }
 */
export interface QaSessionProperties {
  /** Type of QA session */
  session_type?: 'exploratory' | 'regression' | 'smoke' | 'uat'
  /** Duration of the session in minutes */
  duration_minutes?: number
  /** Number of bugs found during the session */
  bugs_found?: number
}

/** Regression test.
 *
 * @example
 * const properties: RegressionTestProperties = {
 *   regression_scope: 'Core auth flows and billing settlement.',
 *   automated: true,
 *   last_pass: '2026-04-10',
 * }
 */
export interface RegressionTestProperties {
  /** Scope of regression coverage (e.g. "checkout flow", "auth module") */
  regression_scope?: string
  /** Whether the regression test is automated */
  automated?: boolean
  /** ISO date of last passing run */
  last_pass?: string
  /** Number of failures in recent runs */
  recent_failures?: number
}

/** Test coverage report.
 *
 * @example
 * const properties: TestCoverageReportProperties = {
 *   line_coverage: 42,
 *   branch_coverage: 42,
 *   function_coverage: 42,
 * }
 */
export interface TestCoverageReportProperties {
  /** Percentage of lines covered (0-100) */
  line_coverage?: number
  /** Percentage of branches covered (0-100) */
  branch_coverage?: number
  /** Percentage of functions covered (0-100) */
  function_coverage?: number
  /** Percentage of statements covered (0-100) */
  statement_coverage?: number
  /** Coverage target threshold set by the team (0-100) */
  target_coverage?: number
  /** Number of lines not covered by any test */
  uncovered_lines?: number
  /** ISO date when the report was generated */
  report_date?: ISODate
}

/** Test environment.
 *
 * @example
 * const properties: TestEnvironmentProperties = {
 *   env_type: 'local',
 *   env_status: 'available',
 *   config: '{ retries: 3, timeout_ms: 15000 }',
 * }
 */
export interface TestEnvironmentProperties {
  /** Type of environment */
  env_type?: 'local' | 'ci' | 'staging' | 'sandbox' | 'production_mirror'
  /** Current availability status of the environment */
  env_status?: 'available' | 'in_use' | 'maintenance' | 'unavailable'
  /** Configuration details (e.g. OS, browser version, database seed) */
  config?: string
}

/** Single test execution result.
 *
 * @example
 * const properties: TestResultProperties = {
 *   result_status: 'passed',
 *   duration_ms: 42,
 *   retry_index: 42,
 * }
 */
export interface TestResultProperties {
  /**
   * Outcome of this execution.
   * passed = all assertions met; failed = one or more assertions failed;
   * timed_out = execution exceeded the timeout; skipped = test was not run;
   * interrupted = test was stopped mid-run.
   */
  result_status: 'passed' | 'failed' | 'timed_out' | 'skipped' | 'interrupted'
  /** Duration of this execution in milliseconds */
  duration_ms?: number
  /** Retry index. 0 = first attempt, 1 = first retry, etc. */
  retry_index?: number
  /** Error message if the test failed */
  error_message?: string
  /** Version of the product or build under test */
  version_tested?: string
  /**
   * ISO timestamp of the execution.
   * @example "2026-04-05T14:30:00Z"
   */
  executed_at?: ISODateTime
  /** Comma-separated list of attachment names or URLs (screenshots, logs, traces) */
  attachments?: string
  /** Notes or commentary about this result */
  comment?: string
}
