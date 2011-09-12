from django import template
from django.utils import simplejson as json
from django.utils.safestring import mark_safe
from django.core.serializers.json import DjangoJSONEncoder

register = template.Library()

@register.filter
def jsonify(value):
    return mark_safe(json.dumps(value, cls=DjangoJSONEncoder))
