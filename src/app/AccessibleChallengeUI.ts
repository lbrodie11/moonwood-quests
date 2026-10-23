import type { ChallengePresentation, GameBridge, GameEventMap } from "../game/bridge";
import { t } from "../i18n";
import { clear, el } from "./dom";

/**
 * Semantic, keyboard- and screen-reader-operable mirror of the challenge on
 * the canvas. Answer buttons live here (not only in the canvas) so every child
 * can operate them by touch, pointer, keyboard or switch access.
 */
export class AccessibleChallengeUI {
  readonly root: HTMLElement;
  private readonly title = el("h2", { id: "quest-title" });
  private readonly intro = el("p", { className: "quest-intro", "data-testid": "quest-intro" });
  private readonly progress = el("p", { className: "quest-progress", "data-testid": "progress" });
  private readonly pips = el("div", { className: "rune-pips", "aria-hidden": "true" });
  private readonly hintButton = el("button", {
    type: "button",
    className: "tool subtle hint-button",
    "data-testid": "ask-hint",
  });
  private readonly backButton = el("button", {
    type: "button",
    className: "tool subtle",
    "data-testid": "leave-quest",
  });
  private readonly prompt = el("p", { id: "challenge-prompt", className: "challenge-prompt" });
  private readonly assessmentBanner = el("p", {
    className: "assessment-banner",
    "data-testid": "assessment-banner",
    hidden: true,
  });
  private readonly passageBox = el("div", {
    className: "story-passage-box",
    "data-testid": "story-passage",
    hidden: true,
  });
  private readonly tileTray = el("div", {
    className: "interactive-tile-tray",
    "data-testid": "interactive-tiles",
    hidden: true,
  });
  private readonly equation = el("p", { className: "challenge-equation", "data-testid": "equation" });
  private readonly choices = el("div", { className: "choices", role: "group", "aria-labelledby": "challenge-prompt" });
  private readonly reflectionTray = el("div", {
    className: "strategy-reflection-tray",
    "data-testid": "strategy-reflection",
    hidden: true,
  });
  private readonly parentGuideTip = el("p", {
    className: "parent-guide-tip",
    "data-testid": "parent-guide-tip",
    hidden: true,
  });
  private readonly feedback = el("p", {
    className: "feedback",
    role: "status",
    "aria-live": "polite",
    tabIndex: -1,
    "data-testid": "feedback",
  });

  private current: ChallengePresentation | null = null;
  private questTitleKey = "";
  private questIntroKey = "";
  private shouldFocusFirstChoice = false;
  private currentModality: "independent-reading" | "listening" = "independent-reading";

  constructor(
    private readonly bridge: GameBridge,
    private readonly onPrompt: (text: string) => void,
  ) {
    this.hintButton.addEventListener("click", () => {
      if (this.current && !this.current.isAssessment) {
        this.bridge.emit("requestHint", { challengeId: this.current.challengeId });
      }
    });
    this.backButton.addEventListener("click", () => {
      this.bridge.emit("returnToMap", {});
    });
    this.root = el(
      "section",
      { className: "challenge-panel", "aria-labelledby": "quest-title", "data-testid": "challenge-panel" },
      el("header", { className: "challenge-header" }, this.title, this.progress, this.pips, this.hintButton, this.backButton),
      this.intro,
      this.assessmentBanner,
      this.passageBox,
      this.prompt,
      this.tileTray,
      this.equation,
      this.choices,
      this.feedback,
      this.reflectionTray,
      this.parentGuideTip,
    );
  }

  setQuest(titleKey: string, introKey = ""): void {
    this.questTitleKey = titleKey;
    this.questIntroKey = introKey;
    this.title.textContent = t(titleKey);
    this.intro.textContent = introKey ? t(introKey) : "";
    this.shouldFocusFirstChoice = false;
  }

