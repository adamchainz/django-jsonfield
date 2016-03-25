django-jsonfield
===================

.. image:: https://codeship.com/projects/2e1a3d30-7db7-0132-629f-4abd151a3721/status?branch=default

I had a serious need for a JSON field for django. There were a couple out
there, but none packaged up nicely on bitbucket/github that were usable
with ``pip install -e``.

So I took the code from `David Cramer's blog`_, and packaged it up.

Usage
-----

To use, just install the package, and then use the field::

    from django.db import models
    import jsonfield

    class MyModel(models.Model):
        the_json = jsonfield.JSONField()

You can assign any JSON-encodable object to this field. It will be
JSON-encoded before being stored in the database as a text value and it
will be turned back into a python list/dict/string upon retrieval from the
database.

There is also a ``TypedJSONField``, that allows you to define data types that must be included within each object in the array. More documentation to follow.


Notes
~~~~~

If no ``default`` is provided, and ``null=True`` is not passed in to the
field constructor, then a default of ``{}`` will be used.


Supported django versions
-------------------------

All versions of Django from 1.8 onwards are tested, however, if you are using Postgres, I highly recommend that you consider using the ``django.contrib.postgres`` module's ``JSONField`` instead.

Extras
------

jsonify templatetag
~~~~~~~~~~~~~~~~~~~
This allows you to convert a python data structure into JSON within a template::

    {% load jsonify %}

    <script>
    var foo = {{ bar|jsonify }};
    </script>

History
----------

1.0.0
~~~~~

Add support for Django 1.8 and 1.9 (without warnings). Remove support for Django < 1.8
as none of those releases are supported upstream anyway.

With this version, ``JSONField`` no longer decodes assigned string values as JSON. Instead it assumes that any value that you assign is the decoded value which will be JSON-encoded before storage in the database. This explains the bump to version 1.0 as it's a backwards incompatible change.

0.9.19
~~~~~~
Allow passing `decoder_kwargs` as an argument to a field. This dict will be passed as kwargs to
the `json.loads()` calls when loading data that is a string.

You may also set this as a global value in settings.JSONFIELD_DECODER_KWARGS.

A new dict is created for each field: so if this value is altered after field definition, it shouldn't
affect already attached fields.

0.9.16
~~~~~~
Allow passing an argument of `encoder_class` to a field, which will result in that object (or
the object located at that path, for instance `core.utils.JSONEncoder`) being used as the `cls`
argument when serializing objects.

You may also set this as a global value in settings.JSONFIELD_ENCODER_CLASS

0.9.15
~~~~~~
Bump version number to get around uploading issues.

0.9.14
~~~~~~
No longer hit the db to work out db_type.

0.9.12
~~~~~~
Cache the result of db_type.
Handle incoming data from multiple select widget better.

0.9.9
~~~~~
Finally strip out non-required files.

0.9.8
~~~~~
Remove freezegun workarounds.
Fix broken build.

0.9.4
~~~~~
Fixes for mutable defaults: we serialize and then deserialize in this
case, so you can still use ``default={}``.

0.9.3
~~~~~
Remove support for storing data using Postgres' 9.2's JSON data type, as
you cannot currently query against this!

Remove support for django < 1.3.


0.9.0
~~~~~
Add LICENSE file.
Added TypedJSONField.


0.8.10
~~~~~~
Allow ``{{ variable|jsonify }}`` to work with querysets.

0.8.8
~~~~~
Prevent circular import problem with django 1.3.1 and gargoyle.

0.8.7
~~~~~
Better handle null=True and blank=True: it should make sense what they do now.

0.8.5
~~~~~
Allow for '{}' and '[]', and make them not appear to be None.

0.8.4
~~~~~
Ensure the version number file is installed with the package.

0.8.3
~~~~~
Store the version number in one place only, now.

0.8.2
~~~~~
Oops. Packaging error prevented install from pypi. Added README.rst to manifest.

0.8.1
~~~~~
Converting to string does nothing, as serializing a model instance with a JSONField would have a string version of that field, instead of it embedded inline. (Back to pre 0.8 behaviour).

Added better querying support: (``field__contains={'key':'value','key2':'value2'}`` works.)

Removed JSONTableWidget from package.

0.8
~~~
(Many thanks to `IanLewis`_ for these features)

Supports django 1.2

Supports callable and json serializable objects as default

Implemented get_db_prep_value()

Add tests and test runner.

Removed JSONTableWidget from README.

0.7.1
~~~~~
Don't fail when trying to install before django is installed.

0.7
~~~
First time I tagged releases.


Todo
----------
Allow for passing in a function to use for processing unknown data types.

Convert date/time objects nicely to/from ISO strings (YYYY-mm-dd HH:MM:SS
TZNAME). This is actually a bit tricky, as we don't know if we are expecting
a date/time object. We may parse objects as we go, but there could be
some performance issues with this. I'm tempted to say "only do this on TypedJSONField()"

.. _David Cramer's blog: http://justcramer.com/2009/04/14/cleaning-up-with-json-and-sql/
.. _IanLewis: https://bitbucket.org/IanLewis
