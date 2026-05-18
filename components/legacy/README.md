# Legacy UI stack (frozen)

These components belong to the previous app architecture (page shell +
problem pane + tracker + feedback panel). The new lab UI under
`components/lab/` and `components/problem-workspace.tsx` has replaced
them on every active route except `app/not-found.tsx`.

Rules:
- Do NOT add new features here. New work goes in the lab stack.
- Bugfixes are fine when they keep `not-found` rendering, but anything
  larger should migrate the callsite onto `LabShell` first.
- Slated for removal once `not-found` has a lab-flavored equivalent.