  show(challenge: ChallengePresentation): void {
    const focusWasInside = this.root.contains(document.activeElement) || this.shouldFocusFirstChoice;
    this.current = challenge;
    this.currentModality = "independent-reading";
    this.feedback.textContent = "";
    this.feedback.dataset.kind = "";
    this.renderText();
    this.renderDomainExtras();
    this.renderChoices();
    if (focusWasInside || challenge.index > 1) {
      this.choices.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus();
      this.shouldFocusFirstChoice = false;
    }
    this.onPrompt(this.promptText());
  }

  handleFeedback(feedback: GameEventMap["feedback"]): void {
    if (feedback.kind === "correct") {
      const focusWasInChoices = this.choices.contains(document.activeElement);
      this.feedback.dataset.kind = "correct";
      this.feedback.textContent = t("feedback.correct");
      for (const b of this.choices.querySelectorAll("button")) b.disabled = true;
      if (focusWasInChoices || document.activeElement === document.body) {
        this.shouldFocusFirstChoice = true;
        this.feedback.focus();
      }
      return;
    }

    let button: HTMLButtonElement | null = null;
    if (feedback.ruledOut !== undefined) {
      button = this.choices.querySelector<HTMLButtonElement>(`button[data-value="${feedback.ruledOut}"]`);
      if (button) {
        button.disabled = true;
        button.classList.add("ruled-out");
      }
    }

    const answerLabel = this.choiceLabel(this.current?.correctAnswer ?? 0);
    if (feedback.hintLevel === 3 && this.current) {
      const rightButton = this.choices.querySelector<HTMLButtonElement>(
        `button[data-value="${this.current.correctAnswer}"]`,
      );
      rightButton?.classList.add("guided-choice");
    }

    this.feedback.dataset.kind = "hint";
    const hintText = this.formatObjectiveHint(feedback.hintLevel, answerLabel);

    if (feedback.ruledOut !== undefined) {
      const ruledOutLabel = this.choiceLabel(feedback.ruledOut);
      this.feedback.textContent = `${t("feedback.notThat", { value: ruledOutLabel })} ${hintText}`;
    } else {
      this.feedback.textContent = hintText;
    }

    // Keep keyboard focus on a usable button.
    if (document.activeElement === button || document.activeElement === document.body) {
      this.choices.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus();
    }
  }

  /** Re-render after a language change. */
  refresh(): void {
    if (this.questTitleKey) this.title.textContent = t(this.questTitleKey);
    if (this.questIntroKey) this.intro.textContent = t(this.questIntroKey);
    if (this.current) {
      this.renderText();
      this.renderDomainExtras();
      this.renderChoices();
    }
  }

  promptText(): string {
    const c = this.current;
    if (!c) return "";
    if (c.operator === "phonics") {
      const [wordId = 1] = c.operands;
      return t(c.promptKey, {
        icon: t(`challenge.phonics.word.${wordId}.icon`),
        sounds: t(`challenge.phonics.word.${wordId}.sounds`),
        clue: t(`challenge.phonics.word.${wordId}.clue`),
        sentence: t(`challenge.phonics.word.${wordId}.sentence`),
      });
    }
    if (c.operator === "pattern") {
      const [a = 0, b = 0, third = 0, step = 1] = c.operands;
      return t(c.promptKey, { a, b, c: third, step });
    }
    const [a = 0, b = 0] = c.operands;
    return t(c.promptKey, { a, b });
  }

  private formatObjectiveHint(level: 1 | 2 | 3, answerLabel: string): string {
    const c = this.current;
    if (!c) {
      return level === 3 ? t("feedback.hint3", { answer: answerLabel }) : t(`feedback.hint${level}`);
    }
    const [a = 0, b = 0, third = 0, step = 1] = c.operands;
    const sounds = c.operator === "phonics" ? t(`challenge.phonics.word.${a || 1}.sounds`) : "";
    return t(`feedback.byObjective.${c.objectiveId}.hint${level}`, {
      a,
      b,
      c: third,
      step,
      tensValue: a * 10,
      sounds,
      answer: answerLabel,
    });
  }

