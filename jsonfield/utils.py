import datetime
from decimal import Decimal

from django.conf import settings
from django.core.cache import cache
from django.core.serializers.json import DjangoJSONEncoder
from django.db import models, DatabaseError, transaction

from jsonfield import __version__

DB_TYPE_CACHE_KEY = (
    'django-jsonfield:db-type:%s' % __version__ +
    '%(ENGINE)s:%(HOST)s:%(PORT)s:%(NAME)s'
)

class TZAwareJSONEncoder(DjangoJSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime.datetime):
            return obj.strftime("%Y-%m-%d %H:%M:%S%z")
        return super(TZAwareJSONEncoder, self).default(obj)

def default(o):
    if hasattr(o, 'to_json'):
        return o.to_json()
    if isinstance(o, Decimal):
        return str(o)
    if isinstance(o, datetime.datetime):
        if o.tzinfo:
            return o.strftime('%Y-%m-%dT%H:%M:%S%z')
        return o.strftime("%Y-%m-%dT%H:%M:%S")
    if isinstance(o, datetime.date):
        return o.strftime("%Y-%m-%d")
    if isinstance(o, datetime.time):
        if o.tzinfo:
            return o.strftime('%H:%M:%S%z')
        return o.strftime("%H:%M:%S")
    
    raise TypeError(repr(o) + " is not JSON serializable")


def db_type(connection):
    cache_key = DB_TYPE_CACHE_KEY % connection.settings_dict
    db_type = cache.get(cache_key)
    
    if not db_type:
        # Test to see if we support JSON querying.
        cursor = connection.cursor()
        try:
            sid = transaction.savepoint(using=connection.alias)
            cursor.execute('SELECT \'{}\'::jsonb = \'{}\'::jsonb;')
        except DatabaseError:
            transaction.savepoint_rollback(sid, using=connection.alias)
            db_type = 'text'
        else:
            db_type = 'jsonb'
        cache.set(cache_key, db_type)
    
    return db_type