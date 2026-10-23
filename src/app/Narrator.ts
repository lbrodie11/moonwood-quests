/**
 * Reads prompts aloud for pre-readers using the browser's speech synthesis.
 *
 * Privacy: some browsers offer network-backed voices that send text to a
 * remote service. We only use voices marked `localService`, so prompts never
 * leave the device. If no local voice exists for the language, narration is
 * simply unavailable (the "Hear it again" button hides).
 */
export class Narrator {
  private readonly synth: SpeechSynthesis | null =
    typeof speechSynthesis === "undefined" ? null : speechSynthesis;
  private lastText = "";
  private lastLang = "";

  constructor(private readonly enabled: () => boolean) {
    // Voices load asynchronously in some browsers.
    this.synth?.addEventListener?.("voiceschanged", () => this.onVoicesChanged?.());
  }

  onVoicesChanged?: () => void;

  canSpeak(lang: string): boolean {
    return this.voiceFor(lang) !== null;
  }

  say(text: string, lang: string): void {
    this.lastText = text;
    this.lastLang = lang;
    if (this.enabled()) this.speak(text, lang);
  }

  repeat(): void {
    if (this.lastText) this.speak(this.lastText, this.lastLang);
  }

  stop(): void {
    this.synth?.cancel();
  }

  private speak(text: string, lang: string): void {
    const voice = this.voiceFor(lang);
    if (!this.synth || !voice) return;
    this.synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice;
    utterance.lang = voice.lang;
    utterance.rate = 0.9; // a little slower for young listeners
    this.synth.speak(utterance);
  }

  private voiceFor(lang: string): SpeechSynthesisVoice | null {
    const voices = this.synth?.getVoices().filter((v) => v.localService) ?? [];
    const prefix = lang.slice(0, 2).toLowerCase();
    return (
      voices.find((v) => v.lang.toLowerCase() === lang.toLowerCase()) ??
      voices.find((v) => v.lang.toLowerCase().startsWith(prefix)) ??
      null
    );
  }
}
