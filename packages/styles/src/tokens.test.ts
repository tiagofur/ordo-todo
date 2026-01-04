/**
 * Comprehensive tests for @ordo-todo/styles design tokens
 *
 * Tests all color objects, spacing, typography, shadows, and helper functions
 */

import { describe, it, expect } from 'vitest';
import {
  lightColors,
  darkColors,
  semanticColors,
  projectColors,
  tagColors,
  chartColors,
  spacing,
  namedSpacing,
  borderRadius,
  fontSize,
  fontWeight,
  lineHeight,
  shadows,
  priorityColors,
  statusColors,
  timerColors,
  getColors,
  getProjectColor,
  getTagColor,
  hexToRgba,
  tokens,
} from './tokens';

describe('Light Colors', () => {
  it('should have all required core colors', () => {
    expect(lightColors.background).toBe('#FFFFFF');
    expect(lightColors.foreground).toBe('#0A0A0B');
    expect(lightColors.card).toBe('#FFFFFF');
    expect(lightColors.cardForeground).toBe('#0A0A0B');
    expect(lightColors.popover).toBe('#FFFFFF');
    expect(lightColors.popoverForeground).toBe('#0A0A0B');
  });

  it('should have primary colors', () => {
    expect(lightColors.primary).toBe('#7C3AED');
    expect(lightColors.primaryForeground).toBe('#FFFFFF');
  });

  it('should have secondary colors', () => {
    expect(lightColors.secondary).toBe('#F5F3FF');
    expect(lightColors.secondaryForeground).toBe('#7C3AED');
  });

  it('should have muted colors', () => {
    expect(lightColors.muted).toBe('#F5F3FF');
    expect(lightColors.mutedForeground).toBe('#6B7280');
  });

  it('should have accent colors', () => {
    expect(lightColors.accent).toBe('#F5F3FF');
    expect(lightColors.accentForeground).toBe('#7C3AED');
  });

  it('should have destructive colors', () => {
    expect(lightColors.destructive).toBe('#EF4444');
    expect(lightColors.destructiveForeground).toBe('#FFFFFF');
  });

  it('should have border and input colors', () => {
    expect(lightColors.border).toBe('#E5E7EB');
    expect(lightColors.input).toBe('#E5E7EB');
    expect(lightColors.ring).toBe('#7C3AED');
  });

  it('should have sidebar colors', () => {
    expect(lightColors.sidebar).toBe('#FAFAFA');
    expect(lightColors.sidebarForeground).toBe('#1F2937');
    expect(lightColors.sidebarPrimary).toBe('#7C3AED');
    expect(lightColors.sidebarPrimaryForeground).toBe('#FFFFFF');
    expect(lightColors.sidebarAccent).toBe('#F3F4F6');
    expect(lightColors.sidebarAccentForeground).toBe('#7C3AED');
    expect(lightColors.sidebarBorder).toBe('#E5E7EB');
    expect(lightColors.sidebarRing).toBe('#7C3AED');
  });

});

describe('Dark Colors', () => {
  it('should have all required core colors', () => {
    expect(darkColors.background).toBe('#0F0F14');
    expect(darkColors.foreground).toBe('#FAFAFA');
    expect(darkColors.card).toBe('#1A1A24');
    expect(darkColors.cardForeground).toBe('#FAFAFA');
    expect(darkColors.popover).toBe('#1A1A24');
    expect(darkColors.popoverForeground).toBe('#FAFAFA');
  });

  it('should have primary colors', () => {
    expect(darkColors.primary).toBe('#A78BFA');
    expect(darkColors.primaryForeground).toBe('#1A1A24');
  });

  it('should have secondary colors', () => {
    expect(darkColors.secondary).toBe('#27272A');
    expect(darkColors.secondaryForeground).toBe('#FAFAFA');
  });

  it('should have muted colors', () => {
    expect(darkColors.muted).toBe('#27272A');
    expect(darkColors.mutedForeground).toBe('#A1A1AA');
  });

  it('should have accent colors', () => {
    expect(darkColors.accent).toBe('#3F3F46');
    expect(darkColors.accentForeground).toBe('#FAFAFA');
  });

  it('should have destructive colors', () => {
    expect(darkColors.destructive).toBe('#DC2626');
    expect(darkColors.destructiveForeground).toBe('#FFFFFF');
  });

  it('should have border and input colors', () => {
    expect(darkColors.border).toBe('#27272A');
    expect(darkColors.input).toBe('#27272A');
    expect(darkColors.ring).toBe('#A78BFA');
  });

  it('should have sidebar colors', () => {
    expect(darkColors.sidebar).toBe('#18181B');
    expect(darkColors.sidebarForeground).toBe('#FAFAFA');
    expect(darkColors.sidebarPrimary).toBe('#A78BFA');
    expect(darkColors.sidebarPrimaryForeground).toBe('#1A1A24');
    expect(darkColors.sidebarAccent).toBe('#27272A');
    expect(darkColors.sidebarAccentForeground).toBe('#FAFAFA');
    expect(darkColors.sidebarBorder).toBe('#27272A');
    expect(darkColors.sidebarRing).toBe('#A78BFA');
  });

});

