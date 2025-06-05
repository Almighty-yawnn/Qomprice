# alembic/env.py

from logging.config import fileConfig
import os # Added for path manipulation
import sys # Added for path manipulation

from sqlalchemy import pool
# For async, we will need create_async_engine or async_engine_from_config
from sqlalchemy.ext.asyncio import create_async_engine # If using create_async_engine directly
# OR, if using config for async engine (often preferred)
# from sqlalchemy.ext.asyncio import async_engine_from_config


from alembic import context

# --- Path setup to help Alembic find your 'app' module ---
# This assumes your 'app' directory is one level up from the 'alembic' directory
project_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, project_dir)
# --- End Path setup ---

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
# from myapp import mymodel
# target_metadata = mymodel.Base.metadata
from app.db import Base  # Import your declarative base
from app.models import * # Import all your models so Alembic sees them
target_metadata = Base.metadata

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        # For async, you might need to indicate that transactions are not per-migration
        # if your DB driver doesn't support DDL in transactions or if you have issues.
        # transaction_per_migration=True # Default, usually fine
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection):
    """Helper function to run migrations with a given connection."""
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        # For async, as above, consider transaction_per_migration if issues arise
        # transaction_per_migration=True
    )

    with context.begin_transaction():
        context.run_migrations()

async def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    # Get the SQLAlchemy URL from alembic.ini
    # This will be used by async_engine_from_config or create_async_engine
    db_url = config.get_main_option("sqlalchemy.url")
    if not db_url:
        raise ValueError("Database URL not found in alembic.ini (sqlalchemy.url)")

    # Create an async engine.
    # Using async_engine_from_config is generally good if you have other engine params in config.
    # connectable = async_engine_from_config(
    #     config.get_section(config.config_ini_section, {}),
    #     prefix="sqlalchemy.",
    #     poolclass=pool.NullPool,
    # )
    # Or create it directly if you prefer:
    connectable = create_async_engine(db_url, poolclass=pool.NullPool)


    async with connectable.connect() as connection:
        # For async, we need to run the migrations within the run_sync method of the connection
        await connection.run_sync(do_run_migrations)

    # Dispose of the engine once done
    await connectable.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    # For async, we need to use asyncio.run() to execute the async function
    import asyncio
    asyncio.run(run_migrations_online())