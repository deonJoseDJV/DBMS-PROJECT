CREATE DATABASE IF NOT EXISTS pet_adoption;
USE pet_adoption;

CREATE TABLE IF NOT EXISTS Donor(
    donor_id INT PRIMARY KEY AUTO_INCREMENT,
    donor_name VARCHAR(50),
    donor_phone VARCHAR(15),
    donor_address VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS Pet(
    pet_id INT PRIMARY KEY AUTO_INCREMENT,
    species VARCHAR(50),
    breed VARCHAR(50),
    donor_id INT,
    adopted BOOLEAN DEFAULT FALSE,  -- Added this column
    FOREIGN KEY (donor_id) REFERENCES Donor(donor_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Adopter(
    adopter_id INT PRIMARY KEY AUTO_INCREMENT,
    adopter_name VARCHAR(50),
    adopter_phone VARCHAR(15),
    adopter_address VARCHAR(100),
    pet_id INT,
    FOREIGN KEY (pet_id) REFERENCES Pet(pet_id) ON DELETE CASCADE
);