package main

import (
	"fmt"
	"net"
	"net/http"
	"os"

	"github.com/davecgh/go-spew/spew"
	"github.com/evanw/esbuild/pkg/api"
)

var port string

func getAvailablePort() string {
	preferredPort := 9090
	for p := preferredPort; p < preferredPort+100; p++ {
		listener, err := net.Listen("tcp", fmt.Sprintf(":%d", p))
		if err == nil {
			listener.Close()
			return fmt.Sprintf("%d", p)
		}
	}
	panic("Could not find an available port")
}

func main() {
	port = getAvailablePort()
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
					fmt.Printf("js watch build failed: %v", len(result.Errors))
					spew.Dump(result.Errors)
				} else {
					spew.Dump("recompiled js...")
				}
			},
		},
	})

	if len(result.Errors) > 0 {
		spew.Dump(result.Errors)
		os.Exit(1)
	}

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
					fmt.Printf("css watch build failed: %d errors\n", len(result.Errors))
					spew.Dump(result.Errors)
				} else {
					spew.Dump("recompiled css...")
				}
			},
		},
	})

	if len(result.Errors) > 0 {
		spew.Dump(result.Errors)
		os.Exit(1)
	}

	fmt.Printf("watching on localhost:%s...\n", port)
	go serve()

	// Returning from main() exits immediately in Go.
	// Block forever so we keep watching and don't exit.
	<-make(chan bool)
}

func serve() {
	err := http.ListenAndServe(fmt.Sprintf(":%s", port), http.FileServer(http.Dir("src")))
	if err != nil {
		fmt.Println("Failed to start server", err)
		return
	}
}
