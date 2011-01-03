from django.db import models
from jsonfield import JSONField

class JSONFieldTestModel(models.Model):
    json = JSONField(u"test", null=True, blank=True)
