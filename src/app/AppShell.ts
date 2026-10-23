import { FINAL_QUEST_ID, REGIONS } from "../content";
import { isPlayable, questAvailability, type QuestAvailability } from "../content/availability";
import type { GuideId, QuestDefinition } from "../content/schemas";
import type { GameBridge, GameEventMap, Screen } from "../game/bridge";
import { currentLanguage, setLanguage, t } from "../i18n";
import type { ProgressStore } from "../storage/ProgressStore";
import { AccessibleChallengeUI } from "./AccessibleChallengeUI";
import { clear, el, requireElement } from "./dom";
import { Narrator } from "./Narrator";
import { ParentGate } from "./ParentGate";
import type { Settings, SettingsRepository } from "./settings";
import { SettingsPanel } from "./SettingsPanel";

interface ShellDeps {
  bridge: GameBridge;
  progress: ProgressStore;
  quests: readonly QuestDefinition[];
  settingsRepository: SettingsRepository;
  getSettings: () => Settings;
  setSettings: (next: Settings) => void;
}

const STATUS_KEY: Record<QuestAvailability, string> = {
  available: "ui.play",
  completed: "ui.completed",
  locked: "ui.locked",
  planned: "ui.comingSoon",
};

const REGION_TITLE_KEY: Record<string, string> = {
  "whispering-woods": "region.whisperingWoods.title",
  "crystal-caves": "region.crystalCaves.title",
  "enchanted-library": "region.enchantedLibrary.title",
  "starfall-tower": "region.starfallTower.title",
};

/**
 * The DOM half of the app: toolbar, story & adventure flow, world exploration
 * controls, quest list, accessible challenge controls, completion screen,
 * grand ending celebration, and dialogs. Talks to Phaser only via the bridge.
 */
export class AppShell {
  private readonly toolbar = requireElement<HTMLElement>("#toolbar");
  private readonly panel = requireElement<HTMLElement>("#panel");
  private readonly title = requireElement<HTMLElement>("#app-title");
  private readonly canvasRegion = requireElement<HTMLElement>("#game-root");

  private readonly narrator: Narrator;
  private readonly challengeUI: AccessibleChallengeUI;
  private readonly settingsPanel: SettingsPanel;
  private readonly parentGate: ParentGate;

  private readonly hearButton = el("button", { type: "button", className: "tool", "data-testid": "hear-again" });
  private readonly settingsButton = el("button", { type: "button", className: "tool", "data-testid": "open-settings" });
  private readonly grownUpsButton = el("button", {
    type: "button",
    className: "tool subtle",
    "data-testid": "open-grown-ups",
  });

  private screen: Screen = "loading";
  private completedQuestId = "";
  private mapDialogueText = "";
  private activeQuestId = "";

  constructor(private readonly deps: ShellDeps) {
    this.narrator = new Narrator(() => deps.getSettings().narration);
    this.narrator.onVoicesChanged = () => this.renderToolbar();
    this.challengeUI = new AccessibleChallengeUI(deps.bridge, (text) => this.narrator.say(text, currentLanguage()));
    this.settingsPanel = new SettingsPanel(deps.getSettings, (next) => void this.applySettings(next));
    this.parentGate = new ParentGate(deps.progress, deps.quests);
  }

