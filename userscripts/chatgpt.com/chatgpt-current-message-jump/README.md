# ChatGPT Current Message Jump

Firefox userscript, **v1.0.0 rebuild**. Shows up/down controls at a safe edge when a long assistant response is in view.

- Up jumps to the preceding mounted turn, or the current assistant turn when older history is virtualized away.
- Down jumps to the next mounted turn, or the end of the current response.
- If neither edge offers a safe placement, controls hide instead of covering content.
- Caches up to 240 turns from a reverse walk of at most 1,600 DOM elements. Scrolls are handled with one animation frame rather than repeated transcript queries.
- A bounded observer responds only to structural changes, not streamed text. Navigation and pagehide clean up state.

**Intentional limitation:** unlike the original, it does not drive virtualized history to hydrate missing earlier turns. Its conservative fallback is safe but may not reach an offscreen unmounted user prompt. No high-frequency polling.
