package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"os"
	"time"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
)

func withCORS(handler http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		handler(w, r)
	}
}

type TerminateResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message,omitempty"`
	Pod     string `json:"pod,omitempty"`
}

type StatusResponse struct {
	Middleware string `json:"middleware"`
	K8s        string `json:"k8s"`
	Message    string `json:"message"`
	RunningPods int   `json:"runningPods,omitempty"`
}

func statusHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	response := StatusResponse{
		Middleware: "ok",
		K8s:        "error",
		Message:    "Initializing K8s connection...",
	}

	config, err := loadK8sConfig()
	if err != nil {
		response.K8s = "error"
		response.Message = fmt.Sprintf("Failed to load kubeconfig: %v", err)
		json.NewEncoder(w).Encode(response)
		return
	}

	clientset, err := kubernetes.NewForConfig(config)
	if err != nil {
		response.K8s = "error"
		response.Message = fmt.Sprintf("Failed to create K8s client: %v", err)
		json.NewEncoder(w).Encode(response)
		return
	}

	pods, err := clientset.CoreV1().Pods("").List(context.Background(), metav1.ListOptions{})
	if err != nil {
		response.K8s = "error"
		response.Message = fmt.Sprintf("Failed to list pods: %v", err)
		json.NewEncoder(w).Encode(response)
		return
	}

	runningPods := 0
	excludedNamespaces := map[string]bool{
		"kube-system": true,
	}

	for _, pod := range pods.Items {
		if excludedNamespaces[pod.Namespace] {
			continue
		}
		if pod.Status.Phase == "Running" {
			runningPods++
		}
	}

	response.K8s = "ok"
	response.Message = "Connected to Kubernetes cluster"
	response.RunningPods = runningPods
	json.NewEncoder(w).Encode(response)
}

func terminatePodHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodDelete {
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(TerminateResponse{
			Success: false,
			Message: "Method not allowed",
		})
		return
	}

	config, err := loadK8sConfig()
	if err != nil {
		log.Printf("Error loading K8s config: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(TerminateResponse{
			Success: false,
			Message: "Failed to load Kubernetes config",
		})
		return
	}

	clientset, err := kubernetes.NewForConfig(config)
	if err != nil {
		log.Printf("Error creating K8s client: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(TerminateResponse{
			Success: false,
			Message: "Failed to create Kubernetes client",
		})
		return
	}

	pods, err := clientset.CoreV1().Pods("").List(context.Background(), metav1.ListOptions{})
	if err != nil {
		log.Printf("Error listing pods: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(TerminateResponse{
			Success: false,
			Message: "Failed to list pods",
		})
		return
	}

	var runningPods []metav1.Object
	excludedNamespaces := map[string]bool{
		"kube-system": true,
	}

	for _, pod := range pods.Items {
		if excludedNamespaces[pod.Namespace] {
			continue
		}
		if pod.Status.Phase == "Running" {
			podCopy := pod
			runningPods = append(runningPods, &podCopy)
		}
	}

	if len(runningPods) == 0 {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(TerminateResponse{
			Success: false,
			Message: "No running pods found",
		})
		return
	}

	rand.Seed(time.Now().UnixNano())
	selectedPod := runningPods[rand.Intn(len(runningPods))]

	deletePropagation := metav1.DeletePropagationBackground
	err = clientset.CoreV1().Pods(selectedPod.GetNamespace()).Delete(
		context.Background(),
		selectedPod.GetName(),
		metav1.DeleteOptions{
			PropagationPolicy: &deletePropagation,
		},
	)

	if err != nil {
		log.Printf("Error deleting pod %s/%s: %v", selectedPod.GetNamespace(), selectedPod.GetName(), err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(TerminateResponse{
			Success: false,
			Message: "Failed to delete pod",
		})
		return
	}

	log.Printf("Terminated pod: %s/%s", selectedPod.GetNamespace(), selectedPod.GetName())
	json.NewEncoder(w).Encode(TerminateResponse{
		Success: true,
		Pod:     selectedPod.GetName(),
	})
}

func loadK8sConfig() (*rest.Config, error) {
	kubeconfig := os.Getenv("KUBECONFIG")
	if kubeconfig == "" {
		home, _ := os.UserHomeDir()
		kubeconfig = home + "/.kube/config"
	}

	config, err := clientcmd.BuildConfigFromFlags("", kubeconfig)
	if err != nil {
		return nil, err
	}

	return config, nil
}

func main() {
	rand.Seed(time.Now().UnixNano())

	http.HandleFunc("/status", withCORS(statusHandler))
	http.HandleFunc("/api/v1/pod/terminate", withCORS(terminatePodHandler))

	port := os.Getenv("PORT")
	if port == "" {
		port = "3001"
	}

	log.Printf("K8s Middleware listening on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
