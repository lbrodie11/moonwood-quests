import { emptyProgress, type PlayerProgress, type ProgressRepository } from "./ProgressRepository";

type Listener = (progress: PlayerProgress) => void;

/**
 * In-memory source of truth for progress, shared by the DOM shell and the
 * Phaser scenes. Every update is persisted through the repository.
 */
export class ProgressStore {
  private progress: PlayerProgress;
  private readonly listeners = new Set<Listener>();

  private constructor(
    private readonly repository: ProgressRepository,
    initial: PlayerProgress,
    private readonly firstQuestId: string,
  ) {
    this.progress = initial;
  }

  static async open(repository: ProgressRepository, firstQuestId: string): Promise<ProgressStore> {
    const saved = await repository.load();
    return new ProgressStore(repository, saved ?? emptyProgress(firstQuestId), firstQuestId);
  }

  get current(): PlayerProgress {
    return this.progress;
  }

  async update(change: (progress: PlayerProgress) => PlayerProgress): Promise<void> {
    this.progress = change(this.progress);
    await this.repository.save(this.progress);
    this.notify();
  }

  async reset(): Promise<void> {
    await this.repository.clear();
    this.progress = emptyProgress(this.firstQuestId);
    this.notify();
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    for (const listener of this.listeners) listener(this.progress);
  }
}
