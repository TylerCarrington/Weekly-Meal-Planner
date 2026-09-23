/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PrintOrientation = 'landscape' | 'portrait';

export interface PrintOptions {
  orientation: PrintOrientation;
  includeEvents: boolean;
  includeBlankSlots: boolean;
}

export const DEFAULT_PRINT_OPTIONS: PrintOptions = {
  orientation: 'landscape',
  includeEvents: true,
  includeBlankSlots: true,
};
