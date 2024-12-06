# Generated by Django 5.0.2 on 2024-12-06 10:08

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('data_collectie', '0002_participatingclub_person1_in_charge_day1_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='volunteer',
            name='size',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='data_collectie.size'),
        ),
        migrations.AlterField(
            model_name='volunteer',
            name='tshirt',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='data_collectie.availabletshirt'),
        ),
    ]
