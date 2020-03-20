# go-hornet

Run [hornet](https://github.com/ks888/hornet) from vscode.

## Features

Hornet is the Golang test runner for the speedster.

The core features are:
* **Change-driven**: by the integration with your editor, hornet knows what changes you made. It runs the tests affected by these changes first.
* **Tuned for high-speed**: hornet implements some strategies to run the tests faster, including tests in parallel. You may disable these features for safety.

## Prerequisites

* Go 1.13 or later
* Linux or Mac OS X

## Install

1. Hornet has the server program (`hornetd`) and client program (`hornet`). Install both:

   ```
   $ go get -u github.com/ks888/hornet/cmd/hornet && go get -u github.com/ks888/hornet/cmd/hornetd
   ```

2. Install the `Go Hornet` extension.

By default, the extension works like this:
* While you edit a file, the extension updates the list of changes you made.
* When the file is saved, sends the list of changes to the hornet server.
* When a user calls the `Hornet Test` command, it runs the tests affected by your changes first and then runs the rest.

## Quickstart

This quickstart shows you how to use hornet to help your coding.

### Set up

1. Run the server program (`hornetd`) if it's not running yet.

   ```sh
   $ hornetd
   ```

2. Download the sample repository.

   ```sh
   $ go get -u github.com/ks888/hornet-tutorial
   ```

### Coding

Let's assume you just implemented some [functions](https://github.com/ks888/hornet-tutorial/blob/master/math.go) (`SlowAdd` and `SlowSub`) and [tests](https://github.com/ks888/hornet-tutorial/blob/master/math_test.go) (`TestSlowAdd`, `TestSlowAdd_Overflow` and `TestSlowSub`) in the `hornet-tutorial` repository.

1. Run the tests

   Open `math.go` in the the repository root and run the `Hornet Test` command. It runs all the tests in the package.

   You will see the output like this:

   ```
   $ hornet test --parallel auto /Users/yagami/go/src/github.com/ks888/hornet-tutorial/math.go:#0
   No important tests. Run all the tests:
   === RUN   TestSlowAdd
   --- PASS: TestSlowAdd (1.00s)
   === RUN   TestSlowAdd_Overflow
   --- PASS: TestSlowAdd_Overflow (1.00s)
   === RUN   TestSlowSub
   --- FAIL: TestSlowSub (1.00s)
       math_test.go:22: wrong result: 2
   FAIL (1.030545101s)
   ```

   Obviously there is one failed test.

   Also, the total test time is `1.030545101s` because the tests run in parallel. When you run the same tests using `go test`, it takes about 3 seconds.

2. Fix the bug

   Fix [the `SlowSub` function](https://github.com/ks888/hornet-tutorial/blob/master/math.go#L12). `return a + b` at the line 12 should be `return a - b`. Then save it.

   While you edit the file, the extension updates the list of changes you made. When you save the file, it sends the list of changes to the hornet server.

3. Run the tests again

   When you run the `Hornet Test` command again, the previous hint is considered.

   ```
   $ hornet test --parallel auto /Users/yagami/go/src/github.com/ks888/hornet-tutorial/math.go:#179
   Found important tests. Run them first:
   === RUN   TestSlowSub
   --- PASS: TestSlowSub (1.00s)

   Run other tests:
   === RUN   TestSlowAdd
   --- PASS: TestSlowAdd (1.00s)
   === RUN   TestSlowAdd_Overflow
   --- PASS: TestSlowAdd_Overflow (1.00s)
   PASS (1.03155511s)
   ```

   *Based on the hint, hornet runs `TestSlowSub` first because it's affected by the previous change.*

## How-to guides

### Do not run `Hornet Hint` on file save

Change the `Gohornet: Hint On Save` option.

### Run tests in sequence

Some tests fail when they are executed in parallel. Tests are executed in sequence when the `Gohornet: Parallel` option is `off`.

### Specify the build tags

Change the `Gohornet: Build Tags` option.

### Run the specified test

Simply run the `Hornet Test` command when the cursor points to the body of the target test.

Before the tests run, the command adds the position of the current cursor to the changes list, so that we can run the test to which the cursor points first without editing the file.
