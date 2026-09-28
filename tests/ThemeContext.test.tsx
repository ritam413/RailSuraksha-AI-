// tests/ThemeContext.test.tsx
import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { Navbar } from '@/components/Navbar';
import { AuthProvider } from '@/context/AuthContext';

const TestThemeConsumer: React.FC = () => {
  const { isDarkMode } = useTheme();
  return <div data-testid="theme-state">{isDarkMode ? 'DARK_MODE' : 'LIGHT_MODE'}</div>;
};

describe('ThemeContext & Global Theme Synchronization', () => {
  it('renders light mode by default', () => {
    const html = renderToStaticMarkup(
      <ThemeProvider>
        <TestThemeConsumer />
      </ThemeProvider>
    );

    expect(html).toContain('LIGHT_MODE');
  });

  it('renders theme toggle button in Navbar that syncs with ThemeContext', () => {
    const html = renderToStaticMarkup(
      <ThemeProvider>
        <AuthProvider>
          <Navbar deploymentMode="ADVISORY" onModeToggle={() => {}} />
        </AuthProvider>
      </ThemeProvider>
    );

    expect(html).toContain('theme-toggle');
    expect(html).toContain('Switch to dark mode');
  });
});
