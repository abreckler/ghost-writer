# Project

A Node.js, Express, Typescript API server that supports:

- Swagger API documentation (version requested in the request header)
- Custom Error handling
- Both Authentication and Authorization middleware

## Install and run

### Clone

```bash
git clone https://github.com/daveKoala/typescript-api-starter.git
```

### Install

```bash
npm install
```

### Settings

Settings are in two areas.

- The traditional ```.env``` files.

- And inside ```./src/config```

### Start Developer mode

```bash
npm run dev
```

### Build with environments

```bash
npm run build
```

If you want to run the built code.

```bash
node dist/server.js
```

### Unit tests

There are two test commands.

```bash
npm run test:unit
```

Runs the unit tests are results are printed in the terminal.

```bash
npm run test:reporter
```

Runs the unit tests as above but will also publish test results. This is used with automated CI/CD builds where test results are published and recorded

#### NPM scripts

|Name |Command |Description |
|---|---|---|
|audit|```npm run audit```|Audits the NPM production packages and errors on 'moderate' risks or higher|
|build|```npm run build```|Compiles JS files from TS into the ```./dist``` folder|
|dev|```npm run dev```|When developing use this. It restarts the server on any file changes|
|lint|```npm run lint```|ES Linter and will try to fix errors|
|pre|```npm run pre```|Run audit, lint, test:unit and build|
|test:unit|```npm run test:unit```|Runs all the unit tests|
|test:reporter|```npm run test:reporter```|Runs all the unit tests and publishes results ```./TEST-RESULTS {{date}}.xml```|

## API versioning

What API version is called by the client is controlled by a key value pair in the request header.

```bash
{"Accept-version": <version>}
```

If no key value pair is found or the version does not exist then an error is returned

## API docs

<https://levelup.gitconnected.com/the-simplest-way-to-add-swagger-to-a-node-js-project-c2a4aa895a3c>

## Error handling

There are a number of custom error methods that extend the defaut Error object. Feel free to add your own.

To use them just throw a custom error.

```bash
throw new error.NotFoundError("my message");
```

These are handled by the ErrorHandler middleware. Notice that it is last middleware in the chain. See ```./src/server.ts```

## Webpack

Yep there is no Webpack used. I am happy with the complied files being separate and any negative effects outweigh the additional complexity and maintenance woes I have experienced in the past.
