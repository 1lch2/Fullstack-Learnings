import { useCallback, useRef } from 'react';

interface UseFocusOutOptions {
  onFocusOut?: (event: React.FocusEvent) => void;
  onFocus?: (event: React.FocusEvent) => void;
  enabled?: boolean;
}

interface UseFocusOutReturn {
  onFocus: (event: React.FocusEvent) => void;
  onFocusOut: (event: React.FocusEvent) => void;
  isFocused: boolean;
}

/**
 * Hook for tracking focus state and handling focus out events
 * Returns handlers that can be attached to React elements
 *
 * @example
 * ```tsx
 * function InputWithValidation() {
 *   const { onFocus, onFocusOut, isFocused } = useFocusOut({
 *     onFocusOut: (e) => validateInput(e.target.value),
 *     onFocus: () => setShowHint(true)
 *   });
 *
 *   return (
 *     <input
 *       onFocus={onFocus}
 *       onFocusOut={onFocusOut}
 *       style={{ borderColor: isFocused ? 'blue' : 'gray' }}
 *     />
 *   );
 * }
 * ```
 */
export function useFocusOut({
  onFocusOut,
  onFocus,
  enabled = true
}: UseFocusOutOptions = {}): UseFocusOutReturn {
  const isFocusedRef = useRef(false);
  const pendingBlurRef = useRef(false);

  const handleFocus = useCallback((event: React.FocusEvent) => {
    if (!enabled) return;

    isFocusedRef.current = true;
    pendingBlurRef.current = false;
    onFocus?.(event);
  }, [enabled, onFocus]);

  const handleFocusOut = useCallback((event: React.FocusEvent) => {
    if (!enabled) return;

    // Use setTimeout to check if focus moved to another element
    // This is a common pattern to detect if focus is still within the same logical group
    pendingBlurRef.current = true;

    setTimeout(() => {
      // Only trigger onFocusOut if we still think we're blurring
      // and focus wasn't re-acquired
      if (pendingBlurRef.current && isFocusedRef.current) {
        isFocusedRef.current = false;
        pendingBlurRef.current = false;
        onFocusOut?.(event as any);
      }
    }, 0);
  }, [enabled, onFocusOut]);

  return {
    onFocus: handleFocus,
    onFocusOut: handleFocusOut,
    isFocused: isFocusedRef.current
  };
}