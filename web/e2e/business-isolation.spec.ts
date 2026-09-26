import { expect, test, type Page, type TestInfo } from '@playwright/test';

const A = 'FDOS Acceptance Business A';
const B = 'FDOS Acceptance Business B';
const UNSAVED_A = 'UNSAVED_A_ISOLATION_CHECK_DO_NOT_SAVE';

const markers = {
  A: {
    dnaPurpose: 'FDOS-A-PURPOSE-MARKER',
    goal: 'FDOS-A-SAVED-GOAL',
    value: 'FDOS-A-VALUE-MARKER',
    opportunity: 'FDOS-A-OPPORTUNITY-MARKER',
    risk: 'FDOS-A-RISK-MARKER',
    decision: 'FDOS-A-DECISION-MARKER',
    memory: 'FDOS-A-MEMORY-MARKER',
    sprint: 'FDOS-A-SPRINT-MARKER',
    money: 'FDOS-A-MONEY-MARKER',
    offer: 'FDOS-A-OFFER-MARKER',
    initiative: 'FDOS-A-INITIATIVE-MARKER',
    model: 'FDOS-A-MODEL-MARKER',
    customer: 'FDOS-A-CUSTOMER-MARKER',
    distribution: 'FDOS-A-DISTRIBUTION-MARKER',
    asset: 'FDOS-A-ASSET-MARKER',
    attention: 'FDOS-A-ATTENTION-MARKER',
    scenario: 'FDOS-A-SCENARIO-MARKER',
    portfolio: 'FDOS-A-PORTFOLIO-MARKER',
  },
  B: {
    dnaPurpose: 'FDOS-B-PURPOSE-MARKER',
    goal: 'FDOS-B-SAVED-GOAL',
    value: 'FDOS-B-VALUE-MARKER',
    opportunity: 'FDOS-B-OPPORTUNITY-MARKER',
    risk: 'FDOS-B-RISK-MARKER',
    decision: 'FDOS-B-DECISION-MARKER',
    memory: 'FDOS-B-MEMORY-MARKER',
    sprint: 'FDOS-B-SPRINT-MARKER',
    money: 'FDOS-B-MONEY-MARKER',
    offer: 'FDOS-B-OFFER-MARKER',
    initiative: 'FDOS-B-INITIATIVE-MARKER',
    model: 'FDOS-B-MODEL-MARKER',
    customer: 'FDOS-B-CUSTOMER-MARKER',
    distribution: 'FDOS-B-DISTRIBUTION-MARKER',
    asset: 'FDOS-B-ASSET-MARKER',
    attention: 'FDOS-B-ATTENTION-MARKER',
    scenario: 'FDOS-B-SCENARIO-MARKER',
    portfolio: 'FDOS-B-PORTFOLIO-MARKER',
  },
} as const;

type MarkerSet = typeof markers.A;

async function waitForCloud(page: Page) {
  await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText(/Cloud sync ready\.|Shared business record synced\.|business record.*available/i).first()).toBeVisible({ timeout: 30_000 }).catch(() => {});
}

async function ensureSignedIn(page: Page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const signOut = page.getByRole('button', { name: 'Sign out' });
  if (await signOut.isVisible().catch(() => false)) {
    await waitForCloud(page);
    return;
  }

  const email = process.env.FDOS_E2E_EMAIL;
  const password = process.env.FDOS_E2E_PASSWORD;
  if (!email || !password) {
    throw new Error(
      'No authenticated browser state was found. Run "npm run e2e:auth" and sign in directly in the opened browser, or set FDOS_E2E_EMAIL/FDOS_E2E_PASSWORD locally. Never commit credentials.'
    );
  }

  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(signOut).toBeVisible({ timeout: 30_000 });
  await waitForCloud(page);
}

async function optionText(page: Page) {
  return page.getByLabel('Choose active business').locator('option').allTextContents();
}

