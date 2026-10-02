/**
 * YASLOGIST spatial substrate.
 *
 * A single native WebGL2 fullscreen triangle draws a restrained analytical
 * grid behind the operations surface. The renderer is demand-driven: after
 * the pointer settles it submits no frames, so an idle dashboard consumes no
 * recurring GPU time. No textures, render targets, per-frame allocations, or
 * fragment loops are used.
 */

const vertexShaderSource = `#version 300 es
in vec2 position;
void main() {
    gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragmentShaderSource = `#version 300 es
precision mediump float;

uniform vec2 uResolution;
uniform vec2 uPointer;
uniform float uPointerActive;
uniform vec3 uAccent;
uniform vec3 uWarm;
uniform float uGrain;
out vec4 fragColor;

float hash12(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

float gridLine(vec2 p, float weight) {
    vec2 derivatives = max(fwidth(p), vec2(0.0002));
    vec2 cell = abs(fract(p - 0.5) - 0.5) / derivatives;
    return 1.0 - min(min(cell.x, cell.y) / weight, 1.0);
}

float contour(vec2 p, float radius, float width) {
    float distanceToRing = abs(length(p) - radius);
    return 1.0 - smoothstep(width * 0.25, width, distanceToRing);
}

float vectorRay(vec2 p, float angle, float width) {
    vec2 axis = vec2(cos(angle), sin(angle));
    float distanceToAxis = abs(dot(p, vec2(-axis.y, axis.x)));
    float extent = 1.0 - smoothstep(0.32, 0.72, abs(dot(p, axis)));
    return (1.0 - smoothstep(width * 0.25, width, distanceToAxis)) * extent;
}

void main() {
    vec2 pixel = gl_FragCoord.xy;
    vec2 plane = (pixel - 0.5 * uResolution) / uResolution.y;
    vec2 pointer = vec2(
        uPointer.x * 0.5 * uResolution.x / uResolution.y,
        uPointer.y * 0.5
    );

    // The substrate reads like a quiet operations chart: orthographic grid,
    // three evidence orbits, and a pointer-local parallax field. It is all
    // analytic geometry, so there are no textures or dynamic fragment loops.
    vec2 offset = plane - pointer;
    float focus = exp(-dot(offset, offset) * 2.6) * uPointerActive;
    vec2 field = plane + offset * focus * 0.018;

    float minorGrid = gridLine(field * 13.0, 0.72);
    float majorGrid = gridLine(field * 3.25, 0.82);
    float axisX = 1.0 - smoothstep(0.0, fwidth(field.x) * 1.2 + 0.0004, abs(field.x));
    float axisY = 1.0 - smoothstep(0.0, fwidth(field.y) * 1.2 + 0.0004, abs(field.y));

    float orbitOuter = contour(field, 0.43, 0.006);
    float orbitMiddle = contour(field, 0.29, 0.004);
    float orbitInner = contour(field, 0.145, 0.003);
    float vectorNorth = vectorRay(field, 1.5708, 0.0035);
    float vectorEast = vectorRay(field, 0.0, 0.0025);
    float vectorWest = vectorRay(field, 3.14159, 0.0025);
    float orbitEnergy = orbitOuter * 0.72 + orbitMiddle * 0.46 + orbitInner * 0.28;
    float rayEnergy = vectorNorth * 0.50 + vectorEast * 0.30 + vectorWest * 0.18;

    float vertical = clamp(plane.y * 0.34 + 0.5, 0.0, 1.0);
    vec3 color = mix(vec3(0.012, 0.023, 0.036), vec3(0.030, 0.052, 0.067), vertical);
    color += uAccent * minorGrid * 0.018;
    color += uAccent * majorGrid * 0.043;
    color += mix(uAccent, uWarm, 0.35) * (axisX + axisY) * 0.028;
    color += uAccent * orbitEnergy * 0.034;
    color += uWarm * rayEnergy * 0.024;

    // The cursor only reveals the local evidence field while it is active;
    // when idle the canvas is a single stable frame.
    float cursorRing = 1.0 - smoothstep(0.002, 0.010, abs(length(plane - pointer) - 0.145));
    float cursorHalo = exp(-dot(offset, offset) * 14.0);
    color += uAccent * (cursorRing * 0.055 + cursorHalo * 0.018) * focus;

    float vignette = 1.0 - smoothstep(0.62, 1.32, length(plane * vec2(0.76, 1.08)));
    color *= mix(0.66, 1.0, vignette);
    color += (hash12(pixel) - 0.5) * uGrain;

    fragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}
`;

const hexToRgb = (value, fallback) => {
    const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(String(value || ''));
    if (!match) return fallback;
    return [
        parseInt(match[1], 16) / 255,
        parseInt(match[2], 16) / 255,
        parseInt(match[3], 16) / 255
    ];
};

export class AcidSquaresBackground {
    constructor(options = {}) {
        this.options = Object.assign({
            accent: '#3FA6B3',
            warm: '#B99752',
            grainIntensity: 0.018,
            mouseInteraction: true,
            targetContainerId: 'acid-squares-bg'
        }, options);

        // Stable storage reused by every interaction frame.
        this.pointerTarget = [0, 0];
        this.pointerCurrent = [0, 0];
        this.pointerActive = 0;
        this.pointerActiveTarget = 0;
        this.raf = null;
        this.resizeQueued = false;
        this.destroyed = false;
        this.isPageVisible = !document.hidden;
        this.reducedMotion = typeof window.matchMedia === 'function'
            && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        this.init();
    }

    init() {
        try {
            this.container = document.getElementById(this.options.targetContainerId);
            if (!this.container) {
                this.container = document.createElement('div');
                this.container.id = this.options.targetContainerId;
                document.body.prepend(this.container);
            }

            this.canvas = document.createElement('canvas');
            this.canvas.setAttribute('aria-hidden', 'true');
            this.canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none';
            this.container.replaceChildren(this.canvas);

            this.initWebGL();
            if (!this.glProgram) return;
            this.bindEvents();
            this.applyViewport();
            this.renderFrame();
            this.container.dataset.renderer = 'demand';
        } catch (error) {
            console.warn('[YASLOGIST] Spatial substrate unavailable:', error);
            if (this.container) this.container.dataset.renderer = 'css-fallback';
        }
    }

    compileShader(type, source) {
        const gl = this.gl;
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
        const message = gl.getShaderInfoLog(shader) || 'Unknown shader compile error';
        gl.deleteShader(shader);
        throw new Error(message);
    }

    initWebGL() {
        const gl = this.canvas.getContext('webgl2', {
            alpha: false,
            antialias: false,
            depth: false,
            stencil: false,
            desynchronized: true,
            powerPreference: 'low-power',
            preserveDrawingBuffer: false
        });
        if (!gl) return;
        this.gl = gl;

        const vertexShader = this.compileShader(gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            const message = gl.getProgramInfoLog(program) || 'Unknown shader link error';
            gl.deleteProgram(program);
            throw new Error(message);
        }

        this.glProgram = program;
        this.vertexArray = gl.createVertexArray();
        this.vertexBuffer = gl.createBuffer();
        gl.bindVertexArray(this.vertexArray);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        const position = gl.getAttribLocation(program, 'position');
        gl.enableVertexAttribArray(position);
        gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

        this.uniforms = {
            resolution: gl.getUniformLocation(program, 'uResolution'),
            pointer: gl.getUniformLocation(program, 'uPointer'),
            pointerActive: gl.getUniformLocation(program, 'uPointerActive'),
            accent: gl.getUniformLocation(program, 'uAccent'),
            warm: gl.getUniformLocation(program, 'uWarm'),
            grain: gl.getUniformLocation(program, 'uGrain')
        };

        gl.useProgram(program);
        gl.uniform3fv(this.uniforms.accent, hexToRgb(this.options.accent, [0.247, 0.651, 0.702]));
        gl.uniform3fv(this.uniforms.warm, hexToRgb(this.options.warm, [0.725, 0.592, 0.322]));
        gl.uniform1f(this.uniforms.grain, this.options.grainIntensity);
        gl.disable(gl.BLEND);
        gl.disable(gl.DEPTH_TEST);
    }

    bindEvents() {
        this.handleContextLost = (event) => {
            event.preventDefault();
            this.stop();
            this.container.dataset.context = 'lost';
        };
        this.handleContextRestored = () => {
            if (this.destroyed) return;
            this.releaseGLResources();
            this.initWebGL();
            this.applyViewport();
            this.renderFrame();
            delete this.container.dataset.context;
        };
        this.handleResize = () => {
            this.resizeQueued = true;
            this.requestRender();
        };
        this.handlePointerMove = (event) => {
            if (this.reducedMotion || !this.options.mouseInteraction) return;
            this.pointerTarget[0] = (event.clientX / Math.max(window.innerWidth, 1) - 0.5) * 2;
            this.pointerTarget[1] = -(event.clientY / Math.max(window.innerHeight, 1) - 0.5) * 2;
            this.pointerActiveTarget = 1;
            this.requestRender();
        };
        this.handlePointerLeave = () => {
            this.pointerActiveTarget = 0;
            this.requestRender();
        };
        this.handleVisibility = () => {
            this.isPageVisible = !document.hidden;
            if (this.isPageVisible) this.requestRender();
            else this.stop();
        };

        this.canvas.addEventListener('webglcontextlost', this.handleContextLost, false);
        this.canvas.addEventListener('webglcontextrestored', this.handleContextRestored, false);
        window.addEventListener('resize', this.handleResize, { passive: true });
        window.addEventListener('pointermove', this.handlePointerMove, { passive: true });
        document.addEventListener('mouseleave', this.handlePointerLeave, { passive: true });
        document.addEventListener('visibilitychange', this.handleVisibility);
    }

    applyViewport() {
        if (!this.gl || !this.glProgram || !this.canvas) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const width = Math.max(1, Math.floor(window.innerWidth * dpr));
        const height = Math.max(1, Math.floor(window.innerHeight * dpr));
        if (this.canvas.width !== width || this.canvas.height !== height) {
            this.canvas.width = width;
            this.canvas.height = height;
        }
        this.gl.viewport(0, 0, width, height);
        this.gl.useProgram(this.glProgram);
        this.gl.uniform2f(this.uniforms.resolution, width, height);
        this.resizeQueued = false;
    }

    renderFrame() {
        const gl = this.gl;
        if (!gl || !this.glProgram || !this.isPageVisible) return;
        if (this.resizeQueued) this.applyViewport();
        gl.useProgram(this.glProgram);
        gl.bindVertexArray(this.vertexArray);
        gl.uniform2f(this.uniforms.pointer, this.pointerCurrent[0], this.pointerCurrent[1]);
        gl.uniform1f(this.uniforms.pointerActive, this.pointerActive);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    requestRender() {
        if (this.raf || this.destroyed || !this.isPageVisible) return;
        if (this.reducedMotion) {
            if (this.resizeQueued) this.applyViewport();
            this.renderFrame();
            return;
        }

        const loop = () => {
            const ease = 0.14;
            this.pointerCurrent[0] += (this.pointerTarget[0] - this.pointerCurrent[0]) * ease;
            this.pointerCurrent[1] += (this.pointerTarget[1] - this.pointerCurrent[1]) * ease;
            this.pointerActive += (this.pointerActiveTarget - this.pointerActive) * ease;
            this.renderFrame();

            const delta = Math.abs(this.pointerTarget[0] - this.pointerCurrent[0])
                + Math.abs(this.pointerTarget[1] - this.pointerCurrent[1])
                + Math.abs(this.pointerActiveTarget - this.pointerActive);
            if (delta > 0.0015 || this.resizeQueued) {
                this.raf = requestAnimationFrame(loop);
            } else {
                this.pointerCurrent[0] = this.pointerTarget[0];
                this.pointerCurrent[1] = this.pointerTarget[1];
                this.pointerActive = this.pointerActiveTarget;
                this.renderFrame();
                this.raf = null;
            }
        };
        this.raf = requestAnimationFrame(loop);
    }

    start() {
        this.requestRender();
    }

    stop() {
        if (this.raf) cancelAnimationFrame(this.raf);
        this.raf = null;
    }

    onResize() {
        this.handleResize?.();
    }

    renderStaticFrame() {
        this.renderFrame();
    }

    releaseGLResources() {
        const gl = this.gl;
        if (!gl) return;
        if (this.vertexBuffer) gl.deleteBuffer(this.vertexBuffer);
        if (this.vertexArray) gl.deleteVertexArray(this.vertexArray);
        if (this.glProgram) gl.deleteProgram(this.glProgram);
        this.vertexBuffer = null;
        this.vertexArray = null;
        this.glProgram = null;
        this.uniforms = null;
    }

    destroyGL() {
        this.releaseGLResources();
    }

    destroy() {
        if (this.destroyed) return;
        this.destroyed = true;
        this.stop();
        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('pointermove', this.handlePointerMove);
        document.removeEventListener('mouseleave', this.handlePointerLeave);
        document.removeEventListener('visibilitychange', this.handleVisibility);
        this.canvas?.removeEventListener('webglcontextlost', this.handleContextLost);
        this.canvas?.removeEventListener('webglcontextrestored', this.handleContextRestored);
        this.releaseGLResources();
        this.gl?.getExtension('WEBGL_lose_context')?.loseContext();
        this.gl = null;
        this.canvas?.remove();
        this.canvas = null;
    }
}

export function initAcidSquares(options) {
    return new AcidSquaresBackground(options);
}