describe('Semantic Colors', () => {
  it('should have success colors', () => {
    expect(semanticColors.success).toBe('#10B981');
    expect(semanticColors.successLight).toBe('#34D399');
    expect(semanticColors.successDark).toBe('#059669');
  });

  it('should have warning colors', () => {
    expect(semanticColors.warning).toBe('#F59E0B');
    expect(semanticColors.warningLight).toBe('#FBBF24');
    expect(semanticColors.warningDark).toBe('#D97706');
  });

  it('should have error colors', () => {
    expect(semanticColors.error).toBe('#EF4444');
    expect(semanticColors.errorLight).toBe('#F87171');
    expect(semanticColors.errorDark).toBe('#DC2626');
  });

  it('should have info colors', () => {
    expect(semanticColors.info).toBe('#3B82F6');
    expect(semanticColors.infoLight).toBe('#60A5FA');
    expect(semanticColors.infoDark).toBe('#2563EB');
  });

  it('should have vibrant accent colors', () => {
    expect(semanticColors.cyan).toBe('#06B6D4');
    expect(semanticColors.cyanLight).toBe('#22D3EE');
    expect(semanticColors.cyanDark).toBe('#0891B2');

    expect(semanticColors.purple).toBe('#A855F7');
    expect(semanticColors.purpleLight).toBe('#C084FC');
    expect(semanticColors.purpleDark).toBe('#9333EA');

    expect(semanticColors.pink).toBe('#EC4899');
    expect(semanticColors.pinkLight).toBe('#F472B6');
    expect(semanticColors.pinkDark).toBe('#DB2777');

    expect(semanticColors.orange).toBe('#F97316');
    expect(semanticColors.orangeLight).toBe('#FB923C');
    expect(semanticColors.orangeDark).toBe('#EA580C');

    expect(semanticColors.green).toBe('#10B981');
    expect(semanticColors.greenLight).toBe('#34D399');
    expect(semanticColors.greenDark).toBe('#059669');
  });

});

describe('Project Colors', () => {
  it('should have 7 project colors', () => {
    expect(projectColors).toHaveLength(7);
  });

  it('should have expected project colors', () => {
    expect(projectColors[0]).toBe('#3B82F6'); // Blue
    expect(projectColors[1]).toBe('#8B5CF6'); // Violet
    expect(projectColors[2]).toBe('#EC4899'); // Pink
    expect(projectColors[3]).toBe('#F97316'); // Orange
    expect(projectColors[4]).toBe('#10B981'); // Emerald
    expect(projectColors[5]).toBe('#06B6D4'); // Cyan
    expect(projectColors[6]).toBe('#F43F5E'); // Rose
  });

});

describe('Tag Colors', () => {
  it('should have 10 tag colors', () => {
    expect(tagColors).toHaveLength(10);
  });

  it('should have expected tag colors', () => {
    expect(tagColors[0]).toBe('#EF4444'); // Red
    expect(tagColors[1]).toBe('#F97316'); // Orange
    expect(tagColors[2]).toBe('#F59E0B'); // Amber
    expect(tagColors[3]).toBe('#84CC16'); // Lime
    expect(tagColors[4]).toBe('#22C55E'); // Green
    expect(tagColors[5]).toBe('#14B8A6'); // Teal
    expect(tagColors[6]).toBe('#06B6D4'); // Cyan
    expect(tagColors[7]).toBe('#3B82F6'); // Blue
    expect(tagColors[8]).toBe('#8B5CF6'); // Violet
    expect(tagColors[9]).toBe('#EC4899'); // Pink
  });

});

