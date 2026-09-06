"""Add extended tenant columns: short_name, institution_type, custom_domain, and JSON branding

Revision ID: 0004_tenant_extended_columns
Revises: 0003_optimized_content_schema
Create Date: 2026-09-06 21:40:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0004_tenant_extended_columns'
down_revision: Union[str, None] = '0003_optimized_content_schema'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Add extended columns
    op.add_column('tenants', sa.Column('short_name', sa.String(length=64), nullable=True))
    op.add_column(
        'tenants',
        sa.Column('institution_type', sa.String(length=32), server_default='university', nullable=False)
    )
    op.add_column('tenants', sa.Column('custom_domain', sa.String(length=255), nullable=True))
    op.create_unique_constraint('uq_tenants_custom_domain', 'tenants', ['custom_domain'])

    # 2. Alter branding from text to JSON
    op.alter_column(
        'tenants',
        'branding',
        existing_type=sa.Text(),
        type_=sa.JSON(),
        postgresql_using='branding::json',
        existing_nullable=True
    )


def downgrade() -> None:
    op.alter_column(
        'tenants',
        'branding',
        existing_type=sa.JSON(),
        type_=sa.Text(),
        postgresql_using='branding::text',
        existing_nullable=True
    )
    op.drop_constraint('uq_tenants_custom_domain', 'tenants', type_='unique')
    op.drop_column('tenants', 'custom_domain')
    op.drop_column('tenants', 'institution_type')
    op.drop_column('tenants', 'short_name')
