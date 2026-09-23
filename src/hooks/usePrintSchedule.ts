/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback } from 'react';
import { PrintOptions, PrintOrientation, DEFAULT_PRINT_OPTIONS } from '../types/print';

const PRINT_STYLE_ID = 'weekly-planner-dynamic-print-style';

function applyPrintOrientation(orientation: PrintOrientation) {
  let styleEl = document.getElementById(PRINT_STYLE_ID) as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = PRINT_STYLE_ID;
    document.head.appendChild(styleEl);
  }

  styleEl.textContent = `
    @media print {
      @page {
        size: ${orientation};
        margin: 6mm;
      }
    }
  `;
}

export function usePrintSchedule() {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<PrintOptions>(DEFAULT_PRINT_OPTIONS);

  const openPrint = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closePrint = useCallback(() => {
    setIsOpen(false);
  }, []);

  const setOrientation = useCallback((orientation: PrintOrientation) => {
    setOptions((prev) => ({ ...prev, orientation }));
  }, []);

  const setIncludeEvents = useCallback((includeEvents: boolean) => {
    setOptions((prev) => ({ ...prev, includeEvents }));
  }, []);

  const setIncludeBlankSlots = useCallback((includeBlankSlots: boolean) => {
    setOptions((prev) => ({ ...prev, includeBlankSlots }));
  }, []);

  const executePrint = useCallback(() => {
    applyPrintOrientation(options.orientation);
    window.print();
  }, [options.orientation]);

  return {
    isOpen,
    options,
    openPrint,
    closePrint,
    setOrientation,
    setIncludeEvents,
    setIncludeBlankSlots,
    executePrint,
  };
}