describe('Chart Colors', () => {
  it('should have light theme colors', () => {
    expect(chartColors.light).toHaveLength(5);
    expect(chartColors.light[0]).toBe('#F97316');
    expect(chartColors.light[1]).toBe('#14B8A6');
    expect(chartColors.light[2]).toBe('#4B5563');
    expect(chartColors.light[3]).toBe('#FACC15');
    expect(chartColors.light[4]).toBe('#EA580C');
  });

  it('should have dark theme colors', () => {
    expect(chartColors.dark).toHaveLength(5);
    expect(chartColors.dark[0]).toBe('#3B82F6');
    expect(chartColors.dark[1]).toBe('#10B981');
    expect(chartColors.dark[2]).toBe('#FACC15');
    expect(chartColors.dark[3]).toBe('#A855F7');
    expect(chartColors.dark[4]).toBe('#EF4444');
  });

});

describe('Spacing', () => {
  it('should have pixel value', () => {
    expect(spacing.px).toBe(1);
  });

  it('should have zero value', () => {
    expect(spacing[0]).toBe(0);
  });

  it('should have fractional spacing', () => {
    expect(spacing[0.5]).toBe(2);
    expect(spacing[1.5]).toBe(6);
    expect(spacing[2.5]).toBe(10);
    expect(spacing[3.5]).toBe(14);
  });

  it('should have integer spacing from 1 to 96', () => {
    expect(spacing[1]).toBe(4);
    expect(spacing[2]).toBe(8);
    expect(spacing[3]).toBe(12);
    expect(spacing[4]).toBe(16);
    expect(spacing[5]).toBe(20);
    expect(spacing[6]).toBe(24);
    expect(spacing[7]).toBe(28);
    expect(spacing[8]).toBe(32);
    expect(spacing[9]).toBe(36);
    expect(spacing[10]).toBe(40);
    expect(spacing[11]).toBe(44);
    expect(spacing[12]).toBe(48);
    expect(spacing[14]).toBe(56);
    expect(spacing[16]).toBe(64);
    expect(spacing[20]).toBe(80);
    expect(spacing[24]).toBe(96);
    expect(spacing[28]).toBe(112);
    expect(spacing[32]).toBe(128);
    expect(spacing[36]).toBe(144);
    expect(spacing[40]).toBe(160);
    expect(spacing[44]).toBe(176);
    expect(spacing[48]).toBe(192);
    expect(spacing[52]).toBe(208);
    expect(spacing[56]).toBe(224);
    expect(spacing[60]).toBe(240);
    expect(spacing[64]).toBe(256);
    expect(spacing[72]).toBe(288);
    expect(spacing[80]).toBe(320);
    expect(spacing[96]).toBe(384);
  });

});

describe('Named Spacing', () => {
  it('should have xs spacing', () => {
    expect(namedSpacing.xs).toBe(4);
  });

  it('should have sm spacing', () => {
    expect(namedSpacing.sm).toBe(8);
  });

  it('should have md spacing', () => {
    expect(namedSpacing.md).toBe(16);
  });

  it('should have lg spacing', () => {
    expect(namedSpacing.lg).toBe(24);
  });

  it('should have xl spacing', () => {
    expect(namedSpacing.xl).toBe(32);
  });

  it('should have 2xl spacing', () => {
    expect(namedSpacing['2xl']).toBe(48);
  });

  it('should have 3xl spacing', () => {
    expect(namedSpacing['3xl']).toBe(64);
  });

});

describe('Border Radius', () => {
  it('should have none radius', () => {
    expect(borderRadius.none).toBe(0);
  });

  it('should have sm radius', () => {
    expect(borderRadius.sm).toBe(6);
  });

  it('should have md radius', () => {
    expect(borderRadius.md).toBe(8);
  });

  it('should have lg radius', () => {
    expect(borderRadius.lg).toBe(10);
  });

  it('should have xl radius', () => {
    expect(borderRadius.xl).toBe(14);
  });

  it('should have 2xl radius', () => {
    expect(borderRadius['2xl']).toBe(18);
  });

  it('should have 3xl radius', () => {
    expect(borderRadius['3xl']).toBe(24);
  });

  it('should have full radius', () => {
    expect(borderRadius.full).toBe(9999);
  });

});