async function switchBusiness(page: Page, name: string) {
  const select = page.getByLabel('Choose active business');
  await expect(select).toBeVisible();
  const options = await select.locator('option').evaluateAll((nodes) =>
    nodes.map((node) => ({ value: (node as HTMLOptionElement).value, text: node.textContent || '' }))
  );
  const match = options.find((item) => item.text.startsWith(name));
  if (!match) throw new Error(`Business "${name}" is not available in the active-business selector.`);
  await select.selectOption(match.value);
  await page.waitForLoadState('domcontentloaded');
  await expect(page.getByLabel('Choose active business').locator('option:checked')).toContainText(name);
}

async function ensureBusinessAExists(page: Page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await waitForCloud(page);
  const options = await optionText(page);
  if (options.some((x) => x.startsWith(A))) {
    await switchBusiness(page, A);
    return;
  }

  const hasB = options.some((x) => x.startsWith(B));
  if (options.length === 1 && !hasB) {
    return; // Rename the automatically created first workspace while populating A.
  }

  await page.goto('/portfolio', { waitUntil: 'domcontentloaded' });
  await page.getByLabel('Business or idea name').fill(A);
  await page.getByLabel('Starting stage').selectOption('Exploring');
  await page.getByRole('button', { name: 'Create and open business' }).click();
  await page.waitForURL(/\/$/);
  await expect(page.getByLabel('Choose active business').locator('option:checked')).toContainText(A);
}

async function ensureBusinessBExists(page: Page) {
  const options = await optionText(page);
  if (options.some((x) => x.startsWith(B))) {
    await switchBusiness(page, B);
    return;
  }

  await page.goto('/portfolio', { waitUntil: 'domcontentloaded' });
  await page.getByLabel('Business or idea name').fill(B);
  await page.getByLabel('Starting stage').selectOption('Validating');
  await page.getByRole('button', { name: 'Create and open business' }).click();
  await page.waitForURL(/\/$/);
  await expect(page.getByLabel('Choose active business').locator('option:checked')).toContainText(B);
}

async function editDNA(page: Page, businessName: string, m: MarkerSet) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByLabel('Choose active business').locator('option:checked')).toContainText(businessName);

  const edit = page.getByRole('button', { name: 'Edit Business DNA' });
  if (await edit.isVisible().catch(() => false)) await edit.click();

  await page.getByLabel('Business / idea name').fill(businessName);
  await page.getByLabel('Why this business exists').fill(m.dnaPurpose);
  await page.getByLabel('Problem it is trying to solve').fill(`${businessName} technical isolation problem marker`);
  await page.getByLabel('Who it is for').fill('Founder Dynasty OS production acceptance');
  await page.getByLabel('What it offers').fill(`${businessName} technical acceptance workspace`);
  await page.getByLabel('How it may make money').fill('Not evaluated in this isolation test');
  await page.getByLabel('Possible advantage').fill(`${businessName} isolated-record marker`);
  await page.getByLabel('Main limit or constraint').fill('Production browser acceptance only');
  await page.getByLabel('Most important current goal').fill(m.goal);
  await page.getByRole('button', { name: 'Save approved edits' }).click();
  await expect(page.getByText('Business DNA saved.')).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText(m.dnaPurpose, { exact: true })).toBeVisible();
}

async function ensureComposerRecord(page: Page, button: string, title: string, detail: string) {
  if (await page.getByText(title, { exact: true }).first().isVisible().catch(() => false)) return;
  await page.getByRole('button', { name: button }).click();
  const dialog = page.locator('form.recordComposer');
  await expect(dialog).toBeVisible();
  const titleInput = dialog.locator('input[required]').first();
  const detailInput = dialog.locator('textarea[required]').first();
  await titleInput.fill(title);
  await detailInput.fill(detail);
  await dialog.getByRole('button', { name: 'Save to business record' }).click();
  await expect(page.getByText(title, { exact: true }).first()).toBeVisible({ timeout: 30_000 });
}

