import os
__version__ = open(os.path.join(os.path.dirname(__file__), 'VERSION')).read().strip()

try:
    from .fields import JSONField  # NOQA
except ImportError:
    pass