describe('Font Size', () => {
  it('should have xs font size', () => {
    expect(fontSize.xs).toBe(12);
  });

  it('should have sm font size', () => {
    expect(fontSize.sm).toBe(14);
  });

  it('should have base font size', () => {
    expect(fontSize.base).toBe(16);
  });

  it('should have lg font size', () => {
    expect(fontSize.lg).toBe(18);
  });

  it('should have xl font size', () => {
    expect(fontSize.xl).toBe(20);
  });

  it('should have 2xl font size', () => {
    expect(fontSize['2xl']).toBe(24);
  });

  it('should have 3xl font size', () => {
    expect(fontSize['3xl']).toBe(30);
  });

  it('should have 4xl font size', () => {
    expect(fontSize['4xl']).toBe(36);
  });

  it('should have 5xl font size', () => {
    expect(fontSize['5xl']).toBe(48);
  });

});

describe('Font Weight', () => {
  it('should have thin weight', () => {
    expect(fontWeight.thin).toBe('100');
  });

  it('should have extralight weight', () => {
    expect(fontWeight.extralight).toBe('200');
  });

  it('should have light weight', () => {
    expect(fontWeight.light).toBe('300');
  });

  it('should have normal weight', () => {
    expect(fontWeight.normal).toBe('400');
  });

  it('should have medium weight', () => {
    expect(fontWeight.medium).toBe('500');
  });

  it('should have semibold weight', () => {
    expect(fontWeight.semibold).toBe('600');
  });

  it('should have bold weight', () => {
    expect(fontWeight.bold).toBe('700');
  });

  it('should have extrabold weight', () => {
    expect(fontWeight.extrabold).toBe('800');
  });

  it('should have black weight', () => {
    expect(fontWeight.black).toBe('900');
  });

});

describe('Line Height', () => {
  it('should have none line height', () => {
    expect(lineHeight.none).toBe(1);
  });

  it('should have tight line height', () => {
    expect(lineHeight.tight).toBe(1.25);
  });

  it('should have snug line height', () => {
    expect(lineHeight.snug).toBe(1.375);
  });

  it('should have normal line height', () => {
    expect(lineHeight.normal).toBe(1.5);
  });

  it('should have relaxed line height', () => {
    expect(lineHeight.relaxed).toBe(1.625);
  });

  it('should have loose line height', () => {
    expect(lineHeight.loose).toBe(2);
  });

});

describe('Shadows', () => {
  it('should have none shadow', () => {
    expect(shadows.none.shadowColor).toBe('transparent');
    expect(shadows.none.shadowOffset).toEqual({ width: 0, height: 0 });
    expect(shadows.none.shadowOpacity).toBe(0);
    expect(shadows.none.shadowRadius).toBe(0);
    expect(shadows.none.elevation).toBe(0);
  });

  it('should have sm shadow', () => {
    expect(shadows.sm.shadowColor).toBe('#000');
    expect(shadows.sm.shadowOffset).toEqual({ width: 0, height: 1 });
    expect(shadows.sm.shadowOpacity).toBe(0.05);
    expect(shadows.sm.shadowRadius).toBe(2);
    expect(shadows.sm.elevation).toBe(1);
  });

  it('should have md shadow', () => {
    expect(shadows.md.shadowColor).toBe('#000');
    expect(shadows.md.shadowOffset).toEqual({ width: 0, height: 2 });
    expect(shadows.md.shadowOpacity).toBe(0.1);
    expect(shadows.md.shadowRadius).toBe(4);
    expect(shadows.md.elevation).toBe(3);
  });

  it('should have lg shadow', () => {
    expect(shadows.lg.shadowColor).toBe('#000');
    expect(shadows.lg.shadowOffset).toEqual({ width: 0, height: 4 });
    expect(shadows.lg.shadowOpacity).toBe(0.15);
    expect(shadows.lg.shadowRadius).toBe(8);
    expect(shadows.lg.elevation).toBe(6);
  });

  it('should have xl shadow', () => {
    expect(shadows.xl.shadowColor).toBe('#000');
    expect(shadows.xl.shadowOffset).toEqual({ width: 0, height: 8 });
    expect(shadows.xl.shadowOpacity).toBe(0.2);
    expect(shadows.xl.shadowRadius).toBe(16);
    expect(shadows.xl.elevation).toBe(12);
  });

});

