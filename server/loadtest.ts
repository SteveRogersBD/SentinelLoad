import fs from 'fs';
import path from 'path';

// Simple logger
const logFile = path.resolve('server/debug.log');
const log = (msg: string) => {
    try {
        fs.appendFileSync(logFile, new Date().toISOString() + ': ' + msg + '\n');
    } catch (e) { console.error(e); }
}

interface TestConfig {
    targetUrl: string;
    httpMethod: string;
    headers: Record<string, string>;
    body?: string;
    startRps: number;
    maxRps: number;
    duration: number; // seconds
    workerCount: number;
    attackPattern?: string; // 'sustained' | 'ramp-up' | 'spike' | 'burst' | 'random'
    securityOptions?: {
        endpointScanning: boolean;
        bruteForce: boolean;
        randomHeaders: boolean;
        errorInducing: boolean;
    };
}

interface TestStats {
    isRunning: boolean;
    totalRequests: number;
    successRequests: number;
    failedRequests: number;
    currentRps: number;
    errors: Record<string, number>;
    startTime: number;
    elapsed: number;
    lastResponseCode?: number;
    recentLogs: string[];
}

export class LoadTestController {
    private isRunning = false;
    private stats: TestStats = this.getEmptyStats();
    private config: TestConfig | null = null;
    private rpsInterval: NodeJS.Timeout | null = null;
    private requestsThisSecond = 0;

    private getEmptyStats(): TestStats {
        return {
            isRunning: false,
            totalRequests: 0,
            successRequests: 0,
            failedRequests: 0,
            currentRps: 0,
            errors: {},
            startTime: 0,
            elapsed: 0,
            recentLogs: []
        };
    }

    getStatus(): TestStats {
        if (this.isRunning) {
            this.stats.elapsed = Math.floor((Date.now() - this.stats.startTime) / 1000);
            if (this.config && this.stats.elapsed >= this.config.duration) {
                this.stop();
            }
        }
        return this.stats;
    }

    start(config: TestConfig) {
        if (this.isRunning) this.stop();

        console.log('Starting simplified load test...', config);
        log('Starting simplified load test: ' + JSON.stringify(config));

        this.config = config;
        this.isRunning = true;
        this.stats = this.getEmptyStats();
        this.stats.isRunning = true;
        this.stats.startTime = Date.now();

        // RPS Monitor
        this.rpsInterval = setInterval(() => {
            this.stats.currentRps = this.requestsThisSecond;
            const msg = `[LoadTest] RPS: ${this.stats.currentRps} | Total: ${this.stats.totalRequests}`;
            console.log(msg);
            this.requestsThisSecond = 0;
        }, 1000);

        // Start Workers
        const workerCount = config.workerCount || 5;
        for (let i = 0; i < workerCount; i++) {
            this.runSimpleWorker(config, i);
        }
    }

    stop() {
        console.log('Stopping load test...');
        log('Stopping load test');
        this.isRunning = false;
        this.stats.isRunning = false;
        if (this.rpsInterval) clearInterval(this.rpsInterval);
    }

    private addLog(msg: string) {
        // Add to history
        this.stats.recentLogs.unshift(msg);

        if (this.stats.recentLogs.length > 2000) {
            this.stats.recentLogs.pop();
        }
    }

    private getTargetRps(config: TestConfig, elapsed: number): number {
        const { startRps, maxRps, duration, attackPattern } = config;

        switch (attackPattern) {
            case 'ramp-up':
                // Linearly increase from startRps to maxRps
                if (elapsed >= duration) return maxRps;
                const progress = elapsed / duration;
                return startRps + (maxRps - startRps) * progress;

            case 'spike':
                // Mostly low (startRps), but spike to maxRps every 10 seconds for 2 seconds
                const cycleTime = 10;
                const spikeDuration = 2;
                const inCycle = elapsed % cycleTime;
                if (inCycle < spikeDuration) {
                    return maxRps;
                }
                return startRps;

            case 'burst':
                // High/Low alternating every 5 seconds
                const burstCycle = 5;
                const isHigh = Math.floor(elapsed / burstCycle) % 2 === 0;
                return isHigh ? maxRps : startRps;

            case 'random':
                // Random value between startRps and maxRps
                return Math.floor(Math.random() * (maxRps - startRps + 1)) + startRps;

            case 'sustained':
            default:
                return maxRps;
        }
    }

