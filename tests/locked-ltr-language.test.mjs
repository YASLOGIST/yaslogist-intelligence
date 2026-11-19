import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    COMMAND_TEXT, paletteCopy, translateCommandLabels,
    applySupplementaryLabels, hasUntranslatedSource,
    evidenceBrief, mountEvidenceAction
} from '../lib/interface-language.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const html=read('index.html'),app=read('app.js'),css=read('interface-fixed.css'),sw=read('sw.js');
test('entire document remains LTR regardless of selected language',()=>{
    assert.match(html,/<html lang="en" dir="ltr">/);
    assert.match(app,/document\.documentElement\.setAttribute\('dir', 'ltr'\)/);
    assert.doesNotMatch(app,/setAttribute\('dir', isAr \? 'rtl'/);
    assert.match(css,/html\[lang="ar"\],body\{direction:ltr!important\}/);
    assert.ok(!css.includes('flex-direction:row-reverse'));
    assert.ok(!css.includes('direction:rtl!important'));
    for(const id of ['news-search','cve-search','actor-search']){
        assert.ok(html.includes('id="'+id+'" dir="auto"'),'logical text input direction '+id);
    }
});
test('menu labels are genuinely localized with identical actions, not changed menu order',()=>{
    assert.equal(COMMAND_TEXT.en.length,8);
    assert.equal(COMMAND_TEXT.ar.length,8);
    const actions=COMMAND_TEXT.en.map((name,i)=>[name,String(i),()=>i]);
    const translated=translateCommandLabels(actions,'ar');
    for(let i=0;i<8;i++){
        assert.equal(translated[i][1],actions[i][1]);
        assert.equal(translated[i][2],actions[i][2]);
        assert.notEqual(translated[i][0],actions[i][0]);
        assert.match(translated[i][0],/[\u0600-\u06FF]/);
    }
    assert.match(paletteCopy('ar').search, /ابحث/);
    assert.match(paletteCopy('ar').none, /لا توجد/);
    assert.equal(translateCommandLabels(actions,'en')[0][0],actions[0][0]);
});
test('Arabic source integrity notices include untranslated English summaries',()=>{
    assert.ok(hasUntranslatedSource('English report'));
    assert.ok(hasUntranslatedSource('عنوان عربي', 'English publisher abstract'));
    assert.ok(!hasUntranslatedSource('عنوان عربي','شرح عربي'));
    assert.ok(!hasUntranslatedSource(''));
});
test('evidence brief uses committed data and explicitly refuses invented incident truth',()=>{
    const a={
        pipelineMeta:{generatedAt:'2026-11-19T08:00:00Z'},
        allWireItems:[{id:1},{id:2}],cveData:[{id:1}],
        feedHealth:{ok:2,total:5}
    };
    const doc={querySelectorAll:s=>Array(s.includes('actors-grid')?3:1).fill({})};
    const english=evidenceBrief({app:a,tab:'cve-matrix',lang:'en',documentRef:doc});
    const arabic=evidenceBrief({app:a,tab:'cve-matrix',lang:'ar',documentRef:doc});
    assert.match(english,/Committed reports: 2/);
    assert.match(english,/Observed CVEs: 1/);
    assert.match(english,/2\/5/);
    assert.match(english,/not confirmation of an incident/);
    assert.match(arabic,/التقارير المحفوظة: 2/);
    assert.match(arabic,/ثغرات/);
    assert.match(arabic,/تحقق من المصدر الأولي/);
    assert.notEqual(english,arabic);
    const missing=evidenceBrief({});
    assert.match(missing,/Unavailable/);
});
test('new evidence action and versioned localized module are all offline cached',()=>{
    assert.ok(html.includes('id="workspace-evidence-brief"'));
    assert.ok(html.includes('id="workspace-evidence-label"'));
    assert.ok(sw.includes("'./lib/interface-language.js'"));
    assert.ok(sw.includes("'./interface-fixed.css?v=1'"));
    assert.ok(sw.includes("yaslogist-v17-shell"));
    assert.ok(sw.includes("app.js?v=25")&&sw.includes("sitewide-ui.js?v=3"));
    const sizes=JSON.parse(read('perf-budget.json'));
    for(const name of ['lib/interface-language.js','interface-fixed.css']){
        assert.ok(sizes.localSurface.includes(name),'performance accounting for '+name);
        assert.ok(fs.statSync(path.join(root,name)).size<=sizes.maxFileBytes[name]);
    }
});
