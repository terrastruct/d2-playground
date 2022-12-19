#!/bin/sh
set -eu
if [ ! -e "$(dirname "$0")/ci/sub/.git" ]; then
  set -x
  git submodule update --init
  set +x
fi
. "$(dirname "$0")/ci/sub/lib.sh"
cd "$(dirname "$0")"

job_parseflags "$@"
runjob fmt ./ci/sub/bin/fmt.sh &
runjob lint ci_go_lint &
runjob build 'go build ./...' &
runjob test 'go test ./...' &
ci_waitjobs
