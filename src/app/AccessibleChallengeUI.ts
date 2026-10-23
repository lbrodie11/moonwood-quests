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
  private readonly equation = el("p", { className: "challenge-equation", "data-testid": "equation" });
  private readonly choices = el("div", { className: "choices", role: "group", "aria-labelledby": "challenge-prompt" });
  private readonly feedback = el("p", {
    className: "feedback",
    role: "status",
    "aria-live": "polite",
    "data-testid": "feedback",
  });

  private current: ChallengePresentation | null = null;
  private questTitleKey = "";
  private questIntroKey = "";

  constructor(
    private readonly bridge: GameBridge,
    private readonly onPrompt: (text: string) => void,
  ) {
    this.hintButton.addEventListener("click", () => {
      if (this.current) {
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
      this.prompt,
      this.equation,
      this.choices,
      this.feedback,
    );
  }

  setQuest(titleKey: string, introKey = ""): void {
    this.questTitleKey = titleKey;
    this.questIntroKey = introKey;
    this.title.textContent = t(titleKey);
    this.intro.textContent = introKey ? t(introKey) : "";
    this.intro.hidden = !introKey;
  }

  show(challenge: ChallengePresentation): void {
    const keyboardUser = this.root.contains(document.activeElement);
    this.current = challenge;
    this.feedback.textContent = "";
    delete this.feedback.dataset.kind;
    this.renderText();
    this.renderChoices();
    this.onPrompt(this.promptText());
    if (keyboardUser) this.choices.querySelector("button")?.focus();
  }

  handleFeedback(feedback: GameEventMap["feedback"]): void {
    if (feedback.kind === "correct") {
      this.feedback.textContent = t("feedback.correct");
      this.feedback.dataset.kind = "correct";
      for (const button of this.choices.querySelectorAll("button")) button.disabled = true;
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
    const hintText =
      feedback.hintLevel === 3
        ? t("feedback.hint3", { answer: answerLabel })
        : t(`feedback.hint${feedback.hintLevel}`);

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
      this.renderChoices();
    }
  }

  promptText(): string {
    const c = this.current;
    if (!c) return "";
    if (c.operator === "phonics") {
      const [wordId = 1] = c.operands;
      return t(c.promptKey, {
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
        sounds: t(`challenge.phonics.word.${wordId}.sounds`),
      });
    } else {
      this.equation.textContent = `${a} ${c.operator} ${b} = ?`;
    }

    this.progress.textContent = t("ui.progress", { current: c.index, total: c.total });
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
