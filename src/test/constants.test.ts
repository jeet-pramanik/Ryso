import { describe, it, expect } from 'vitest';
import { CATEGORY_CONFIG } from '@/constants/categories';
import { ExpenseCategory } from '@/types';

describe('Category Configuration', () => {
  it('should have configuration for all expense categories', () => {
    const categories = Object.values(ExpenseCategory);
    
    categories.forEach(category => {
      expect(CATEGORY_CONFIG[category]).toBeDefined();
      expect(CATEGORY_CONFIG[category].name).toBeTruthy();
      expect(CATEGORY_CONFIG[category].icon).toBeTruthy();
      expect(CATEGORY_CONFIG[category].color).toBeTruthy();
      expect(CATEGORY_CONFIG[category].keywords).toBeDefined();
      expect(CATEGORY_CONFIG[category].keywords.length).toBeGreaterThan(0);
    });
  });

  it('should have unique colors for each category', () => {
    const colors = Object.values(CATEGORY_CONFIG).map(config => config.color);
    const uniqueColors = new Set(colors);
    
    expect(uniqueColors.size).toBe(colors.length);
  });
});