  mount(): void {
    const syncModalState = (): void => {
      const open =
        this.settingsPanel.dialog.open || this.parentGate.gate.open || this.parentGate.area.open;
      this.deps.bridge.emit("modalState", { open });
    };

    this.hearButton.addEventListener("click", () => this.narrator.repeat());
    this.settingsButton.addEventListener("click", () => {
      this.settingsPanel.open();
      syncModalState();
    });
    this.grownUpsButton.addEventListener("click", () => {
      this.parentGate.open();
      syncModalState();
    });

    for (const dialog of [this.settingsPanel.dialog, this.parentGate.gate, this.parentGate.area]) {
      dialog.addEventListener("close", syncModalState);
    }

    this.toolbar.append(this.hearButton, this.settingsButton, this.grownUpsButton);
    document.body.append(this.settingsPanel.dialog, this.parentGate.gate, this.parentGate.area);

    const { bridge } = this.deps;
    bridge.on("screen", ({ screen, questId }) => this.show(screen, questId));
    bridge.on("challenge", (challenge) => this.challengeUI.show(challenge));
    bridge.on("feedback", (feedback) => this.challengeUI.handleFeedback(feedback));
    bridge.on("questComplete", ({ questId }) => (this.completedQuestId = questId));
    bridge.on("mapDiscovery", (payload) => this.handleMapDiscovery(payload));
    this.deps.progress.subscribe(() => {
      if (this.screen === "map") this.updateMapInPlace();
    });

    this.render();
  }

  private show(screen: Screen, questId?: string): void {
    this.screen = screen;
    if (screen === "quest" && questId) {
      this.activeQuestId = questId;
      const quest = this.deps.quests.find((q) => q.id === questId);
      if (quest) this.challengeUI.setQuest(quest.titleKey, quest.introKey);
    }
    if (screen !== "quest") this.narrator.stop();
    this.render();
  }

  private handleMapDiscovery(payload: GameEventMap["mapDiscovery"]): void {
    if (payload.kind === "guide") {
      const name = t(`guide.${payload.guideId}.name`);
      const line = t(`guide.${payload.guideId}.greeting`);
      this.mapDialogueText = `${name}: "${line}"`;
    } else {
      const treasureName = t(payload.nameKey);
      this.mapDialogueText = t("feedback.treasureDiscovered", { name: treasureName });
    }
    this.narrator.say(this.mapDialogueText, currentLanguage());
    if (this.screen === "map") {
      const dialogueEl = this.panel.querySelector<HTMLElement>('[data-testid="map-dialogue"]');
      if (dialogueEl) dialogueEl.textContent = this.mapDialogueText;
    }
  }

  private render(): void {
    document.title = t("app.title");
    this.title.textContent = t("app.title");
    this.canvasRegion.setAttribute("aria-label", t("map.canvasLabel"));
    this.renderToolbar();
    this.panel.dataset.screen = this.screen;

    switch (this.screen) {
      case "loading":
        this.panel.replaceChildren(el("p", { className: "loading" }, t("app.loading")));
        break;
      case "map":
        this.panel.replaceChildren(this.renderMapPanel());
        break;
      case "quest":
        this.challengeUI.refresh();
        if (!this.panel.contains(this.challengeUI.root)) this.panel.replaceChildren(this.challengeUI.root);
        break;
      case "complete":
        this.panel.replaceChildren(this.renderComplete());
        this.panel.querySelector<HTMLButtonElement>("button")?.focus();
        break;
      case "ending":
        this.panel.replaceChildren(this.renderEnding());
        this.panel.querySelector<HTMLButtonElement>("button")?.focus();
        break;
    }
  }