  private choiceLabel(value: number): string {
    const c = this.current;
    if (c?.choiceKeyPrefix) {
      return t(`${c.choiceKeyPrefix}.${value}.label`);
    }
    return String(value);
  }

  private renderText(): void {
    const c = this.current;
    if (!c) return;
    const [a = 0, b = 0] = c.operands;
    this.prompt.textContent = this.promptText();

    if (c.operator === "tens-ones") {
      this.equation.textContent = t("challenge.placeValue.equation", { a, b });
    } else if (c.operator === "unknown-equation") {
      const [, , structureCode = 1] = c.operands;
      const eqKey =
        structureCode === 2
          ? "challenge.unknownEquation.equationFirst"
          : structureCode === 3
            ? "challenge.unknownEquation.equationSub"
            : structureCode === 4
              ? "challenge.unknownEquation.equationRev"
              : "challenge.unknownEquation.equationSecond";
      this.equation.textContent = t(eqKey, { a, b });
    } else if (c.operator === "length") {
      const eqKey = c.promptKey.includes("missing")
        ? "challenge.length.missingEquation"
        : "challenge.length.joinEquation";
      this.equation.textContent = t(eqKey, { a, b });
    } else if (c.operator === "shapes") {
      this.equation.textContent = t("challenge.shapes.equation", { a, b });
    } else if (c.operator === "pattern") {
      const [, , third = 0] = c.operands;
      this.equation.textContent = t("challenge.pattern.equation", { a, b, c: third });
    } else if (c.operator === "phonics") {
      const [wordId = 1] = c.operands;
      this.equation.textContent = t("challenge.phonics.equation", {
        icon: t(`challenge.phonics.word.${wordId}.icon`),
      });
    } else if (
      c.operator === "comprehension" ||
      c.operator === "vocabulary" ||
      c.operator === "spelling" ||
      c.operator === "reasoning" ||
      c.operator === "science" ||
      c.operator === "workshop"
    ) {
      const std = c.meta?.standardCode ?? "✦";
      this.equation.textContent = `✦ ${std}`;
    } else {
      this.equation.textContent = `${a} ${c.operator} ${b} = ?`;
    }

    this.progress.textContent = t("ui.progress", { current: c.index, total: c.total });
    this.hintButton.hidden = Boolean(c.isAssessment);
    clear(this.hintButton);
    this.hintButton.append(
      el("span", { "aria-hidden": "true", className: "tool-icon" }, "💡"),
      el("span", {}, t("ui.askHint")),
    );
    clear(this.backButton);
    this.backButton.append(
      el("span", { "aria-hidden": "true", className: "tool-icon" }, "🗺️"),
      el("span", {}, t("ui.backToMap")),
    );

    clear(this.pips);
    for (let i = 1; i <= c.total; i++) {
      this.pips.append(el("span", { className: i < c.index ? "pip lit" : i === c.index ? "pip current" : "pip" }));
    }
  }

