import os
__version__ = open(os.path.join(os.path.dirname(__file__),'VERSION')).read().strip()

# Temporary fix to not fail when django is not yet installed.
try:
    from fields import JSONField
except ImportError:
    pass