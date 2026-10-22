import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CommentThread } from '../comment-thread';

vi.mock('@/components/shared/confirm-dialog', () => ({
  useConfirm: () => ({
    confirm: vi.fn(async () => true),
    ConfirmModal: () => null,
  }),
}));

// cmdk (mention suggestions) requires ResizeObserver, absent in jsdom
class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
beforeEach(() => {
  (globalThis as any).ResizeObserver =
    (globalThis as any).ResizeObserver ?? ResizeObserverMock;
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
  window.HTMLElement.prototype.hasPointerCapture = vi.fn();
  window.HTMLElement.prototype.releasePointerCapture = vi.fn();
  // vitest.setup.tsx replaces window.Image with a bare class; Radix Avatar
  // calls addEventListener on its probe image.
  const ImageCtor = (globalThis as any).Image;
  if (typeof ImageCtor?.prototype?.addEventListener !== 'function') {
    ImageCtor.prototype.addEventListener = function (
      this: any,
      type: string,
      listener: () => void,
    ) {
      if (type === 'load') setTimeout(listener, 0);
    };
    ImageCtor.prototype.removeEventListener = function () {};
  }
});

const baseComment = {
  id: 'c1',
  content: 'First comment',
  taskId: 'task-1',
  userId: 'user-1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  author: { id: 'user-1', name: 'Ann Writer', email: 'a@x.com', image: null },
} as any;

const users = [
  { id: 'user-1', name: 'Ann Writer' },
  { id: 'user-2', name: 'Bob Member' },
];

function renderThread(onCreate = vi.fn()) {
  render(
    <CommentThread
      taskId="task-1"
      comments={[baseComment]}
      currentUserId="user-1"
      users={users}
      onCreate={onCreate}
    />,
  );
  return onCreate;
}

describe('CommentThread (ODD 018 S2)', () => {
  it('renders the author name from author (not Unknown User)', () => {
    renderThread();

    expect(screen.getByText('Ann Writer')).toBeDefined();
  });

  it('sends mentionedUserIds when a member is picked from the mention popover', async () => {
    const onCreate = renderThread();

    const textarea = screen.getByPlaceholderText(
      'Write a comment...',
    ) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'Hey @' } });

    fireEvent.click(await screen.findByText('Bob Member'));

    await waitFor(() => {
      expect(textarea.value).toContain('@Bob Member');
    });

    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() => {
      expect(onCreate).toHaveBeenCalledWith(
        expect.stringContaining('@Bob Member'),
        ['user-2'],
      );
    });
  });

  it('drops picked IDs whose @name is no longer in the text (review round)', async () => {
    const onCreate = renderThread();

    const textarea = screen.getByPlaceholderText(
      'Write a comment...',
    ) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'Hey @' } });
    fireEvent.click(await screen.findByText('Bob Member'));

    await waitFor(() => {
      expect(textarea.value).toContain('@Bob Member');
    });

    // Author removes the mention from the draft entirely
    fireEvent.change(textarea, { target: { value: 'nothing to see' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() => {
      expect(onCreate).toHaveBeenCalledWith('nothing to see', undefined);
    });
  });

  it('renders @Name as a chip for known members and leaves unknown text plain', () => {
    render(
      <CommentThread
        taskId="task-1"
        comments={[
          {
            ...baseComment,
            id: 'c2',
            content: 'hey @Bob Member and @Stranger Person',
          } as any,
        ]}
        currentUserId="user-1"
        users={users}
      />,
    );

    const chip = screen.getByText('@Bob Member');
    expect(chip.className).toContain('rounded-full');

    // Unknown mentions stay plain text (leaf node)
    const plain = screen
      .getAllByText((_, el) => el?.textContent === 'and @Stranger Person')
      .filter((el) => el.children.length === 0);
    expect(plain.length).toBeGreaterThan(0);
  });

  it('sends without mentionedUserIds when no one is mentioned', async () => {
    const onCreate = renderThread();

    fireEvent.change(screen.getByPlaceholderText('Write a comment...'), {
      target: { value: 'plain text' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() => {
      expect(onCreate).toHaveBeenCalledWith('plain text', undefined);
    });
  });
});
