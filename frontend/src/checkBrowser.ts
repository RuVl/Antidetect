// noinspection JSDeprecatedSymbols

function isNative(fn: Function) {
    return /\{\s*\[native code]\s*}/.test(Function.prototype.toString.call(fn));
}

async function sha256(message: string) {
    const enc = new TextEncoder();
    const data = enc.encode(message);

    const hash = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hash));

    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function checkBrowser(): Promise<{
    isWebDriver: boolean;
    score: number;
    reasons: string[];
    fingerprint: string;
    details: Record<string, any>;
}> {
    let score = 0;
    const reasons: string[] = [];
    const details: Record<string, string> = {};

    // basic
    try {
        details.userAgent = navigator.userAgent;
        details.platform = navigator.platform;
        details.vendor = navigator.vendor;
        details.webdriver = String(navigator.webdriver);
        if (navigator.webdriver) {
            score += 100;
            reasons.push('navigator.webdriver==true');
        }
    } catch (e) {
        details.navError = String(e);
    }

    // property checks (cdc_, webdriver flags)
    try {
        const windowKeys = Object.getOwnPropertyNames(window);
        details.windowKeysSample = String(windowKeys.slice(0, 200));

        const cdcMatch = windowKeys.some(k => /cdc_/.test(k));  // ChromeDriver artifact
        if (cdcMatch) {
            score += 100;
            reasons.push('window contains cdc_ property (chromedriver artifact)');
        }
        details.hasCdc = String(cdcMatch);

        // flags
        const suspiciousGlobals = ['__webdriver', '_driver', '_phantom', 'callPhantom', '__nightmare'];
        const foundSuspicious = suspiciousGlobals.filter(g => (window as any)[g] !== undefined);
        if (foundSuspicious.length) reasons.push('suspicious global props: ' + foundSuspicious.join(', '));
        details.suspiciousGlobals = JSON.stringify(foundSuspicious);
    } catch (e) {
        details.windowKeysError = String(e);
    }

    // plugins, mimeTypes, languages
    try {
        details.pluginsLength = String(navigator.plugins?.length ?? '');
        details.mimeTypesLength = String(navigator.mimeTypes?.length ?? '');
        details.languages = JSON.stringify(navigator.languages);

        if (!navigator.languages?.length) {
            score += 70;
            reasons.push('navigator.languages missing or empty');
        }
        if (navigator.plugins?.length === 0) {
            score += 65;
            reasons.push('no navigator.plugins');
        }
    } catch (e) {
        details.pluginsError = String(e);
    }

    // window.chrome
    try {
        details.hasWindowChrome = String(!!(window as any).chrome);
        if (!details.hasWindowChrome && /Chrome|Chromium/.test(navigator.userAgent)) {
            score += 70;
            reasons.push('window.chrome missing while user agent is Chrome');
        }
    } catch (e) {
        details.chromeError = String(e);
    }

    // webgl vendor and renderer fingerprint (headless or virtual GPUs)
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl');
        if (gl) {
            const dbg = gl.getExtension('WEBGL_debug_renderer_info');
            if (dbg) {
                const vendor = gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL);
                const renderer = gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL);

                details.webglVendor = String(vendor ?? '');
                details.webglRenderer = String(renderer ?? '');

                if (/SwiftShader|llvmpipe|software|VirtualBox|VMware|ANGLE/.test(`${renderer} ${vendor}`)) {
                    score += 20;
                    reasons.push(`webgl renderer looks like software or virtual: ${renderer}, ${vendor}`);
                }
            } else details.webglDebugInfo = 'unavailable';
        } else details.webgl = 'unavailable';
    } catch (e) {
        details.webglError = String(e);
    }

    // Canvas fingerprint
    try {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 64;

        const ctx = canvas.getContext('2d')!;
        ctx.textBaseline = 'top';
        ctx.font = "14px 'Arial'";
        ctx.fillStyle = '#f60';
        ctx.fillRect(0, 0, 256, 64);
        ctx.fillStyle = '#069';
        ctx.fillText('fingerprint' + navigator.userAgent, 2, 2);
        ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
        ctx.fillText('😍☺︎ッ西', 4, 18);

        const canvasData = canvas.toDataURL();
        details.canvasHashSample = canvasData.slice(0, 255) ?? '';
    } catch (e) {
        details.canvasError = String(e);
        score += 45;
        reasons.push(`canvas drawing failed: ${e}`);
    }

    // MediaDevices
    try {
        if (navigator.mediaDevices) {
            const devices = await navigator.mediaDevices.enumerateDevices();
            details.mediaDevicesCount = String(devices.length);
            if (devices.length === 0) reasons.push('no media devices enumerated');
        } else details.mediaDevices = 'missing';
    } catch (e) {
        details.mediaDevicesError = String(e);
        score += 45;
        reasons.push(`mediaDevices.enumerateDevices failed: ${e}`);
    }

    // timezone, memory
    try {
        details.screen = JSON.stringify({
            width: screen.width,
            height: screen.height,
            colorDepth: screen.colorDepth,
            pixelDepth: screen.pixelDepth,
        });

        details.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (!details.timezone) {
            score += 65;
            reasons.push('timezone missing');
        }

        details.deviceMemory = String((navigator as any).deviceMemory ?? '');
        details.hardwareConcurrency = String(navigator.hardwareConcurrency);
    } catch (e) {
        details.miscError = String(e);
    }

    // check non-native code
    try {
        const exceptionFunctions = new Set(['createFileRoute', 'createLazyFileRoute']);  // ours
        const checkObjects = [window, Document.prototype, navigator];
        const nonNativeFunctions: string[] = [];

        for (const o of checkObjects) {
            const nonNative = Object.getOwnPropertyNames(o)
                .filter((p) => !exceptionFunctions.has(p))
                .map((p) => {
                    const descriptor = Object.getOwnPropertyDescriptor(o, p) ||
                        Object.getOwnPropertyDescriptor(Object.getPrototypeOf(o), p);
                    if (!descriptor || typeof descriptor.value !== 'function') {
                        return { obj: o, param: p, fn: undefined };
                    }
                    return { obj: o, param: p, fn: descriptor.value }
                })
                .filter(({ fn }) => !!fn && !isNative(fn))
                .map(({ obj, param }) => `${obj}.${param} is not native!`);
            nonNativeFunctions.push(...nonNative);
        }

        if (nonNativeFunctions.length) {
            score += 40 * nonNativeFunctions.length;
            reasons.push('some built-in functions appear non-native');
            details.nonNativeFns = nonNativeFunctions.join(',');
        }
    } catch (e) {
        details.toStringError = String(e);
    }

    // calc fingerprint
    const fpParts = Object.values(details)
        .map((s) => String(s).replace(/\s+/g, ' '))
        .join('|');

    const fingerprint = await sha256(fpParts);
    const isWebDriver = score > 75;

    return {
        isWebDriver,
        score,
        reasons,
        fingerprint,
        details,
    };
}