  /**
   * Updates the map panel DOM in place when progress changes (e.g. discovering
   * a treasure or erasing progress in Grown-ups), preserving keyboard focus and
   * keeping the `aria-live="polite"` dialogue region intact.
   */
  private updateMapInPlace(): void {
    const storyBanner = this.panel.querySelector<HTMLElement>('[data-testid="story-banner"]');
    if (!storyBanner) {
      this.render();
      return;
    }

    const progress = this.deps.progress.current;
    const kingdomRestored = progress.completedQuestIds.includes(FINAL_QUEST_ID);
    const nextAvailableQuest =
      this.deps.quests.find((q) => questAvailability(q, progress) === "available") ?? this.deps.quests[0];

    const treasuresFound = REGIONS.filter((r) => progress.rewardIds.includes(r.treasureId)).length;
    const statsEl = this.panel.querySelector<HTMLElement>('[data-testid="story-stats"]');
    if (statsEl) {
      statsEl.textContent = t("ui.collectiblesCount", {
        found: treasuresFound,
        total: REGIONS.length,
        quests: progress.completedQuestIds.length,
        totalQuests: this.deps.quests.length,
      });
    }

    const storyTitleEl = storyBanner.querySelector<HTMLElement>(".story-title");
    const storyBodyEl = storyBanner.querySelector<HTMLElement>(".story-body");
    if (storyTitleEl) {
      storyTitleEl.textContent = t(kingdomRestored ? "story.restoredTitle" : "story.introTitle");
    }
    if (storyBodyEl) {
      storyBodyEl.textContent = t(kingdomRestored ? "story.restoredBody" : "story.introBody");
    }

    const continueBtn = this.panel.querySelector<HTMLButtonElement>('[data-testid="continue-adventure"]');
    if (continueBtn && nextAvailableQuest) {
      continueBtn.textContent =
        progress.completedQuestIds.length === 0
          ? t("ui.startAdventure", { title: t(nextAvailableQuest.titleKey) })
          : t("ui.continueAdventure", { title: t(nextAvailableQuest.titleKey) });
      continueBtn.dataset.targetQuest = nextAvailableQuest.id;
    }

    for (const region of REGIONS) {
      const btn = this.panel.querySelector<HTMLButtonElement>(`[data-testid="treasure-${region.id}"]`);
      if (btn) {
        const found = progress.rewardIds.includes(region.treasureId);
        const name = t(region.treasureNameKey);
        btn.className = found ? "tool subtle treasure-found" : "tool subtle";
        btn.textContent = found ? t("ui.treasureFound", { name }) : `✨ ${t("ui.findTreasure", { name })}`;
      }
    }

    for (const quest of this.deps.quests) {
      const card = this.panel.querySelector<HTMLButtonElement>(`[data-quest="${quest.id}"]`);
      if (card) {
        const state = questAvailability(quest, progress);
        card.className = `quest-card ${state}`;
        card.dataset.state = state;
        card.disabled = !isPlayable(state);
        const statusSpan = card.querySelector<HTMLElement>(".quest-status");
        if (statusSpan) statusSpan.textContent = t(STATUS_KEY[state]);
      }
    }
  }

  private renderToolbar(): void {
    const narrationAvailable = this.narrator.canSpeak(currentLanguage()) && this.deps.getSettings().narration;
    this.hearButton.hidden = !(this.screen === "quest" && narrationAvailable);
    setToolLabel(this.hearButton, "🔊", t("ui.hearAgain"));
    setToolLabel(this.settingsButton, "⚙️", t("ui.settings"));
    setToolLabel(this.grownUpsButton, "🔒", t("ui.grownUps"));
  }