async function populateCore(page: Page, businessName: string, m: MarkerSet) {
  await editDNA(page, businessName, m);
  await ensureComposerRecord(page, 'Add value item', m.value, `${m.value} detail`);
  await ensureComposerRecord(page, 'Add opportunity', m.opportunity, `${m.opportunity} observation`);
  await ensureComposerRecord(page, 'Add risk', m.risk, `${m.risk} response`);
  await ensureComposerRecord(page, 'Add decision', m.decision, `${m.decision} next action`);
  await ensureComposerRecord(page, 'Add founder note', 'Isolation acceptance note', m.memory);
}

async function populateIntelligence(page: Page, m: MarkerSet) {
  await page.goto('/intelligence#value-sprints', { waitUntil: 'domcontentloaded' });
  if (await page.getByText(m.sprint, { exact: true }).first().isVisible().catch(() => false)) return;
  await page.getByLabel('What are we testing?').fill(m.sprint);
  await page.getByLabel('How will we know?').fill('Record remains attached only to the active business');
  await page.getByLabel('Hypothesis').fill(`${m.sprint} hypothesis`);
  await page.getByLabel('Smallest useful action').fill(`${m.sprint} action`);
  await page.getByLabel('Baseline').fill('No cross-business visibility');
  await page.getByLabel('Target').fill('Zero cross-business leakage');
  await page.getByRole('button', { name: 'Plan Value Sprint' }).click();
  await expect(page.getByText(m.sprint, { exact: true })).toBeVisible({ timeout: 30_000 });
}

async function populateWorkbench(page: Page, m: MarkerSet) {
  await page.goto('/workbench', { waitUntil: 'domcontentloaded' });

  if (!await page.getByText(m.money, { exact: true }).first().isVisible().catch(() => false)) {
    await page.getByLabel('Assumption').fill(m.money);
    await page.getByLabel('Current model value').fill('Technical isolation marker only');
    await page.getByRole('button', { name: 'Save financial assumption' }).click();
    await expect(page.getByText(m.money, { exact: true })).toBeVisible({ timeout: 30_000 });
  }

  if (!await page.getByText(m.offer, { exact: true }).first().isVisible().catch(() => false)) {
    await page.getByLabel('Offer name').fill(m.offer);
    await page.getByLabel('Promise / useful outcome').fill(`${m.offer} technical isolation outcome`);
    await page.getByRole('button', { name: 'Create offer hypothesis' }).click();
    await expect(page.getByText(m.offer, { exact: true })).toBeVisible({ timeout: 30_000 });
  }

  if (!await page.getByText(m.initiative, { exact: true }).first().isVisible().catch(() => false)) {
    await page.getByLabel('Initiative').fill(m.initiative);
    await page.getByLabel('Outcome we want').fill(`${m.initiative} stays business-scoped`);
    await page.getByRole('button', { name: 'Plan initiative' }).click();
    await expect(page.getByText(m.initiative, { exact: true })).toBeVisible({ timeout: 30_000 });
  }
}

