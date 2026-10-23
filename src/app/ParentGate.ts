import type { QuestDefinition } from "../content/schemas";
import { t } from "../i18n";
import { OBJECTIVES } from "../learning/objectives";
import type { ProgressStore } from "../storage/ProgressStore";
import { el, enableDialogLightDismiss } from "./dom";

/**
 * Two dialogs:
 *  1. A grown-up gate that prevents *accidental* child navigation. It is NOT
 *     verifiable parental consent under COPPA — that is a separate legal
 *     mechanism, required only if the game ever collects personal information.
 *  2. The grown-ups area: privacy statement, local learning summary, and
 *     on-device data deletion.
 */
export class ParentGate {
  readonly gate: HTMLDialogElement;
  readonly area: HTMLDialogElement;
  private answer = 0;

  constructor(
    private readonly progress: ProgressStore,
    private readonly quests: readonly QuestDefinition[],
  ) {
    this.gate = el("dialog", {
      className: "panel-dialog",
      "aria-labelledby": "gate-heading",
      "data-testid": "parent-gate",
    });
    this.area = el("dialog", {
      className: "panel-dialog wide",
      "aria-labelledby": "parent-heading",
      "data-testid": "parent-area",
    });
    enableDialogLightDismiss(this.gate);
    enableDialogLightDismiss(this.area);
  }

  open(): void {
    const a = 6 + Math.floor(Math.random() * 4);
    const b = 6 + Math.floor(Math.random() * 4);
    this.answer = a * b;

    const input = el("input", {
      id: "gate-answer",
      type: "text",
      inputmode: "numeric",
      autocomplete: "off",
      pattern: "[0-9]*",
    });
    const error = el("p", { className: "feedback", role: "alert" });
    const form = el(
      "form",
      { method: "dialog" },
      el("label", { for: "gate-answer" }, t("parent.gateQuestion", { a, b })),
      input,
      error,
      el(
        "div",
        { className: "dialog-actions" },
        el("button", { type: "submit" }, t("parent.gateSubmit")),
        el("button", { type: "button", className: "secondary", value: "cancel" }, t("ui.close")),
      ),
    );

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (Number.parseInt(input.value, 10) === this.answer) {
        this.gate.close();
        this.openArea();
      } else {
        error.textContent = t("parent.gateWrong");
        input.value = "";
        input.focus();
      }
    });
    form.querySelector("button.secondary")?.addEventListener("click", () => this.gate.close());

    this.gate.replaceChildren(el("h2", { id: "gate-heading" }, t("parent.gateHeading")), form);
    this.gate.showModal();
    input.focus();
  }

  private openArea(): void {
    this.renderArea();
    this.area.showModal();
  }

  private renderArea(): void {
    const progress = this.progress.current;
    const objectives = Object.values(progress.objectives);

    const summary = objectives.length
      ? el(
          "ul",
          {},
          ...objectives.map((m) =>
            el(
              "li",
              {},
              t("parent.objectiveRow", {
                standard: OBJECTIVES[m.objectiveId].standard,
                independent: m.independentSuccesses,
                supported: m.supportedSuccesses,
              }),
            ),
          ),
        )
      : el("p", {}, t("parent.noProgress"));

    const completed = this.quests.filter((q) => progress.completedQuestIds.includes(q.id));
    const completedList = completed.length
      ? el("ul", {}, ...completed.map((q) => el("li", {}, `${t(q.titleKey)} — ${t("ui.completed")}`)))
      : null;

    const status = el("p", { role: "status" });
    const erase = el("button", { type: "button", className: "danger", "data-testid": "erase" }, t("parent.erase"));
    let confirming = false;
    erase.addEventListener("click", async () => {
      if (!confirming) {
        confirming = true;
        erase.textContent = t("parent.eraseConfirm");
        return;
      }
      await this.progress.reset();
      this.renderArea();
      this.area.querySelector<HTMLElement>("[role=status]")!.textContent = t("parent.erased");
    });

    const close = el("button", { type: "button", className: "secondary" }, t("ui.close"));
    close.addEventListener("click", () => this.area.close());

    this.area.replaceChildren(
      el("h2", { id: "parent-heading" }, t("parent.heading")),
      el("h3", {}, t("parent.privacyHeading")),
      el("p", {}, t("parent.privacy")),
      el("h3", {}, t("parent.progressHeading")),
      summary,
      completedList ?? "",
      el("div", { className: "dialog-actions" }, erase, close),
      status,
    );
  }
}
