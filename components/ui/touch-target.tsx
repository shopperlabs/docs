/**
 * Extends a control below 48px to the minimum touch target on coarse pointers.
 * The parent must be `relative`.
 */
export function TouchTarget() {
  return (
    <span
      aria-hidden="true"
      className="absolute top-1/2 left-1/2 size-[max(100%,3rem)] -translate-1/2 pointer-fine:hidden"
    />
  );
}
