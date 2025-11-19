import { Alert, Box, Container, Typography } from '@mui/material';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { useGetBooksApiV1HighlightsBooksGet } from '../../api/generated/highlights/highlights';
import { usePullToRefresh } from '../../hooks/usePullToRefresh';
import { PullToRefreshIndicator } from '../common/PullToRefreshIndicator';
import { SearchBar } from '../common/SearchBar';
import { SectionTitle } from '../common/SectionTitle';
import { Spinner } from '../common/Spinner';
import { BookList } from './components/BookList';

export const LandingPage = () => {
  const navigate = useNavigate({ from: '/' });
  const { search } = useSearch({ from: '/' });
  const searchText = search || '';
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useGetBooksApiV1HighlightsBooksGet({
    search: searchText || undefined,
  });

  const handleSearch = (value: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        search: value || undefined,
      }),
      replace: true,
    });
  };

  // Pull to refresh handler
  const handleRefresh = async () => {
    await queryClient.invalidateQueries({
      queryKey: ['getBooks'],
    });
  };

  // Initialize pull-to-refresh
  const pullToRefreshState = usePullToRefresh({
    onRefresh: handleRefresh,
  });

  return (
    <>
      <PullToRefreshIndicator {...pullToRefreshState} />
      <Container maxWidth="lg">
        <Box sx={{ mt: { xs: 6, md: 8 }, mb: 6, textAlign: 'center' }}>
          <Typography variant="h2" component="h1" gutterBottom>
            Welcome to Crossbill
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
            Your highlights management application
          </Typography>
        </Box>

      <Box sx={{ mb: 4 }}>
        <SectionTitle showDivider>Books</SectionTitle>

        <Box sx={{ mb: 3 }}>
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search books by title or author..."
            initialValue={searchText}
          />
        </Box>

        {isLoading && <Spinner />}

        {isError && (
          <Box sx={{ py: 3 }}>
            <Alert severity="error">Failed to load books. Please try again later.</Alert>
          </Box>
        )}

        {data?.books && data.books.length === 0 && (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No books found. Upload some highlights to get started!
            </Typography>
          </Box>
        )}

        {data?.books && data.books.length > 0 && <BookList books={data.books} />}
      </Box>
      </Container>
    </>
  );
};
