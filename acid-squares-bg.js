/**
 * YASLOGIST Threat Radar — AcidSquares Background Shader
 * Native Vanilla JS ES Module using OGL (https://cdn.jsdelivr.net/npm/ogl@0.0.116/+esm)
 * With zero-build resilient WebGL 2 fallback for 100% offline & local server portability
 * Optimized for Apple Silicon (M1 Pro) & multi-threaded GPUs
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
precision highp float;

uniform vec2 iResolution;
uniform float iTime;
uniform float uSpeed;
uniform float uWaveDepth;
uniform float uZoom;
uniform float uDensity;
uniform float uSpread;
uniform float uStepSize;
uniform float uGlow;
uniform float uExposure;
uniform float uColorShift;
uniform float uContrast;
uniform float uBrightness;
uniform float uOpacity;
uniform float uSteps;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform vec2 uMouse;
uniform float uMouseStrength;
uniform float uMouseRadius;
uniform float uEnableMouse;
uniform float uMouseActive;
uniform float uGrain;
uniform float uGrainIntensity;
uniform float uLightMode;

out vec4 fragColor;

void main() {
    vec2 frag = gl_FragCoord.xy;
    float zoom = max(uZoom, 0.05);
    float aspect = iResolution.x / iResolution.y;
    vec2 ndc = (2.0 * frag - iResolution.xy) / iResolution.y;
    vec2 dir = ndc * (0.5 / zoom);

    vec2 mouseNdc = vec2(uMouse.x * aspect, uMouse.y);
    float mr = max(uMouseRadius, 0.01);
    vec2 md = ndc - mouseNdc;
    float dent = exp(-dot(md, md) / (mr * mr)) * (3.0 * uMouseStrength * uEnableMouse * uMouseActive);

    float travel = sin(iTime * uSpeed) * uWaveDepth;
    float density = max(uDensity, 1.0);
    float spread = clamp(uSpread, 0.05, 0.6);
    float stepSize = max(uStepSize, 0.0005);
    float glowGain = max(uGlow, 0.0);

    vec3 tOffset = vec3(0.0, dent, travel);
    vec3 p = vec3(0.0);
    float s = 0.0;
    float glow = 0.0;

    for (int i = 0; i < 64; i++) {
        if (float(i) >= uSteps) break;
        p += vec3(dir * s, s);
        vec3 q = p + tOffset;
        s += density - length(q.xz) + length(ceil(q).xy);
        s = stepSize + abs(s) * spread;
        glow += glowGain / s;
    }

    float e = glow / max(uExposure, 1.0);
    float shimmer = 0.5 + 0.5 * dot(cos(iTime * uColorShift + p), vec3(0.3333));
    float v = tanh(e * uBrightness * mix(0.7, 1.05, shimmer));
    v = clamp((v - 0.5) * uContrast + 0.5, 0.0, 1.0);

    // Color gradient mapping: YASLOGIST Gold -> Tactical Amber -> Crimson Peak
    vec3 col = mix(uColor1, uColor2, smoothstep(0.0, 0.55, v));
    col = mix(col, uColor3, smoothstep(0.55, 1.0, v));
    col *= v;

    float a = clamp(v, 0.0, 1.0) * uOpacity;

    // Grain texture for tactical HUD depth
    if (uGrain > 0.5) {
        float gv = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233)) + iTime) * 43758.5453) - 0.5) * uGrainIntensity;
        col = clamp(col + gv, 0.0, 1.0);
        a = clamp(a + gv, 0.0, 1.0);
    }

    // Base obsidian background (#07090e)
    vec3 bgObsidian = vec3(0.027, 0.035, 0.055);
    vec3 finalRgb = mix(bgObsidian, col, a);

    fragColor = vec4(finalRgb, 1.0);
}
`;

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
            steps: 32,             // detail: medium (32 steps)
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

            // Attempt OGL ES Module from CDN, with native WebGL2 fallback
            let useOGL = false;
            try {
                const oglModule = await import('https://cdn.jsdelivr.net/npm/ogl@0.0.116/+esm');
                if (oglModule && oglModule.Renderer && oglModule.Program) {
                    this.initOGL(oglModule);
                    useOGL = true;
                }
            } catch (cdnErr) {
                console.warn('[YASLOGIST] OGL CDN remote import unreachable, switching to native WebGL2 pipeline:', cdnErr.message || cdnErr);
            }

            if (!useOGL) {
                this.initNativeWebGL2();
            }

            this.bindEvents();
            this.onResize();
            this.start();
            console.log('[YASLOGIST] <AcidSquares /> Background Shader online (YASLOGIST Gold / Amber / Crimson).');
        } catch (err) {
            console.error('[YASLOGIST] WebGL Shader initialization failed:', err);
        }
    }

    initOGL(ogl) {
        const { Renderer, Program, Mesh, Triangle } = ogl;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        this.renderer = new Renderer({
            canvas: this.canvas,
            webgl: 2,
            alpha: false,
            antialias: false,
            dpr: dpr
        });

        this.gl = this.renderer.gl;
        const c1 = hexToRgb(this.options.color1);
        const c2 = hexToRgb(this.options.color2);
        const c3 = hexToRgb(this.options.color3);

        const geometry = new Triangle(this.gl);
        this.program = new Program(this.gl, {
            vertex: vertexShaderSource,
            fragment: fragmentShaderSource,
            uniforms: {
                iTime: { value: 0 },
                iResolution: { value: new Float32Array([window.innerWidth, window.innerHeight]) },
                uSpeed: { value: this.options.speed },
                uWaveDepth: { value: this.options.waveDepth },
                uZoom: { value: this.options.zoom },
                uDensity: { value: this.options.density },
                uSpread: { value: this.options.spread },
                uStepSize: { value: this.options.stepSize },
                uGlow: { value: this.options.glow },
                uExposure: { value: this.options.exposure },
                uColorShift: { value: this.options.colorShift },
                uContrast: { value: this.options.contrast },
                uBrightness: { value: this.options.brightness },
                uOpacity: { value: this.options.opacity },
                uSteps: { value: this.options.steps },
                uColor1: { value: new Float32Array(c1) },
                uColor2: { value: new Float32Array(c2) },
                uColor3: { value: new Float32Array(c3) },
                uMouse: { value: new Float32Array([0, 0]) },
                uMouseStrength: { value: this.options.mouseStrength },
                uMouseRadius: { value: this.options.mouseRadius },
                uEnableMouse: { value: this.options.mouseInteraction ? 1.0 : 0.0 },
                uMouseActive: { value: 0.0 },
                uGrain: { value: this.options.grain },
                uGrainIntensity: { value: this.options.grainIntensity },
                uLightMode: { value: 0.0 }
            }
        });

        this.mesh = new Mesh(this.gl, { geometry, program: this.program });
        this.isOGL = true;
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

        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
            console.error('[YASLOGIST] Program link error:', gl.getProgramInfoLog(prog));
        }

        this.glProgram = prog;
        gl.useProgram(prog);

        // Fullscreen Triangle Geometry
        const quad = new Float32Array([-1, -1, 3, -1, -1, 3]);
        const vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);

        const posLoc = gl.getAttribLocation(prog, 'position');
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

        // Cache uniform locations
        this.uniformLocs = {};
        const uNames = [
            'iResolution', 'iTime', 'uSpeed', 'uWaveDepth', 'uZoom', 'uDensity',
            'uSpread', 'uStepSize', 'uGlow', 'uExposure', 'uColorShift', 'uContrast',
            'uBrightness', 'uOpacity', 'uSteps', 'uColor1', 'uColor2', 'uColor3',
            'uMouse', 'uMouseStrength', 'uMouseRadius', 'uEnableMouse', 'uMouseActive',
            'uGrain', 'uGrainIntensity', 'uLightMode'
        ];
        uNames.forEach(name => {
            this.uniformLocs[name] = gl.getUniformLocation(prog, name);
        });

        // Set static uniforms
        const c1 = hexToRgb(this.options.color1);
        const c2 = hexToRgb(this.options.color2);
        const c3 = hexToRgb(this.options.color3);

        gl.uniform1f(this.uniformLocs.uSpeed, this.options.speed);
        gl.uniform1f(this.uniformLocs.uWaveDepth, this.options.waveDepth);
        gl.uniform1f(this.uniformLocs.uZoom, this.options.zoom);
        gl.uniform1f(this.uniformLocs.uDensity, this.options.density);
        gl.uniform1f(this.uniformLocs.uSpread, this.options.spread);
        gl.uniform1f(this.uniformLocs.uStepSize, this.options.stepSize);
        gl.uniform1f(this.uniformLocs.uGlow, this.options.glow);
        gl.uniform1f(this.uniformLocs.uExposure, this.options.exposure);
        gl.uniform1f(this.uniformLocs.uColorShift, this.options.colorShift);
        gl.uniform1f(this.uniformLocs.uContrast, this.options.contrast);
        gl.uniform1f(this.uniformLocs.uBrightness, this.options.brightness);
        gl.uniform1f(this.uniformLocs.uOpacity, this.options.opacity);
        gl.uniform1f(this.uniformLocs.uSteps, this.options.steps);
        gl.uniform3fv(this.uniformLocs.uColor1, c1);
        gl.uniform3fv(this.uniformLocs.uColor2, c2);
        gl.uniform3fv(this.uniformLocs.uColor3, c3);
        gl.uniform1f(this.uniformLocs.uMouseStrength, this.options.mouseStrength);
        gl.uniform1f(this.uniformLocs.uMouseRadius, this.options.mouseRadius);
        gl.uniform1f(this.uniformLocs.uEnableMouse, this.options.mouseInteraction ? 1.0 : 0.0);
        gl.uniform1f(this.uniformLocs.uGrain, this.options.grain);
        gl.uniform1f(this.uniformLocs.uGrainIntensity, this.options.grainIntensity);
        gl.uniform1f(this.uniformLocs.uLightMode, 0.0);
    }

    bindEvents() {
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
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
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

    start() {
        if (this.raf || !this.isPageVisible) return;
        this.startTime = performance.now();

        const loop = (t) => {
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
