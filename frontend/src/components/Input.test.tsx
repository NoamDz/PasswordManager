import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { Input } from './Input';


describe('Input component', () => {
  it('renders label and associates it with input element', () => {
    render(<Input label="Email" type="email" data-testid="email-input" />);

    const label = screen.getByText('Email');
    expect(label).toBeInTheDocument();

    const input = screen.getByTestId('email-input');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'email');
  });

  it('passes arbitrary props to the underlying input', () => {
    render(
      <Input
        label="Password"
        type="password"
        placeholder="Enter password"
        required
        data-testid="pw-input"
      />
    );
    const input = screen.getByTestId('pw-input');
    expect(input).toHaveAttribute('placeholder', 'Enter password');
    expect(input).toBeRequired();
  });
});