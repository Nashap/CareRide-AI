import threading
import time
import os
from django.apps import AppConfig


def run_scheduler():
    from django.core.management import call_command
    while True:
        try:
            call_command('process_timeouts')
        except Exception as e:
            print(f"Scheduler error: {e}")
        time.sleep(10)


class RidesConfig(AppConfig):
    name = 'rides'

    def ready(self):
        # Prevent running twice when autoreload is enabled
        if os.environ.get('RUN_MAIN', None) == 'true':
            thread = threading.Thread(target=run_scheduler, daemon=True)
            thread.start()
