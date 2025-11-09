"""Add cover column to books table.

Revision ID: 003
Revises: 002
Create Date: 2025-11-09 12:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "003"
down_revision: str | None = "002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Add cover column to books table."""
    op.add_column(
        "books",
        sa.Column("cover", sa.String(length=500), nullable=True),
    )


def downgrade() -> None:
    """Remove cover column from books table."""
    op.drop_column("books", "cover")
