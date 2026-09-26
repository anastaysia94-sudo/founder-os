import { readFileSync } from "node:fs";

const vision = readFileSync("PRODUCT-VISION.md","utf8");
const readme = readFileSync("README.md","utf8");
const home = readFileSync("web/app/page.tsx","utf8");
const intelligence = readFileSync("web/app/intelligence/page.tsx","utf8");
const workbench = readFileSync("web/app/workbench/page.tsx","utf8");
const strategy = readFileSync("web/app/strategy/page.tsx","utf8");

const checks = [
  [vision.includes("Founder Dynasty OS is the operating intelligence of the business."), "canonical product statement"],
  [vision.includes("It is not a CRM with extra panels."), "anti-CRM identity rule"],
  [vision.includes("It is not a sales app."), "anti-sales-app identity rule"],
  [vision.includes("Evidence → Value Leak / Value Opportunity → ranked action → Value Sprint → measurement → KEEP / REVISE / REVERT"), "original operating loop"],
  [vision.includes("E1 Verified Fact") && vision.includes("E8 Illustrative Example"), "E1-E8 evidence model"],
  [vision.includes("Plain-English design rule"), "plain-English design rule"],
  [vision.includes("Dynasty Mode"), "Dynasty mission"],
  [readme.includes("Customers & Growth → Same-Day Customer Growth Pack / Sales OS"), "Sales OS subordinate hierarchy"],
  [home.includes("Founder Command Center") && home.includes("Business DNA") && home.includes("Value Map") && home.includes("Business Memory"), "main operating-intelligence surface"],
  [intelligence.includes("BUSINESS X-RAY") && intelligence.includes("VALUE SPRINTS"), "intelligence + learning surfaces"],
  [workbench.includes("FINANCE CENTER") && workbench.includes("PRODUCT & OFFER LAB") && workbench.includes("OPERATIONS"), "build/run breadth"],
  [strategy.includes("BUSINESS MODEL LAB") && strategy.includes("ASSET MAP") && strategy.includes("SCENARIO LAB") && strategy.includes("PORTFOLIO / DYNASTY MODE"), "strategy/dynasty breadth"],
];

const failed = checks.filter(([ok]) => !ok);
if (failed.length) {
  console.error("PRODUCT IDEOLOGY GUARD: FAIL");
  for (const [,label] of failed) console.error(" - missing:", label);
  process.exit(1);
}
console.log("PRODUCT IDEOLOGY GUARD: PASS");
for (const [,label] of checks) console.log(" -", label);
