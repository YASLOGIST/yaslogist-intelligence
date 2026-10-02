/**
 * YASLOGIST Threat Radar — AcidSquares Background Shader (v2)
 * Native WebGL2 fullscreen-triangle pass. Zero runtime dependencies,
 * deterministic offline path, CSP-clean (no CDN script needed).
 *
 * v2 changes:
 *  - The `steps` quality option is real now: the march loop is bounded by a
 *    uSteps uniform instead of a hardcoded 24, so the adaptive ladder can
 *    trade raymarch depth for frame time WITHOUT recompiling the shader
 *    (avoids shader-program churn under load).
 *  - Adaptive ladder follows the documented doctrine in full:
 *    DPR 2 → 1.5 → 1, then steps 32 → 24 → 16 → 8, then a static frame.
 *  - The former DOM overlay stack (fullscreen `hud-container::before`
 *    diagonal data-lines, `body::before` atmosphere glows and the
 *    `body::after` CRT scanline texture — each a permanent fullscreen
 *    composited layer, one of them repainted every frame via
 *    background-position) is absorbed into this single GPU pass.
 *    Net effect: identical visual language, zero main-thread repaint cost,
 *    three fewer fullscreen layers.
 *  - Subtle vignette anchors the composition behind the glass panels.
 *  - Reduced-motion / degraded static frame re-renders on resize
 *    (previously the one-shot frame was stretched after viewport changes).
 */

// Utility: Convert Hex color to [r, g, b] in range 0..1
const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return [0.9176, 0.7020, 0.0314];
    return [
        parseInt(result[1], 16) / 255,
        parseInt(result[2], 16) / 255,
        parseInt(result[3], 16) / 255
    ];
};

const vertexShaderSource = `#version 300 es
in vec2 position;
void main() {
    gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragmentShaderSource = `#version 300 es
precision mediump float;

uniform vec2 iResolution;
uniform float iTime;
uniform float uSpeed;
uniform float uZoom;
uniform float uDensity;
uniform float uSteps;        // live march depth: 8..32 (quality ladder)
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform vec2 uMouse;
uniform float uMouseStrength;
uniform float uMouseRadius;
uniform float uEnableMouse;
uniform float uMouseActive;
uniform float uOpacity;
uniform float uContrast;
uniform float uBrightness;
uniform float uGrainIntensity;
uniform float uOverlay;      // 1 = scanlines + data-line weave + atmosphere
out vec4 fragColor;

const int MAX_STEPS = 32;

// A bounded 3D lattice: one fullscreen triangle, uniform-bounded march.
// The fold keeps detail near the camera without unbounded ray distance.
float lattice(vec3 p) {
    vec3 cell = abs(fract(p) - 0.5);
    float edge = min(min(cell.x, cell.y), cell.z);
    float seam = 1.0 - smoothstep(0.015, 0.055, edge);
    float face = 1.0 - smoothstep(0.11, 0.48, max(cell.x, max(cell.y, cell.z)));
    return seam * 0.72 + face * 0.12;
}

// Soft periodic line profile for the diagonal data-line weave.
// t is normalized distance to the nearest line (0 on the line, 0.5 midway).
float dataLine(float t) {
    float p = abs(t);
    float l = 1.0 - smoothstep(0.045, 0.115, p);
    // Peak emphasis near the line core; edges ascending (GLSL ES smoothstep
    // is undefined when edge0 >= edge1).
    float core = 1.0 - smoothstep(0.012, 0.10, p);
    return l * (0.05 + 0.10 * core);
}

