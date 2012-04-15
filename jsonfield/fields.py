from django.core.exceptions import ValidationError
from django.db import models
from django.utils import simplejson as json
from django.utils.translation import ugettext as _

from decimal import Decimal
import datetime

from forms import JSONFormField

def default(o):
    if isinstance(o, Decimal):
        return str(o)
    if isinstance(o, datetime.datetime):
        return o.strftime("%Y-%m-%dT%H:%M:%S")
    if isinstance(o, datetime.date):
        return o.strftime("%Y-%m-%d")
    if isinstance(o, datetime.time):
        return o.strftime("%H:%M:%S")

    raise TypeError(repr(o) + " is not JSON serializable")


class JSONField(models.TextField):
    """
    A field that will ensure the data entered into it is valid JSON.
    """
    __metaclass__ = models.SubfieldBase
    default_error_messages = {
        'invalid': _(u"'%s' is not a valid JSON string.")
    }
    description = "JSON object"
    
    def formfield(self, **kwargs):
        return super(JSONField, self).formfield(form_class=JSONFormField, **kwargs)
    
    def validate(self, value, model_instance):
        if not self.null and value is None:
            raise ValidationError(self.error_messages['null'])
        try:
            self.get_db_prep_value(value)
        except:
            raise ValidationError(self.error_messages['invalid'])

    def get_default(self):
        if self.has_default():
            if callable(self.default):
                return self.default()
            return self.default
        return super(JSONField, self).get_default()

    def to_python(self, value):
        if isinstance(value, basestring):
            if value is None:
                return None
            if value == "":
                if self.null:
                    return None
                if self.blank:
                    return ""
            try:
                value = json.loads(value)
            except ValueError:
                msg = self.error_messages['invalid'] % str(value)
                raise ValidationError(msg)
        # TODO: Look for date/time/datetime objects within the structure?
        return value

    def get_db_prep_value(self, value, connection=None, prepared=None):
        if value is None:
            if not self.null and self.blank:
                return ""
            return None
        return json.dumps(value, default=default)
    
    def get_prep_lookup(self, lookup_type, value):
        if lookup_type in ["exact", "iexact"]:
            return self.to_python(self.get_db_prep_value(value))
        if lookup_type == "in":
            return [self.to_python(self.get_db_prep_value(v)) for v in value]
        if lookup_type == "isnull":
            return value
        if lookup_type in ["contains", "icontains"]:
            if isinstance(value, (list, tuple)):
                raise TypeError("Lookup type %r not supported with argument of %s" % (
                    lookup_type, type(value).__name__
                ))
                # Need a way co combine the values with '%', but don't escape that.
                return self.get_db_prep_value(value)[1:-1].replace(', ', r'%')
            if isinstance(value, dict):
                return self.get_db_prep_value(value)[1:-1]
            return self.to_python(self.get_db_prep_value(value))
        raise TypeError('Lookup type %r not supported' % lookup_type)

    def value_to_string(self, obj):
        return self._get_val_from_obj(obj)

try:
    from south.modelsinspector import add_introspection_rules
    add_introspection_rules([], ['^jsonfield\.fields\.JSONField'])
except ImportError:
    pass