describe('Priority Colors', () => {
  it('should have LOW priority colors', () => {
    expect(priorityColors.LOW.background).toBe('#DBEAFE');
    expect(priorityColors.LOW.foreground).toBe('#1E40AF');
    expect(priorityColors.LOW.border).toBe('#93C5FD');
  });

  it('should have MEDIUM priority colors', () => {
    expect(priorityColors.MEDIUM.background).toBe('#FEF3C7');
    expect(priorityColors.MEDIUM.foreground).toBe('#92400E');
    expect(priorityColors.MEDIUM.border).toBe('#FCD34D');
  });

  it('should have HIGH priority colors', () => {
    expect(priorityColors.HIGH.background).toBe('#FECACA');
    expect(priorityColors.HIGH.foreground).toBe('#991B1B');
    expect(priorityColors.HIGH.border).toBe('#F87171');
  });

  it('should have URGENT priority colors', () => {
    expect(priorityColors.URGENT.background).toBe('#F87171');
    expect(priorityColors.URGENT.foreground).toBe('#FFFFFF');
    expect(priorityColors.URGENT.border).toBe('#EF4444');
  });

});

describe('Status Colors', () => {
  it('should have TODO status colors', () => {
    expect(statusColors.TODO.background).toBe('#F3F4F6');
    expect(statusColors.TODO.foreground).toBe('#374151');
    expect(statusColors.TODO.border).toBe('#D1D5DB');
  });

  it('should have IN_PROGRESS status colors', () => {
    expect(statusColors.IN_PROGRESS.background).toBe('#DBEAFE');
    expect(statusColors.IN_PROGRESS.foreground).toBe('#1E40AF');
    expect(statusColors.IN_PROGRESS.border).toBe('#93C5FD');
  });

  it('should have COMPLETED status colors', () => {
    expect(statusColors.COMPLETED.background).toBe('#D1FAE5');
    expect(statusColors.COMPLETED.foreground).toBe('#065F46');
    expect(statusColors.COMPLETED.border).toBe('#6EE7B7');
  });

  it('should have CANCELLED status colors', () => {
    expect(statusColors.CANCELLED.background).toBe('#F3F4F6');
    expect(statusColors.CANCELLED.foreground).toBe('#6B7280');
    expect(statusColors.CANCELLED.border).toBe('#D1D5DB');
  });

});

describe('Timer Colors', () => {
  it('should have WORK timer colors', () => {
    expect(timerColors.WORK.primary).toBe('#EF4444');
    expect(timerColors.WORK.background).toBe('#FEE2E2');
  });

  it('should have SHORT_BREAK timer colors', () => {
    expect(timerColors.SHORT_BREAK.primary).toBe('#22C55E');
    expect(timerColors.SHORT_BREAK.background).toBe('#DCFCE7');
  });

  it('should have LONG_BREAK timer colors', () => {
    expect(timerColors.LONG_BREAK.primary).toBe('#3B82F6');
    expect(timerColors.LONG_BREAK.background).toBe('#DBEAFE');
  });

});

