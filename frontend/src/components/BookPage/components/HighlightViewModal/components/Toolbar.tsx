import {
  useCreateBookmarkApiV1BooksBookIdBookmarkPost,
  useDeleteBookmarkApiV1BooksBookIdBookmarkBookmarkIdDelete,
} from '@/api/generated/books/books';
import type { Bookmark } from '@/api/generated/model';
import {
  BookmarkBorder as BookmarkBorderIcon,
  Bookmark as BookmarkIcon,
  Delete as DeleteIcon,
  Notes as NotesIcon,
} from '@mui/icons-material';
import { Box, IconButton } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

interface ToolbarProps {
  highlightId: number;
  bookId: number;
  bookmark?: Bookmark;
  hasNote: boolean;
  noteVisible: boolean;
  onNoteToggle: () => void;
  onDelete: () => void;
  disabled?: boolean;
}

export const Toolbar = ({
  highlightId,
  bookId,
  bookmark,
  hasNote,
  noteVisible,
  onNoteToggle,
  onDelete,
  disabled = false,
}: ToolbarProps) => {
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

  const createBookmarkMutation = useCreateBookmarkApiV1BooksBookIdBookmarkPost({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: [`/api/v1/books/${bookId}`],
        });
      },
      onError: (error) => {
        console.error('Failed to create bookmark:', error);
        alert('Failed to create bookmark. Please try again.');
      },
    },
  });

  const deleteBookmarkMutation = useDeleteBookmarkApiV1BooksBookIdBookmarkBookmarkIdDelete({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: [`/api/v1/books/${bookId}`],
        });
      },
      onError: (error) => {
        console.error('Failed to delete bookmark:', error);
        alert('Failed to delete bookmark. Please try again.');
      },
    },
  });

  const handleBookmarkToggle = async () => {
    setIsProcessing(true);
    try {
      if (bookmark) {
        // Remove bookmark
        await deleteBookmarkMutation.mutateAsync({
          bookId,
          bookmarkId: bookmark.id,
        });
      } else {
        // Create bookmark
        await createBookmarkMutation.mutateAsync({
          bookId,
          data: { highlight_id: highlightId },
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const isLoading = disabled || isProcessing;

  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
      <IconButton
        onClick={handleBookmarkToggle}
        disabled={isLoading}
        aria-label={bookmark ? 'Remove bookmark' : 'Add bookmark'}
        size="small"
      >
        {bookmark ? <BookmarkIcon /> : <BookmarkBorderIcon />}
      </IconButton>
      <IconButton
        onClick={onNoteToggle}
        disabled={isLoading}
        aria-label={noteVisible ? 'Hide note' : 'Show note'}
        size="small"
        sx={{
          color: hasNote || noteVisible ? 'primary.main' : 'inherit',
        }}
      >
        <NotesIcon />
      </IconButton>
      <IconButton
        onClick={onDelete}
        disabled={isLoading}
        aria-label="Delete highlight"
        size="small"
      >
        <DeleteIcon />
      </IconButton>
    </Box>
  );
};
