# Generated by Django 5.1.4 on 2025-01-09 17:10

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('data_collectie', '0007_alter_volunteer_club'),
    ]

    operations = [
        migrations.AlterField(
            model_name='volunteer',
            name='national_registry_number',
            field=models.CharField(max_length=100, null=True),
        ),
    ]
