// @ts-check
import js from "@eslint/js";
import tseslint from "typescript-eslint";

/**
 * Network and tracking APIs are banned everywhere in src/.
 * The MVP is local-only by design (COPPA data minimisation). Adding any of
 * these requires an architecture + privacy review — see
 * .agents/skills/coppa-data-minimization/SKILL.md.
 */
const NETWORK_GLOBALS = [
  { name: "fetch", message: "No network calls in the child experience. See coppa-data-minimization skill." },
  { name: "XMLHttpRequest", message: "No network calls in the child experience." },
  { name: "WebSocket", message: "No network calls in the child experience." },
  { name: "EventSource", message: "No network calls in the child experience." },
];

const NETWORK_PROPERTIES = [
  { object: "navigator", property: "sendBeacon", message: "No telemetry beacons." },
  { object: "navigator", property: "geolocation", message: "No location data." },
  { object: "navigator", property: "mediaDevices", message: "No camera/microphone access." },
  { object: "document", property: "cookie", message: "No cookies." },
];

export default tseslint.config(
  { ignores: ["dist/", "playwright-report/", "test-results/", "coverage/"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.ts"],
    rules: {
      "no-restricted-globals": ["error", ...NETWORK_GLOBALS],
      "no-restricted-properties": ["error", ...NETWORK_PROPERTIES],
      "no-restricted-syntax": [
        "error",
        { selector: "MemberExpression[property.name='innerHTML']", message: "Use textContent; never render HTML from content." },
      ],
    },
  },
  {
    // The learning domain, content and storage layers must stay engine- and
    // DOM-free so they are testable in plain Node and portable to any renderer.
    files: ["src/learning/**/*.ts", "src/content/**/*.ts", "src/storage/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: ["phaser", "phaser/*"], message: "Learning/content/storage must not depend on Phaser." },
            { group: ["**/game/**", "**/app/**"], message: "Domain layers must not import presentation code." },
          ],
        },
      ],
    },
  },
  {
    // Phaser game scenes and systems communicate with the DOM shell strictly via GameBridge.
    files: ["src/game/**/*.ts"],
    rules: {
      "no-restricted-globals": [
        "error",
        ...NETWORK_GLOBALS,
        { name: "document", message: "Phaser scenes must not query the DOM directly; use GameBridge." },
      ],
    },
  },
);
