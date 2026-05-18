// Lab UI CSS extracted from components/problem-workspace.tsx (Ref#6).
// Imported back into the workspace as a styled-jsx template literal.

export const LAB_STYLES = `
.pseudo-lab {
  --bg0: #0e0f11;
  --bg1: #16181c;
  --bg2: #1e2126;
  --bg3: #262a31;
  --fg: #e7ebf0;
  --fg-mute: #8a93a0;
  --fg-faint: #5a6270;
  --accent: #4fffb0;
  --accent-soft: rgba(79, 255, 176, 0.15);
  --accent-line: rgba(79, 255, 176, 0.4);
  --blue: #7eb8ff;
  --amber: #ffb347;
  --red: #ff5f7e;
  --purple: #c8a4ff;
  --warm: #ffb86b;
  --border-1: rgba(255, 255, 255, 0.18);
  --border-2: rgba(255, 255, 255, 0.10);
  --border-3: rgba(255, 255, 255, 0.06);

  position: fixed;
  inset: 0;
  background: var(--bg0);
  color: var(--fg);
  font-family: var(--font-dm-sans), ui-sans-serif, system-ui, sans-serif;
  font-size: 13px;
  display: flex;
  flex-direction: column;
  z-index: 1;
}

.pseudo-lab * { box-sizing: border-box; }

.pseudo-lab .pl-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 16px;
  background: var(--bg1);
  border-bottom: 0.5px solid var(--border-3);
  flex-shrink: 0;
}
.pl-top-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}
.pl-back {
  color: var(--fg-mute);
  text-decoration: none;
  font-size: 16px;
  padding: 2px 6px;
  border-radius: 4px;
}
.pl-back:hover { color: var(--fg); background: var(--bg2); }
.pl-tag {
  background: var(--accent-soft);
  color: var(--accent);
  border: 0.5px solid var(--accent-line);
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.02em;
}
.pl-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  letter-spacing: -0.005em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.pl-difficulty {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--fg-mute);
  font-weight: 600;
}
.pl-tabs {
  display: flex;
  gap: 2px;
  background: var(--bg2);
  border-radius: 6px;
  padding: 2px;
  border: 0.5px solid var(--border-3);
}
.pl-tab {
  background: transparent;
  border: 0;
  color: var(--fg-mute);
  padding: 5px 12px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 4px;
  cursor: pointer;
  font-family: inherit;
}
.pl-tab.is-active {
  background: var(--bg3);
  color: var(--fg);
}
.pl-tab[data-disabled="true"] {
  color: var(--fg-faint);
  cursor: not-allowed;
}
.pl-top-right {
  display: flex;
  align-items: center;
  gap: 8px;
}
.pl-secondary {
  background: transparent;
  color: var(--fg-mute);
  border: 0.5px solid var(--border-2);
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
}
.pl-secondary:hover:not(:disabled) {
  color: var(--fg);
  border-color: var(--border-1);
}
.pl-secondary.is-done {
  color: var(--accent);
  border-color: var(--accent-line);
}
.pl-secondary:disabled { opacity: 0.4; cursor: not-allowed; }
.pl-run {
  background: var(--accent);
  color: #08110d;
  border: 0;
  border-radius: 6px;
  padding: 7px 16px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  letter-spacing: 0.02em;
}
.pl-run:hover:not(:disabled) { filter: brightness(1.05); }
.pl-run:disabled { opacity: 0.5; cursor: not-allowed; }

.pl-main {
  flex: 1;
  display: grid;
  min-height: 0;
  overflow: hidden;
}

.pl-sidebar {
  background: var(--bg1);
  border-right: 0.5px solid var(--border-3);
  padding: 16px 14px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.pl-side-section { display: flex; flex-direction: column; gap: 8px; }
.pl-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--fg-mute);
  margin: 0;
}
.pl-body {
  margin: 0;
  font-size: 12px;
  line-height: 1.55;
  color: var(--fg);
}
.pl-examples { display: flex; flex-direction: column; gap: 8px; }
.pl-example {
  background: var(--bg2);
  border: 0.5px solid var(--border-3);
  border-radius: 6px;
  padding: 8px 10px;
  font-family: var(--font-dm-mono), ui-monospace, monospace;
  font-size: 11px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.pl-example-line { margin: 0; display: flex; gap: 6px; }
.pl-example-key { color: var(--fg-faint); width: 22px; flex-shrink: 0; }
.pl-example-val { color: var(--fg); word-break: break-all; }
.pl-constraints {
  margin: 0;
  padding-left: 14px;
  font-size: 11.5px;
  color: var(--fg-mute);
  line-height: 1.5;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.pl-concepts { display: flex; flex-wrap: wrap; gap: 4px; }
.pl-concept {
  background: var(--bg2);
  border: 0.5px solid var(--border-3);
  color: var(--fg-mute);
  font-size: 10.5px;
  padding: 2px 7px;
  border-radius: 3px;
}

.pl-center {
  display: grid;
  min-height: 0;
  overflow: hidden;
}

.pl-editor-wrap {
  background: var(--bg1);
  border-bottom: 0.5px solid var(--border-3);
  padding: 0;
  min-height: 0;
  display: flex;
}
.pl-editor {
  flex: 1;
  display: grid;
  grid-template-columns: 44px 1fr;
  font-family: var(--font-dm-mono), ui-monospace, monospace;
  font-size: 13px;
  line-height: 20px;
  background: var(--bg1);
  min-height: 0;
  overflow: hidden;
}
.pl-gutter {
  background: var(--bg1);
  border-right: 0.5px solid var(--border-3);
  padding: 12px 8px 12px 0;
  text-align: right;
  color: var(--fg-faint);
  user-select: none;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.pl-gutter-num {
  display: block;
  height: 20px;
  font-size: 11px;
  transition: color 80ms;
}
.pl-gutter-num.is-active { color: var(--accent); }
.pl-code-area {
  position: relative;
  min-height: 0;
  overflow: hidden;
}
.pl-highlight,
.pl-textarea {
  position: absolute;
  inset: 0;
  padding: 12px 16px;
  margin: 0;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  white-space: pre;
  overflow: auto;
  border: 0;
  outline: 0;
  tab-size: 2;
}
.pl-highlight {
  pointer-events: none;
  color: var(--fg);
}
.pl-line {
  display: block;
  min-height: 20px;
  padding: 0 6px;
  margin: 0 -6px;
  border-left: 2px solid transparent;
}
.pl-line.is-active {
  background: var(--accent-soft);
  border-left-color: var(--accent);
}
.tok-kw { color: var(--purple); }
.tok-fn { color: var(--blue); }
.tok-op { color: var(--accent); }
.tok-num { color: var(--warm); }
.tok-cm { color: var(--fg-faint); font-style: italic; }
.tok-id { color: var(--fg); }
.tok-punct { color: var(--fg-mute); }
.tok-ws { white-space: pre; }
.pl-textarea {
  background: transparent;
  color: transparent;
  caret-color: var(--accent);
  resize: none;
  white-space: pre;
}
.pl-textarea::placeholder { color: var(--fg-faint); }
.pl-textarea::selection { background: rgba(79, 255, 176, 0.25); }

.pl-bottom {
  display: grid;
  gap: 0;
  min-height: 0;
  background: var(--bg0);
}

/* resize handles */
.pl-resize {
  background: transparent;
  position: relative;
  z-index: 5;
  transition: background 120ms ease;
}
.pl-resize-col {
  cursor: col-resize;
  width: 4px;
  align-self: stretch;
}
.pl-resize-row {
  cursor: row-resize;
  height: 4px;
  justify-self: stretch;
}
.pl-resize::after {
  content: "";
  position: absolute;
  background: var(--border-3);
}
.pl-resize-col::after {
  top: 0; bottom: 0;
  left: 50%;
  width: 0.5px;
  transform: translateX(-50%);
}
.pl-resize-row::after {
  left: 0; right: 0;
  top: 50%;
  height: 0.5px;
  transform: translateY(-50%);
}
.pl-resize:hover {
  background: rgba(79, 255, 176, 0.08);
}
.pl-resize:hover::after,
.pl-resize:active::after {
  background: var(--accent);
}
.pl-resize:active {
  background: rgba(79, 255, 176, 0.15);
}
.pl-panel {
  background: var(--bg1);
  border-right: 0.5px solid var(--border-3);
  padding: 10px 14px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
  min-width: 0;
}
.pl-panel:last-child { border-right: 0; }
.pl-panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}
.pl-pulse {
  font-family: var(--font-dm-mono), ui-monospace, monospace;
  font-size: 10px;
  color: var(--accent);
  animation: pl-pulse 1.2s ease-in-out infinite;
}
@keyframes pl-pulse { 0%, 100% { opacity: 0.6 } 50% { opacity: 1 } }
.pl-agg {
  font-family: var(--font-dm-mono), ui-monospace, monospace;
  font-size: 11px;
  font-weight: 600;
  padding: 1px 7px;
  border-radius: 4px;
  border: 0.5px solid var(--border-2);
}
.pl-agg-pass { color: var(--accent); border-color: var(--accent-line); }
.pl-agg-fail { color: var(--red); border-color: rgba(255,95,126,0.4); }
.pl-agg-neutral { color: var(--fg-mute); }
.pl-step-count {
  font-family: var(--font-dm-mono), ui-monospace, monospace;
  font-size: 11px;
  color: var(--fg-mute);
}

.pl-cases {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
  overflow-y: auto;
  min-height: 0;
}
.pl-case {
  width: 100%;
  background: transparent;
  border: 0.5px solid transparent;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 5px;
  cursor: pointer;
  color: var(--fg);
  font-family: inherit;
  font-size: 12px;
}
.pl-case:hover { background: var(--bg2); border-color: var(--border-3); }
.pl-case.is-selected { background: var(--bg3); border-color: var(--border-2); }
.pl-icon {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  flex-shrink: 0;
}
.pl-icon-pending { background: var(--bg3); color: var(--fg-faint); }
.pl-icon-running { background: var(--bg3); color: var(--accent); animation: pl-pulse 0.8s ease-in-out infinite; }
.pl-icon-pass { background: var(--accent-soft); color: var(--accent); }
.pl-icon-fail { background: rgba(255,95,126,0.15); color: var(--red); }
.pl-case-label {
  font-weight: 500;
  color: var(--fg);
  flex-shrink: 0;
  min-width: 50px;
}
.pl-case-input {
  font-family: var(--font-dm-mono), ui-monospace, monospace;
  font-size: 11px;
  color: var(--fg-mute);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}
.pl-empty {
  color: var(--fg-mute);
  font-size: 12px;
  padding: 8px;
}

.pl-validator {
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow-y: auto;
  min-height: 0;
}
.pl-msg {
  border-radius: 6px;
  padding: 7px 10px;
  font-size: 12px;
  line-height: 1.5;
  border: 0.5px solid transparent;
  animation: pl-fade-in 280ms ease-out both;
}
@keyframes pl-fade-in {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
.pl-msg strong { color: var(--fg); font-weight: 600; }
.pl-msg-good { background: var(--accent-soft); color: #cdeede; border-color: var(--accent-line); }
.pl-msg-good strong { color: var(--accent); }
.pl-msg-tip { background: rgba(255,179,71,0.10); color: #ffe6c8; border-color: rgba(255,179,71,0.30); }
.pl-msg-tip strong { color: var(--amber); }
.pl-msg-error { background: rgba(255,95,126,0.10); color: #ffd1da; border-color: rgba(255,95,126,0.30); }
.pl-msg-error strong { color: var(--red); }
.pl-msg-empty {
  color: var(--fg-mute);
  font-size: 12px;
  font-style: italic;
  padding: 8px 4px;
}

.pl-vis-empty {
  color: var(--fg-mute);
  font-size: 12px;
  padding: 8px 4px;
  font-style: italic;
}
.pl-vis {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
  flex: 1;
}
.pl-vis-target {
  font-family: var(--font-dm-mono), ui-monospace, monospace;
  font-size: 11px;
  color: var(--fg-mute);
}
.pl-vis-cells {
  display: flex;
  gap: 4px;
  overflow-x: auto;
  padding: 4px 0;
}
.pl-cell-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  min-width: 30px;
}
.pl-cell-pointers {
  height: 16px;
  display: flex;
  gap: 2px;
  align-items: center;
  justify-content: center;
}
.pl-ptr {
  font-family: var(--font-dm-mono), ui-monospace, monospace;
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
}
.pl-ptr-l { color: var(--blue); }
.pl-ptr-r { color: var(--amber); }
.pl-ptr-m { color: var(--accent); }
.pl-cell {
  width: 28px;
  height: 28px;
  background: var(--bg2);
  border: 0.5px solid var(--border-2);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-dm-mono), ui-monospace, monospace;
  font-size: 12px;
  font-weight: 500;
  color: var(--fg);
  transition: all 120ms;
}
.pl-cell.is-mid {
  border-color: var(--accent-line);
}
.pl-cell.is-found {
  background: var(--accent-soft);
  border-color: var(--accent);
  color: var(--accent);
  box-shadow: 0 0 12px rgba(79,255,176,0.4);
}
.pl-cell-idx {
  font-family: var(--font-dm-mono), ui-monospace, monospace;
  font-size: 9px;
  color: var(--fg-faint);
}
.pl-vis-note {
  font-family: var(--font-dm-mono), ui-monospace, monospace;
  font-size: 11px;
  color: var(--fg-mute);
  min-height: 14px;
}
.pl-progress {
  height: 3px;
  background: var(--bg2);
  border-radius: 2px;
  overflow: hidden;
}
.pl-progress-bar {
  height: 100%;
  background: var(--accent);
  transition: width 200ms ease;
}
.pl-vis-controls {
  display: flex;
  gap: 6px;
}
.pl-step-btn {
  background: transparent;
  color: var(--fg);
  border: 0.5px solid var(--border-2);
  border-radius: 4px;
  padding: 4px 12px;
  font-size: 11px;
  font-family: inherit;
  cursor: pointer;
}
.pl-step-btn:hover:not(:disabled) { border-color: var(--border-1); }
.pl-step-btn:disabled { opacity: 0.3; cursor: not-allowed; }

/* ---- guide chat (inline workspace panel) ---- */
.pl-guide { display: flex; flex-direction: column; min-height: 0; }
.pl-guide-reset {
  background: transparent;
  border: 0.5px solid var(--border-3);
  color: var(--fg-mute);
  font-family: inherit;
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 4px;
  cursor: pointer;
}
.pl-guide-reset:hover { color: var(--fg); border-color: var(--border-1); }
.pl-guide-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-family: var(--font-dm-sans, system-ui), sans-serif;
}
.pl-guide-empty {
  color: var(--fg-mute);
  font-size: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.pl-guide-empty p { margin: 0; line-height: 1.4; }
.pl-guide-quicks {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.pl-guide-quick {
  text-align: left;
  background: var(--bg2);
  border: 0.5px solid var(--border-3);
  color: var(--fg);
  font-family: inherit;
  font-size: 11px;
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
  line-height: 1.3;
}
.pl-guide-quick:hover {
  border-color: var(--accent-line);
  color: var(--accent);
}
.pl-guide-msg {
  display: flex;
  flex-direction: column;
  gap: 4px;
  animation: pl-fade-up 180ms ease-out;
}
.pl-guide-role {
  font-size: 9px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--fg-faint);
  font-family: var(--font-dm-mono, ui-monospace), monospace;
}
.pl-guide-text {
  font-size: 12px;
  line-height: 1.5;
  color: var(--fg);
  white-space: pre-wrap;
  word-break: break-word;
}
.pl-guide-msg-user .pl-guide-text {
  background: var(--bg3);
  border-left: 2px solid var(--blue);
  padding: 6px 10px;
  border-radius: 0 4px 4px 0;
}
.pl-guide-msg-assistant .pl-guide-text {
  background: var(--bg2);
  border-left: 2px solid var(--accent);
  padding: 6px 10px;
  border-radius: 0 4px 4px 0;
}
.pl-guide-msg-error .pl-guide-text {
  background: rgba(255, 95, 126, 0.08);
  border-left: 2px solid var(--red);
  padding: 6px 10px;
  border-radius: 0 4px 4px 0;
  color: var(--red);
}
.pl-chat-code {
  font-family: var(--font-dm-mono, ui-monospace), monospace;
  font-size: 11px;
  background: var(--bg0);
  border: 0.5px solid var(--border-3);
  padding: 1px 4px;
  border-radius: 3px;
  color: var(--accent);
}
.pl-chat-link {
  font-family: var(--font-dm-mono, ui-monospace), monospace;
  font-size: 11px;
  color: var(--accent);
  text-decoration: underline;
  text-underline-offset: 2px;
}
.pl-guide-typing {
  display: inline-flex;
  gap: 4px;
  padding: 8px 10px;
  background: var(--bg2);
  border-left: 2px solid var(--accent);
  border-radius: 0 4px 4px 0;
  width: fit-content;
}
.pl-guide-typing span {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--accent);
  opacity: 0.4;
  animation: pl-typing 1.2s infinite ease-in-out;
}
.pl-guide-typing span:nth-child(2) { animation-delay: 0.15s; }
.pl-guide-typing span:nth-child(3) { animation-delay: 0.3s; }
@keyframes pl-typing {
  0%, 60%, 100% { opacity: 0.4; transform: translateY(0); }
  30% { opacity: 1; transform: translateY(-3px); }
}
@keyframes pl-fade-up {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
.pl-guide-form {
  border-top: 0.5px solid var(--border-3);
  padding: 8px;
  display: flex;
  gap: 8px;
  align-items: flex-end;
}
.pl-guide-input {
  flex: 1;
  background: var(--bg0);
  border: 0.5px solid var(--border-3);
  color: var(--fg);
  font-family: inherit;
  font-size: 12px;
  padding: 6px 8px;
  border-radius: 4px;
  resize: none;
  line-height: 1.4;
  outline: none;
}
.pl-guide-input:focus { border-color: var(--accent-line); }
.pl-guide-input:disabled { opacity: 0.6; }
.pl-guide-send {
  background: var(--accent);
  color: var(--bg0);
  border: 0;
  font-family: inherit;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}
.pl-guide-send:disabled { opacity: 0.4; cursor: not-allowed; }
.pl-guide-head-actions { display: inline-flex; gap: 6px; align-items: center; }
.pl-guide-expand {
  background: transparent;
  border: 0.5px solid var(--border-3);
  color: var(--fg-mute);
  font-family: inherit;
  font-size: 12px;
  line-height: 1;
  padding: 2px 7px;
  border-radius: 4px;
  cursor: pointer;
}
.pl-guide-expand:hover { color: var(--accent); border-color: var(--accent-line); }
.pl-guide-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 50;
  animation: pl-fade-in 140ms ease-out;
}
@keyframes pl-fade-in { from { opacity: 0; } to { opacity: 1; } }
.pl-guide-expanded {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: min(460px, 92vw);
  z-index: 60;
  background: var(--bg1);
  border-left: 0.5px solid var(--border-2);
  box-shadow: -8px 0 24px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  animation: pl-slide-in 200ms ease-out;
}
@keyframes pl-slide-in {
  from { transform: translateX(20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
`;
