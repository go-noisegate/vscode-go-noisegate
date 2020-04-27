# Go Noise Gate

VSCode extension for [Noise Gate](https://github.com/go-noisegate/noisegate).

## Prerequisites

* Go 1.13 or later

## Install

1. The tool has the server (`gated`) and cli (`gate`). Install both:

   ```sh
   $ go get -u github.com/go-noisegate/noisegate/cmd/gate && go get -u github.com/go-noisegate/noisegate/cmd/gated
   ```

2. Install the `Go Noise Gate` extension.

By default, the extension works like this:
* While you edit a file, the extension updates the list of recent changes.
* When the file is saved, sends the list of recent changes to the server.
* To run the test, calls the `Noise Gate Test` command. It runs the tests affected by the recent changes.
* To run all the tests regardless of recent changes, calls the `Noise Gate Test All` command.

## Quickstart

This quickstart shows you how to use the Noise Gate to get faster test results.

### Set up

1. Run the server program (`gated`) if it's not running yet.

   ```sh
   $ gated
   ```

2. Download the quickstart repository.

   ```sh
   $ go get -u github.com/go-noisegate/quickstart
   ```

### Run your tests

Let's assume you just implemented some [functions](https://github.com/go-noisegate/quickstart/blob/master/math.go) (`SlowAdd` and `SlowSub`) and [tests](https://github.com/go-noisegate/quickstart/blob/master/math_test.go) (`TestSlowAdd`, `TestSlowAdd_Overflow` and `TestSlowSub`) at the `quickstart` repository.

1. Run all the tests

   First, check if all the tests are passed. Open `math.go` at the the repository root and run the `Noise Gate Test All` command.


   ```
   $ gate test -bypass /Users/ks888/go/src/github.com/go-noisegate/quickstart -- -v 
   Run all tests:
   === RUN   TestSlowAdd
   --- PASS: TestSlowAdd (1.00s)
   === RUN   TestSlowAdd_Overflow
   --- PASS: TestSlowAdd_Overflow (1.00s)
   === RUN   TestSlowSub
   --- FAIL: TestSlowSub (1.00s)
       math_test.go:22: wrong result: 2
   FAIL
   FAIL	github.com/go-noisegate/quickstart	3.014s
   FAIL
   ```

   * One failed test. We will fix this soon.
   * The tool internally calls `go test` and the `-v` option is passed by default. See the [How-to guides](#how-to-guides) section to pass other options.

2. Change the code

   To fix the failed test, change [the `SlowSub` function](https://github.com/go-noisegate/quickstart/blob/master/math.go#L12). `return a + b` at the line 12 should be `return a - b`. Then save it.

   * While you edit the file, the extension updates the list of changes.
   * When you save the file, the extension sends the list of changes to the server.

3. Run the tests affected by the recent changes

   Let's check if the test is fixed. Run the `Noise Gate Test` command.

   ```
   $ gate test /Users/ks888/go/src/github.com/go-noisegate/quickstart -- -v 
   Changed: [SlowSub]
   === RUN   TestSlowSub
   --- PASS: TestSlowSub (1.00s)
   PASS
   ok  	github.com/go-noisegate/quickstart	1.007s
   ```

   * The recent changes are listed at the `Changed: [SlowSub]` line. The list is cleared when all the tests are passed.
   * Based on the recent changes, the tool selects and runs only the `TestSlowSub` test.
   * *You get the faster test results (`3.014s` -> `1.007s`)!*

## How-to guides

### Pass options to `go test`

Change the `Gonoisegate: Go Test Options` option.

### Run a specific test

Run the `Noise Gate Test` command when the cursor points to the body of the test function.

The current cursor position is also considered as the recent change so that we can run some test without edit.

## How it works

See [DEVELOPMENT.md](https://github.com/go-noisegate/noisegate/blob/master/DEVELOPMENT.md).
