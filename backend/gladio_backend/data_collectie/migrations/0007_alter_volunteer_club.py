# Generated by Django 5.1.4 on 2025-01-08 18:41

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('data_collectie', '0006_alter_timeregistration_end_time_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='volunteer',
            name='club',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='volunteers', to='data_collectie.club'),
        ),
    ]
