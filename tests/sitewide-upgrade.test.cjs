"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root,file),"utf8");
const html=read("index.html"),css=read("sitewide-upgrade.css"),sw=read("sw.js");
const panels=["dashboard","threat-map-view","intel-wire","cve-matrix","apt-dossiers"];

test("every original view keeps its exact existing panel and tab IDs",()=>{
    for(const id of panels) {
        assert.ok(html.includes('id="'+id+'"'),'missing '+id);
        assert.ok(html.includes('data-target="'+id+'"'),'missing tab '+id);
        assert.ok(css.includes('#'+id),'no sitewide visual enhancement for '+id);
    }
    for(const id of ['wire-status-rail','news-container','cve-table','actors-grid','threat-map','attackVectorChart','industryChart']){
        assert.ok(html.includes('id="'+id+'"'),'removed original feature: '+id);
    }
});

test("workspace is visible across every view but adds no nested dashboard or external service",()=>{
    for(const id of ['workspace-bar','workspace-index','workspace-name','workspace-density','workspace-copy-link','workspace-results']){
        assert.ok(html.includes('id="'+id+'"'),'missing workspace control '+id);
    }
    assert.ok(html.includes('role="region"'));
    assert.ok(html.includes('aria-pressed="false"'));
    assert.ok(html.includes('lang="ar"')&&html.includes('lang="en"'));
    assert.ok(css.includes('body[data-view-density="compact"]'));
    assert.ok(css.includes('prefers-reduced-motion'));
    assert.ok(!read("sitewide-ui.js").includes("fetch("),'sitewide controls must not call external services');
});

test("sitewide styling stays inside performance budget and PWA shell",()=>{
    const budget=JSON.parse(read("perf-budget.json"));
    for(const file of ['sitewide-upgrade.css','sitewide-ui.js']){
        assert.ok(budget.localSurface.includes(file),file+' missing from total budget');
        assert.ok(fs.statSync(path.join(root,file)).size<=budget.maxFileBytes[file],file+' breaches file budget');
        assert.ok(sw.includes("'./"+file+"?v=1'"),file+' not cached offline');
        assert.ok(html.includes(file+'?v=1'),file+' not loaded by page');
    }
    assert.ok(sw.includes('yaslogist-v15-shell'));
    assert.ok(sw.includes('currentNavigation'));
    assert.ok(sw.includes("'./lib/wire-visual-state.js'"));
});

test("reader retains single-column Intel Wire and improves other views instead of enlarging the wire masthead",()=>{
    assert.ok(css.includes('#intel-wire .wire-item'));
    assert.ok(!css.includes('grid-template-columns:repeat(2,minmax(0,1fr))'+'; /* wire */'));
    assert.match(css,/\#intel-wire \.card-header \{min-height:72px/);
    assert.match(css,/\#cve-matrix \.tactical-table tbody tr:nth-child\(2n\)/);
    assert.match(css,/\#apt-dossiers \.actor-dossier-card \{/);
    assert.match(css,/\#threat-map-view \.map-container-relative \{/);
    assert.match(css,/\#dashboard \.kpi-card \{/);
});

test("new UI has no cross-project links, invented incidents, or third-party scripts",()=>{
    const js=read("sitewide-ui.js");
    assert.ok(!/https?:\/\//.test(js));
    assert.ok(!/eval\s*\(|new Function\s*\(/.test(js));
    assert.ok(!/autoMerge|productionDeploy|verifiedIncident|shipmentDelay/.test(js));
    assert.ok(html.includes('rel="canonical" href="https://intelligence.yaslogist.com/"'));
});
