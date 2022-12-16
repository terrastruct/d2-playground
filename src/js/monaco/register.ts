import * as monacoEditor from "monaco-editor";

/** String identifier like 'cpp' or 'java'. */
export type LanguageId = string;

export type LanguageInfo = {
  tokensProvider: monacoEditor.languages.EncodedTokensProvider | null;
  configuration: monacoEditor.languages.LanguageConfiguration | null;
};

/**
 * This function needs to be called before monacoEditor.editor.create().
 *
 * @param languages the set of languages Monaco must know about up front.
 * @param fetchLanguageInfo fetches full language configuration on demand.
 * @param monacoInstance instance of Monaco on which to register languages information.
 */

export function registerLanguages(
  languages: monacoEditor.languages.ILanguageExtensionPoint[],
  fetchLanguageInfo: (language: LanguageId) => Promise<LanguageInfo>,
  monacoInstance: typeof monacoEditor
) {
  // We have to register all of the languages with Monaco synchronously before
  // we can configure them.
  for (const extensionPoint of languages) {
    // Recall that the id is a short name like 'cpp' or 'java'.
    const { id: languageId } = extensionPoint;
    monacoInstance.languages.register(extensionPoint);

    // Lazy-load the tokens provider and configuration data.
    monacoInstance.languages.onLanguage(languageId, async () => {
      const { tokensProvider, configuration } = await fetchLanguageInfo(languageId);

      if (tokensProvider !== null) {
        monacoInstance.languages.setTokensProvider(languageId, tokensProvider);
      }

      if (configuration !== null) {
        monacoInstance.languages.setLanguageConfiguration(languageId, configuration);
      }
    });
  }
}
