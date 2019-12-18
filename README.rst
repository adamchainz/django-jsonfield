django-jsonfield
================

**Maintenance mode only:** It is not recommended you use this library on new
projects. See the (long) **History** section below for why and alternatives.

----

Cross-database JSON field for Django models.

History
-------


This project was created in 2010 by Matthew Schinckel. He created it based upon
code from `David Cramer's
blog <https://web.archive.org/web/20140731084522/http://cramer.io/2009/04/14/cleaning-up-with-json-and-sql/>`_,
had the repository in Mercurial on
`BitBucket <https://bitbucket.org/schinckel/django-jsonfield>`_, and
maintained it until 2018. In March 2019, Adam Johnson took over maintenance
(from an invite back in 2018!), and moved it to Git on
`GitHub <https://github.com/adamchainz/django-jsonfield>`_ because he's no good
at Mercurial and "everyone" uses GitHub these days.

At the time it was created, the databases that Django supports didn't feature
native JSON support. Since then, most of them have gained that ability.
Correspondingly, there are some Django field implementations for taking
advantage of this:

* A PostgreSQL ``JSONField`` is provided in
  `django.contrib.postgres <https://docs.djangoproject.com/en/2.1/ref/contrib/postgres/fields/>`_,
  which was created as part of Django in version 1.9, released December 2015.
  Note this library interferes with the way that works, see
  `issue 5 <https://github.com/adamchainz/django-jsonfield/issues/5>`_ for
  explanation and a workaround.
* A MySQL (and maybe MariaDB) ``JSONField`` is provided in
  `Django-MySQL <https://django-mysql.readthedocs.io/en/latest/model_fields/json_field.html>`_,
  since version 1.0.7, released March 2016.

At time of writing this history (March 2019), there still isn't a JSONField
implementation that can take advantage of the native features on all the
databases. This has been discussed on the ``django-developers`` mailing list
several times though.

The ``JSONField`` provided by this library uses native features on
PostgreSQL, but not on any other database, so it's in a bit of a weird place.

If you are considering adding this to a new project, you probably don't want
it, instead:

* If you want native JSON support from your database and you're using
  PostgreSQL or MySQL, use the native fields as per the links above.
* If you don't want native JSON support, consider just storing the JSON in a
  ``TextField`` and deserializing it appropriately in your code, perhaps with
  a simple model property to proxy it.
* If you need native JSON support on a database for which there is no Django
  field implementation, try making it yourself or getting in touch to see if
  there's something that can be done.

Installation
------------

Install it with **pip**:

.. code-block:: sh

    pip install django-jsonfield

Then use the field in your models:

.. code-block:: python

    from django.db import models
    import jsonfield

    class MyModel(models.Model):
        the_json = jsonfield.JSONField()

You can assign any JSON-encodable object to this field. It will be
JSON-encoded before being stored in the database as a text value and it
will be turned back into a python list/dict/string upon retrieval from the
database.

There is also a ``TypedJSONField``, that allows you to define data types that
must be included within each object in the array. More documentation to follow.

Notes
~~~~~

If no ``default`` is provided, and ``null=True`` is not passed in to the
field constructor, then a default of ``{}`` will be used.

Supported django versions
-------------------------

All versions of Django from 1.8 onwards are tested.

Extras
------

jsonify templatetag
~~~~~~~~~~~~~~~~~~~
This allows you to convert a python data structure into JSON within a template::

    {% load jsonify %}

    <script>
    var foo = {{ bar|jsonify|safe }};
    </script>

Note that you must only use the "safe" filter when you use the jsonify
filter within a <script> tag (which is parsed like a CDATA section).

If you use it in some other places like in an HTML attribute, then
you must not use the safe filter so that its output is properly escaped::

    <div data-foo="{{ bar|jsonify }}">

The above rules are important to avoid XSS attacks with unsafe strings
stored in the converted data structure.

Contributing
------------

If you want to contribute to django-jsonfield, it will help you to run
the test suite. This can be done in its most simple form by running::

  DB_ENGINE=sqlite3 DB_NAME=tests ./tests.py

To run the tests fully, you will need to install tox.


History
-------

1.4.0 (2019-12-18)
~~~~~~~~~~~~~~~~~~

* Django 3.0 compatbility. This required adding ``six`` as a dependency.

1.3.1 (2019-08-19)
~~~~~~~~~~~~~~~~~~

* Fix Python 2 compatilibity from change in 1.3.0
  (`PR #16 <https://github.com/adamchainz/django-jsonfield/pull/16>`__).

1.3.0 (2019-08-18)
~~~~~~~~~~~~~~~~~~

* Work in parallel with ``django.contrib.postgres.fields.JSONField`` by
  removing registration of default JSONB function and instead using Postgres'
  cast-to-text in SQL
  (`PR #14 <https://github.com/adamchainz/django-jsonfield/pull/14>`__).

  This should allow you to move to the better supported
  ``django.contrib.postgres.fields.JSONField``, and then Django 3.0's upcoming
  all-database ``JSONField``.

1.2.0 (2019-04-28)
~~~~~~~~~~~~~~~~~~

* Tested with Django 2.2.
* Stop "RemovedInDjango30Warning: Remove the context parameter from
  JSONField.from_db_value()." on Django 2.0+.

1.1.0 (2019-03-16)
~~~~~~~~~~~~~~~~~~

Django 1.10 support: register explicit lookup operators.

Django 1.11 support: update render() method for widget.

1.0.1 (2016-07-21)
~~~~~~~~~~~~~~~~~~

Fix issue with Postgres JSONB fields.

Limit XSS attacks with jsonify template tag.

1.0.0 (2016-06-02)
~~~~~~~~~~~~~~~~~~

Add support for Django 1.8 and 1.9 (without warnings). Remove support for Django < 1.8
as none of those releases are supported upstream anyway.

With this version, ``JSONField`` no longer decodes assigned string values as JSON. Instead it assumes that any value that you assign is the decoded value which will be JSON-encoded before storage in the database. This explains the bump to version 1.0 as it's a backwards incompatible change.

0.9.19 (2016-02-22)
~~~~~~~~~~~~~~~~~~~

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

(Many thanks to `IanLewis <https://bitbucket.org/IanLewis>`_ for these features)

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
First tagged release.
