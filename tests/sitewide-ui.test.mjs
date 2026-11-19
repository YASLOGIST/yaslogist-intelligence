import test from 'node:test';
import assert from 'node:assert/strict';
import { TAB_IDS,UI_TEXT,activeWorkspace,resultCount } from '../sitewide-ui.js';

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
