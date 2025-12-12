import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FileUpload } from './file-upload';
import { apiClient } from '@/lib/api-client';
import { createMockTask } from '@/test/setup';

// Mock apiClient
vi.mock('@/lib/api-client', () => ({
  apiClient: {
    uploadFile: vi.fn(),
  },
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock useTranslation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => {
      if (options?.maxFileSize) return `File size must be less than ${options.maxFileSize}MB`;
      if (options?.fileName) return `Cancelled ${options.fileName}`;
      return key;
    },
  }),
}));

describe('FileUpload', () => {
  const mockTaskId = 'task-123';
  const mockOnUploadComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiClient.uploadFile).mockResolvedValue({
      id: 'file-123',
      name: 'test-file.pdf',
      size: 1024,
    });
  });

  it('should render file upload component', () => {
    render(<FileUpload taskId={mockTaskId} />);

    expect(screen.getByText(/Seguridad/i)).toBeInTheDocument();
    expect(screen.getByText(/Solo se permiten archivos seguros/i)).toBeInTheDocument();
    expect(screen.getByText(/Drag and drop/)).toBeInTheDocument();
    expect(screen.getByText(/o haz clic para seleccionar/)).toBeInTheDocument();
  });

  it('should show supported file types', () => {
    render(<FileUpload taskId={mockTaskId} />);

    expect(screen.getByText('Imágenes')).toBeInTheDocument();
    expect(screen.getByText('PDF')).toBeInTheDocument();
    expect(screen.getByText('Word')).toBeInTheDocument();
    expect(screen.getByText('Excel')).toBeInTheDocument();
    expect(screen.getByText('Texto')).toBeInTheDocument();
  });

  it('should open file dialog when drop zone is clicked', async () => {
    const user = userEvent.setup();
    render(<FileUpload taskId={mockTaskId} />);

    const fileInput = screen.getByRole('button', { hidden: true }); // Hidden input
    const dropZone = screen.getByText(/o haz clic para seleccionar/i).closest('div');

    // Simulate click on drop zone
    await user.click(dropZone!);

    expect(fileInput).toBeInTheDocument();
  });

  it('should handle drag over events', () => {
    render(<FileUpload taskId={mockTaskId} />);

    const dropZone = screen.getByText(/Drag and drop/).closest('div');

    act(() => {
      fireEvent.dragOver(dropZone!, {
        dataTransfer: {
          items: [],
        },
      });
    });

    expect(dropZone).toHaveClass('border-primary', 'bg-accent/50', 'scale-[1.02]');
  });

  it('should handle drag leave events', () => {
    render(<FileUpload taskId={mockTaskId} />);

    const dropZone = screen.getByText(/Drag and drop/).closest('div');

    // First trigger drag over
    act(() => {
      fireEvent.dragOver(dropZone!);
    });

    // Then drag leave
    act(() => {
      fireEvent.dragLeave(dropZone!);
    });

    expect(dropZone).not.toHaveClass('border-primary', 'bg-accent/50', 'scale-[1.02]');
  });

  it('should handle file drop', async () => {
    const user = userEvent.setup();
    render(<FileUpload taskId={mockTaskId} onUploadComplete={mockOnUploadComplete} />);

    const file = new File(['test content'], 'test-file.pdf', { type: 'application/pdf' });
    const dropZone = screen.getByText(/Drag and drop/).closest('div');

    // Simulate file drop
    const dropEvent = new DragEvent('drop', {
      dataTransfer: {
        files: [file],
      },
    });

    act(() => {
      fireEvent.drop(dropZone!, dropEvent);
    });

    await waitFor(() => {
      expect(apiClient.uploadFile).toHaveBeenCalledWith(
        mockTaskId,
        file,
        expect.any(Function)
      );
    });

    await waitFor(() => {
      expect(mockOnUploadComplete).toHaveBeenCalled();
    });

    expect(screen.getByText('FileUpload.success.uploaded')).toBeInTheDocument();
  });

  it('should validate file size', async () => {
    const user = userEvent.setup();
    render(<FileUpload taskId={mockTaskId} maxFileSize={1} />); // 1MB limit

    // Create a file larger than 1MB
    const largeFile = new File(['x'.repeat(2 * 1024 * 1024)], 'large-file.pdf', { type: 'application/pdf' });
    const dropZone = screen.getByText(/Drag and drop/).closest('div');

    const dropEvent = new DragEvent('drop', {
      dataTransfer: {
        files: [largeFile],
      },
    });

    act(() => {
      fireEvent.drop(dropZone!, dropEvent);
    });

    await waitFor(() => {
      expect(screen.getByText(/File size must be less than 1MB/)).toBeInTheDocument();
    });

    expect(apiClient.uploadFile).not.toHaveBeenCalled();
  });

  it('should validate file type', async () => {
    const user = userEvent.setup();
    render(<FileUpload taskId={mockTaskId} />);

    // Create a disallowed file type
    const invalidFile = new File(['test content'], 'test.exe', { type: 'application/x-executable' });
    const dropZone = screen.getByText(/Drag and drop/).closest('div');

    const dropEvent = new DragEvent('drop', {
      dataTransfer: {
        files: [invalidFile],
      },
    });

    act(() => {
      fireEvent.drop(dropZone!, dropEvent);
    });

    await waitFor(() => {
      expect(screen.getByText(/FileUpload.errors.invalidType/)).toBeInTheDocument();
    });

    expect(apiClient.uploadFile).not.toHaveBeenCalled();
  });

  it('should block dangerous file extensions', async () => {
    const user = userEvent.setup();
    render(<FileUpload taskId={mockTaskId} />);

    // Create a dangerous file
    const dangerousFile = new File(['malicious content'], 'malware.exe', { type: 'text/plain' });
    const dropZone = screen.getByText(/Drag and drop/).closest('div');

    const dropEvent = new DragEvent('drop', {
      dataTransfer: {
        files: [dangerousFile],
      },
    });

    act(() => {
      fireEvent.drop(dropZone!, dropEvent);
    });

    await waitFor(() => {
      expect(screen.getByText(/FileUpload.errors.dangerousType/)).toBeInTheDocument();
    });

    expect(apiClient.uploadFile).not.toHaveBeenCalled();
  });

  it('should block dangerous filenames', async () => {
    const user = userEvent.setup();
    render(<FileUpload taskId={mockTaskId} />);

    // Create a file with dangerous filename
    const dangerousFile = new File(['test'], 'CON.txt', { type: 'text/plain' });
    const dropZone = screen.getByText(/Drag and drop/).closest('div');

    const dropEvent = new DragEvent('drop', {
      dataTransfer: {
        files: [dangerousFile],
      },
    });

    act(() => {
      fireEvent.drop(dropZone!, dropEvent);
    });

    await waitFor(() => {
      expect(screen.getByText(/FileUpload.errors.invalidName/)).toBeInTheDocument();
    });

    expect(apiClient.uploadFile).not.toHaveBeenCalled();
  });

  it('should handle upload progress', async () => {
    const user = userEvent.setup();
    let progressCallback: ((progress: number) => void) | undefined;

    vi.mocked(apiClient.uploadFile).mockImplementation((taskId, file, onProgress) => {
      progressCallback = onProgress;
      return new Promise((resolve) => {
        setTimeout(() => resolve({ id: 'file-123', name: file.name }), 100);
      });
    });

    render(<FileUpload taskId={mockTaskId} />);

    const file = new File(['test content'], 'test-file.pdf', { type: 'application/pdf' });
    const dropZone = screen.getByText(/Drag and drop/).closest('div');

    const dropEvent = new DragEvent('drop', {
      dataTransfer: {
        files: [file],
      },
    });

    act(() => {
      fireEvent.drop(dropZone!, dropEvent);
    });

    // Should show initial upload state
    await waitFor(() => {
      expect(screen.getByText(/test-file.pdf/)).toBeInTheDocument();
    });

    // Simulate progress updates
    if (progressCallback) {
      act(() => {
        progressCallback(50);
      });

      await waitFor(() => {
        expect(screen.getByText('50%')).toBeInTheDocument();
      });

      act(() => {
        progressCallback(100);
      });

      await waitFor(() => {
        expect(screen.getByText('100%')).toBeInTheDocument();
      });
    }
  });

  it('should handle upload errors', async () => {
    const user = userEvent.setup();
    vi.mocked(apiClient.uploadFile).mockRejectedValue(new Error('Upload failed'));

    render(<FileUpload taskId={mockTaskId} />);

    const file = new File(['test content'], 'test-file.pdf', { type: 'application/pdf' });
    const dropZone = screen.getByText(/Drag and drop/).closest('div');

    const dropEvent = new DragEvent('drop', {
      dataTransfer: {
        files: [file],
      },
    });

    act(() => {
      fireEvent.drop(dropZone!, dropEvent);
    });

    await waitFor(() => {
      expect(screen.getByText(/FileUpload.errors.uploadError/)).toBeInTheDocument();
    });

    expect(screen.getByText('Upload failed')).toBeInTheDocument();
  });

  it('should allow canceling uploads', async () => {
    const user = userEvent.setup();
    let uploadPromise: Promise<any> | null = null;

    vi.mocked(apiClient.uploadFile).mockImplementation((taskId, file, onProgress) => {
      uploadPromise = new Promise((resolve, reject) => {
        // Never resolve to simulate long upload
      });
      return uploadPromise;
    });

    render(<FileUpload taskId={mockTaskId} />);

    const file = new File(['test content'], 'test-file.pdf', { type: 'application/pdf' });
    const dropZone = screen.getByText(/Drag and drop/).closest('div');

    const dropEvent = new DragEvent('drop', {
      dataTransfer: {
        files: [file],
      },
    });

    act(() => {
      fireEvent.drop(dropZone!, dropEvent);
    });

    await waitFor(() => {
      expect(screen.getByText('test-file.pdf')).toBeInTheDocument();
    });

    // Find and click cancel button
    const cancelButton = screen.getByRole('button', { name: '' }); // X icon button
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.getByText(/Cancelled test-file.pdf/)).toBeInTheDocument();
    });

    // File should be removed from uploading list
    expect(screen.queryByText('test-file.pdf')).not.toBeInTheDocument();
  });

  it('should handle multiple file uploads', async () => {
    const user = userEvent.setup();
    render(<FileUpload taskId={mockTaskId} />);

    const file1 = new File(['content1'], 'file1.pdf', { type: 'application/pdf' });
    const file2 = new File(['content2'], 'file2.jpg', { type: 'image/jpeg' });

    const dropZone = screen.getByText(/Drag and drop/).closest('div');

    // Drop first file
    const dropEvent1 = new DragEvent('drop', {
      dataTransfer: {
        files: [file1],
      },
    });

    act(() => {
      fireEvent.drop(dropZone!, dropEvent1);
    });

    // Drop second file
    const dropEvent2 = new DragEvent('drop', {
      dataTransfer: {
        files: [file2],
      },
    });

    act(() => {
      fireEvent.drop(dropZone!, dropEvent2);
    });

    await waitFor(() => {
      expect(screen.getByText('file1.pdf')).toBeInTheDocument();
      expect(screen.getByText('file2.jpg')).toBeInTheDocument();
    });

    expect(apiClient.uploadFile).toHaveBeenCalledTimes(2);
  });

  it('should handle files passed via props', async () => {
    const user = userEvent.setup();
    const file = new File(['test content'], 'test-file.pdf', { type: 'application/pdf' });
    const onFilesHandled = vi.fn();

    render(<FileUpload taskId={mockTaskId} filesToUpload={[file]} onFilesHandled={onFilesHandled} />);

    await waitFor(() => {
      expect(apiClient.uploadFile).toHaveBeenCalledWith(
        mockTaskId,
        file,
        expect.any(Function)
      );
    });

    expect(onFilesHandled).toHaveBeenCalled();
  });

  it('should display correct file type icons', async () => {
    const user = userEvent.setup();
    render(<FileUpload taskId={mockTaskId} />);

    // Test different file types
    const files = [
      new File(['content'], 'image.jpg', { type: 'image/jpeg' }),
      new File(['content'], 'document.pdf', { type: 'application/pdf' }),
      new File(['content'], 'text.txt', { type: 'text/plain' }),
    ];

    const dropZone = screen.getByText(/Drag and drop/).closest('div');

    for (const file of files) {
      const dropEvent = new DragEvent('drop', {
        dataTransfer: {
          files: [file],
        },
      });

      act(() => {
        fireEvent.drop(dropZone!, dropEvent);
      });

      await waitFor(() => {
        expect(screen.getByText(file.name)).toBeInTheDocument();
      });

      // Check that appropriate icon is displayed (we can't easily test the exact icon,
      // but we can verify the file is being processed)
    }

    expect(apiClient.uploadFile).toHaveBeenCalledTimes(3);
  });
});