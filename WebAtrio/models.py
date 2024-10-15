from sqlalchemy import or_
from sqlalchemy.orm import relationship
from .controller import app, db
from datetime import date

class Person(db.Model):
    __tablename__ = 'persons'
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    birth_date = db.Column(db.Date, nullable=False)
    
    jobs = relationship("Job", back_populates="employee")
    
    def get_jobs_between_dates(self, start_date, end_date):
        if start_date is None and end_date is None:
            return [job.to_dict() for job in self.jobs]
    
        def date_ranges_overlap(job_start, job_end, range_start, range_end):
            return (job_start <= range_end and job_end >= range_start)
    
        return [
        job.to_dict() for job in self.jobs 
        if job.start_date is not None and job.end_date is not None and
           date_ranges_overlap(job.start_date, job.end_date, 
                               start_date if start_date else job.start_date,
                               end_date if end_date else job.end_date)
        ]


    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    @property
    def age(self):
        today = date.today()
        return today.year - self.birth_date.year - ((today.month, today.day) < (self.birth_date.month, self.birth_date.day))

    @property
    def latest_job(self):
        if self.jobs:
            return sorted(self.jobs, key=lambda job: job.start_date, reverse=True)[0]
        return ''

    def to_dict(self):
        return {
            'id': self.id,
            'firstName': self.first_name,
            'lastName': self.last_name,
            'birthDate': self.birth_date.isoformat(),
            'age': self.age,
            'fullName': self.full_name,
            'jobs': [job.to_dict()['position'] for job in self.jobs],
            'latestJob': self.latest_job.to_dict() if self.latest_job else None
        }

class Company(db.Model):
    __tablename__ = 'companies'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    
    jobs = relationship("Job", back_populates="employer")
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'persons': list({job.to_dict()['personName'] for job in self.jobs})
        }

class Job(db.Model):
    __tablename__ = 'jobs'
    id = db.Column(db.Integer, primary_key=True)
    position = db.Column(db.String(100), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=True)
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id'), nullable=False)
    person_id = db.Column(db.Integer, db.ForeignKey('persons.id'), nullable=False)
    
    # Explicitly linking back to Person and Company
    employer = relationship("Company", back_populates="jobs")
    employee = relationship("Person", back_populates="jobs")

    def to_dict(self):
        return {
            'id': self.id,
            'position': self.position,
            'startDate': self.start_date.isoformat(),
            'endDate': self.end_date.isoformat() if self.end_date else None,
            'companyId': self.company_id,
            'personId': self.person_id,
            'personName': self.employee.full_name,
            'companyName': self.employer.name
        }
   
def init_db():
    db.drop_all()
    db.create_all()
    db.session.commit()
    app.logger.info('Database initialized!')
