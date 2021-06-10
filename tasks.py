from invoke_release.tasks import *  # noqa: F403


configure_release_parameters(  # noqa: F405
    module_name='ebdjango',
    display_name='Eventbrite Common Django Library',
    use_pull_request=True,
    use_tag=False,
)
