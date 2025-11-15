"""Tag repository for database operations."""

import logging
from datetime import UTC, datetime

from sqlalchemy import and_, select, update
from sqlalchemy.orm import Session

from crossbill import models

logger = logging.getLogger(__name__)


class TagRepository:
    """Repository for Tag database operations."""

    def __init__(self, db: Session) -> None:
        """Initialize repository with database session."""
        self.db = db

    def get_by_name(self, name: str) -> models.Tag | None:
        """Get a tag by its name."""
        stmt = select(models.Tag).where(models.Tag.name == name)
        return self.db.execute(stmt).scalar_one_or_none()

    def get_by_id(self, tag_id: int) -> models.Tag | None:
        """Get a tag by its ID."""
        stmt = select(models.Tag).where(models.Tag.id == tag_id)
        return self.db.execute(stmt).scalar_one_or_none()

    def create(self, name: str) -> models.Tag:
        """Create a new tag."""
        tag = models.Tag(name=name)
        self.db.add(tag)
        self.db.flush()
        self.db.refresh(tag)
        logger.info(f"Created tag: {tag.name} (id={tag.id})")
        return tag

    def get_or_create(self, name: str) -> models.Tag:
        """Get existing tag by name or create a new one."""
        tag = self.get_by_name(name)
        if tag:
            return tag
        return self.create(name)

    def get_or_create_many(self, tag_names: list[str]) -> list[models.Tag]:
        """
        Get or create multiple tags in bulk.

        This is much more efficient than calling get_or_create in a loop.

        Args:
            tag_names: List of tag names to get or create

        Returns:
            list[Tag]: List of tag objects in the same order as tag_names
        """
        if not tag_names:
            return []

        # Fetch all existing tags in one query
        stmt = select(models.Tag).where(models.Tag.name.in_(tag_names))
        existing_tags = list(self.db.execute(stmt).scalars().all())
        existing_by_name = {tag.name: tag for tag in existing_tags}

        # Determine which tags need to be created
        missing_names = [name for name in tag_names if name not in existing_by_name]

        # Bulk create missing tags
        if missing_names:
            new_tags = [models.Tag(name=name) for name in missing_names]
            self.db.add_all(new_tags)
            self.db.flush()
            for tag in new_tags:
                self.db.refresh(tag)
                existing_by_name[tag.name] = tag
            logger.info(f"Created {len(new_tags)} tags: {missing_names}")

        # Return tags in the same order as input
        return [existing_by_name[name] for name in tag_names]

    def get_all(self) -> list[models.Tag]:
        """Get all tags."""
        stmt = select(models.Tag).order_by(models.Tag.name)
        return list(self.db.execute(stmt).scalars().all())

    def set_tags(self, book_id: int, tag_ids: list[int]) -> None:
        """
        Set book tags to exactly match the provided list (UI edit use case).

        This is a DEFINITE operation - the book's tags will match this list exactly:
        - Creates new associations for tags in the list
        - Restores soft-deleted associations that are in the list
        - Soft-deletes associations NOT in the list

        Args:
            book_id: ID of the book
            tag_ids: Complete list of tag IDs the book should have
        """
        # Get all current associations (including soft-deleted) in one query
        stmt = select(models.book_tags).where(models.book_tags.c.book_id == book_id)
        current_associations = self.db.execute(stmt).fetchall()

        # Build maps for efficient lookup
        current_by_tag_id = {assoc.tag_id: assoc for assoc in current_associations}
        tag_ids_set = set(tag_ids)

        # Determine operations
        to_create = []  # New associations
        to_restore = []  # Soft-deleted associations to restore

        for tag_id in tag_ids:
            if tag_id in current_by_tag_id:
                # Association exists - restore if soft-deleted
                if current_by_tag_id[tag_id].deleted_at is not None:
                    to_restore.append(tag_id)
            else:
                # Association doesn't exist - create it
                to_create.append(tag_id)

        # Find associations to soft-delete (exist but not in the list)
        to_delete = [
            assoc.tag_id
            for assoc in current_associations
            if assoc.tag_id not in tag_ids_set and assoc.deleted_at is None
        ]

        # Execute bulk operations
        if to_restore:
            update_stmt = (
                update(models.book_tags)
                .where(
                    and_(
                        models.book_tags.c.book_id == book_id,
                        models.book_tags.c.tag_id.in_(to_restore),
                    )
                )
                .values(deleted_at=None)
            )
            self.db.execute(update_stmt)
            logger.info(f"Restored {len(to_restore)} soft-deleted tags for book {book_id}")

        if to_create:
            values = [{"book_id": book_id, "tag_id": tag_id} for tag_id in to_create]
            insert_stmt = models.book_tags.insert().values(values)
            self.db.execute(insert_stmt)
            logger.info(f"Created {len(to_create)} new tag associations for book {book_id}")

        if to_delete:
            update_stmt = (
                update(models.book_tags)
                .where(
                    and_(
                        models.book_tags.c.book_id == book_id,
                        models.book_tags.c.tag_id.in_(to_delete),
                    )
                )
                .values(deleted_at=datetime.now(UTC))
            )
            self.db.execute(update_stmt)
            logger.info(f"Soft-deleted {len(to_delete)} tag associations for book {book_id}")

        self.db.flush()

    def add_new_tags(self, book_id: int, tag_ids: list[int]) -> None:
        """
        Add new tags to book without modifying existing associations (device upload use case).

        This is an ADDITIVE operation - only adds tags that don't exist yet:
        - Creates associations for tags not yet associated with the book
        - Does NOT restore soft-deleted associations
        - Does NOT soft-delete any associations

        Args:
            book_id: ID of the book
            tag_ids: List of tag IDs to add (if not already present)
        """
        if not tag_ids:
            return

        # Get existing associations (including soft-deleted) in one query
        stmt = select(models.book_tags.c.tag_id).where(
            and_(
                models.book_tags.c.book_id == book_id,
                models.book_tags.c.tag_id.in_(tag_ids),
            )
        )
        existing_tag_ids = {row[0] for row in self.db.execute(stmt).fetchall()}

        # Only add tags that don't have any association (even soft-deleted)
        to_create = [tag_id for tag_id in tag_ids if tag_id not in existing_tag_ids]

        if to_create:
            values = [{"book_id": book_id, "tag_id": tag_id} for tag_id in to_create]
            insert_stmt = models.book_tags.insert().values(values)
            self.db.execute(insert_stmt)
            logger.info(f"Added {len(to_create)} new tags from device for book {book_id}")
            self.db.flush()
