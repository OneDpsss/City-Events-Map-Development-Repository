from django.db import models


class News(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    description = models.TextField()
    news_date = models.DateTimeField()
    address = models.TextField()
    url = models.TextField()
    img = models.TextField()
    priority = models.IntegerField(default=1)

    def __str__(self):
        return self.title

    class Meta:
        verbose_name_plural = "News"
        verbose_name = "News"


class Events(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    event_date = models.DateTimeField()
    address = models.TextField()
    url = models.TextField()
    img = models.TextField()

    def __str__(self):
        return self.title

    class Meta:
        verbose_name_plural = "Events"
        verbose_name = "Event"