async function populateStrategy(page: Page, m: MarkerSet) {
  await page.goto('/strategy', { waitUntil: 'domcontentloaded' });

  if (!await page.getByText(m.model, { exact: true }).first().isVisible().catch(() => false)) {
    await page.getByLabel('Current hypothesis').fill(m.model);
    await page.getByRole('button', { name: 'Add model element' }).click();
    await expect(page.getByText(m.model, { exact: true })).toBeVisible({ timeout: 30_000 });
  }

  if (!await page.getByText(m.customer, { exact: true }).first().isVisible().catch(() => false)) {
    await page.getByLabel('What did we learn?').fill(m.customer);
    await page.getByLabel('What might this change?').fill('Technical isolation observation, not customer-derived evidence');
    await page.getByRole('button', { name: 'Save customer insight' }).click();
    await expect(page.getByText(m.customer, { exact: true })).toBeVisible({ timeout: 30_000 });
  }

  if (!await page.getByText(m.distribution, { exact: true }).first().isVisible().catch(() => false)) {
    await page.getByLabel('Channel').fill(m.distribution);
    await page.getByLabel('Measure').fill('Remain visible only inside this Business Record');
    await page.getByRole('button', { name: 'Plan distribution test' }).click();
    await expect(page.getByText(m.distribution, { exact: true })).toBeVisible({ timeout: 30_000 });
  }

  if (!await page.getByText(m.asset, { exact: true }).first().isVisible().catch(() => false)) {
    await page.getByLabel('Name').fill(m.asset);
    await page.getByLabel('Why it creates durable value').fill('Technical isolation marker');
    await page.getByRole('button', { name: 'Map asset' }).click();
    await expect(page.getByText(m.asset, { exact: true })).toBeVisible({ timeout: 30_000 });
  }

  if (!await page.getByText(m.attention, { exact: true }).first().isVisible().catch(() => false)) {
    await page.getByLabel('Area').fill(m.attention);
    await page.getByLabel('Outcome this time should produce').fill('Verify business-scoped isolation');
    await page.getByRole('button', { name: 'Allocate attention' }).click();
    await expect(page.getByText(m.attention, { exact: true })).toBeVisible({ timeout: 30_000 });
  }

  if (!await page.getByText(m.scenario, { exact: true }).first().isVisible().catch(() => false)) {
    const scenarioPanel = page.locator('section#scenarios');
    await scenarioPanel.getByLabel('Name').fill(m.scenario);
    await scenarioPanel.getByLabel('Early signal').fill('Cross-business marker appears');
    await scenarioPanel.getByLabel('Decision rule').fill('Fail acceptance and repair isolation');
    await scenarioPanel.getByRole('button', { name: 'Create scenario' }).click();
    await expect(page.getByText(m.scenario, { exact: true })).toBeVisible({ timeout: 30_000 });
  }

  if (!await page.getByText(m.portfolio, { exact: true }).first().isVisible().catch(() => false)) {
    const dynastyPanel = page.locator('section#dynasty');
    await dynastyPanel.getByLabel('Name').fill(m.portfolio);
    await dynastyPanel.getByLabel('Investment thesis').fill('Technical isolation marker, not an investment recommendation');
    await dynastyPanel.getByRole('button', { name: 'Add portfolio thesis' }).click();
    await expect(page.getByText(m.portfolio, { exact: true })).toBeVisible({ timeout: 30_000 });
  }
}

async function populateBusiness(page: Page, businessName: string, m: MarkerSet) {
  await populateCore(page, businessName, m);
  await populateIntelligence(page, m);
  await populateWorkbench(page, m);
  await populateStrategy(page, m);
}

async function bodyText(page: Page) {
  return page.locator('body').innerText();
}

async function assertMarkerAbsent(page: Page, marker: string) {
  expect(await bodyText(page)).not.toContain(marker);
}

async function verifyBusiness(page: Page, businessName: string, own: MarkerSet, other: MarkerSet) {
  const checks: Array<[string, string, string]> = [
    ['/', own.dnaPurpose, other.dnaPurpose],
    ['/', own.value, other.value],
    ['/', own.opportunity, other.opportunity],
    ['/', own.risk, other.risk],
    ['/', own.decision, other.decision],
    ['/', own.memory, other.memory],
    ['/intelligence', own.sprint, other.sprint],
    ['/workbench', own.money, other.money],
    ['/workbench', own.offer, other.offer],
    ['/workbench', own.initiative, other.initiative],
    ['/strategy', own.model, other.model],
    ['/strategy', own.customer, other.customer],
    ['/strategy', own.distribution, other.distribution],
    ['/strategy', own.asset, other.asset],
    ['/strategy', own.attention, other.attention],
    ['/strategy', own.scenario, other.scenario],
    ['/strategy', own.portfolio, other.portfolio],
  ];

  for (const [route, ownMarker, otherMarker] of checks) {
    await page.goto(route, { waitUntil: 'domcontentloaded' });
    await expect(page.getByLabel('Choose active business').locator('option:checked')).toContainText(businessName);
    await expect(page.getByText(ownMarker, { exact: true }).first()).toBeVisible({ timeout: 30_000 });
    await assertMarkerAbsent(page, otherMarker);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByLabel('Choose active business').locator('option:checked')).toContainText(businessName);
  }
}

