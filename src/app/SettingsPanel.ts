import { LANGUAGES, t } from "../i18n";
import { el, enableDialogLightDismiss } from "./dom";
import type { Settings } from "./settings";

type BooleanSetting = "sound" | "reducedMotion" | "narration";

/** Child-safe settings: nothing here collects or transmits anything. */
export class SettingsPanel {
  readonly dialog: HTMLDialogElement;

  constructor(
    private readonly getSettings: () => Settings,
    private readonly onChange: (next: Settings) => void,
  ) {
    this.dialog = el("dialog", {
      className: "panel-dialog",
      "aria-labelledby": "settings-heading",
      "data-testid": "settings",
    });
    enableDialogLightDismiss(this.dialog);
  }

  open(): void {
    this.render();
    this.dialog.showModal();
  }

  private render(): void {
    const settings = this.getSettings();

    const toggle = (key: BooleanSetting, labelKey: string) => {
      const input = el("input", { type: "checkbox", name: key, checked: settings[key] });
      input.addEventListener("change", () => this.onChange({ ...this.getSettings(), [key]: input.checked }));
      return el("label", { className: "toggle" }, input, el("span", {}, t(labelKey)));
    };

    const languages = el(
      "fieldset",
      { className: "language-choice" },
      el("legend", {}, t("settings.language")),
      ...LANGUAGES.map(({ code, label }) => {
        const input = el("input", { type: "radio", name: "language", value: code, checked: settings.language === code });
        input.addEventListener("change", () => {
          if (input.checked) {
            this.onChange({ ...this.getSettings(), language: code });
            this.render();
          }
        });
        return el("label", { className: "toggle", lang: code }, input, el("span", {}, label));
      }),
    );

    const close = el("button", { type: "button", className: "secondary" }, t("ui.close"));
    close.addEventListener("click", () => this.dialog.close());

    this.dialog.replaceChildren(
      el("h2", { id: "settings-heading" }, t("settings.heading")),
      toggle("sound", "settings.sound"),
      toggle("narration", "settings.narration"),
      toggle("reducedMotion", "settings.reducedMotion"),
      languages,
      close,
    );
  }
}
