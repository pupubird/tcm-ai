// Phone number whitelist validation (E.164 format)

export class Whitelist {
  private numbers: Set<string>;
  private enabled: boolean;

  constructor(whitelistStr: string = '') {
    this.numbers = new Set();
    this.enabled = false;

    if (whitelistStr && whitelistStr.trim()) {
      const entries = whitelistStr.split(',').map(n => n.trim()).filter(Boolean);

      for (const entry of entries) {
        if (this.isValidE164(entry)) {
          this.numbers.add(entry);
        } else {
          console.warn(`Invalid whitelist entry: ${entry} (must use E.164 format like +60123456789)`);
        }
      }

      this.enabled = this.numbers.size > 0;

      if (this.enabled) {
        console.log(`Whitelist enabled with ${this.numbers.size} number(s)`);
      }
    } else {
      console.log('Whitelist disabled - accepting messages from all numbers');
    }
  }

  isValidE164(phone: string): boolean {
    // E.164 format: +[country code][number] (max 15 digits)
    return /^\+[1-9]\d{1,14}$/.test(phone);
  }

  isAllowed(phone: string): boolean {
    if (!this.enabled) return true;
    return this.numbers.has(phone);
  }

  getNumbers(): string[] {
    return Array.from(this.numbers);
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}