  private renderDomainExtras(): void {
    const c = this.current;
    if (!c) return;

    // 1. Assessment mode banner (hints disabled)
    if (c.isAssessment) {
      this.assessmentBanner.hidden = false;
      this.assessmentBanner.textContent = `⭐ ${t("ui.assessmentBanner")}`;
    } else {
      this.assessmentBanner.hidden = true;
      this.assessmentBanner.textContent = "";
    }

    // 2. Story passage & Reading vs. Listening modality controls
    clear(this.passageBox);
    if (c.meta?.passageKey) {
      this.passageBox.hidden = false;
      const passageText = t(c.meta.passageKey);
      const readBtn = el(
        "button",
        {
          type: "button",
          className:
            this.currentModality === "independent-reading"
              ? "tool subtle modality-active"
              : "tool subtle",
          "data-testid": "read-myself-btn",
        },
        `📖 ${t("ui.readMyself")}`,
      );
      const listenBtn = el(
        "button",
        {
          type: "button",
          className:
            this.currentModality === "listening" ? "tool subtle modality-active" : "tool subtle",
          "data-testid": "listen-story-btn",
        },
        `🔊 ${t("ui.listenStory")}`,
      );

      readBtn.addEventListener("click", () => {
        this.currentModality = "independent-reading";
        this.bridge.emit("setModality", {
          challengeId: c.challengeId,
          modality: "independent-reading",
        });
        readBtn.className = "tool subtle modality-active";
        listenBtn.className = "tool subtle";
      });
      listenBtn.addEventListener("click", () => {
        this.currentModality = "listening";
        this.bridge.emit("setModality", {
          challengeId: c.challengeId,
          modality: "listening",
        });
        listenBtn.className = "tool subtle modality-active";
        readBtn.className = "tool subtle";
        this.onPrompt(`${passageText} ${this.promptText()}`);
      });

      this.passageBox.append(
        el("p", { className: "passage-text", "data-testid": "passage-text" }, passageText),
        el("div", { className: "modality-actions" }, readBtn, listenBtn),
      );
    } else {
      this.passageBox.hidden = true;
    }

    // 3. Interactive letter/word/workshop tiles
    clear(this.tileTray);
    if (c.meta?.interactiveTiles?.length) {
      this.tileTray.hidden = false;
      for (const tileLabel of c.meta.interactiveTiles) {
        const tileBtn = el(
          "button",
          {
            type: "button",
            className: "tool subtle interactive-tile",
          },
          `🔹 ${tileLabel}`,
        );
        tileBtn.addEventListener("click", () => {
          tileBtn.classList.toggle("tile-selected");
        });
        this.tileTray.append(tileBtn);
      }
    } else {
      this.tileTray.hidden = true;
    }

    // 4. Non-graded strategy reflection cards
    clear(this.reflectionTray);
    if (c.meta?.reflectionPromptKey) {
      this.reflectionTray.hidden = false;
      const reflectionStatus = el("p", {
        className: "reflection-thanks",
        "data-testid": "reflection-thanks",
      });
      const cardKeys = [
        "workshop.reflection.cardCountOn",
        "workshop.reflection.cardMakeTen",
        "workshop.reflection.cardVisual",
        "workshop.reflection.cardTalked",
      ] as const;
      const cardRow = el(
        "div",
        { className: "reflection-cards" },
        ...cardKeys.map((key) => {
          const btn = el(
            "button",
            {
              type: "button",
              className: "tool subtle reflection-card",
            },
            `💭 ${t(key)}`,
          );
          btn.addEventListener("click", () => {
            reflectionStatus.textContent = t("workshop.reflection.thankYou");
          });
          return btn;
        }),
      );
      this.reflectionTray.append(
        el("p", { className: "reflection-heading" }, `🧭 ${t(c.meta.reflectionPromptKey)}`),
        cardRow,
        reflectionStatus,
      );
    } else {
      this.reflectionTray.hidden = true;
    }

    // 5. Grown-up / companion guidance tip
    if (c.meta?.parentGuideKey) {
      this.parentGuideTip.hidden = false;
      this.parentGuideTip.textContent = `💡 ${t(c.meta.parentGuideKey)}`;
    } else {
      this.parentGuideTip.hidden = true;
      this.parentGuideTip.textContent = "";
    }
  }

  private renderChoices(): void {
    const c = this.current;
    if (!c) return;
    clear(this.choices);
    for (const value of c.choices) {
      const label = this.choiceLabel(value);
      const button = el(
        "button",
        {
          type: "button",
          className: c.choiceKeyPrefix ? "choice word-choice" : "choice",
          "data-value": value,
        },
        label,
      );
      button.addEventListener("click", () => this.bridge.emit("answer", { challengeId: c.challengeId, value }));
      this.choices.append(button);
    }
  }
}
