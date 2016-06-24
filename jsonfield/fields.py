from __future__ import unicode_literals
import json

from django.core.exceptions import ValidationError
from django.conf import settings
from django.db import models
from django.db.backends.signals import connection_created
from django.utils.translation import ugettext_lazy as _
from django.utils import six

from .utils import _resolve_object_path
from .widgets import JSONWidget
from .forms import JSONFormField


class JSONField(models.Field):
    """
    A field that will ensure the data entered into it is valid JSON.
    """
    default_error_messages = {
        'invalid': _("'%s' is not a valid JSON string.")
    }
    description = "JSON object"

    def __init__(self, *args, **kwargs):
        if not kwargs.get('null', False):
            kwargs['default'] = kwargs.get('default', dict)
        self.encoder_kwargs = {
            'indent': kwargs.pop('indent', getattr(settings, 'JSONFIELD_INDENT', None)),
        }
        # This can be an object (probably a class), or a path which can be imported, resulting
        # in an object.
        encoder_class = kwargs.pop('encoder_class', getattr(settings, 'JSONFIELD_ENCODER_CLASS', None))
        if encoder_class:
            self.encoder_kwargs['cls'] = _resolve_object_path(encoder_class)

        self.decoder_kwargs = dict(kwargs.pop('decoder_kwargs', getattr(settings, 'JSONFIELD_DECODER_KWARGS', {})))
        super(JSONField, self).__init__(*args, **kwargs)
        self.validate(self.get_default(), None)

    def formfield(self, **kwargs):
        defaults = {
            'form_class': JSONFormField,
            'widget': JSONWidget
        }
        defaults.update(**kwargs)
        return super(JSONField, self).formfield(**defaults)

    def validate(self, value, model_instance):
        if not self.null and value is None:
            raise ValidationError(self.error_messages['null'])
        try:
            self.get_prep_value(value)
        except ValueError:
            raise ValidationError(self.error_messages['invalid'] % value)

    def get_default(self):
        if self.has_default():
            default = self.default
            if callable(default):
                default = default()
            if isinstance(default, six.string_types):
                return json.loads(default, **self.decoder_kwargs)
            return json.loads(json.dumps(default, **self.encoder_kwargs), **self.decoder_kwargs)
        return super(JSONField, self).get_default()

    def get_internal_type(self):
        return 'TextField'

    def db_type(self, connection):
        if connection.vendor == 'postgresql':
            # Only do jsonb if in pg 9.4+
            if connection.pg_version >= 90400:
                return 'jsonb'
            return 'text'
        if connection.vendor == 'mysql':
            return 'longtext'
        if connection.vendor == 'oracle':
            return 'long'
        return 'text'

    def from_db_value(self, value, expression, connection, context):
        if value is None:
            return None
        return json.loads(value, **self.decoder_kwargs)


    def get_db_prep_value(self, value, connection=None, prepared=None):
        return self.get_prep_value(value)

    def get_prep_value(self, value):
        if value is None:
            if not self.null and self.blank:
                return ""
            return None
        return json.dumps(value, **self.encoder_kwargs)

    def get_prep_lookup(self, lookup_type, value):
        if lookup_type in ["exact", "iexact", "in", "isnull"]:
            return value
        if lookup_type in ["contains", "icontains"]:
            if isinstance(value, (list, tuple)):
                raise TypeError("Lookup type %r not supported with argument of %s" % (
                    lookup_type, type(value).__name__
                ))
                # Need a way co combine the values with '%', but don't escape that.
                return self.get_prep_value(value)[1:-1].replace(', ', r'%')
            if isinstance(value, dict):
                return self.get_prep_value(value)[1:-1]
            return self.get_prep_value(value)
        raise TypeError('Lookup type %r not supported' % lookup_type)

    def value_to_string(self, obj):
        return self._get_val_from_obj(obj)


class TypedJSONField(JSONField):
    """

    """
    def __init__(self, *args, **kwargs):
        self.json_required_fields = kwargs.pop('required_fields', {})
        self.json_validators = kwargs.pop('validators', [])

        super(TypedJSONField, self).__init__(*args, **kwargs)

    def cast_required_fields(self, obj):
        if not obj:
            return
        for field_name, field_type in self.json_required_fields.items():
            obj[field_name] = field_type.to_python(obj[field_name])

    def to_python(self, value):
        value = super(TypedJSONField, self).to_python(value)

        if isinstance(value, list):
            for item in value:
                self.cast_required_fields(item)
        else:
            self.cast_required_fields(value)

        return value

    def validate(self, value, model_instance):
        super(TypedJSONField, self).validate(value, model_instance)

        for v in self.json_validators:
            if isinstance(value, list):
                for item in value:
                    v(item)
            else:
                v(value)


def configure_database_connection(connection, **kwargs):
    if connection.vendor != 'postgresql':
        return

    # Ensure that psycopg does not do JSON decoding under the hood
    # We want to be able to do our own decoding with our own options
    import psycopg2.extras
    if hasattr(psycopg2.extras, 'register_default_jsonb'):
        psycopg2.extras.register_default_jsonb(
            connection.connection,
            globally=False,
            loads=lambda x: x)


connection_created.connect(configure_database_connection)