void main() {
    vec2 px = gl_FragCoord.xy;
    vec2 uv0 = (2.0 * px - iResolution.xy) / iResolution.y;   // aspect-true, lens-free
    vec2 uv = uv0;
    vec2 mouse = vec2(uMouse.x * iResolution.x / iResolution.y, uMouse.y);
    vec2 lens = uv - mouse;
    float focus = exp(-dot(lens, lens) / max(uMouseRadius * uMouseRadius, 0.02));
    uv += lens * focus * uMouseStrength * uEnableMouse * uMouseActive;

    float time = iTime * uSpeed;
    vec3 ray = normalize(vec3(uv / max(uZoom, 0.2), 1.15));
    float depth = 0.0;
    float glow = 0.0;
    float bands = 0.0;
    int steps = clamp(int(uSteps + 0.5), 8, MAX_STEPS);
    // Weight normalizer keeps perceived luminance stable across the quality
    // ladder, so a downgrade dims detail instead of flashing darker.
    float norm = 1.0 / (float(steps) + 3.0);
    for (int i = 0; i < MAX_STEPS; i++) {
        if (i >= steps) break;
        float fi = float(i);
        vec3 p = ray * depth;
        p.z += time * 0.16;
        p.xy += vec2(sin(time * 0.18), cos(time * 0.14)) * 0.12;
        p *= max(uDensity * 0.085, 0.35);
        p += vec3(sin(fi * 1.7), cos(fi * 1.3), fi * 0.21);
        float field = lattice(p);
        float weight = 1.0 - fi * norm;
        glow += field * weight;
        bands += smoothstep(0.2, 0.9, field) * weight;
        depth += 0.045 + field * 0.018;
    }

    // Energy normalization: the accumulated march energy scales with step
    // count, so without compensation 32 steps (today's real tier) renders
    // ~30% hotter than the 24-step tuning baseline, flooding the frame in
    // crimson. Normalize to the 24-step energy budget (13.7778); the clamp
    // band is the exact tier range (32 -> 0.77, 8 -> 2.53), keeping every
    // ladder tier in the same exposure window (verified p50 0.196..0.217).
    float energy = glow * 0.22 + bands * 0.035;
    float wsum = float(steps) * (1.0 - float(steps - 1) / (2.0 * float(steps + 3)));
    float value = clamp(energy * clamp(13.7778 / wsum, 0.7, 2.6), 0.0, 1.0);
    value = clamp((value - 0.35) * uContrast + 0.35, 0.0, 1.0) * uBrightness;

    // Grade: cubic compressive curve — darks sink to the navy base, the gold
    // lattice holds the mids, crimson appears only at true alert peaks.
    float vs = value * value * value;
    vec3 col = mix(uColor1, uColor2, smoothstep(0.08, 0.62, vs));
    col = mix(col, uColor3, smoothstep(0.58, 1.0, vs));
    vec3 base = vec3(0.012, 0.021, 0.035);
    float alpha = clamp(vs * uOpacity * 0.9 + bands * 0.015, 0.0, 1.0);
    col = mix(base, col, alpha);

    if (uOverlay > 0.5) {
        // Atmosphere glows (absorbed body::before; cyan / gold / violet)
        vec2 c1 = vec2(-0.85 * iResolution.x / iResolution.y * 0.62, 0.0);
        vec2 c2 = vec2( 0.85 * iResolution.x / iResolution.y * 0.74, 0.35);
        vec2 c3 = vec2(0.0, -0.62);
        col += vec3(0.024, 0.710, 0.831) * 0.085 * exp(-dot(uv0 - c1, uv0 - c1) * 2.2);
        col += vec3(0.918, 0.702, 0.031) * 0.080 * exp(-dot(uv0 - c2, uv0 - c2) * 2.2);
        col += vec3(0.659, 0.333, 0.969) * 0.080 * exp(-dot(uv0 - c3, uv0 - c3) * 2.2);

        // Diagonal data-line weave (absorbed hud-container::before neon-sweep).
        // Two drift phases keep the composition alive; period is viewport-
        // scaled so roughly one line of each family is on screen at a time.
        float aspect = iResolution.x / iResolution.y;
        float period = max(aspect, 1.0) * 1.35;
        float driftA = fract(iTime / 15.0) * period;
        float driftB = fract(iTime / 15.0 + 0.5) * period;
        float axis1 = (uv0.x + uv0.y) * 0.7071;
        float axis2 = (uv0.x - uv0.y) * 0.7071;
        col += vec3(0.024, 0.710, 0.831) * dataLine(fract((axis1 - driftA) / period + 0.5) - 0.5);
        col += vec3(0.659, 0.333, 0.969) * dataLine(fract((axis2 + driftB) / period + 0.5) - 0.5);
        col += vec3(0.918, 0.702, 0.031) * dataLine(fract((uv0.x + driftA * 0.6) / period + 0.5) - 0.5) * 0.6;

        // CRT scanline texture (absorbed body::after): 4px horizontal
        // stripe + 6px vertical channel fringe, at the original ~0.3 layer
        // opacity baked into the constants.
        float damp = 0.033 * step(0.5, fract(px.y * 0.25));
        col *= 1.0 - damp;
        float ch = mod(px.x, 6.0);
        col.r += ch < 2.0 ? 0.010 : 0.0;
        col.g += (ch >= 2.0 && ch < 4.0) ? 0.004 : 0.0;
        col.b += ch >= 4.0 ? 0.010 : 0.0;
    }

    // Vignette (computed on the undistorted plane so the mouse lens never
    // drags the frame edges). smoothstep edges are kept ascending — the
    // inverted-edge form is undefined behavior in GLSL ES.
    float vig = 1.0 - smoothstep(0.8, 2.35, length(uv0 * vec2(0.92, 1.18)));
    col *= mix(0.74, 1.0, vig);

    // Animated grain: dithers the dark gradient and breaks banding.
    float grain = (fract(sin(dot(px + iTime, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * uGrainIntensity;
    col = clamp(col + grain, 0.0, 1.0);
    fragColor = vec4(col, 1.0);
}
`;

export class AcidSquaresBackground {
    constructor(options = {}) {
        this.options = Object.assign({
            color1: '#EAB308',      // YASLOGIST Gold Core
            color2: '#D97706',      // Tactical Amber Midtone
            color3: '#EF4444',      // Tactical Crimson Alert Peak
            speed: 0.7,
            zoom: 1.3,
            density: 10.0,
            grainIntensity: 0.05,
            steps: 32,
            opacity: 0.85,
            brightness: 1.0,
            contrast: 1.0,
            overlay: true,
            mouseInteraction: true,
            mouseStrength: 0.15,
            mouseRadius: 0.35,
            targetContainerId: 'acid-squares-bg'
        }, options);

        this.mouseTarget = [0, 0];
        this.mouseCurrent = [0, 0];
        this.mouseActive = 0;
        this.mouseActiveTarget = 0;
        this.raf = null;
        this.isPageVisible = !document.hidden;
        this.degraded = false;

        // Accessibility + adaptive performance budget.
        // Reduced-motion users get one rich static frame, never an animation.
        // Everyone else is protected by an FPS watchdog that steps the
        // raymarch quality down before it is allowed to jank the interface.
        this.reducedMotion = typeof window !== 'undefined'
            && typeof window.matchMedia === 'function'
            && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Quality ladder (documented doctrine):
        //   DPR 2 → 1.5 → 1, then steps 32 → 24 → 16 → 8, then static.
        // DPR entries that the device cannot reach are skipped, so a native-1
        // display runs straight through the steps ladder.
        const deviceDpr = typeof window !== 'undefined'
            ? Math.min(window.devicePixelRatio || 1, 2) : 1;
        const requestedSteps = Math.max(8, Math.min(32, this.options.steps | 0));
        const ladder = [];
        ladder.push({ dpr: deviceDpr, steps: requestedSteps });
        if (deviceDpr > 1.5) ladder.push({ dpr: 1.5, steps: requestedSteps });
        if (deviceDpr > 1) ladder.push({ dpr: 1.0, steps: requestedSteps });
        const floorDpr = ladder[ladder.length - 1].dpr;
        for (const s of [24, 16, 8]) {
            ladder.push({ dpr: floorDpr, steps: Math.min(s, requestedSteps) });
        }
        // Drop consecutive duplicates (e.g. requestedSteps=16 makes 24→16 a no-op)
        this.ladder = ladder.filter((t, i) => i === 0 || t.dpr !== ladder[i - 1].dpr || t.steps !== ladder[i - 1].steps);
        this.tier = 0;
        this.perf = { frames: 0, accum: 0, last: 0 };
        this.pendingResize = false;

        this.init();
    }

    async init() {
        try {
            let container = document.getElementById(this.options.targetContainerId);
            if (!container) {
                container = document.createElement('div');
                container.id = this.options.targetContainerId;
                document.body.prepend(container);
            }
            this.container = container;

            // Ensure container is styled properly: fixed, behind UI, non-blocking
            this.container.style.cssText = `
                position: fixed;
                inset: 0;
                width: 100vw;
                height: 100vh;
                z-index: -1;
                pointer-events: none;
                overflow: hidden;
                background: transparent;
            `;

            // Create Canvas
            this.canvas = document.createElement('canvas');
            this.canvas.style.cssText = `
                position: absolute;
                inset: 0;
                width: 100%;
                height: 100%;
                display: block;
                pointer-events: none;
            `;
            this.container.innerHTML = '';
            this.container.appendChild(this.canvas);

            // Native WebGL2 is deliberately the only path: one context, no
            // runtime CDN import, and a deterministic CSP/offline surface.
            this.initWebGL();

            this.bindEvents();
            this.applyViewport();
            this.start();
            console.log('[YASLOGIST] AcidSquares v2 shader online (Gold Core / Amber / Crimson).');
        } catch (err) {
            console.error('[YASLOGIST] WebGL Shader initialization failed:', err);
        }
    }

    initWebGL() {
        const gl = this.canvas.getContext('webgl2', {
            alpha: false,
            antialias: false,
            desynchronized: true,          // hint: present the frame with minimal latency
            powerPreference: 'high-performance'
        });

        if (!gl) {
            console.error('[YASLOGIST] WebGL2 not supported on this device.');
            return;
        }

        this.gl = gl;

        // Compile Shaders
        const compile = (type, src) => {
            const s = gl.createShader(type);
            gl.shaderSource(s, src);
            gl.compileShader(s);
            if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
                console.error('[YASLOGIST] Shader compile error:', gl.getShaderInfoLog(s));
                gl.deleteShader(s);
                return null;
            }
            return s;
        };

        const vs = compile(gl.VERTEX_SHADER, vertexShaderSource);
        const fs = compile(gl.FRAGMENT_SHADER, fragmentShaderSource);

        const prog = gl.createProgram();
        if (vs && fs) {
            gl.attachShader(prog, vs);
            gl.attachShader(prog, fs);
            gl.linkProgram(prog);
        }
        if (vs) gl.deleteShader(vs);
        if (fs) gl.deleteShader(fs);

        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
            console.error('[YASLOGIST] Program link error:', gl.getProgramInfoLog(prog));
            gl.deleteProgram(prog);
            this.glProgram = null;
            return;
        }

        this.glProgram = prog;
        gl.useProgram(prog);

        // Fullscreen Triangle Geometry
        const quad = new Float32Array([-1, -1, 3, -1, -1, 3]);
        const vbo = gl.createBuffer();
        this.vertexBuffer = vbo;
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);

        const posLoc = gl.getAttribLocation(prog, 'position');
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

        // Cache uniform locations
        this.uniformLocs = {};
        const uNames = [
            'iResolution', 'iTime', 'uSpeed', 'uZoom', 'uDensity', 'uSteps',
            'uContrast', 'uBrightness', 'uOpacity', 'uColor1', 'uColor2',
            'uColor3', 'uMouse', 'uMouseStrength', 'uMouseRadius',
            'uEnableMouse', 'uMouseActive', 'uGrainIntensity', 'uOverlay'
        ];
        uNames.forEach(name => {
            this.uniformLocs[name] = gl.getUniformLocation(prog, name);
        });

        // Set static uniforms
        gl.uniform1f(this.uniformLocs.uSpeed, this.options.speed);
        gl.uniform1f(this.uniformLocs.uZoom, this.options.zoom);
        gl.uniform1f(this.uniformLocs.uDensity, this.options.density);
        gl.uniform1f(this.uniformLocs.uSteps, this.ladder[this.tier].steps);
        gl.uniform1f(this.uniformLocs.uContrast, this.options.contrast);
        gl.uniform1f(this.uniformLocs.uBrightness, this.options.brightness);
        gl.uniform1f(this.uniformLocs.uOpacity, this.options.opacity);
        gl.uniform3fv(this.uniformLocs.uColor1, hexToRgb(this.options.color1));
        gl.uniform3fv(this.uniformLocs.uColor2, hexToRgb(this.options.color2));
        gl.uniform3fv(this.uniformLocs.uColor3, hexToRgb(this.options.color3));
        gl.uniform1f(this.uniformLocs.uMouseStrength, this.options.mouseStrength);
        gl.uniform1f(this.uniformLocs.uMouseRadius, this.options.mouseRadius);
        gl.uniform1f(this.uniformLocs.uEnableMouse, this.options.mouseInteraction ? 1.0 : 0.0);
        gl.uniform1f(this.uniformLocs.uGrainIntensity, this.options.grainIntensity);
        gl.uniform1f(this.uniformLocs.uOverlay, this.options.overlay ? 1.0 : 0.0);
    }

    bindEvents() {
        this.handleContextLost = (event) => {
            event.preventDefault();
            this.stop();
            if (this.container) this.container.dataset.context = 'lost';
        };
        this.handleContextRestored = () => {
            if (!this.canvas || !this.isPageVisible) return;
            this.destroyGL();
            this.initWebGL();
            this.applyViewport();
            if (this.container) delete this.container.dataset.context;
            this.start();
            if (this.reducedMotion || this.degraded) this.renderStaticFrame();
        };
        if (this.canvas) {
            this.canvas.addEventListener('webglcontextlost', this.handleContextLost, false);
            this.canvas.addEventListener('webglcontextrestored', this.handleContextRestored, false);
        }
        this.handleResize = () => {
            // Coalesce bursts (mobile URL-bar collapse, pinch zoom) into the
            // next animation frame; static frames re-render immediately.
            if (this.degraded || this.reducedMotion || !this.raf) {
                this.applyViewport();
                if (this.degraded || this.reducedMotion) this.renderStaticFrame();
                return;
            }
            this.pendingResize = true;
        };
        window.addEventListener('resize', this.handleResize, { passive: true });

        this.handlePointerMove = (e) => {
            const w = window.innerWidth || 1;
            const h = window.innerHeight || 1;
            const x = (e.clientX / w - 0.5) * 2.0;
            const y = -(e.clientY / h - 0.5) * 2.0;
            this.mouseTarget[0] = x;
            this.mouseTarget[1] = y;
            this.mouseActiveTarget = 1.0;
        };
        window.addEventListener('pointermove', this.handlePointerMove, { passive: true });

        this.handlePointerLeave = () => {
            this.mouseActiveTarget = 0.0;
        };
        window.addEventListener('mouseleave', this.handlePointerLeave, { passive: true });

        this.handleVisibility = () => {
            this.isPageVisible = !document.hidden;
            if (this.isPageVisible) {
                this.start();
            } else {
                this.stop();
            }
        };
        document.addEventListener('visibilitychange', this.handleVisibility);
    }

    /** Apply the current DPR tier to the canvas backing store. */
    applyViewport() {
        if (!this.gl || !this.canvas || !this.glProgram) return;
        const dpr = this.ladder[this.tier].dpr;
        const w = window.innerWidth;
        const h = window.innerHeight;
        const bw = Math.max(1, Math.floor(w * dpr));
        const bh = Math.max(1, Math.floor(h * dpr));
        // Skip the backing-store realloc when unchanged — but a freshly (re)
        // linked program after context loss still needs iResolution uploaded.
        if (this.canvas.width !== bw || this.canvas.height !== bh) {
            this.canvas.width = bw;
            this.canvas.height = bh;
            this.gl.viewport(0, 0, bw, bh);
        }
        this.gl.useProgram(this.glProgram);
        this.gl.uniform2f(this.uniformLocs.iResolution, bw, bh);
    }

    onResize() {
        // Backwards-compatible hook (same behavior as the resize listener).
        this.handleResize();
    }

    /** Render exactly one frame — used for reduced-motion and degraded mode. */
    renderStaticFrame() {
        const gl = this.gl;
        if (!gl || !this.glProgram) return;
        gl.useProgram(this.glProgram);
        gl.uniform1f(this.uniformLocs.iTime, 42.0);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    start() {
        if (this.raf || !this.isPageVisible || this.degraded) return;
        if (this.reducedMotion) {
            // Honor prefers-reduced-motion: rich static frame, zero animation.
            this.renderStaticFrame();
            return;
        }
        this.startTime = performance.now();
        this.perf = { frames: 0, accum: 0, last: 0 };

        const loop = (t) => {
            if (this.pendingResize) {
                this.pendingResize = false;
                this.applyViewport();
            }

            // FPS watchdog: rolling 90-frame average frame time.
            const delta = this.perf.last ? t - this.perf.last : 16.7;
            this.perf.last = t;
            this.perf.accum += delta;
            this.perf.frames++;
            if (this.perf.frames >= 90) {
                const avg = this.perf.accum / this.perf.frames;
                if (avg > 21) this.stepDownQuality(); // below ~48fps budget
                this.perf.frames = 0;
                this.perf.accum = 0;
            }

            const elapsed = (t - this.startTime) * 0.001;

            // Smooth pointer damping
            this.mouseCurrent[0] += 0.05 * (this.mouseTarget[0] - this.mouseCurrent[0]);
            this.mouseCurrent[1] += 0.05 * (this.mouseTarget[1] - this.mouseCurrent[1]);
            this.mouseActive += 0.05 * (this.mouseActiveTarget - this.mouseActive);

            const gl = this.gl;
            if (gl && this.glProgram) {
                gl.useProgram(this.glProgram);
                gl.uniform1f(this.uniformLocs.iTime, elapsed);
                gl.uniform2f(this.uniformLocs.uMouse, this.mouseCurrent[0], this.mouseCurrent[1]);
                gl.uniform1f(this.uniformLocs.uMouseActive, this.mouseActive);
                gl.drawArrays(gl.TRIANGLES, 0, 3);
            }

            this.raf = requestAnimationFrame(loop);
        };
        this.raf = requestAnimationFrame(loop);
    }

    /**
     * Adaptive quality ladder. DPR 2 → 1.5 → 1, then steps 32 → 24 → 16 → 8,
     * then a static frame. Downgrades-only: no oscillation between tiers.
     */
    stepDownQuality() {
        const next = this.tier + 1;
        if (next >= this.ladder.length) {
            this.degradeToStatic();
            return;
        }
        this.tier = next;
        const q = this.ladder[this.tier];
        console.info(`[YASLOGIST] Shader auto-tuned for smoothness (dpr=${q.dpr}, steps=${q.steps}).`);
        if (this.gl && this.glProgram && this.uniformLocs.uSteps) {
            this.gl.useProgram(this.glProgram);
            this.gl.uniform1f(this.uniformLocs.uSteps, q.steps);
        }
        if (this.container) this.container.dataset.quality = `${q.dpr}x/${q.steps}`;
        this.applyViewport();
    }

    degradeToStatic() {
        this.degraded = true;
        this.stop();
        this.renderStaticFrame();
        if (this.container) this.container.dataset.degraded = 'true';
        console.info('[YASLOGIST] Shader degraded to a static frame to protect frame rate on this device.');
    }

    destroyGL() {
        const gl = this.gl;
        if (!gl) return;
        if (this.glProgram) gl.deleteProgram(this.glProgram);
        if (this.vertexBuffer) gl.deleteBuffer(this.vertexBuffer);
        this.glProgram = null;
        this.vertexBuffer = null;
    }

    /** Release the context-facing resources and every global listener. */
    destroy() {
        this.stop();
        if (this.handleResize) window.removeEventListener('resize', this.handleResize);
        if (this.handlePointerMove) window.removeEventListener('pointermove', this.handlePointerMove);
        if (this.handlePointerLeave) window.removeEventListener('mouseleave', this.handlePointerLeave);
        if (this.handleVisibility) document.removeEventListener('visibilitychange', this.handleVisibility);
        if (this.canvas) {
            this.canvas.removeEventListener('webglcontextlost', this.handleContextLost);
            this.canvas.removeEventListener('webglcontextrestored', this.handleContextRestored);
        }
        this.destroyGL();
        this.gl = null;
        this.canvas?.remove();
        this.canvas = null;
    }

    stop() {
        if (this.raf) {
            cancelAnimationFrame(this.raf);
            this.raf = null;
        }
    }
}

export function initAcidSquares(options) {
    return new AcidSquaresBackground(options);
}