describe('Helper Functions', () => {
  describe('getColors', () => {
    it('should return light colors when isDark is false', () => {
      const colors = getColors(false);
      expect(colors).toEqual(lightColors);
      expect(colors.background).toBe('#FFFFFF');
    });

    it('should return dark colors when isDark is true', () => {
      const colors = getColors(true);
      expect(colors).toEqual(darkColors);
      expect(colors.background).toBe('#0F0F14');
    });
  });

  describe('getProjectColor', () => {
    it('should return color at index 0', () => {
      const color = getProjectColor(0);
      expect(color).toBe('#3B82F6');
    });

    it('should return color at index 3', () => {
      const color = getProjectColor(3);
      expect(color).toBe('#F97316');
    });

    it('should wrap around when index exceeds array length', () => {
      const color1 = getProjectColor(7);
      expect(color1).toBe('#3B82F6'); // 7 % 7 = 0

      const color2 = getProjectColor(10);
      expect(color2).toBe('#F97316'); // 10 % 7 = 3
    });

    it('should handle negative indices by returning undefined', () => {
      const color = getProjectColor(-1);
      // Negative modulo in JS returns negative, which is undefined
      expect(color).toBeUndefined();
    });
  });

  describe('getTagColor', () => {
    it('should return color at index 0', () => {
      const color = getTagColor(0);
      expect(color).toBe('#EF4444');
    });

    it('should return color at index 5', () => {
      const color = getTagColor(5);
      expect(color).toBe('#14B8A6');
    });

    it('should wrap around when index exceeds array length', () => {
      const color1 = getTagColor(10);
      expect(color1).toBe('#EF4444'); // 10 % 10 = 0

      const color2 = getTagColor(15);
      expect(color2).toBe('#14B8A6'); // 15 % 10 = 5
    });

    it('should handle negative indices by returning undefined', () => {
      const color = getTagColor(-1);
      // Negative modulo in JS returns negative, which is undefined
      expect(color).toBeUndefined();
    });
  });

  describe('hexToRgba', () => {
    it('should convert hex to rgba with default alpha', () => {
      expect(hexToRgba('#FF0000')).toBe('rgba(255, 0, 0, 1)');
    });

    it('should convert hex to rgba with custom alpha', () => {
      expect(hexToRgba('#FF0000', 0.5)).toBe('rgba(255, 0, 0, 0.5)');
    });

    it('should handle hex without hash', () => {
      expect(hexToRgba('FF0000')).toBe('rgba(255, 0, 0, 1)');
    });

    it('should handle various colors', () => {
      expect(hexToRgba('#00FF00')).toBe('rgba(0, 255, 0, 1)');
      expect(hexToRgba('#0000FF')).toBe('rgba(0, 0, 255, 1)');
      expect(hexToRgba('#FFFFFF')).toBe('rgba(255, 255, 255, 1)');
      expect(hexToRgba('#000000')).toBe('rgba(0, 0, 0, 1)');
    });

    it('should handle lowercase hex', () => {
      expect(hexToRgba('#ff0000')).toBe('rgba(255, 0, 0, 1)');
    });

    it('should return original string for invalid hex', () => {
      expect(hexToRgba('invalid')).toBe('invalid');
      expect(hexToRgba('#FFF')).toBe('#FFF'); // Too short
      expect(hexToRgba('#GGG')).toBe('#GGG'); // Invalid chars
    });
  });
});

describe('Default Tokens Export', () => {
  it('should export all color tokens', () => {
    expect(tokens.colors.light).toBe(lightColors);
    expect(tokens.colors.dark).toBe(darkColors);
    expect(tokens.colors.semantic).toBe(semanticColors);
    expect(tokens.colors.project).toBe(projectColors);
    expect(tokens.colors.tag).toBe(tagColors);
    expect(tokens.colors.chart).toBe(chartColors);
    expect(tokens.colors.priority).toBe(priorityColors);
    expect(tokens.colors.status).toBe(statusColors);
    expect(tokens.colors.timer).toBe(timerColors);
  });

  it('should export all spacing tokens', () => {
    expect(tokens.spacing).toBe(spacing);
    expect(tokens.namedSpacing).toBe(namedSpacing);
  });

  it('should export all typography tokens', () => {
    expect(tokens.borderRadius).toBe(borderRadius);
    expect(tokens.fontSize).toBe(fontSize);
    expect(tokens.fontWeight).toBe(fontWeight);
    expect(tokens.lineHeight).toBe(lineHeight);
  });

  it('should export shadows', () => {
    expect(tokens.shadows).toBe(shadows);
  });
});

