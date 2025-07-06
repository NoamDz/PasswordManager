import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  outputDir: 'e2e/test-results',
  reporter: [
    ['html', { outputFolder: 'e2e/playwright-report', open: 'never' }],
  ],
  webServer: [
    {
      command: 'npm run dev -- --port 5173',
      port: 5173,
      cwd: 'frontend',
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'poetry run uvicorn backend.app.main:app --port 8000',
      port: 8000,
      cwd: '.',
      reuseExistingServer: !process.env.CI,
    },
  ],
}); 