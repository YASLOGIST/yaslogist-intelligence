import test from 'node:test';
import assert from 'node:assert/strict';
import { TAB_IDS,UI_TEXT,activeWorkspace,resultCount,workspaceContext,VIEW_CONTEXT } from '../sitewide-ui.js';

test('five stable workspaces map one-to-one to existing navigation IDs',()=>{
    assert.deepEqual(TAB_IDS,['dashboard','threat-map-view','intel-wire','cve-matrix','apt-dossiers']);
    const tabs=TAB_IDS.map((id,i)=>({getAttribute:(k)=>k==='aria-selected'?(i===3?'true':'false'):id}));
    assert.equal(activeWorkspace(tabs),3);
    assert.equal(activeWorkspace([]),0);
});

test('operator-facing view controls have genuine Arabic and English labels',()=>{
    for(const name of ['comfortable','compact','copy','copied','unavailable','profiles','cves']){
        assert.ok(UI_TEXT.en[name] && UI_TEXT.ar[name],name);
    }
    assert.notEqual(UI_TEXT.en.compact,UI_TEXT.ar.compact);
});

test('CVE counter excludes only the existing empty-state row',()=>{
    const row=(empty=false)=>({querySelector:()=>empty?{}:null});
    const document={querySelectorAll:selector=>selector==='#cve-table tbody tr'?[row(),row(),row(true)]:[]};
    assert.deepEqual(resultCount('cve-matrix',document),{value:2,kind:'cves'});
});

test('APT counter counts displayed reference cards, not confirmed threat incidents',()=>{
    const document={querySelectorAll:selector=>selector==='#actors-grid .actor-dossier-card'?[{},{},{}]:[]};
    assert.deepEqual(resultCount('apt-dossiers',document),{value:3,kind:'profiles'});
    assert.equal(resultCount('dashboard',document),null);
    assert.equal(resultCount('intel-wire',document),null);
});

test('workspace captions follow the active view in both languages without asserting verified events',()=>{
    for(const id of TAB_IDS) {
        assert.equal(workspaceContext(id,'en'), VIEW_CONTEXT.en[id]);
        assert.equal(workspaceContext(id,'ar'), VIEW_CONTEXT.ar[id]);
        assert.notEqual(workspaceContext(id,'en'), workspaceContext(id,'ar'));
    }
    assert.match(workspaceContext('threat-map-view','en'), /not live positions/);
    assert.match(workspaceContext('apt-dossiers','en'), /not attribution/);
    assert.match(workspaceContext('dashboard','ar'), /ليست حوادث مؤكدة/);
    assert.equal(workspaceContext('invalid','en'), VIEW_CONTEXT.en.dashboard);
});
