.POSIX:

.PHONY: all
all: fmt

.PHONY: fmt
fmt:
	prefix "$@" ./ci/sub/bin/fmt.sh
