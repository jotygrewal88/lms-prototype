// Passwordless Login Prototype — shared 6-digit PIN validation
// Used by both the first-time setup page and the change-PIN modal.

export function isSequentialPin(pin: string): boolean {
  let ascending = true;
  let descending = true;
  for (let i = 1; i < pin.length; i++) {
    const diff = pin.charCodeAt(i) - pin.charCodeAt(i - 1);
    if (diff !== 1) ascending = false;
    if (diff !== -1) descending = false;
  }
  return ascending || descending;
}

export function isRepeatingPin(pin: string): boolean {
  return pin.length > 0 && pin.split("").every((d) => d === pin[0]);
}

// Returns an error message, or null if the new PIN is valid.
export function validateNewPin(pin: string, confirm: string): string | null {
  if (!/^\d{6}$/.test(pin)) {
    return "Your PIN must be exactly 6 digits.";
  }
  if (isRepeatingPin(pin)) {
    return "Choose a PIN that isn't all the same digit (like 111111).";
  }
  if (isSequentialPin(pin)) {
    return "Choose a PIN that isn't sequential (like 123456).";
  }
  if (pin !== confirm) {
    return "Those PINs don't match. Try again.";
  }
  return null;
}
