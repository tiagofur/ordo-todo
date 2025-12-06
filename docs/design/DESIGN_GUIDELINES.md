# Design Guidelines

**Core Principle**: Solid, Flat, and Vibrant Colors.

## 🚫 DO NOT USE
- **Transparencies**: Avoid `opacity`, `bg-opacity`, or colors with alpha channel (e.g., `bg-blue-500/10`). Use solid lighter shades instead (e.g., `bg-blue-50`).
- **Gradients**: Do not use background gradients. Use solid background colors.
- **Blur Effects**: Avoid `backdrop-blur` or glassmorphism effects.

## ✅ USE
- **Solid Colors**: Use the full range of Tailwind colors but always solid.
- **Flat Design**: Clean lines, solid borders, solid backgrounds.
- **Vibrant Colors**: Use vibrant colors for accents, badges, and important elements.
- **Shadows**: Subtle shadows are allowed for depth (cards, dropdowns), but keep them clean.

## Component Specifics

### Cards
- Background: Solid (e.g., `bg-card` or `bg-white` / `bg-zinc-900`).
- Border: Solid, subtle (e.g., `border-border` or `border-zinc-200`).
- Hover: Solid color change (e.g., `hover:bg-accent`).

### Badges / Tags
- Instead of `bg-blue-500/10 text-blue-500`, use:
  - Light mode: `bg-blue-100 text-blue-700` (Solid light background).
  - Dark mode: `bg-blue-900 text-blue-100` (Solid dark background).

### Icons
- Use solid colors for icons.
- Avoid icon containers with transparent backgrounds. Use solid circles/squares.
