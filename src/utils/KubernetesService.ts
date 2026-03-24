export class KubernetesService {
  private static readonly API_URL = "http://localhost:3001/api/v1/pod/terminate";
  private static readonly STATUS_URL = "http://localhost:3001/status";
  private static status: {
    middleware: string;
    k8s: string;
    message: string;
    runningPods: number;
  } | null = null;

  static async checkStatus(): Promise<{
    middleware: string;
    k8s: string;
    message: string;
    runningPods: number;
  } | null> {
    if (this.status) {
      return this.status;
    }

    try {
      const response = await fetch(this.STATUS_URL);
      const data = await response.json();
      this.status = data;
      return data;
    } catch (error) {
      this.status = {
        middleware: "error",
        k8s: "error",
        message: "Middleware not reachable",
        runningPods: 0,
      };
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