  private renderMapPanel(): HTMLElement {
    const progress = this.deps.progress.current;
    const kingdomRestored = progress.completedQuestIds.includes(FINAL_QUEST_ID);
    const nextAvailableQuest =
      this.deps.quests.find((q) => questAvailability(q, progress) === "available") ?? this.deps.quests[0];

    const treasuresFound = REGIONS.filter((r) => progress.rewardIds.includes(r.treasureId)).length;
    const statsText = t("ui.collectiblesCount", {
      found: treasuresFound,
      total: REGIONS.length,
      quests: progress.completedQuestIds.length,
      totalQuests: this.deps.quests.length,
    });

    const continueLabel =
      progress.completedQuestIds.length === 0
        ? t("ui.startAdventure", { title: nextAvailableQuest ? t(nextAvailableQuest.titleKey) : "" })
        : t("ui.continueAdventure", { title: nextAvailableQuest ? t(nextAvailableQuest.titleKey) : "" });

    const continueBtn = el(
      "button",
      {
        type: "button",
        className: "primary",
        "data-testid": "continue-adventure",
        "data-target-quest": nextAvailableQuest?.id ?? "forest-gate",
      },
      continueLabel,
    );
    continueBtn.addEventListener("click", () => {
      const targetId = continueBtn.dataset.targetQuest ?? nextAvailableQuest?.id;
      if (targetId) this.deps.bridge.emit("startQuest", { questId: targetId });
    });

    const celebrateBtn = kingdomRestored
      ? el(
          "button",
          {
            type: "button",
            className: "primary celebrate-btn",
            "data-testid": "celebrate-kingdom",
          },
          `✨ ${t("ui.celebrateKingdom")}`,
        )
      : null;
    celebrateBtn?.addEventListener("click", () =>
      this.deps.bridge.emit("exploreMap", { target: "celebrate" }),
    );

    const storyBanner = el(
      "div",
      { className: "story-banner", "data-testid": "story-banner" },
      el(
        "div",
        { className: "story-copy" },
        el("p", { className: "story-title" }, t(kingdomRestored ? "story.restoredTitle" : "story.introTitle")),
        el("p", { className: "story-body" }, t(kingdomRestored ? "story.restoredBody" : "story.introBody")),
        el("p", { className: "story-stats", "data-testid": "story-stats" }, statsText),
      ),
      el("div", { className: "story-actions" }, continueBtn, celebrateBtn),
    );

    const dialogueText =
      this.mapDialogueText || `${t("guide.pip.name")}: "${t("guide.pip.greeting")}"`;
    const dialogueBox = el(
      "p",
      {
        className: "map-dialogue",
        role: "status",
        "aria-live": "polite",
        "data-testid": "map-dialogue",
      },
      dialogueText,
    );

    const guideButtons: GuideId[] = ["pip", "moss", "bramble", "luma", "astra"];
    const explorerButtons = el(
      "div",
      { className: "explorer-buttons" },
      ...guideButtons.map((guideId) => {
        const btn = el(
          "button",
          {
            type: "button",
            className: "tool subtle",
            "data-testid": `talk-${guideId}`,
          },
          `💬 ${t("ui.talkTo", { name: t(`guide.${guideId}.name`) })}`,
        );
        btn.addEventListener("click", () =>
          this.deps.bridge.emit("exploreMap", { target: "guide", guideId }),
        );
        return btn;
      }),
      ...REGIONS.map((region) => {
        const found = progress.rewardIds.includes(region.treasureId);
        const name = t(region.treasureNameKey);
        const btn = el(
          "button",
          {
            type: "button",
            className: found ? "tool subtle treasure-found" : "tool subtle",
            "data-testid": `treasure-${region.id}`,
          },
          found ? t("ui.treasureFound", { name }) : `✨ ${t("ui.findTreasure", { name })}`,
        );
        btn.addEventListener("click", () =>
          this.deps.bridge.emit("exploreMap", { target: "treasure", treasureId: region.treasureId }),
        );
        return btn;
      }),
    );

    const explorerBar = el(
      "div",
      { className: "explorer-bar", "data-testid": "explorer-bar" },
      el("p", { className: "hero-status" }, t("map.heroStatus")),
      dialogueBox,
      explorerButtons,
    );

    const list = el("ul", { className: "quest-list", role: "list" });
    for (const quest of this.deps.quests) {
      const state = questAvailability(quest, progress);
      const regionTitle = t(REGION_TITLE_KEY[quest.regionId] ?? "region.whisperingWoods.title");
      const emblem = el("img", {
        className: "quest-emblem",
        src: `/assets/emblems/${quest.regionId}.svg`,
        alt: "",
        width: 28,
        height: 28,
      });
      const button = el(
        "button",
        {
          type: "button",
          className: `quest-card ${state}`,
          "data-quest": quest.id,
          "data-region": quest.regionId,
          "data-state": state,
          disabled: !isPlayable(state),
        },
        el("span", { className: "quest-region-header" }, emblem, el("span", { className: "quest-region-tag" }, regionTitle)),
        el("span", { className: "quest-name" }, t(quest.titleKey)),
        el("span", { className: "quest-status" }, t(STATUS_KEY[state])),
      );
      button.addEventListener("click", () => this.deps.bridge.emit("startQuest", { questId: quest.id }));
      list.append(el("li", {}, button));
    }

    return el(
      "section",
      { "aria-labelledby": "map-heading" },
      storyBanner,
      el("h2", { id: "map-heading" }, t("map.heading")),
      list,
      explorerBar,
    );
  }

