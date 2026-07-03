import time
from django.core.management.base import BaseCommand
from django.utils import timezone
from rides.models import TravelRequest
from rides.utils import process_recommendation_timeouts

class Command(BaseCommand):
    help = 'Processes timeouts for active AI recommendations in the background.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--loop',
            action='store_true',
            help='Run the scheduler continuously in a loop',
        )
        parser.add_argument(
            '--interval',
            type=int,
            default=60,
            help='Interval in seconds for the loop (default 60)',
        )

    def handle(self, *args, **options):
        loop = options['loop']
        interval = options['interval']

        if loop:
            self.stdout.write(self.style.SUCCESS(f'Starting timeout scheduler. Running every {interval} seconds...'))
            try:
                while True:
                    self.process_all()
                    time.sleep(interval)
            except KeyboardInterrupt:
                self.stdout.write(self.style.WARNING('Scheduler stopped.'))
        else:
            self.process_all()
            self.stdout.write(self.style.SUCCESS('Timeouts processed successfully.'))

    def process_all(self):
        # We find all travel requests that are in an active state
        active_requests = TravelRequest.objects.filter(
            status__in=[
                "AI Recommended", 
                "Waiting for Helper Response", 
                "Searching for another helper", 
                "Waiting for another available helper",
                "Pending",
                "Urgent AI Recommended",
                "Open Dispatch",
                "Assigned"
            ]
        )
        
        count = 0
        for req in active_requests:
            # We call our highly optimized utils function that handles everything
            # including the new response_deadline logic and urgent pivoting!
            process_recommendation_timeouts(req)
            count += 1
            
        if count > 0:
            self.stdout.write(f"[{timezone.now()}] Evaluated {count} active travel requests.")
