import datetime
from django.core.serializers.json import DjangoJSONEncoder

class TZAwareJSONEncoder(DjangoJSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime.datetime):
            return obj.strftime("%Y-%m-%d %H:%M:%S%z")
        return super(TZAwareJSONEncoder, self).default(obj)