  private renderComplete(): HTMLElement {
    const progress = this.deps.progress.current;
    const targetQuestId = this.completedQuestId || this.activeQuestId;
    const quest = this.deps.quests.find((q) => q.id === targetQuestId);
    const back = el("button", { type: "button", className: "primary", "data-testid": "back-to-map" }, t("ui.backToMap"));
    back.addEventListener("click", () => this.deps.bridge.emit("returnToMap", {}));

    const nextUnlocked = this.deps.quests.find(
      (q) => q.id !== targetQuestId && questAvailability(q, progress) === "available",
    );
    const nextButton = nextUnlocked
      ? el(
          "button",
          { type: "button", className: "secondary", "data-testid": "next-quest" },
          t("ui.nextQuest", { title: t(nextUnlocked.titleKey) }),
        )
      : null;
    if (nextUnlocked && nextButton) {
      nextButton.addEventListener("click", () =>
        this.deps.bridge.emit("startQuest", { questId: nextUnlocked.id }),
      );
    }

    const isFinale = targetQuestId === FINAL_QUEST_ID || progress.completedQuestIds.includes(FINAL_QUEST_ID);
    const celebrateButton = isFinale
      ? el(
          "button",
          { type: "button", className: "primary celebrate-btn", "data-testid": "celebrate-kingdom" },
          `✨ ${t("ui.celebrateKingdom")}`,
        )
      : null;
    celebrateButton?.addEventListener("click", () =>
      this.deps.bridge.emit("exploreMap", { target: "celebrate" }),
    );

    const rewards = quest?.rewards ?? [];
    return el(
      "section",
      { className: "complete-panel", "aria-labelledby": "complete-heading", "data-testid": "quest-complete" },
      el("h2", { id: "complete-heading" }, t("quest.complete")),
      ...rewards.map((r) =>
        el("p", { className: "reward" }, t(`reward.earnedByKind.${r.kind}`, { name: t(r.nameKey) })),
      ),
      el("div", { className: "dialog-actions" }, back, nextButton, celebrateButton),
    );
  }

  private renderEnding(): HTMLElement {
    const back = el(
      "button",
      { type: "button", className: "primary", "data-testid": "ending-back-to-map" },
      t("story.endingReplay"),
    );
    back.addEventListener("click", () => this.deps.bridge.emit("returnToMap", {}));

    return el(
      "section",
      { className: "complete-panel ending-panel", "aria-labelledby": "ending-heading", "data-testid": "ending-panel" },
      el("h2", { id: "ending-heading" }, t("story.endingHeading")),
      el("p", { className: "reward" }, t("story.endingSubtitle")),
      el("p", {}, t("story.endingFriends")),
      back,
    );
  }

  private async applySettings(next: Settings): Promise<void> {
    const languageChanged = next.language !== this.deps.getSettings().language;
    this.deps.setSettings(next);
    this.deps.settingsRepository.save(next);
    if (languageChanged) await setLanguage(next.language);
    if (!next.narration) this.narrator.stop();
    this.deps.bridge.emit("settingsChanged", next);
    this.render();
  }
}

/** Icon + text, never icon alone. The emoji is decorative. */
function setToolLabel(button: HTMLButtonElement, icon: string, text: string): void {
  clear(button);
  button.append(el("span", { "aria-hidden": "true", className: "tool-icon" }, icon), el("span", {}, text));
}
