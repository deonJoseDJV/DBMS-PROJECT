
from flask import Flask, render_template, request, jsonify
import mysql.connector
from flask_cors import CORS
import logging
from contextlib import contextmanager

app = Flask(__name__, static_folder='static')
CORS(app)  # Enable CORS for all routes

# Database connection
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",  # replace with your username
        password="mysql@2027",  # replace with your password
        database="pet_adoption"
    )

# Context manager for database cursor
@contextmanager
def get_db_cursor():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        yield cursor
    finally:
        cursor.close()
        conn.close()

# Home route to render the main page
@app.route('/')
def home():
    return render_template('index.html')

# Route for how it works page
@app.route('/how-it-works')
def how_it_works():
    return render_template('howitworks.html')

# Route to display the adoption page
@app.route('/adopt')
def adopt():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Fetch available pets (not adopted)
        cursor.execute("""
            SELECT Pet.pet_id, Pet.species, Pet.breed, Donor.donor_name, Donor.donor_phone, Donor.donor_address
            FROM Pet
            JOIN Donor ON Pet.donor_id = Donor.donor_id
            WHERE Pet.adopted = FALSE
        """)
        pets = cursor.fetchall()

        cursor.close()
        conn.close()

        return render_template('adopt.html', pets=pets)
    except Exception as e:
        return jsonify({"success": False, "message": str(e)})

# API endpoint for donating a pet
@app.route('/api/donate', methods=['POST'])
def api_donate():
    try:
        # Log the incoming request data for debugging
        app.logger.info(f"Incoming form data: {request.form}")

        # Get form data
        data = request.get_json()  # Use request.get_json() for JSON data
        donor_name = data.get('donor_name')
        donor_phone = data.get('donor_phone')
        donor_address = data.get('donor_address')
        species = data.get('species')
        breed = data.get('breed')

        # Validate that all fields are present
        if not all([donor_name, donor_phone, donor_address, species, breed]):
            return jsonify({"success": False, "message": "All fields are required"}), 400

        # Insert into database
        conn = get_db_connection()
        cursor = conn.cursor()

        # Insert into Donor table
        cursor.execute(
            "INSERT INTO Donor (donor_name, donor_phone, donor_address) VALUES (%s, %s, %s)",
            (donor_name, donor_phone, donor_address)
        )
        donor_id = cursor.lastrowid

        # Insert into Pet table
        cursor.execute(
            "INSERT INTO Pet (species, breed, donor_id) VALUES (%s, %s, %s)",
            (species, breed, donor_id)
        )

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"success": True, "message": "Pet donated successfully!"})
    except Exception as e:
        app.logger.error(f"Error in api_donate: {e}")
        return jsonify({"success": False, "message": str(e)}), 500

# API endpoint for adopting a pet
@app.route('/api/adopt', methods=['POST'])
def api_adopt():
    try:
        # Get form data
        adopter_name = request.form.get('adopter_name')
        adopter_phone = request.form.get('adopter_phone')
        adopter_address = request.form.get('adopter_address')
        pet_id = request.form.get('pet_id')

        # Validate that all fields are present
        if not all([adopter_name, adopter_phone, adopter_address, pet_id]):
            return jsonify({"success": False, "message": "All fields are required"}), 400

        # Insert into database
        conn = get_db_connection()
        cursor = conn.cursor()

        # Insert into Adopter table
        cursor.execute(
            "INSERT INTO Adopter (adopter_name, adopter_phone, adopter_address, pet_id) VALUES (%s, %s, %s, %s)",
            (adopter_name, adopter_phone, adopter_address, pet_id)
        )

        # Mark the pet as adopted
        cursor.execute(
            "UPDATE Pet SET adopted = TRUE WHERE pet_id = %s",
            (pet_id,)
        )

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"success": True, "message": "Pet adopted successfully!"})
    except Exception as e:
        app.logger.error(f"Error in api_adopt: {e}")
        return jsonify({"success": False, "message": str(e)}), 500
# API endpoint for getting available pets
@app.route('/api/pets', methods=['GET'])
def api_pets():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Fetch donated pets with donor information
        cursor.execute("""
            SELECT Pet.pet_id, Pet.species, Pet.breed, Donor.donor_name, Donor.donor_phone, Donor.donor_address
            FROM Pet
            JOIN Donor ON Pet.donor_id = Donor.donor_id
            WHERE Pet.adopted = FALSE
        """)
        pets = cursor.fetchall()

        cursor.close()
        conn.close()

        return jsonify({"success": True, "pets": pets})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)})

# Route to view donated pets
@app.route('/view-donated-pets')
def view_donated_pets():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Fetch donated pets that are not adopted
        cursor.execute("""
            SELECT Pet.pet_id, Pet.species, Pet.breed, Donor.donor_name, Donor.donor_phone, Donor.donor_address
            FROM Pet
            JOIN Donor ON Pet.donor_id = Donor.donor_id
            WHERE Pet.adopted = FALSE
        """)
        donated_pets = cursor.fetchall()

        cursor.close()
        conn.close()

        return render_template('view_donated_pets.html', donated_pets=donated_pets)
    except Exception as e:
        return jsonify({"success": False, "message": str(e)})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)