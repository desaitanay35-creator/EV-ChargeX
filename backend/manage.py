#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys


def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'evchargex.settings')
    # Monkeypatch Django BaseContext.__copy__ for Python 3.14 compatibility
    try:
        from django.template.context import BaseContext
        def safe_copy(self):
            duplicate = self.__class__.__new__(self.__class__)
            duplicate.__dict__.update(self.__dict__)
            if hasattr(self, 'dicts'):
                duplicate.dicts = self.dicts[:]
            return duplicate
        BaseContext.__copy__ = safe_copy
    except Exception:
        pass

    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
