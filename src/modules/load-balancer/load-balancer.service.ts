// src/load-balancer/load-balancer.service.ts
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

interface ServerInstance {
  url: string;
  port: number;
  activeRequests: number;
  totalRequests: number;
  lastResponseTime: number;
  isHealthy: boolean;
  name: string;
}

@Injectable()
export class LoadBalancerService {
  private readonly logger = new Logger(LoadBalancerService.name);
  private servers: ServerInstance[] = [];
  private readonly mainServerPort: number;
  private isEnabled = false;

  constructor() {
    this.mainServerPort = parseInt(process.env.PORT || '3000');
    this.initializeServers();

    setInterval(() => this.healthCheck(), 10000);
  }

  private initializeServers() {
    const workerPorts = process.env.WORKER_PORTS?.split(',') || [];

    if (workerPorts.length === 0) {
      this.logger.warn('No worker servers configured. Load balancer disabled.');
      this.isEnabled = false;
      return;
    }

    this.servers = workerPorts.map((port, index) => ({
      url: `http://localhost:${port.trim()}`,
      port: parseInt(port.trim()),
      activeRequests: 0,
      totalRequests: 0,
      lastResponseTime: 0,
      isHealthy: false, 
      name: `Worker-${port.trim()}`,
    }));

    this.isEnabled = true;
    this.logger.log(
      `✅ Load Balancer enabled with ${this.servers.length} workers`,
    );
    this.servers.forEach((s) =>
      this.logger.log(`   - ${s.name} on port ${s.port}`),
    );
  }

  isLoadBalancerEnabled(): boolean {
    return this.isEnabled && this.servers.some((s) => s.isHealthy);
  }

  private rrIndex = 0;

  getLeastLoadedServer(): ServerInstance | null {
    const healthy = this.servers.filter((s) => s.isHealthy);
    if (!healthy.length) return null;

    const minLoad = Math.min(...healthy.map((s) => s.activeRequests));
    const candidates = healthy.filter((s) => s.activeRequests === minLoad);

    const server = candidates[this.rrIndex % candidates.length];
    this.rrIndex++;

    return server;
  }

  async forwardRequest(
    method: string,
    path: string,
    body?: any,
    headers?: Record<string, any>,
  ): Promise<{
    data: any;
    status: number;
    serverPort: number;
    serverName: string;
  }> {
    const server = this.getLeastLoadedServer();

    if (!server) {
      throw new Error('No healthy worker servers available');
    }

    const startTime = Date.now();
    server.activeRequests++;
    server.totalRequests++;

    try {
      this.logger.debug(`📤 Forwarding ${method} ${path} to ${server.name}`);

      const response = await axios({
        method,
        url: `${server.url}${path}`,
        data: body,
        headers: {
          ...headers,
          'x-forwarded-from': `main-server:${this.mainServerPort}`,
          'x-forwarded-to': server.name,
          host: undefined,
          connection: undefined,
          'content-length': undefined,
        },
        timeout: 30000,
        validateStatus: () => true,
      });

      server.lastResponseTime = Date.now() - startTime;

      this.logger.log(
        `✅ ${method} ${path} -> ${server.name}:${server.port} [${response.status}] (${server.lastResponseTime}ms)`,
      );

      return {
        data: response.data,
        status: response.status,
        serverPort: server.port,
        serverName: server.name,
      };
    } catch (error) {
      this.logger.error(
        `❌ Error forwarding to ${server.name}: ${error.message}`,
      );
      server.isHealthy = false;
      throw error;
    } finally {
      server.activeRequests--;
    }
  }

  async healthCheck() {
    if (!this.isEnabled) return;

    const checks = this.servers.map(async (server) => {
      try {
        const response = await axios.get(`${server.url}/api/health`, {
          timeout: 3000,
          validateStatus: (status) => status === 200,
        });

        if (!server.isHealthy) {
          this.logger.log(`✅ ${server.name} is now online`);
        }
        server.isHealthy = true;
      } catch (error) {
        if (server.isHealthy) {
          this.logger.warn(`⚠️ ${server.name} is down - ${error.message}`);
        }
        server.isHealthy = false;
      }
    });

    await Promise.allSettled(checks);
  }

  getStatus() {
    return {
      enabled: this.isEnabled,
      mainServer: {
        port: this.mainServerPort,
        role: 'Load Balancer',
      },
      workers: this.servers.map((s) => ({
        name: s.name,
        port: s.port,
        url: s.url,
        healthy: s.isHealthy,
        activeRequests: s.activeRequests,
        totalRequests: s.totalRequests,
        avgResponseTime: s.lastResponseTime,
      })),
      stats: {
        totalWorkers: this.servers.length,
        healthyWorkers: this.servers.filter((s) => s.isHealthy).length,
        totalRequests: this.servers.reduce(
          (sum, s) => sum + s.totalRequests,
          0,
        ),
        activeRequests: this.servers.reduce(
          (sum, s) => sum + s.activeRequests,
          0,
        ),
      },
    };
  }
}
