export class KubernetesService {
  private static readonly API_URL = "http://localhost:3001/api/v1/pod/terminate";
  private static readonly STATUS_URL = "http://localhost:3001/status";
  private static readonly STATUS_CHECK_INTERVAL = 5000;
  private static lastStatusCheck: number = 0;
  private static status: {
    middleware: string;
    k8s: string;
    message: string;
    runningPods: number;
  } | null = null;
  private static readonly SIMULATE_POD_NAMES = [
    "frontend-abc123",
    "backend-xyz789",
    "worker-job456",
    "api-service-001",
    "cache-node-02",
    "db-primary-01",
    "monitoring-agent",
    "auth-service-03",
    "message-queue",
    "storage-bucket-01"
  ];

  static async checkStatus(): Promise<{
    middleware: string;
    k8s: string;
    message: string;
    runningPods: number;
  } | null> {
    const now = Date.now();
    
    if (now - this.lastStatusCheck < this.STATUS_CHECK_INTERVAL) {
      return this.status;
    }

    try {
      const response = await fetch(this.STATUS_URL);
      const data = await response.json();
      this.status = data;
      this.lastStatusCheck = now;
      return data;
    } catch (error) {
      this.status = {
        middleware: "error",
        k8s: "error",
        message: "Middleware not reachable",
        runningPods: 0,
      };
      this.lastStatusCheck = now;
      console.log(`Status check failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      return this.status;
    }
  }

  static getStatus(): {
    middleware: string;
    k8s: string;
    message: string;
    runningPods: number;
  } | null {
    return this.status;
  }

  static terminateRandomPod(callback: (podName: string) => void): void {
    const urlParams = new URLSearchParams(window.location.search);
    const simulate = urlParams.get("simulate") === "true";

    if (simulate) {
      const randomPod = this.SIMULATE_POD_NAMES[Math.floor(Math.random() * this.SIMULATE_POD_NAMES.length)];
      console.log(`[SIMULATE] Pod terminated: ${randomPod}`);
      callback(randomPod);
      return;
    }

    console.log("K8s: Attempting pod termination");
    fetch(this.API_URL, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          console.log(`K8s termination failed: ${response.statusText}`);
          return;
        }
        return response.json();
      })
      .then((data) => {
        if (data && data.success) {
          console.log(`Pod terminated: ${data.pod}`);
          callback(data.pod);
        }
      })
      .catch((error) => {
        console.log(`K8s termination error: ${error instanceof Error ? error.message : "Unknown error"}`);
      });
  }
}
