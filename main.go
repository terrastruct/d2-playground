package main

import (
	"fmt"
	"net"
	"net/http"
	"os"
	"os/exec"
	"os/signal"
	"runtime"
	"sync/atomic"
	"syscall"
	"time"

	"github.com/charmbracelet/lipgloss"
	"github.com/charmbracelet/log"
	"github.com/evanw/esbuild/pkg/api"
)

var (
	port string
	jsErrors atomic.Int32
	cssErrors atomic.Int32
)

var (
	logger = log.New(os.Stderr)
	
	headerStyle = lipgloss.NewStyle().
		Bold(true).
		Foreground(lipgloss.Color("#7D56F4")).
		PaddingTop(1).
		PaddingBottom(1)
	
	urlStyle = lipgloss.NewStyle().
		Bold(true).
		Foreground(lipgloss.Color("#00E396")).
		Underline(true)
	
	successStyle = lipgloss.NewStyle().
		Foreground(lipgloss.Color("#00E396"))
	
	errorStyle = lipgloss.NewStyle().
		Foreground(lipgloss.Color("#FF6B6B")).
		Bold(true)
	
	boxStyle = lipgloss.NewStyle().
		Border(lipgloss.RoundedBorder()).
		BorderForeground(lipgloss.Color("#7D56F4")).
		Padding(1, 2)
)

func getAvailablePort() string {
	preferredPort := 9090
	for p := preferredPort; p < preferredPort+100; p++ {
		listener, err := net.Listen("tcp", fmt.Sprintf(":%d", p))
		if err == nil {
			listener.Close()
			if p != preferredPort {
				logger.Info("Port 9090 was occupied", "using", p)
			}
			return fmt.Sprintf("%d", p)
		}
	}
	logger.Fatal("Could not find an available port")
	return ""
}

func clearTerminal() {
	if runtime.GOOS == "windows" {
		cmd := exec.Command("cmd", "/c", "cls")
		cmd.Stdout = os.Stdout
		cmd.Run()
	} else {
		fmt.Print("\033[H\033[2J")
	}
}

func main() {
	clearTerminal()
	
	logger.SetReportCaller(false)
	logger.SetLevel(log.DebugLevel)
	
	header := headerStyle.Render("🚀 D2 Playground Dev Server")
	fmt.Println(header)
	
	port = getAvailablePort()
	
	logger.Info("Building JavaScript bundle...")
	result := api.Build(api.BuildOptions{
		EntryPoints: []string{"./src/js/main.js"},
		Outfile:     "./src/build/out.js",
		Bundle:      true,
		Loader: map[string]api.Loader{
			".js":  api.LoaderJSX,
			".ttf": api.LoaderBase64,
		},
		Write:  true,
		Define: map[string]string{"ENV": "\"DEV\""},
		Watch: &api.WatchMode{
			OnRebuild: func(result api.BuildResult) {
				if len(result.Errors) > 0 {
					jsErrors.Store(int32(len(result.Errors)))
					logger.Error("JS build failed", "errors", len(result.Errors))
					for _, err := range result.Errors {
						logger.Error(err.Text, "file", err.Location.File, "line", err.Location.Line)
					}
					updateTitle()
				} else {
					jsErrors.Store(0)
					logger.Info("✨ JS recompiled", "time", time.Now().Format("15:04:05"))
					updateTitle()
				}
			},
		},
	})

	if len(result.Errors) > 0 {
		logger.Fatal("JS build failed", "errors", result.Errors)
	}
	logger.Info(successStyle.Render("✓ JavaScript bundle ready"))

	logger.Info("Building CSS bundle...")
	result = api.Build(api.BuildOptions{
		EntryPoints: []string{"./src/css/main.css"},
		Outfile:     "./src/build/style.css",
		Loader: map[string]api.Loader{
			".svg": api.LoaderBase64,
			".ttf": api.LoaderBase64,
		},
		Bundle: true,
		Write:  true,
		Watch: &api.WatchMode{
			OnRebuild: func(result api.BuildResult) {
				if len(result.Errors) > 0 {
					cssErrors.Store(int32(len(result.Errors)))
					logger.Error("CSS build failed", "errors", len(result.Errors))
					for _, err := range result.Errors {
						logger.Error(err.Text, "file", err.Location.File, "line", err.Location.Line)
					}
					updateTitle()
				} else {
					cssErrors.Store(0)
					logger.Info("✨ CSS recompiled", "time", time.Now().Format("15:04:05"))
					updateTitle()
				}
			},
		},
	})

	if len(result.Errors) > 0 {
		logger.Fatal("CSS build failed", "errors", result.Errors)
	}
	logger.Info(successStyle.Render("✓ CSS bundle ready"))

	url := fmt.Sprintf("http://localhost:%s", port)
	
	shortcutsStyle := lipgloss.NewStyle().
		Foreground(lipgloss.Color("#888")).
		Italic(true)
	
	info := boxStyle.Render(fmt.Sprintf(
		"Server running at %s\n\n"+
		"Watching for file changes...\n\n"+
		"%s",
		urlStyle.Render(url),
		shortcutsStyle.Render("Press Ctrl+C to stop"),
	))
	fmt.Println("\n" + info)
	
	go serve()
	
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)
	
	<-sigChan
	
	fmt.Println("\n" + headerStyle.Render("👋 Shutting down gracefully..."))
	os.Exit(0)
}

func serve() {
	handler := loggingMiddleware(http.FileServer(http.Dir("src")))
	err := http.ListenAndServe(fmt.Sprintf(":%s", port), handler)
	if err != nil {
		logger.Fatal("Failed to start server", "error", err)
	}
}

func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		wrapped := &responseWriter{ResponseWriter: w, statusCode: http.StatusOK}
		next.ServeHTTP(wrapped, r)
		
		duration := time.Since(start)
		
		logger.Debug(
			"Request",
			"method", r.Method,
			"path", r.URL.Path,
			"status", wrapped.statusCode,
			"duration", fmt.Sprintf("%dms", duration.Milliseconds()),
		)
	})
}

type responseWriter struct {
	http.ResponseWriter
	statusCode int
}

func (rw *responseWriter) WriteHeader(code int) {
	rw.statusCode = code
	rw.ResponseWriter.WriteHeader(code)
}

func updateTitle() {
	totalErrors := jsErrors.Load() + cssErrors.Load()
	if totalErrors > 0 {
		fmt.Printf("\033]0;❌ (%d) D2 Playground\007", totalErrors)
	} else {
		fmt.Printf("\033]0;✅ D2 Playground\007")
	}
}