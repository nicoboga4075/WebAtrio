from .models import *
import json
from datetime import datetime
from flask import abort, jsonify, render_template, redirect, url_for, request, send_from_directory, send_file

@app.route('/')
def index():
    return redirect('swagger')

@app.route('/swagger')
def init_swagger():
    return send_from_directory('static', 'swagger_ui.html')

@app.route('/persons', methods=['GET', 'POST'])
def handle_persons():
    if request.method == 'GET':
        persons = Person.query.order_by(Person.last_name).all()
        return jsonify([person.to_dict() for person in persons]), 200

    elif request.method == 'POST':
        data = request.json
        first_name = data.get('firstName')
        last_name = data.get('lastName')
        
        try:
            birth_date = datetime.strptime(data.get('birthDate'), '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD.'}), 400

        age = datetime.now().year - birth_date.year

        if age > 150:
            return jsonify({'error': 'Person is too old to be recorded (over 150 years).'}), 400

        new_person = Person(first_name=first_name, last_name=last_name, birth_date=birth_date)
        db.session.add(new_person)
        db.session.commit()
        return jsonify(new_person.to_dict()), 201

@app.route('/persons/<int:person_id>', methods=['GET', 'PUT', 'DELETE'])
def handle_person(person_id):
    person = Person.query.get_or_404(person_id)
    
    if request.method == 'GET':
        return jsonify(person.to_dict()), 200

    elif request.method == 'PUT':
        data = request.json
        person.first_name = data.get('firstName', person.first_name)
        person.last_name = data.get('lastName', person.last_name)

        try :
            birth_date = datetime.strptime(data.get('birthDate'), '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD.'}), 400

        age = datetime.now().year - birth_date.year
        if age > 150:
            return jsonify({'error': 'Person is too old to be recorded (over 150 years).'}), 400
        
        person.birth_date = birth_date
      
        db.session.commit()
        return jsonify(person.to_dict()), 200

    elif request.method == 'DELETE':
        db.session.delete(person)
        db.session.commit()
        return jsonify({}), 204
    
@app.route('/persons/<int:person_id>/jobs', methods=['GET'])
def handleJobsForPerson(person_id):
    person = Person.query.get_or_404(person_id)
    if request.method == 'GET':
        try:
            if request.args.get('startDate', None):
                start_date = datetime.strptime(request.args.get('startDate'), '%Y-%m-%d').date()
            else:
                start_date = None
            
        except ValueError:
            start_date = None
        
        try:
            if request.args.get('endDate', None):
                end_date = datetime.strptime(request.args.get('endDate'), '%Y-%m-%d').date()
            else:
                end_date = None
                
        except ValueError:
            end_date = None
        
        jobs = person.get_jobs_between_dates(start_date, end_date)

    return jsonify({'jobs' : jobs}), 200

@app.route('/companies', methods=['GET', 'POST'])
def handle_companies():
    if request.method == 'GET':
        companies = Company.query.all()
        return jsonify([company.to_dict() for company in companies]), 200

    elif request.method == 'POST':
        data = request.json
        name = data.get('name')
        
        if Company.query.filter_by(name=name).first():
            return jsonify({'error': 'Company already exists.'}), 400
        
        new_company = Company(name=name)
        db.session.add(new_company)
        db.session.commit()
        return jsonify(new_company.to_dict()), 201

@app.route('/companies/<int:company_id>', methods=['GET', 'PUT', 'DELETE'])
def handle_company(company_id):
    company = Company.query.get_or_404(company_id)

    if request.method == 'GET':
        return jsonify(company.to_dict()), 200

    elif request.method == 'PUT':
        data = request.json
        name = data.get('name', company.name)

        existing_company = Company.query.filter_by(name=name).first()
        if existing_company and existing_company.id != company_id:
            return jsonify({'error': 'Company name already exists.'}), 400

        company.name = name
        
        db.session.commit()
        return jsonify(company.to_dict()), 200

    elif request.method == 'DELETE':
        db.session.delete(company)
        db.session.commit()
        return jsonify({}), 204

@app.route('/jobs', methods=['GET', 'POST'])
def handle_jobs():
    if request.method == 'GET':
        jobs = Job.query.all()
        return jsonify([job.to_dict() for job in jobs]), 200

    elif request.method == 'POST':
        data = request.json
        position = data.get('position')
        person_id = data.get('personId', 0)
        company_id = data.get('companyId', 0)

        try:
            start_date = datetime.strptime(data.get('startDate'), '%Y-%m-%d').date()
            
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD.'}), 400
        
        try:
            if data.get('endDate', None):
                end_date = datetime.strptime(data.get('endDate'), '%Y-%m-%d').date()
            else:
                end_date = None
                
        except ValueError:
            end_date = None

        new_job = Job(position=position, start_date=start_date, end_date=end_date, person_id=person_id, company_id=company_id)
        db.session.add(new_job)
        db.session.commit()
        return jsonify(new_job.to_dict()), 201

@app.route('/jobs/<int:job_id>', methods=['GET', 'PUT', 'DELETE'])
def handle_job(job_id):
    job = Job.query.get_or_404(job_id)
    
    if request.method == 'GET':
        return jsonify(job.to_dict()), 200

    elif request.method == 'PUT':
        data = request.json
        position = data.get('position', job.position)
        person_id = data.get('personId', job.person_id)
        company_id = data.get('companyId', job.company_id)

        try:
            job.start_date = datetime.strptime(data.get('startDate'), '%Y-%m-%d').date()
            if(data.get('endDate', None)):
                 job.end_date = datetime.strptime(data.get('endDate'), '%Y-%m-%d').date()
            else:
                job.end_date = None
        except ValueError:
            return jsonify({'error': 'Invalid start date format. Use YYYY-MM-DD.'}), 400

        job.position = position
        job.person_id = person_id
        job.company_id = company_id
    
        db.session.commit()
        return jsonify(job.to_dict()), 200

    elif request.method == 'DELETE':
        db.session.delete(job)
        db.session.commit()
        return jsonify({}), 204