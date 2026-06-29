import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RatingControl } from './components/RatingControl';
import { ReviewControl } from './components/ReviewControl';
import { RewatchControl } from './components/RewatchControl';

function RatingHarness() {
  const [value, setValue] = useState<number | null>(null);
  return <RatingControl value={value} onChange={setValue} />;
}

describe('RatingControl', () => {
  it('exposes an accessible slider with value text', () => {
    render(<RatingHarness />);
    const slider = screen.getByRole('slider', { name: /your rating/i });
    expect(slider).toHaveAttribute('aria-valuetext', 'Not rated');
    expect(slider).toHaveAttribute('aria-valuemax', '10');
  });

  it('increments by 0.5 with arrow keys and shows the numeric value', async () => {
    const user = userEvent.setup();
    render(<RatingHarness />);
    const slider = screen.getByRole('slider');
    slider.focus();

    await user.keyboard('{ArrowRight}');
    expect(slider).toHaveAttribute('aria-valuenow', '0.5');
    await user.keyboard('{ArrowRight}');
    expect(slider).toHaveAttribute('aria-valuenow', '1');
    expect(screen.getByText('1.0/10')).toBeInTheDocument();
  });

  it('jumps to 10 with End', async () => {
    const user = userEvent.setup();
    render(<RatingHarness />);
    const slider = screen.getByRole('slider');
    slider.focus();
    await user.keyboard('{End}');
    expect(slider).toHaveAttribute('aria-valuenow', '10');
    expect(screen.getByText('10.0/10')).toBeInTheDocument();
  });

  it('represents the cleared state as a valid slider (Not rated)', async () => {
    const user = userEvent.setup();
    render(<RatingHarness />);
    const slider = screen.getByRole('slider');
    slider.focus();
    await user.keyboard('{End}'); // rate 10 so a Clear action appears
    await user.click(screen.getByRole('button', { name: 'Clear' }));

    const cleared = screen.getByRole('slider');
    expect(cleared).toHaveAttribute('aria-valuetext', 'Not rated');
    expect(cleared).toHaveAttribute('aria-valuenow', '0'); // 0 ∈ [0,10] — a valid slider state
  });
});

describe('ReviewControl', () => {
  it('shows a character counter and saves on blur', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ReviewControl value={null} onChange={onChange} />);

    const textarea = screen.getByRole('textbox', { name: /your review/i });
    await user.type(textarea, 'Great ending.');
    expect(screen.getByText('13/500')).toBeInTheDocument();

    await user.tab();
    expect(onChange).toHaveBeenCalledWith('Great ending.');
  });

  it('hard-caps the textarea at 500 characters', () => {
    render(<ReviewControl value={'x'.repeat(500)} onChange={() => {}} />);
    const textarea = screen.getByRole('textbox', { name: /your review/i }) as HTMLTextAreaElement;
    expect(textarea.maxLength).toBe(500);
    expect(textarea.value).toHaveLength(500);
  });
});

describe('RewatchControl', () => {
  it('increments, and disables decrement at zero', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<RewatchControl value={0} onChange={onChange} />);

    expect(screen.getByRole('button', { name: /decrease rewatch count/i })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: /increase rewatch count/i }));
    expect(onChange).toHaveBeenCalledWith(1);
  });
});
