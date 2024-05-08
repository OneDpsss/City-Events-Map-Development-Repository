from django.core.management.base import BaseCommand
from datetime import timedelta
from django.utils import timezone
from api.models import News, Events


class Command(BaseCommand):
    help = 'Deletes old records'

    def handle(self, *args, **kwargs):
        news_1 = News.objects.filter(news_date__lte=timezone.now() - timedelta(hours=8), priority=1)
        news_2 = News.objects.filter(news_date__lte=timezone.now() - timedelta(days=1), priority=2)
        news_3 = News.objects.filter(news_date__lte=timezone.now() - timedelta(days=3), priority=3)
        old_events = Events.objects.filter(event_date__lte=timezone.now())
        news_count = news_1.count() + news_2.count() + news_3.count()
        events_count = old_events.count()
        news_1.delete()
        news_2.delete()
        news_3.delete()
        old_events.delete()

        self.stdout.write(
            self.style.SUCCESS(f"{news_count} news and {events_count} events have been deleted successfully"))
