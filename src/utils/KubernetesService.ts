export class KubernetesService {
  private static readonly API_URL = "http://localhost:3001/api/v1/pod/terminate";

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
