# Generated by Django 3.1.4 on 2021-02-05 11:08

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0007_auto_20210128_1517'),
    ]

    operations = [
        migrations.AlterField(
            model_name='post',
            name='likes',
            field=models.ManyToManyField(blank=True, default=None, related_name='likers', to=settings.AUTH_USER_MODEL),
        ),
    ]