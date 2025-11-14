"""Add soft delete to book_tags join table.

Revision ID: 009
Revises: 008
Create Date: 2025-11-14 00:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "009"
down_revision: str | None = "008"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Add deleted_at column to book_tags table for soft deletion."""
    op.add_column(
        "book_tags",
        sa.Column(
            "deleted_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
    )
    # Add index for efficient filtering of non-deleted tags
    op.create_index(
        op.f("ix_book_tags_deleted_at"),
        "book_tags",
        ["deleted_at"],
        unique=False,
    )


def downgrade() -> None:
    """Remove deleted_at column from book_tags table."""
    op.drop_index(op.f("ix_book_tags_deleted_at"), table_name="book_tags")
    op.drop_column("book_tags", "deleted_at")
