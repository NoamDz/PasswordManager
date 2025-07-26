import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { Button } from './Button';


describe('Button component', () => {
  it('renders children and applies primary classes by default', () => {
    render(<Button>Click me</Button>);
    const btn = screen.getByRole('button', { name: /click me/i });
    expect(btn).toBeInTheDocument();
    // Primary variant should include primary background class
    expect(btn.className).toMatch(/bg-primary/);
  });

  it('applies secondary variant classes when specified', () => {
    render(
      <Button variant="secondary" data-testid="btn">
        Secondary
      </Button>
    );
    const btn = screen.getByTestId('btn');
    expect(btn.className).toMatch(/bg-gray-100/);
    expect(btn.className).not.toMatch(/bg-primary/);
  });

  it('honours the disabled prop', () => {
    render(
      <Button disabled>
        Disabled
      </Button>
    );
    const btn = screen.getByRole('button', { name: /disabled/i });
    expect(btn).toBeDisabled();
  });
});