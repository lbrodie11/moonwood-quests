import { SANCTUARY_ACTIVITIES } from "../content";
import type { QuestDefinition } from "../content/schemas";
import { currentLanguage, t } from "../i18n";
import { buildParentRecommendations } from "../learning/adaptation/spacedReview";
import { evaluateSkillEvidence } from "../learning/assessment/evidence";
import { OBJECTIVE_IDS, OBJECTIVES } from "../learning/objectives";
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
    const locale = currentLanguage();
    const objectives = Object.values(progress.objectives);

    const evaluations = OBJECTIVE_IDS.map((skillId) => {
      const legacyObj = progress.objectives[skillId];
      const legacyAttempts = progress.legacyMigratedFromV1 ? (legacyObj?.attempts ?? 0) : 0;
      return evaluateSkillEvidence(skillId, progress.evidenceLog ?? [], {
        locale,
        legacyAttempts,
      });
    });

    const activeEvaluations = evaluations.filter(
      (ev) => ev.totalCompletedAttempts > 0 || ev.classification === "legacy-unverified",
    );

    const summary = objectives.length
      ? el(
          "ul",
          { "data-testid": "parent-objective-list" },
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

    const evidenceSection = activeEvaluations.length
      ? el(
          "ul",
          { className: "evidence-list", "data-testid": "parent-evidence-summary" },
          ...activeEvaluations.map((ev) => {
            const obj = OBJECTIVES[ev.skillId];
            return el(
              "li",
              {},
              t("parent.evidenceSummaryRow", {
                standard: obj.standard,
                ncStandard: obj.ncStandard,
                stage: ev.currentStage,
                status: ev.classification,
                sampleNote: ev.sampleSizeWarning,
              }),
            );
          }),
        )
      : null;

    const readingEv = evaluations.find((ev) => ev.skillId === "reading-comprehension");
    const readingModalityNote =
      readingEv && (readingEv.independentReadingCount > 0 || readingEv.listeningOnlyCount > 0)
        ? el(
            "p",
            { className: "modality-note", "data-testid": "reading-modality-note" },
            t("parent.readingModalityNote", {
              independentRead: readingEv.independentReadingCount,
              listened: readingEv.listeningOnlyCount,
            }),
          )
        : null;

    const legacyNote = progress.legacyMigratedFromV1
      ? el(
          "p",
          { className: "legacy-note", "data-testid": "legacy-migration-note" },
          t("parent.legacyMigrationNote"),
        )
      : null;

    const recommendations = buildParentRecommendations(evaluations);
    const recommendationsList = el(
      "ul",
      { className: "recommendations-list", "data-testid": "parent-recommendations" },
      ...recommendations.map((rec) =>
        el(
          "li",
          {},
          `${OBJECTIVES[rec.skillId].standard} — ${t(rec.reasonKey)} ${t(rec.activityKey)}`,
        ),
      ),
    );

    const allActivities = [...this.quests, ...SANCTUARY_ACTIVITIES];
    const completed = allActivities.filter((q) => progress.completedQuestIds.includes(q.id));
    const completedList = completed.length
      ? el("ul", {}, ...completed.map((q) => el("li", {}, `${t(q.titleKey)} — ${t("ui.completed")}`)))
      : null;

    const status = el("p", { role: "status", "data-testid": "parent-status" });

    const exportBtn = el(
      "button",
      { type: "button", className: "secondary", "data-testid": "export-learning-report" },
      t("parent.exportJson"),
    );
    exportBtn.addEventListener("click", () => {
      const report = {
        privacyNotice: "Local-only academic progress report. Contains no child PII.",
        schemaVersion: progress.schemaVersion,
        legacyMigratedFromV1: progress.legacyMigratedFromV1 ?? false,
        completedQuestIds: progress.completedQuestIds,
        objectives: progress.objectives,
        evidenceEvaluations: activeEvaluations,
        recommendations: recommendations.map((r) => ({
          skillId: r.skillId,
          standard: OBJECTIVES[r.skillId].standard,
          activity: t(r.activityKey),
        })),
      };
      const serialized = JSON.stringify(report, null, 2);
      status.dataset.exportPayload = serialized;
      try {
        const blob = new Blob([serialized], { type: "application/json" });
        const objectUrl = URL.createObjectURL(blob);
        const downloadLink = el("a", {
          href: objectUrl,
          download: "moonwood-learning-report.json",
        });
        downloadLink.style.display = "none";
        document.body.appendChild(downloadLink);
        downloadLink.click();
        downloadLink.remove();
        setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      } catch {
        // Fallback when Blob/createObjectURL is unavailable in restricted environments
      }
      status.textContent = t("parent.exported");
    });

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
      evidenceSection ?? "",
      readingModalityNote ?? "",
      legacyNote ?? "",
      completedList ?? "",
      el("h3", {}, t("parent.confidenceHeading")),
      el("p", { "data-testid": "parent-confidence-note" }, t("parent.confidenceBody")),
      el("h3", {}, t("parent.recommendationsHeading")),
      recommendationsList,
      el("div", { className: "dialog-actions" }, exportBtn, erase, close),
      status,
    );
  }
}
