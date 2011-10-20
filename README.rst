django-jsonfield
===================

I had a serious need for a JSON field for django. There were a couple out
there, but none packaged up nicely on bitbucket/github that were usable
with ``pip install -e``.

So I took the code from `David Cramer's blog`_, and packaged it up.

To use, just install the package, and then use the field::


    from django.db import models
    import jsonfield
    
    class MyModel(models.Model):
        the_json = jsonfield.JSONField()
    
Now, it will validate the JSON on entry, and store it as a string in the
database.  When you instantiate/fetch the object, it will be turned back
into a python list/dict/string.


Todo
----------

Convert date/time objects nicely to/from ISO strings (YYYY-mm-dd HH:MM:SS 
TZNAME). This is actually a bit tricky, as we don't know if we are expecting
a date/time object. We may parse objects as we go, but there could be
some performance issues with this.

.. _David Cramer's blog: http://justcramer.com/2009/04/14/cleaning-up-with-json-and-sql/