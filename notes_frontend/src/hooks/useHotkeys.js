import { useEffect } from "react";

/**
 * PUBLIC_INTERFACE
 * useHotkeys
 * Register a hotkey handler. Supports Ctrl/Cmd key combinations.
 * @param {{ combo: string, handler: (e: KeyboardEvent)=>void, deps?: any[] }} options
 */
export function useHotkeys({ combo, handler, deps = [] }) {
  useEffect(() => {
    const isMetaCombo = combo.toLowerCase().includes("cmd+") || combo.toLowerCase().includes("meta+");
    const isCtrlCombo = combo.toLowerCase().includes("ctrl+");
    const key = combo.split("+").pop().toLowerCase();

    function onKeyDown(e) {
      const pressedKey = e.key.toLowerCase();
      const matchKey = pressedKey === key;
      const needMeta = isMetaCombo;
      const needCtrl = isCtrlCombo;
      const metaOk = needMeta ? e.metaKey : true;
      const ctrlOk = needCtrl ? e.ctrlKey : true;

      if (matchKey && metaOk && ctrlOk) {
        e.preventDefault();
        handler(e);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
