"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const get=name=>fs.readFileSync(path.join(root,name),"utf8");
const css=get("visual-finishing.css"),html=get("index.html"),sw=get("sw.js");
test("final visual finish reaches all five existing panels while preserving site identity",()=>{
  for (const name of ["#dashboard","#threat-map-view","#intel-wire","#cve-matrix","#apt-dossiers"]) {
    assert.ok(css.includes(name),"Missing visual refinement in "+name);
  }
  assert.match(css,/--vf-cyan:#81dbe5/);
  assert.match(css,/--vf-gold:#f0c888/);
  assert.ok(css.includes(".command-header::after"));
  assert.ok(css.includes(".tactical-navbar .nav-tab.active"));
  assert.ok(css.includes(".workspace-bar"));
  assert.ok(css.includes(".wire-state-card"));
  assert.ok(css.includes(".actor-dossier-card"));
  assert.ok(css.includes(".tactical-table tbody tr:focus-within"));
  assert.ok(css.includes(".map-container-relative::after"));
});
test("creative cues are passive and never fabricate an operational signal",()=>{
  assert.ok(!css.includes("@keyframes"));
  assert.ok(!css.includes("infinite"));
  assert.ok(!css.includes("backdrop-filter"));
  assert.ok(css.includes("pointer-events:none"));
  assert.ok(css.includes("prefers-reduced-motion"));
  assert.ok(!css.includes("direction:rtl"));
  assert.ok(!css.includes("flex-direction:row-reverse"));
  assert.ok(css.includes(".wire-state-card")&&css.includes("var(--signal-color"));
});
test("final CSS and PWA shell are versioned, explicitly budgeted and reviewable",()=>{
  assert.ok(html.includes('href="visual-finishing.css?v=1"'));
  assert.ok(sw.includes("'./visual-finishing.css?v=1'"));
  assert.ok(sw.includes("'yaslogist-v18-shell'"));
  const perf=JSON.parse(get("perf-budget.json"));
  assert.ok(perf.localSurface.includes("visual-finishing.css"));
  assert.ok(fs.statSync(path.join(root,"visual-finishing.css")).size<=perf.maxFileBytes["visual-finishing.css"]);
  assert.ok(html.includes('href="interface-fixed.css?v=1"'));
  assert.ok(html.includes('id="workspace-evidence-brief"'));
});