    private applySecurityBehaviors(options: RequestInit, url: string, config: TestConfig): string {
        const sec = config.securityOptions;
        if (!sec) return url;

        // Random Headers
        if (sec.randomHeaders) {
            const userAgents = [
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
                'Mozilla/5.0 (Linux; Android 10; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.162 Mobile Safari/537.36',
                'PostmanRuntime/7.26.8'
            ];
            const randomAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
            options.headers = { ...options.headers, 'User-Agent': randomAgent };
        }

        // Error Inducing: Malformed Body or Bad Headers
        if (sec.errorInducing) {
            if (Math.random() > 0.8) {
                // 20% chance to send garbage
                options.body = "{ 'malformed': json "; // Invalid JSON
                options.headers = { ...options.headers, 'Content-Type': 'application/json' };
            }
        }

        // Endpoint Scanning
        if (sec.endpointScanning) {
            if (Math.random() > 0.7) {
                // 30% chance to hit a different path
                const paths = ['/admin', '/login', '/backup', '/config', '/.env', '/api/v1/users', '/server-status'];
                const randomPath = paths[Math.floor(Math.random() * paths.length)];

                // Simple URL parsing to append path
                try {
                    const u = new URL(url);
                    u.pathname = randomPath; // Replaces current path
                    return u.toString();
                } catch (e) {
                    return url + randomPath;
                }
            }
        }

        return url;
    }


    private async runSimpleWorker(config: TestConfig, workerId: number) {
        while (this.isRunning) {
            try {
                // Calculate current target RPS for THIS worker
                const elapsed = (Date.now() - this.stats.startTime) / 1000;
                const globalTargetRps = this.getTargetRps(config, elapsed);
                const workerTargetRps = globalTargetRps / (config.workerCount || 1);

                // Prepare options
                const options: RequestInit = {
                    method: config.httpMethod,
                    headers: config.headers || {},
                };

                if (config.httpMethod !== 'GET' && config.httpMethod !== 'HEAD' && config.body) {
                    options.body = config.body;
                }

                // Apply Security Behaviors
                let targetUrl = config.targetUrl;
                targetUrl = this.applySecurityBehaviors(options, targetUrl, config);

                // Brute Force Simulation (simple append if not scanning)
                if (config.securityOptions?.bruteForce && !config.securityOptions.endpointScanning) {
                    // Add a random query param to simulate cache busting or different credential tries
                    const separator = targetUrl.includes('?') ? '&' : '?';
                    targetUrl += `${separator}attempt=${Math.floor(Math.random() * 10000)}`;
                }


                // Execute Fetch
                const reqPromise = fetch(targetUrl, options)
                    .then(async res => {
                        this.stats.lastResponseCode = res.status;

                        // Try to get text preview for log
                        let body = '';
                        try {
                            const text = await res.clone().text();
                            body = text.substring(0, 50).replace(/\n/g, '') + (text.length > 50 ? '...' : '');
                        } catch { }

                        let pathOnly = config.targetUrl;
                        try {
                            const u = new URL(targetUrl);
                            pathOnly = u.pathname + u.search;
                        } catch { }

                        const userAgent = (options.headers as any)?.['User-Agent'];
                        let logMsg = '';

                        if (userAgent) {
                            // If Random Headers is active (or user manually set one), show it
                            logMsg = `[${new Date().toLocaleTimeString()}] ${res.status} ${config.httpMethod} ${pathOnly} [UA: ${userAgent}] -> ${body || '(no body)'}`;
                        } else {
                            // Clean output for normal tests
                            logMsg = `[${new Date().toLocaleTimeString()}] ${res.status} ${config.httpMethod} ${pathOnly} -> ${body || '(no body)'}`;
                        }
                        this.addLog(logMsg);

                        if (res.ok) {
                            this.stats.successRequests++;
                        } else {
                            this.stats.failedRequests++;
                        }
                    })
                    .catch(e => {
                        this.stats.failedRequests++;
                        const msg = e.message || 'Error';
                        this.addLog(`[Error] ${msg}`);
                        this.stats.errors[msg] = (this.stats.errors[msg] || 0) + 1;
                    });

                this.requestsThisSecond++;
                this.stats.totalRequests++;

                // Rate Limiting Sleep
                // Avoid divide by zero
                const safeRps = Math.max(0.1, workerTargetRps);
                const delay = 1000 / safeRps;

                if (delay > 0) {
                    await new Promise(r => setTimeout(r, delay));
                } else {
                    await new Promise(r => setTimeout(r, 0));
                }

            } catch (e) {
                console.error('Worker error:', e);
                await new Promise(r => setTimeout(r, 1000)); // Sleep on crash
            }
        }
    }
}
