from flask import Flask, json, jsonify, request
from flask_restful import Api, Resource
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import logging
from logging.handlers import TimedRotatingFileHandler
from datetime import datetime
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)
api = Api(app)

# upload photo directory
app.config['UPLOAD_FOLDER'] = 'frontEnd/dist/img/uploads'
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://root:@localhost/Info'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Configure and set logs path
def get_log_file():
    current_datetime = datetime.utcnow()
    log_file_name = current_datetime.strftime('%Y-%m-%d.log')
    return (f'backEnd/log/app_{log_file_name}')

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
handler = TimedRotatingFileHandler(get_log_file(), when="H", interval=23, backupCount=30)
handler.suffix = "%Y-%m-%d"
handler.setLevel(logging.DEBUG)
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
console_handler.setFormatter(formatter)
logger.addHandler(handler)
logger.addHandler(console_handler)

#function to upload images
def upload_file(id,fname,file):

    if not file:
        return jsonify({'message': 'No file part'}), 400
    
    if file.filename == '':
        return jsonify({'message': 'No selected file'}), 400
    
    filename = f"{secure_filename(fname)}_{id}{os.path.splitext(file.filename)[1]}"
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    # check if there is old image and delete it
    if os.path.exists(file_path):
         os.remove(file_path)

    file.save(file_path)
    employee = Employee.query.get(id)

    if employee:
        employee.photo = f'../img/uploads/{filename}'
        db.session.commit()
    else:
        return jsonify({'message': 'Employee not found'}), 404
    return jsonify({'message': 'File uploaded successfully', 'file_path': file_path}), 200

# Create db model for employee
class Employee(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(250), nullable=False)
    password = db.Column(db.String(250), nullable=False)
    fname = db.Column(db.String(250), nullable=False)
    lname = db.Column(db.String(250), nullable=False)
    company_id = db.Column(db.String(250), nullable=False)
    address = db.Column(db.String(250), nullable=False)
    city = db.Column(db.String(250), nullable=False)
    country = db.Column(db.String(250), nullable=False)
    photo = db.Column(db.String(250), nullable=True)
    access_right = db.Column(db.String(250), nullable=True)

    def __repr__(self):
        return f"Employee({self.fname} {self.lname})"

# Create db model for company
class Company(db.Model):
    company_id = db.Column(db.String(250), primary_key=True)
    company = db.Column(db.String(250), nullable=False)
    color = db.Column(db.String(250), nullable=False)

    def __repr__(self):
        return f"Company({self.company})"


class Employees(Resource):

    # Add employee to the database
    def post(self):
        employee_data = request.form.get('newEmployee')
        file = request.files.get('file')

        if not employee_data:
            return jsonify({'message':'no employee data provided'})
        
        data = json.loads(employee_data)

        logger.info("Adding new employee with data: %s", data)

        # Check if email already exists
        existing_employee = Employee.query.filter_by(email=data['email']).first()
        if existing_employee:
            logger.warning("Employee with email %s already exists", data['email'])
            return jsonify({"message": "Email already exists"})

        
        new_employee = Employee(
            email=data['email'],
            fname=data['fname'],
            lname=data['lname'],
            password=data['password'],
            company_id=data['company_id'],
            address=data['address'],
            city=data['city'],
            country=data['country'],
            photo="",
            access_right=data.get('access_right', '').strip()
        )
        db.session.add(new_employee)
        db.session.commit()

        new_employee.password = f"{new_employee.fname}_{new_employee.lname}@{new_employee.id}"
        db.session.commit()

        upload_file(new_employee.id,new_employee.fname,file)
        print('hello')
        return jsonify({
            "message":"new employee added",
            "employee": {
                "id": new_employee.id,
                "email": new_employee.email,
                "password": new_employee.password,
                "fname": new_employee.fname,
                "lname": new_employee.lname,
                "company_id": new_employee.company_id,
                "address": new_employee.address,
                "city": new_employee.city,
                "country": new_employee.country,
                "photo": new_employee.photo,
                "access_right": new_employee.access_right
            }
        })

class Emp(Resource):

    # Edit employee using id
    def put(self, id):

        employee_data = request.form.get('updatedEmployee')
        file = request.files.get('file')

        if not employee_data:
            return jsonify({'message':'no employee data provided'})
        
        data = json.loads(employee_data)

        logger.info("Updating employee with id: %s with data: %s", id, data)
        employee = Employee.query.get(id)

        if not employee:
            logger.warning("Employee with id %s not found", id)
            return jsonify({"message": "Employee not found"}), 404
        
        employee.email = data['email']
        employee.password = data['password']
        employee.fname = data['fname']
        employee.lname = data['lname']
        employee.company_id = data['company_id']
        employee.address = data['address']
        employee.city = data['city']
        employee.country = data['country']
        employee.access_right = data['access_right']
        db.session.commit()

        upload_file(employee.id,employee.fname, file)

        return jsonify({"message": "Employee updated"})

    # Delete employee using id
    def delete(self, id):
        logger.info("Deleting employee with id: %s", id)
        employee = Employee.query.get(id)

        if not employee:
            logger.warning("Employee with id %s not found", id)
            return jsonify({"message": "Employee not found"}), 404
        
        # Check if the photo exists and delete it
        if employee.photo:
            photo_path = os.path.join(app.config['UPLOAD_FOLDER'], os.path.basename(employee.photo))
            if os.path.exists(photo_path):
                os.remove(photo_path)
                logger.info("Deleted photo for employee with id: %s", id)
        
        db.session.delete(employee)
        db.session.commit()

        return jsonify({"message": "Employee deleted"})


class Companies(Resource):
    # Get all companies
    def get(self):
        logger.info("Fetching all companies")
        companies = Company.query.all()

        return jsonify([
            {
                "company_id": comp.company_id,
                "company": comp.company,
                "color": comp.color
            }
            for comp in companies
        ])

class RecieveLoginInfo(Resource):
    # Get data through API then check the email; if it exists, check the password and return true or false
    def post(self):
        data = request.json
        email = data.get('mail')
        password = data.get('pass')

        logger.info("Received login info with data: %s", data)

        employee = Employee.query.filter_by(email=email).first()

        if employee and employee.password == password:
            logger.info("Authentication successful for email: %s", email)
            return jsonify({"authenticated": True})
        
        logger.warning("Authentication failed for email: %s", email)
        return jsonify({"authenticated": False})

class EmployeeWithCompany(Resource):

    def get(self):
        logger.info("Fetching employees with their company details")
        employees_with_companies = db.session.query(Employee, Company).join(Company, Employee.company_id == Company.company_id).all()
        
        return jsonify([
            {
                "id": emp.id,
                "email": emp.email,
                "password": emp.password,
                "fname": emp.fname,
                "lname": emp.lname,
                "company_id": emp.company_id,
                "company": comp.company,
                "color": comp.color,
                "address": emp.address,
                "city": emp.city,
                "country": emp.country,
                "photo": emp.photo,
                "access_right": emp.access_right.strip() if emp.access_right else None
            }
            for emp, comp in employees_with_companies
        ])

# Calling class + endpoints
api.add_resource(EmployeeWithCompany, '/ec')
api.add_resource(Employees, '/emp')
api.add_resource(Emp, '/emp/<string:email>', '/emp/<int:id>')
api.add_resource(RecieveLoginInfo, '/empInfo')
api.add_resource(Companies, "/comp")

if __name__ == '__main__':
    app.run(debug=True)