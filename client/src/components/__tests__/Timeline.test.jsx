import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Timeline from '../Timeline';

describe('Timeline', () => {
  it('renders all four election steps', () => {
    render(<Timeline onStepClick={() => {}} />);
    expect(screen.getByText('Registration')).toBeInTheDocument();
    expect(screen.getByText('Verification')).toBeInTheDocument();
    expect(screen.getByText('Polling')).toBeInTheDocument();
    expect(screen.getByText('Counting')).toBeInTheDocument();
  });

  it('calls onStepClick with correct query when a step is clicked', async () => {
    const mockClick = vi.fn();
    const user = userEvent.setup();

    render(<Timeline onStepClick={mockClick} />);

    await user.click(screen.getByLabelText('Learn about Registration'));
    expect(mockClick).toHaveBeenCalledTimes(1);
    expect(mockClick).toHaveBeenCalledWith(
      expect.stringContaining('voter registration')
    );
  });

  it('renders step numbers 1 through 4', () => {
    render(<Timeline onStepClick={() => {}} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('has accessible labels on all step buttons', () => {
    render(<Timeline onStepClick={() => {}} />);
    expect(screen.getByLabelText('Learn about Registration')).toBeInTheDocument();
    expect(screen.getByLabelText('Learn about Verification')).toBeInTheDocument();
    expect(screen.getByLabelText('Learn about Polling')).toBeInTheDocument();
    expect(screen.getByLabelText('Learn about Counting')).toBeInTheDocument();
  });

  it('uses an ordered list for timeline steps', () => {
    render(<Timeline onStepClick={() => {}} />);
    const list = screen.getByRole('list');
    expect(list.tagName).toBe('OL');
  });
});
