__version__ = "0.7.1"

# Temporary fix to not fail when django is not yet installed.
try:
    from fields import JSONField
except ImportError:
    pass