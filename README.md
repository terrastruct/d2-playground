<div align="center">
  <img src="./src/assets/images/og.png" alt="D2 Playground" />
  <h2>
    An online runner to play, learn, and create with D2, the modern diagram scripting language that turns text to diagrams.
  </h2>

[![ci](https://github.com/terrastruct/d2-playground/actions/workflows/ci.yml/badge.svg)](https://github.com/terrastruct/d2-playground/actions/workflows/ci.yml)
[![daily](https://github.com/terrastruct/d2-playground/actions/workflows/daily.yml/badge.svg)](https://github.com/terrastruct/d2-playground/actions/workflows/daily.yml)
[![discord](https://img.shields.io/discord/1039184639652265985?label=discord)](https://discord.gg/NF6X8K4eDq)
[![twitter](https://img.shields.io/twitter/follow/terrastruct?style=social)](https://twitter.com/terrastruct)
[![license](https://img.shields.io/github/license/terrastruct/d2-playground?color=9cf)](./LICENSE.txt)

</div>

**Notice:** This is not the repository for the D2 language. That can be found [here](https://github.com/terrastruct/d2).

# Table of Contents

<!-- toc -->
- [FAQ](#faq)
  - [What is this written in?](#what-is-this-written-in)
  - [How does it work?](#how-does-it-work)
  - [Can I run it locally?](#can-i-run-it-locally)
- [Development](#development)
  - [Prerequisites](#prerequisites)
- [Contributing](#contributing)
- [Dependencies](#dependencies)

## FAQ

### What is this written in?

Vanilla HTML, CSS, and Javascript.

### How does it work?

[d2.js](https://www.npmjs.com/package/@terrastruct/d2) serves every request for dagre and
elk layouts all within the frontend client. To render
[tala](https://d2lang.com/tour/tala/) layouts, a request is made to an API (since it's not
supported by `d2.js`).

### Can I run it locally?

Yes. Just clone and follow the instructions in the Development section below.

## Development

Run `./ci/dev.sh`.

### Prerequisites

- `esbuild`:
[https://esbuild.github.io/getting-started/#install-esbuild](https://esbuild.github.io/getting-started/#install-esbuild)

## Contributing

Contributions are welcome!

## Dependencies

External dependencies are kept to a minimum. Currently they are:
1. [Monaco Editor](https://github.com/microsoft/monaco-editor) for text editing features.
1. [Panzoom](https://github.com/anvaka/panzoom) for SVG navigation.

Both are not ideal. Monaco is unnecessarily heavy and Panzoom lacks scrolling. The plan is
to replace these one day.

If you're a contributor, please do not add any dependencies without discussing first.
