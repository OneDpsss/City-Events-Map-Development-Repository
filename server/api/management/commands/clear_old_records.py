from django.core.management.base import BaseCommand
from datetime import timedelta
from django.utils import timezone
from api.models import News, Events


class Command(BaseCommand):
    help = 'Deletes old records'

    def handle(self, *args, **kwargs):
        old_news = News.objects.filter(news_date__lte=timezone.now() - timedelta(days=1))
        old_events = Events.objects.filter(event_date__lte=timezone.now())
        news_count = old_news.count()
        events_count = old_events.count()
        old_news.delete()
        old_events.delete()

        self.stdout.write(self.style.SUCCESS(f"{news_count} news and {events_count} events have been deleted successfully"))
