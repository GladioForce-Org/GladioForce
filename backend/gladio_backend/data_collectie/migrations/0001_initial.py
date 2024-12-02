# Generated by Django 5.0.2 on 2024-12-02 16:40

import django.db.models.deletion
from django.db import migrations, models


def create_test_data(apps, schema_editor):
    Club = apps.get_model('data_collectie', 'Club')
    Edition = apps.get_model('data_collectie', 'Edition')
    Size = apps.get_model('data_collectie', 'Size')
    Tshirt = apps.get_model('data_collectie', 'Tshirt')
    AvailableTshirt = apps.get_model('data_collectie', 'AvailableTshirt')
    Volunteer = apps.get_model('data_collectie', 'Volunteer')
    
    # Create test data
    club = Club.objects.create(
        name="Sample Club",
        email="sample@club.com",
        contact="John Doe",
        phone="123456789",
        link="http://sampleclub.com",
        bank_account="BE12345678901234",
        address="123 Sample Street",
        btw_number="BE0123456789",
        postal_code="1000",
        city="Sample City"
    )
    edition = Edition.objects.create(year=2024)
    size = Size.objects.create(size="M")
    tshirt = Tshirt.objects.create(model="Unisex")
    tshirt.size.add(size)
    available_tshirt = AvailableTshirt.objects.create(tshirt=tshirt, edition=edition, price=20.00)
    Volunteer.objects.create(
        first_name="Jane",
        last_name="Doe",
        national_registry_number="123456789",
        works_day1=True,
        tshirt=available_tshirt,
        club=club,
        size=size
    )


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Club',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('email', models.EmailField(max_length=254)),
                ('contact', models.CharField(max_length=100)),
                ('phone', models.CharField(max_length=100)),
                ('link', models.URLField()),
                ('bank_account', models.CharField(max_length=100)),
                ('address', models.CharField(max_length=100)),
                ('btw_number', models.CharField(max_length=100)),
                ('postal_code', models.CharField(max_length=100)),
                ('city', models.CharField(max_length=100)),
            ],
        ),
        migrations.CreateModel(
            name='Edition',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('year', models.IntegerField()),
            ],
        ),
        migrations.CreateModel(
            name='Size',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('size', models.CharField(max_length=100)),
            ],
        ),
        migrations.CreateModel(
            name='ParticipatingClub',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('person_in_charge_day1', models.CharField(max_length=100)),
                ('person_in_charge_day2', models.CharField(max_length=100)),
                ('club', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='data_collectie.club')),
                ('edition', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='data_collectie.edition')),
            ],
        ),
        migrations.CreateModel(
            name='Task',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('description', models.TextField()),
                ('day', models.IntegerField(choices=[(1, 'Day 1'), (2, 'Day 2')])),
                ('volunteers_required', models.IntegerField()),
                ('start_time', models.TimeField()),
                ('end_time', models.TimeField()),
                ('responsible_employee', models.CharField(max_length=100)),
                ('edition', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='data_collectie.edition')),
                ('participating_club', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='data_collectie.participatingclub')),
            ],
        ),
        migrations.CreateModel(
            name='Tshirt',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('model', models.CharField(max_length=100)),
                ('size', models.ManyToManyField(to='data_collectie.size')),
            ],
        ),
        migrations.CreateModel(
            name='AvailableTshirt',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('price', models.DecimalField(decimal_places=2, max_digits=6)),
                ('edition', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='data_collectie.edition')),
                ('tshirt', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='data_collectie.tshirt')),
            ],
        ),
        migrations.CreateModel(
            name='Volunteer',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('first_name', models.CharField(max_length=100)),
                ('last_name', models.CharField(max_length=100)),
                ('national_registry_number', models.CharField(max_length=100)),
                ('works_day1', models.BooleanField(default=False)),
                ('works_day2', models.BooleanField(default=False)),
                ('needs_parking_day1', models.BooleanField(default=False)),
                ('needs_parking_day2', models.BooleanField(default=False)),
                ('club', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='data_collectie.club')),
                ('size', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='data_collectie.size')),
                ('tshirt', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='data_collectie.availabletshirt')),
            ],
        ),
        migrations.CreateModel(
            name='TimeRegistration',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('start_time', models.TimeField()),
                ('end_time', models.TimeField()),
                ('day', models.IntegerField(choices=[(1, 'Day 1'), (2, 'Day 2')])),
                ('edition', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='data_collectie.edition')),
                ('volunteer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='data_collectie.volunteer')),
            ],
        ),
        migrations.RunPython(create_test_data),
    ]
