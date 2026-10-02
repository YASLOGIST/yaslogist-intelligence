'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');

test('WebGL substrate is loop-free, demand-driven, and DPR-bounded', () => {
    const source = read('acid-squares-bg.js');
    const fragment = source.match(/const fragmentShaderSource = `([\s\S]*?)`;/)?.[1] || '';
    assert.ok(fragment.includes('gridLine'), 'analytical grid shader missing');
    assert.doesNotMatch(fragment, /\bfor\s*\(/, 'fragment shader must not raymarch');
    assert.doesNotMatch(fragment, /\bwhile\s*\(/, 'fragment shader must use no dynamic loops');
    assert.equal((source.match(/gl\.drawArrays\(/g) || []).length, 1, 'one draw path only');
    assert.doesNotMatch(source, /setInterval\s*\(/, 'renderer must have no recurring timer');
    assert.match(source, /Math\.min\(window\.devicePixelRatio \|\| 1, 2\)/);
    assert.match(source, /delta > 0\.0015[\s\S]*this\.raf = null/);
});

test('WebGL and map resources have deterministic disposal paths', () => {
    const shader = read('acid-squares-bg.js');
    for (const release of ['deleteBuffer', 'deleteVertexArray', 'deleteProgram', 'loseContext', 'cancelAnimationFrame']) {
        assert.ok(shader.includes(release), `missing GPU lifecycle operation: ${release}`);
    }

    const map = read('threat-map.js');
    assert.match(map, /preferCanvas:\s*true/);
    assert.match(map, /collapsed:\s*true/);
    assert.match(map, /this\.observedLayer = L\.layerGroup\(\)\.addTo\(this\.map\)/);
    assert.match(map, /this\.referenceRoutesLayer = L\.layerGroup\(\)\.addTo\(this\.map\)/);
    assert.match(map, /REFERENCE CONTEXT/);
    assert.match(map, /not represent live vessel, cable, incident, or threat-condition telemetry/);
    assert.doesNotMatch(map, /Simulated AIS/);
    assert.match(map, /destroy\(\)[\s\S]*this\.map\.off\(\)[\s\S]*this\.map\.remove\(\)/);
});

test('app teardown releases timers, charts, observers, map, and shader', () => {
    const app = read('app.js');
    const destroy = app.match(/\/\*\* Deterministic teardown[\s\S]*?\n    }\n}/)?.[0] || '';
    for (const operation of [
        'this.lifecycle?.abort()',
        'clearInterval(this.clockTimer)',
        'clearInterval(this.telemetryTimer)',
        'this.revealObserver?.disconnect()',
        'this.charts.vectors?.destroy?.()',
        'this.threatMap?.destroy?.()',
        'this.acidSquares?.destroy?.()'
    ]) {
        assert.ok(destroy.includes(operation), `app teardown missing: ${operation}`);
    }
});
