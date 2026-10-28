/**
 * The username hook returns English messages; map the ones the register form
 * can show to translated strings. Unknown messages pass through untouched.
 *
 * Note: matches on the hook's literal English output. If
 * `use-username-validation` rewords a message, add the new literal here.
 */
export function resolveValidationMessage(
  message: string | undefined,
  t: (key: string, values?: Record<string, string | number>) => string,
): string | undefined {
  if (!message) return message;
  if (message === 'Username is available!') return t('usernameAvailable');
  if (message === 'Username format is valid') return t('usernameFormatValid');
  if (message === 'Username is already taken') return t('usernameTaken');
  if (message === 'Username is required') return t('usernameMinLength', { min: 3 });
  if (message === 'Username can only contain lowercase letters, numbers, hyphens, and underscores')
    return t('usernameInvalidChars');
  if (message === 'Username cannot start with underscore or hyphen')
    return t('usernameInvalidStart');
  if (message === 'Username cannot end with underscore or hyphen')
    return t('usernameInvalidEnd');
  if (message === 'Username cannot contain consecutive hyphens or underscores')
    return t('usernameInvalidConsecutive');
  const minMatch = message.match(/^Username must be at least (\d+) characters$/);
  if (minMatch) return t('usernameMinLength', { min: minMatch[1] });
  const maxMatch = message.match(/^Username must be less than (\d+) characters$/);
  if (maxMatch) return t('usernameMaxLength', { max: maxMatch[1] });
  return message;
}
