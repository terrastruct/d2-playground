// @ts-nocheck
// This file is a hack. We disable typescript here to avoid having to as any everywhere.
import * as monacoEditor from "monaco-editor";

export function rehydrateRegexps(conf: monacoEditor.languages.LanguageConfiguration) {
  if (conf.autoClosingPairs) {
    for (const [i, pair] of conf.autoClosingPairs.entries()) {
      if (pair instanceof Array) {
        conf.autoClosingPairs[i] = {
          open: pair[0],
          close: pair[1],
        };
      }
    }
  }

  const markers = conf.folding?.markers;
  if (markers) {
    markers.start = safeRegExp(markers.start);
    markers.end = safeRegExp(markers.end);
  }

  if (conf.wordPattern) {
    conf.wordPattern = safeRegExp(conf.wordPattern);
  }

  const indentationRules = conf.indentationRules;
  if (indentationRules) {
    indentationRules.increaseIndentPattern = safeRegExp(
      indentationRules.increaseIndentPattern
    );
    indentationRules.decreaseIndentPattern = safeRegExp(
      indentationRules.decreaseIndentPattern
    );
    indentationRules.indentNextLinePattern = safeRegExp(
      indentationRules.indentNextLinePattern
    );
    indentationRules.unIndentedLinePattern = safeRegExp(
      indentationRules.unIndentedLinePattern
    );
  }

  if (conf.onEnterRules) {
    for (const rule of conf.onEnterRules) {
      rule.beforeText = safeRegExp(rule.beforeText);
      rule.afterText = safeRegExp(rule.afterText);
      rule.previousLineText = safeRegExp(rule.previousLineText);
      rule.action.indentAction = indentActions[rule.action.indent];
    }
  }
}

const indentActions = {
  none: monacoEditor.languages.IndentAction.None,
  indent: monacoEditor.languages.IndentAction.Indent,
  indentOutdent: monacoEditor.languages.IndentAction.IndentOutdent,
  outdent: monacoEditor.languages.IndentAction.Outdent,
};

function safeRegExp(s: string | undefined): RegExp | undefined {
  if (s === undefined) {
    return undefined;
  }
  try {
    return new RegExp(s);
  } catch (err) {
    console.error("bad regexp", err);
    return undefined;
  }
}
