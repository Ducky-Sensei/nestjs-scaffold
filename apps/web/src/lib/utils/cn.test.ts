import { describe, expect, it } from 'vitest';
import { cn } from './cn';

describe('cn utility', () => {
  it('should merge class names', () => {
    const result = cn('text-red-500', 'bg-blue-500');
    expect(result).toContain('text-red-500');
    expect(result).toContain('bg-blue-500');
  });

  it('should handle conditional classes', () => {
    const result = cn('base-class', { 'active-class': true, 'inactive-class': false });
    expect(result).toContain('base-class');
    expect(result).toContain('active-class');
    expect(result).not.toContain('inactive-class');
  });

  it('should resolve Tailwind class conflicts', () => {
    const result = cn('p-4', 'p-8');
    // tailwind-merge should keep only the last padding class
    expect(result).toBe('p-8');
  });

  it('should handle undefined and null values', () => {
    const result = cn('base-class', undefined, null, 'another-class');
    expect(result).toContain('base-class');
    expect(result).toContain('another-class');
  });

  it('should handle array of classes', () => {
    const result = cn(['class-1', 'class-2'], 'class-3');
    expect(result).toContain('class-1');
    expect(result).toContain('class-2');
    expect(result).toContain('class-3');
  });

  it('should handle empty input', () => {
    const result = cn();
    expect(result).toBe('');
  });
});
