/**
 * YASLOGIST Threat Radar — AcidSquares Background Shader
 * Native WebGL2 ES module with a deterministic offline path.
 * Optimized for Apple Silicon (M1 Pro) and safe DPR scaling.
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
out vec4 fragColor;

// A bounded 3D lattice: one fullscreen triangle, fixed 24-step march.
// The fold keeps detail near the camera without unbounded ray distance.
float lattice(vec3 p) {
    vec3 cell = abs(fract(p) - 0.5);
    float edge = min(min(cell.x, cell.y), cell.z);
    float seam = 1.0 - smoothstep(0.015, 0.055, edge);
    float face = 1.0 - smoothstep(0.11, 0.48, max(cell.x, max(cell.y, cell.z)));
    return seam * 0.72 + face * 0.12;
}

void main() {
    vec2 uv = (2.0 * gl_FragCoord.xy - iResolution.xy) / iResolution.y;
    vec2 mouse = vec2(uMouse.x * iResolution.x / iResolution.y, uMouse.y);
    float focus = exp(-dot(uv - mouse, uv - mouse) / max(uMouseRadius * uMouseRadius, 0.02));
    uv += (uv - mouse) * focus * uMouseStrength * uEnableMouse * uMouseActive;

    float time = iTime * uSpeed;
    vec3 ray = normalize(vec3(uv / max(uZoom, 0.2), 1.15));
    float depth = 0.0;
    float glow = 0.0;
    float bands = 0.0;
    for (int i = 0; i < 24; i++) {
        float fi = float(i);
        vec3 p = ray * depth;
        p.z += time * 0.16;
        p.xy += vec2(sin(time * 0.18), cos(time * 0.14)) * 0.12;
        p *= max(uDensity * 0.085, 0.35);
        p += vec3(sin(fi * 1.7), cos(fi * 1.3), fi * 0.21);
        float field = lattice(p);
        float weight = 1.0 - fi / 27.0;
        glow += field * weight;
        bands += smoothstep(0.2, 0.9, field) * weight;
        depth += 0.045 + field * 0.018;
    }

    float value = clamp(glow * 0.22 + bands * 0.035, 0.0, 1.0);
    value = clamp((value - 0.35) * uContrast + 0.35, 0.0, 1.0) * uBrightness;
    vec3 col = mix(uColor1, uColor2, smoothstep(0.08, 0.62, value));
    col = mix(col, uColor3, smoothstep(0.58, 1.0, value));
    float grain = (fract(sin(dot(gl_FragCoord.xy + iTime, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * uGrainIntensity;
    col = clamp(col + grain, 0.0, 1.0);
    vec3 base = vec3(0.012, 0.021, 0.035);
    float alpha = clamp(value * uOpacity + bands * 0.025, 0.0, 1.0);
    fragColor = vec4(mix(base, col, alpha), 1.0);
}
`

export class AcidSquaresBackground {
    constructor(options = {}) {
        this.options = Object.assign({
            color1: '#EAB308',      // YASLOGIST Gold Core
            color2: '#D97706',      // Tactical Amber Midtone
            color3: '#EF4444',      // Tactical Crimson Alert Peak
            speed: 0.7,
            waveDepth: 1.0,
            zoom: 1.3,
            density: 10.0,
            glow: 1.0,
            exposure: 2700.0,
            spread: 0.3,
            stepSize: 0.002,
            grain: 1.0,
            grainIntensity: 0.05,
            steps: 24,             // retained for compatibility with saved configs
            opacity: 0.85,
            brightness: 1.0,
            contrast: 1.0,
            colorShift: 0.0,
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

        // Accessibility + adaptive performance budget.
        // Reduced-motion users get one rich static frame, never an animation.
        // Everyone else is protected by an FPS watchdog that steps the
        // raymarch quality down before it is allowed to jank the interface.
        this.reducedMotion = typeof window !== 'undefined'
            && typeof window.matchMedia === 'function'
            && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.quality = {
            dpr: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1,
            steps: this.options.steps,
            downgrades: 0
        };
        this.dprOverride = null;
        this.perf = { frames: 0, accum: 0, last: 0 };

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

            // Native WebGL2 is deliberately the primary path: one context, no
            // runtime CDN import, and a deterministic CSP/offline surface.
            this.initNativeWebGL2();

            this.bindEvents();
            this.onResize();
            this.start();
            console.log('[YASLOGIST] <AcidSquares /> Background Shader online (YASLOGIST Gold / Amber / Crimson).');
        } catch (err) {
            console.error('[YASLOGIST] WebGL Shader initialization failed:', err);
        }
    }

    initNativeWebGL2() {
        const gl = this.canvas.getContext('webgl2', {
            alpha: false,
            antialias: false,
            powerPreference: 'high-performance'
        });

        if (!gl) {
            console.error('[YASLOGIST] WebGL2 not supported on this device.');
            return;
        }

        this.gl = gl;
        this.isOGL = false;

        // Compile Shaders
        const compile = (type, src) => {
            const s = gl.createShader(type);
            gl.shaderSource(s, src);
            gl.compileShader(s);
            if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
                console.error('[YASLOGIST] Shader compile error:', gl.getShaderInfoLog(s));
            }
            return s;
        };

        const vs = compile(gl.VERTEX_SHADER, vertexShaderSource);
        const fs = compile(gl.FRAGMENT_SHADER, fragmentShaderSource);

        const prog = gl.createProgram();
        gl.attachShader(prog, vs);
        gl.attachShader(prog, fs);
        gl.linkProgram(prog);
        // Shader objects are no longer needed after linking; release them now.
        gl.deleteShader(vs);
        gl.deleteShader(fs);

        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
            console.error('[YASLOGIST] Program link error:', gl.getProgramInfoLog(prog));
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
            'iResolution', 'iTime', 'uSpeed', 'uZoom', 'uDensity', 'uContrast',
            'uBrightness', 'uOpacity', 'uColor1', 'uColor2', 'uColor3', 'uMouse',
            'uMouseStrength', 'uMouseRadius', 'uEnableMouse', 'uMouseActive',
            'uGrainIntensity'
        ];
        uNames.forEach(name => {
            this.uniformLocs[name] = gl.getUniformLocation(prog, name);
        });

        // Set static uniforms
        const c1 = hexToRgb(this.options.color1);
        const c2 = hexToRgb(this.options.color2);
        const c3 = hexToRgb(this.options.color3);

        gl.uniform1f(this.uniformLocs.uSpeed, this.options.speed);
        gl.uniform1f(this.uniformLocs.uZoom, this.options.zoom);
        gl.uniform1f(this.uniformLocs.uDensity, this.options.density);
        gl.uniform1f(this.uniformLocs.uContrast, this.options.contrast);
        gl.uniform1f(this.uniformLocs.uBrightness, this.options.brightness);
        gl.uniform1f(this.uniformLocs.uOpacity, this.options.opacity);
        gl.uniform3fv(this.uniformLocs.uColor1, c1);
        gl.uniform3fv(this.uniformLocs.uColor2, c2);
        gl.uniform3fv(this.uniformLocs.uColor3, c3);
        gl.uniform1f(this.uniformLocs.uMouseStrength, this.options.mouseStrength);
        gl.uniform1f(this.uniformLocs.uMouseRadius, this.options.mouseRadius);
        gl.uniform1f(this.uniformLocs.uEnableMouse, this.options.mouseInteraction ? 1.0 : 0.0);
        gl.uniform1f(this.uniformLocs.uGrainIntensity, this.options.grainIntensity);
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
            this.initNativeWebGL2();
            this.onResize();
            if (this.container) delete this.container.dataset.context;
            this.start();
        };
        this.canvas.addEventListener('webglcontextlost', this.handleContextLost, false);
        this.canvas.addEventListener('webglcontextrestored', this.handleContextRestored, false);
        this.handleResize = () => this.onResize();
        window.addEventListener('resize', this.handleResize, { passive: true });

        this.handlePointerMove = (e) => {
            const w = window.innerWidth || 1;
            const h = window.innerHeight || 1;
            const x = (e.clientX / w - 0.5) * 2.0;
            const y = -(e.clientY / h - 0.5) * 2.0;
            this.mouseTarget = [x, y];
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

    onResize() {
        if (!this.gl || !this.canvas) return;
        const dpr = this.dprOverride || Math.min(window.devicePixelRatio || 1, 2);
        const w = window.innerWidth;
        const h = window.innerHeight;

        if (this.isOGL && this.renderer) {
            this.renderer.setSize(w, h);
            const bw = this.gl.drawingBufferWidth;
            const bh = this.gl.drawingBufferHeight;
            this.program.uniforms.iResolution.value[0] = bw;
            this.program.uniforms.iResolution.value[1] = bh;
        } else {
            this.canvas.width = Math.floor(w * dpr);
            this.canvas.height = Math.floor(h * dpr);
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
            if (this.glProgram && this.uniformLocs.iResolution) {
                this.gl.useProgram(this.glProgram);
                this.gl.uniform2f(this.uniformLocs.iResolution, this.canvas.width, this.canvas.height);
            }
        }
    }

    /** Render exactly one frame — used for reduced-motion and degraded mode. */
    renderStaticFrame() {
        const elapsed = 42.0;
        if (this.isOGL && this.program && this.renderer) {
            this.program.uniforms.iTime.value = elapsed;
            this.renderer.render({ scene: this.mesh });
        } else if (this.gl && this.glProgram) {
            this.gl.useProgram(this.glProgram);
            this.gl.uniform1f(this.uniformLocs.iTime, elapsed);
            this.gl.drawArrays(this.gl.TRIANGLES, 0, 3);
        }
    }

    start() {
        if (this.raf || !this.isPageVisible) return;
        if (this.reducedMotion) {
            // Honor prefers-reduced-motion: rich static frame, zero animation.
            this.renderStaticFrame();
            return;
        }
        this.startTime = performance.now();
        this.perf = { frames: 0, accum: 0, last: 0 };

        const loop = (t) => {
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

            if (this.isOGL && this.program) {
                this.program.uniforms.iTime.value = elapsed;
                this.program.uniforms.uMouse.value[0] = this.mouseCurrent[0];
                this.program.uniforms.uMouse.value[1] = this.mouseCurrent[1];
                this.program.uniforms.uMouseActive.value = this.mouseActive;
                this.renderer.render({ scene: this.mesh });
            } else if (this.gl && this.glProgram) {
                this.gl.useProgram(this.glProgram);
                this.gl.uniform1f(this.uniformLocs.iTime, elapsed);
                this.gl.uniform2f(this.uniformLocs.uMouse, this.mouseCurrent[0], this.mouseCurrent[1]);
                this.gl.uniform1f(this.uniformLocs.uMouseActive, this.mouseActive);
                this.gl.drawArrays(this.gl.TRIANGLES, 0, 3);
            }

            this.raf = requestAnimationFrame(loop);
        };
        this.raf = requestAnimationFrame(loop);
    }

    /**
     * Adaptive quality ladder. DPR 2 -> 1.5 -> 1, then freeze to a
     * static frame. The shader itself uses a fixed bounded loop.
     */
    stepDownQuality() {
        const q = this.quality;
        if (q.dpr > 1.5) q.dpr = 1.5;
        else if (q.dpr > 1) q.dpr = 1;
        else { this.degradeToStatic(); return; }
        q.downgrades++;
        console.info(`[YASLOGIST] Shader auto-tuned for smoothness (dpr=${q.dpr}, steps=${q.steps}).`);
        this.applyQuality();
    }

    applyQuality() {
        this.dprOverride = this.quality.dpr < 2 ? this.quality.dpr : null;
        this.onResize();
    }

    degradeToStatic() {
        this.stop();
        this.renderStaticFrame();
        if (this.container) this.container.dataset.degraded = 'true';
        console.info('[YASLOGIST] Shader degraded to a static frame to protect frame rate on this device.');
    }

    destroyGL() {
        if (!this.gl) return;
        if (this.isOGL) return; // kept for backwards-compatible instances
        const gl = this.gl;
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
