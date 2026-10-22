import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AcceptInvitationPage from '../page';

const mutateAsync = vi.fn();

vi.mock('@/lib/api-hooks', () => ({
  useAcceptInvitation: () => ({ mutateAsync }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams('token=abc'),
}));

describe('AcceptInvitationPage (ODD 018 S4 / W4)', () => {
  it('shows the backend message when the invitation belongs to another email', async () => {
    // The api client rejects with the raw AxiosError: the useful text is in response.data
    mutateAsync.mockRejectedValueOnce(
      Object.assign(new Error('Request failed with status code 403'), {
        response: {
          data: {
            message: 'This invitation was sent to a different email address',
          },
        },
      }),
    );

    render(<AcceptInvitationPage />);
    fireEvent.click(screen.getByText('acceptButton'));

    expect(
      await screen.findByText(
        'This invitation was sent to a different email address',
      ),
    ).toBeDefined();
  });

  it('falls back to the generic error when the response carries no message', async () => {
    mutateAsync.mockRejectedValueOnce(new Error('Network Error'));

    render(<AcceptInvitationPage />);
    fireEvent.click(screen.getByText('acceptButton'));

    expect(await screen.findByText('Network Error')).toBeDefined();
  });
});