describe('Token Consistency', () => {
  it('should ensure light and dark themes have the same keys', () => {
    const lightKeys = Object.keys(lightColors).sort();
    const darkKeys = Object.keys(darkColors).sort();
    expect(lightKeys).toEqual(darkKeys);
  });

  it('should ensure project colors are unique', () => {
    const uniqueColors = new Set(projectColors);
    expect(uniqueColors.size).toBe(projectColors.length);
  });

  it('should ensure tag colors are unique', () => {
    const uniqueColors = new Set(tagColors);
    expect(uniqueColors.size).toBe(tagColors.length);
  });

  it('should ensure all spacing values are positive numbers or zero', () => {
    Object.values(spacing).forEach((value) => {
      expect(typeof value).toBe('number');
      expect(value).toBeGreaterThanOrEqual(0);
    });
  });

  it('should ensure all border radius values are non-negative', () => {
    Object.values(borderRadius).forEach((value) => {
      expect(typeof value).toBe('number');
      expect(value).toBeGreaterThanOrEqual(0);
    });
  });

  it('should ensure all font sizes are positive', () => {
    Object.values(fontSize).forEach((value) => {
      expect(typeof value).toBe('number');
      expect(value).toBeGreaterThan(0);
    });
  });

  it('should ensure all font weights are strings', () => {
    Object.values(fontWeight).forEach((value) => {
      expect(typeof value).toBe('string');
      expect(value).toMatch(/^\d+$/); // Numeric string
    });
  });

  it('should ensure all line heights are positive numbers', () => {
    Object.values(lineHeight).forEach((value) => {
      expect(typeof value).toBe('number');
      expect(value).toBeGreaterThan(0);
    });
  });

  it('should ensure all shadows have required properties', () => {
    Object.values(shadows).forEach((shadow) => {
      expect(shadow).toHaveProperty('shadowColor');
      expect(shadow).toHaveProperty('shadowOffset');
      expect(shadow).toHaveProperty('shadowOpacity');
      expect(shadow).toHaveProperty('shadowRadius');
      expect(shadow).toHaveProperty('elevation');

      expect(typeof shadow.shadowColor).toBe('string');
      expect(typeof shadow.shadowOffset).toBe('object');
      expect(typeof shadow.shadowOpacity).toBe('number');
      expect(typeof shadow.shadowRadius).toBe('number');
      expect(typeof shadow.elevation).toBe('number');
    });
  });

  it('should ensure priority colors have all required properties', () => {
    Object.values(priorityColors).forEach((colors) => {
      expect(colors).toHaveProperty('background');
      expect(colors).toHaveProperty('foreground');
      expect(colors).toHaveProperty('border');

      expect(typeof colors.background).toBe('string');
      expect(typeof colors.foreground).toBe('string');
      expect(typeof colors.border).toBe('string');
    });
  });

  it('should ensure status colors have all required properties', () => {
    Object.values(statusColors).forEach((colors) => {
      expect(colors).toHaveProperty('background');
      expect(colors).toHaveProperty('foreground');
      expect(colors).toHaveProperty('border');

      expect(typeof colors.background).toBe('string');
      expect(typeof colors.foreground).toBe('string');
      expect(typeof colors.border).toBe('string');
    });
  });

  it('should ensure timer colors have all required properties', () => {
    Object.values(timerColors).forEach((colors) => {
      expect(colors).toHaveProperty('primary');
      expect(colors).toHaveProperty('background');

      expect(typeof colors.primary).toBe('string');
      expect(typeof colors.background).toBe('string');
    });
  });

  it('should ensure semantic colors have light/dark variants', () => {
    expect(semanticColors).toHaveProperty('success');
    expect(semanticColors).toHaveProperty('successLight');
    expect(semanticColors).toHaveProperty('successDark');

    expect(semanticColors).toHaveProperty('warning');
    expect(semanticColors).toHaveProperty('warningLight');
    expect(semanticColors).toHaveProperty('warningDark');

    expect(semanticColors).toHaveProperty('error');
    expect(semanticColors).toHaveProperty('errorLight');
    expect(semanticColors).toHaveProperty('errorDark');

    expect(semanticColors).toHaveProperty('info');
    expect(semanticColors).toHaveProperty('infoLight');
    expect(semanticColors).toHaveProperty('infoDark');
  });

  it('should ensure chart colors have light and dark themes', () => {
    expect(chartColors).toHaveProperty('light');
    expect(chartColors).toHaveProperty('dark');
    expect(Array.isArray(chartColors.light)).toBe(true);
    expect(Array.isArray(chartColors.dark)).toBe(true);
  });
});
