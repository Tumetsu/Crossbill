"""Service layer for tag-related business logic."""

import logging

from sqlalchemy.orm import Session

from crossbill import models, repositories

logger = logging.getLogger(__name__)


class TagService:
    """Service for handling tag-related operations."""

    def __init__(self, db: Session) -> None:
        """Initialize service with database session."""
        self.db = db
        self.tag_repo = repositories.TagRepository(db)
        self.book_repo = repositories.BookRepository(db)

    def set_tags(self, book_id: int, tags: list[str | int]) -> models.Book:
        """
        Set book tags to exactly match the provided list (UI edit use case).

        This is a DEFINITE operation - the book's final tags will match this list exactly.
        - Creates new tags if they don't exist
        - Creates new associations
        - Restores soft-deleted associations
        - Soft-deletes associations not in the list

        Args:
            book_id: ID of the book to update
            tags: List of tag names (for new tags) or tag IDs (for existing tags)

        Returns:
            Updated book with new tags

        Raises:
            ValueError: If book is not found
        """
        book = self.book_repo.get_by_id(book_id)
        if not book:
            raise ValueError(f"Book with id {book_id} not found")

        # Separate tag IDs from tag names
        tag_ids = []
        tag_names = []

        for tag in tags:
            if isinstance(tag, int):
                tag_ids.append(tag)
            elif isinstance(tag, str):
                tag_names.append(tag.strip())

        # Filter out empty strings
        tag_names = [name for name in tag_names if name]

        # Get or create tags for the names (1-2 queries)
        if tag_names:
            created_tags = self.tag_repo.get_or_create_many(tag_names)
            tag_ids.extend([tag.id for tag in created_tags])

        # Set the exact list of tags (1 query to fetch, up to 3 queries for operations)
        self.tag_repo.set_tags(book_id, tag_ids)

        self.db.flush()
        self.db.refresh(book)

        logger.info(f"Set tags for book {book_id} to {len(tag_ids)} tags")
        return book

    def add_tags_from_device(self, book_id: int, tag_names: list[str]) -> models.Book:
        """
        Add tags from device upload (ADDITIVE operation).

        This only creates new tags and associations - it never:
        - Restores soft-deleted associations
        - Soft-deletes any associations
        - Modifies existing associations

        Args:
            book_id: ID of the book to update
            tag_names: List of tag names from device

        Returns:
            Updated book

        Raises:
            ValueError: If book is not found
        """
        book = self.book_repo.get_by_id(book_id)
        if not book:
            raise ValueError(f"Book with id {book_id} not found")

        # Clean tag names
        cleaned_names = [name.strip() for name in tag_names if name.strip()]

        if not cleaned_names:
            return book

        # Get or create tags (1-2 queries)
        tags = self.tag_repo.get_or_create_many(cleaned_names)
        tag_ids = [tag.id for tag in tags]

        # Add only new associations (1 query to fetch existing, 1 query to insert new)
        self.tag_repo.add_new_tags(book_id, tag_ids)

        self.db.flush()
        self.db.refresh(book)

        logger.info(f"Added {len(tag_ids)} tags from device for book {book_id}")
        return book

    def get_all_tags(self) -> list[models.Tag]:
        """Get all available tags."""
        return self.tag_repo.get_all()
