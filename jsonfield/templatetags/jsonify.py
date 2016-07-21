import json

from django import template
from django.utils.safestring import mark_safe
from jsonfield.utils import TZAwareJSONEncoder

register = template.Library()


@register.filter
def jsonify(value):
    # If we have a queryset, then convert it into a list.
    if getattr(value, 'all', False):
        value = list(value)

    json_str = json.dumps(value, cls=TZAwareJSONEncoder)

    unsafe_chars = {
        '&': '\\u0026',
        '<': '\\u003c',
        '>': '\\u003e',
        '\u2028': '\\u2028',
        '\u2029': '\\u2029',
    }
    for (unsafe, safe) in unsafe_chars.items():
        json_str = json_str.replace(unsafe, safe)

    return json_str
