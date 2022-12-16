import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { createOnigScanner, createOnigString, loadWASM } from "vscode-oniguruma";

// Most of this code is derived from https://github.com/bolinfest/monaco-tm
import { rehydrateRegexps } from "./configuration";
import { registerLanguages } from "./register";
import { SimpleLanguageInfoProvider, ScopeNameInfo, TextMateGrammar } from "./providers";
import * as config from "../d2-vscode/language-configuration.json";

import d2Grammar from "../d2-vscode/syntaxes/d2.tmLanguage.json";

const languages: monaco.languages.ILanguageExtensionPoint[] = [
  {
    id: "d2",
    extensions: [".d2"],
    aliases: ["d2", "d2"],
  },
];

interface DemoScopeNameInfo extends ScopeNameInfo {
  path: string;
}

const grammars: { [scopeName: string]: DemoScopeNameInfo } = {
  "source.d2": {
    language: "d2",
    path: "d2.tmLanguage.json",
  },
  // "text.html.markdown.d2": {
  //   language: "markdown",
  //   path: "markdown.tmLanguage.json",
  // },
  // "source.go": {
  //   language: "go",
  //   path: "go.tmLanguage.json",
  // },
  // "source.js": {
  //   language: "javascript",
  //   path: "javascript.tmLanguage.json",
  // },
  // "source.shell": {
  //   language: "shellscript",
  //   path: "shell.tmLanguage.json",
  // },
};

const fetchGrammar = async (scopeName): Promise<TextMateGrammar> => {
  let grammar;
  switch (scopeName) {
    case "source.d2":
      grammar = d2Grammar;
      break;
    // case "text.html.markdown.d2":
    //   grammar = await import("~/d2-vscode/syntaxes/markdown.tmLanguage.json");
    //   break;
    // case "source.go":
    //   grammar = await import("shiki/languages/go.tmLanguage.json");
    //   break;
    // case "source.js":
    //   grammar = await import("shiki/languages/javascript.tmLanguage.json");
    //   break;
    // case "source.shell":
    //   grammar = await import("shiki/languages/shellscript.tmLanguage.json");
    //   break;
  }
  return { type: "json", grammar: JSON.stringify(grammar) };
};

const fetchConfiguration = async (): Promise<monaco.languages.LanguageConfiguration> => {
  rehydrateRegexps(config);
  return config;
};

// Taken from https://github.com/microsoft/vscode/blob/829230a5a83768a3494ebbc61144e7cde9105c73/src/vs/workbench/services/textMate/browser/textMateService.ts#L33-L40
async function loadVSCodeOnigurumWASM(): Promise<Response | ArrayBuffer> {
  const response = await fetch("../js/vendor/onig.wasm");
  const contentType = response.headers.get("content-type");
  if (contentType === "application/wasm") {
    return response;
  }

  // Using the response directly only works if the server sets the MIME type 'application/wasm'.
  // Otherwise, a TypeError is thrown when using the streaming compiler.
  // We therefore use the non-streaming compiler :(.
  return response.arrayBuffer();
}

const getLanguageProvider = async (theme) => {
  const data: ArrayBuffer | Response = await loadVSCodeOnigurumWASM();
  await loadWASM(data);

  const onigLib = Promise.resolve({
    createOnigScanner,
    createOnigString,
  });

  const provider = new SimpleLanguageInfoProvider({
    grammars,
    fetchGrammar,
    configurations: languages.map((language) => language.id),
    fetchConfiguration,
    theme,
    onigLib,
    monaco,
  });
  registerLanguages(
    languages,
    (language: string) => provider.fetchLanguageInfo(language),
    monaco
  );

  return provider;
};

// the entry point to monaco-tm utils
export { getLanguageProvider, SimpleLanguageInfoProvider };
