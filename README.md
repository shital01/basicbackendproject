# Installation Guide

## Prerequisites

- **Install NODE**
- **Install MONGODB** (for test/dev as a local MongoDB server is needed)
  - For Mac users, you need to install Homebrew and xcode-install.

## Setup

1. Use `git clone` to get updated code/files.
2. Run `npm install` to install all packages.
3. Run `npm install` for dev dependencies such as `nodemon`, `morgan`, `jest`, `debug` (if not already installed).

## Running the Application

- Execute `npm run test` for locally testing files and coverage to see the report.
- Execute `npm run dev` for running in dev mode using `nodemon` and `debug`.
- Execute `npm run start` for running with no debug and no nodemon, set to production so that `helmet` runs, and also a different DB to be used.

## Important Notes

- Beware of the `set`/`export` command.
- Add an extra `app.env` for setting our secret.
- Switch from the Git Main Branch to a side Branch for non-dev/test + `app.env`.
- As per environment config is used but hide either by terminal or `app.env`.

## Workflow

1. First, work on development.
2. Alongside, conduct tests.
3. Then, start the application.
4. Next, switch to the side branch to update `app.env`.
5. Finally, conduct tests using Postman.

## Tests
### Running Load Tests
Use the following command to run a scenario for the project load test:
`npx artillery run --config artillery-test.yml test/load/scenarios/<scenario file name>`

To generate report, 
- First create a directory with the name test-report at the root of your project
- Generate json with command
`npx artillery run --config artillery-test.yml --output testr-report/<output file name>.json test/load/scenarios/<scenario file name>`

- Generate html with command
`npx artillery report test-report/<output file name>.json`


Detailed instructions on running artillery scripts can be found at [artillery docs](https://github.com/artilleryio/artillery/tree/main/examples/multiple-scenario-specs)
