/**
 * Patch customElements.define to skip already-registered elements.
 * 
 * This prevents NotSupportedError when running inside Salesforce Lightning shell,
 * which pre-registers 'lightning-out-application'. The Agentforce SDK also tries
 * to register it at import time, causing a conflict.
 * 
 * MUST be imported FIRST in app.tsx (before any other imports).
 */
const original = customElements.define.bind(customElements);

customElements.define = function (
  name: string,
  constructor: CustomElementConstructor,
  options?: ElementDefinitionOptions
) {
  if (customElements.get(name)) {
    console.debug(`[patchCustomElements] Skipping already-registered: ${name}`);
    return;
  }
  return original(name, constructor, options);
};

export {};
