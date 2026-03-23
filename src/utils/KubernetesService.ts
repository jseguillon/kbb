export class KubernetesService {
  private static readonly API_URL = "http://localhost:3001/api/v1/pod/terminate";

  static async terminateRandomPod(): Promise<void> {
    console.log("K8s: Attempting pod termination");
    try {
      const response = await fetch(this.API_URL, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log(
          `K8s termination failed: ${errorData.message || response.statusText}`,
        );
        return;
      }

      const data = await response.json();
      if (data.success) {
        console.log(`Pod terminated: ${data.pod}`);
      }
    } catch (error) {
      console.log(`K8s termination error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
}
