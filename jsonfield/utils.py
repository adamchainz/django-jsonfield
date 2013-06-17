import datetime
from decimal import Decimal

from django.core.serializers.json import DjangoJSONEncoder

DATETIME = (datetime.datetime,)
DATE = (datetime.date,)
TIME = (datetime.time,)

try:
    import freezegun.api
except ImportError:
    pass
else:
    DATETIME += (freezegun.api.FakeDatetime,)
    DATE += (freezegun.api.FakeDate,)
    
class TZAwareJSONEncoder(DjangoJSONEncoder):
    def default(self, obj):
        if isinstance(obj, DATETIME):
            return obj.strftime("%Y-%m-%d %H:%M:%S%z")
        return super(TZAwareJSONEncoder, self).default(obj)

def default(o):
    if hasattr(o, 'to_json'):
        return o.to_json()
    if isinstance(o, Decimal):
        return str(o)
    if isinstance(o, DATETIME):
        if o.tzinfo:
            return o.strftime('%Y-%m-%dT%H:%M:%S%z')
        return o.strftime("%Y-%m-%dT%H:%M:%S")
    if isinstance(o, DATE):
        return o.strftime("%Y-%m-%d")
    if isinstance(o, TIME):
        if o.tzinfo:
            return o.strftime('%H:%M:%S%z')
        return o.strftime("%H:%M:%S")
    
    raise TypeError(repr(o) + " is not JSON serializable")
