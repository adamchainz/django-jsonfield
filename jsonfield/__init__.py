import os

from .fields import JSONField

__all__ = ('JSONField',)

with open(os.path.join(os.path.dirname(__file__), 'VERSION')) as fp:
    __version__ = fp.read().strip()