async function attachAcceptanceEvidence(page: Page, testInfo: TestInfo) {
  await page.goto('/acceptance', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Run browser checks again' }).click();
  await expect(page.getByText(/PASS · A genuine active-Business switch has been observed in this browser/)).toBeVisible({ timeout: 30_000 });
  const checkpoint = await page.evaluate(() => window.sessionStorage.getItem('fdos.acceptance.business-switch.v1'));
  expect(checkpoint).toBeTruthy();
  const parsed = JSON.parse(checkpoint || '{}');
  expect(parsed.completedAt).toBeTruthy();
  expect(parsed.startBusinessId).not.toBe(parsed.endBusinessId);

  await testInfo.attach('business-switch-checkpoint.json', {
    body: Buffer.from(JSON.stringify(parsed, null, 2)),
    contentType: 'application/json',
  });
  await page.screenshot({ path: testInfo.outputPath('final-acceptance.png'), fullPage: true });
}

test.describe.serial('Founder Dynasty OS production Business A/B isolation', () => {
  test('saved and unsaved state remain isolated across repeated business switches', async ({ page }, testInfo) => {
    await ensureSignedIn(page);
    await ensureBusinessAExists(page);
    await populateBusiness(page, A, markers.A);

    await ensureBusinessBExists(page);

    // B must be clean before it receives its own technical acceptance markers.
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.getByLabel('Choose active business').locator('option:checked')).toContainText(B);
    await assertMarkerAbsent(page, markers.A.dnaPurpose);
    await assertMarkerAbsent(page, markers.A.value);
    await assertMarkerAbsent(page, markers.A.opportunity);

    // Arm genuine A -> B switch proof.
    await switchBusiness(page, A);
    await page.goto('/acceptance', { waitUntil: 'domcontentloaded' });
    const reset = page.getByRole('button', { name: 'Reset switch proof' });
    if (await reset.isEnabled().catch(() => false)) {
      await reset.click();
      await page.getByRole('button', { name: 'Run browser checks again' }).click();
    }
    await page.getByRole('button', { name: 'Arm Business switch proof' }).click();

    // Create an intentionally unsaved browser draft in A, then switch through the real selector.
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const edit = page.getByRole('button', { name: 'Edit Business DNA' });
    if (await edit.isVisible().catch(() => false)) await edit.click();
    await page.getByLabel('Most important current goal').fill(UNSAVED_A);
    await switchBusiness(page, B);
    await assertMarkerAbsent(page, UNSAVED_A);
    await assertMarkerAbsent(page, markers.A.dnaPurpose);

    // The acceptance page must observe the real A -> B hard-reload crossing.
    await page.goto('/acceptance', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Run browser checks again' }).click();
    await expect(page.getByText(/PASS · A genuine active-Business switch has been observed in this browser/)).toBeVisible({ timeout: 30_000 });

    // Give B its own unmistakable business-scoped records.
    await populateBusiness(page, B, markers.B);

    // B -> A: A returns, B is absent, unsaved A draft remains gone.
    await switchBusiness(page, A);
    await verifyBusiness(page, A, markers.A, markers.B);
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    expect(await bodyText(page)).not.toContain(UNSAVED_A);
    await expect(page.getByText(markers.A.goal, { exact: true })).toBeVisible();

    // A -> B again: repeatability and route/reload persistence.
    await switchBusiness(page, B);
    await verifyBusiness(page, B, markers.B, markers.A);

    // One more complete round trip catches stale component/local-storage state.
    await switchBusiness(page, A);
    await expect(page.getByText(markers.A.dnaPurpose, { exact: true })).toBeVisible();
    await assertMarkerAbsent(page, markers.B.dnaPurpose);
    await switchBusiness(page, B);
    await expect(page.getByText(markers.B.dnaPurpose, { exact: true })).toBeVisible();
    await assertMarkerAbsent(page, markers.A.dnaPurpose);

    await attachAcceptanceEvidence(page, testInfo);
  });
});
