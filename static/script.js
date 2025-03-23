document.addEventListener('DOMContentLoaded', function() {
  const donateButton = document.querySelector('#donate-button');
  const adoptButton = document.querySelector('#adopt-button');
  const viewButton = document.querySelector('#view-button');

  if (donateButton) {
      donateButton.addEventListener('click', function(e) {
          e.preventDefault();
          showModal(`
              <h2>Donate a Pet</h2>
              <form id="donate-form">
                  <input type="text" name="donor_name" placeholder="Your Name" required><br>
                  <input type="text" name="donor_phone" placeholder="Phone Number" required><br>
                  <input type="text" name="donor_address" placeholder="Address" required><br>
                  <input type="text" name="species" placeholder="Pet Species" required><br>
                  <input type="text" name="breed" placeholder="Breed" required><br>
                  <button type="submit">Donate</button>
              </form>
          `);

          document.getElementById('donate-form').addEventListener('submit', function(e) {
              e.preventDefault();
              const formData = new FormData(this);
              fetch('/api/donate', {
                  method: 'POST',
                  body: JSON.stringify(Object.fromEntries(formData)),
                  headers: {
                      'Content-Type': 'application/json'
                  }
              })
              .then(response => response.json())
              .then(data => {
                  if (data.success) {
                      closeModal();
                      alert('Thank you for donating your pet!');
                  } else {
                      alert('Error: ' + data.message);
                  }
              })
              .catch(error => {
                  alert('Error: ' + error);
              });
          });
      });
  }

  if (adoptButton) {
      adoptButton.addEventListener('click', function(e) {
          e.preventDefault();
          fetch('/api/pets')
          .then(response => response.json())
          .then(data => {
              if (data.success) {
                  let petOptions = '';
                  data.pets.forEach(pet => {
                      petOptions += `<option value="${pet.pet_id}">${pet.species} - ${pet.breed} (ID: ${pet.pet_id})</option>`;
                  });

                  showModal(`
                      <h2>Adopt a Pet</h2>
                      <form id="adopt-form">
                          <input type="text" name="adopter_name" placeholder="Your Name" required><br>
                          <input type="text" name="adopter_phone" placeholder="Phone Number" required><br>
                          <input type="text" name="adopter_address" placeholder="Address" required><br>
                          <select name="pet_id" required>
                              <option value="">Select a Pet</option>
                              ${petOptions}
                          </select><br>
                          <button type="submit">Adopt</button>
                      </form>
                  `);

                  document.getElementById('adopt-form').addEventListener('submit', function(e) {
                      e.preventDefault();
                      const formData = new FormData(this);
                      fetch('/api/adopt', {
                          method: 'POST',
                          body: JSON.stringify(Object.fromEntries(formData)),
                          headers: {
                              'Content-Type': 'application/json'
                          }
                      })
                      .then(response => response.json())
                      .then(data => {
                          if (data.success) {
                              closeModal();
                              alert('Congratulations on your new pet!');
                          } else {
                              alert('Error: ' + data.message);
                          }
                      })
                      .catch(error => {
                          alert('Error: ' + error);
                      });
                  });
              } else {
                  alert('Error: ' + data.message);
              }
          })
          .catch(error => {
              alert('Error: ' + error);
          });
      });
  }

  if (viewButton) {
      viewButton.addEventListener('click', function(e) {
          e.preventDefault();
          fetch('/api/pets')
          .then(response => response.json())
          .then(data => {
              if (data.success) {
                  let petsRows = '';
                  data.pets.forEach(pet => {
                      petsRows += `
                          <tr>
                              <td>${pet.pet_id}</td>
                              <td>${pet.species}</td>
                              <td>${pet.breed}</td>
                              <td>${pet.donor_phone}</td>
                          </tr>
                      `;
                  });

                  showModal(`
                      <h2>Available Pets</h2>
                      <table>
                          <thead>
                              <tr>
                                  <th>Pet ID</th>
                                  <th>Species</th>
                                  <th>Breed</th>
                                  <th>Donor Contact</th>
                              </tr>
                          </thead>
                          <tbody>
                              ${petsRows}
                          </tbody>
                      </table>
                  `);
              } else {
                  alert('Error: ' + data.message);
              }
          })
          .catch(error => {
              alert('Error: ' + error);
          });
      });
  }

  function showModal(content) {
      if (!document.getElementById('pet-modal')) {
          const modal = document.createElement('div');
          modal.id = 'pet-modal';
          modal.innerHTML = `
              <div class="modal-content">
                  <span class="close-button">&times;</span>
                  <div class="modal-body"></div>
              </div>
          `;
          document.body.appendChild(modal);

          const style = document.createElement('style');
          style.textContent = `
              #pet-modal {
                  display: none;
                  position: fixed;
                  z-index: 1000;
                  left: 0;
                  top: 0;
                  width: 100%;
                  height: 100%;
                  background-color: rgba(0,0,0,0.5);
              }
              .modal-content {
                  background-color: white;
                  margin: 10% auto;
                  padding: 20px;
                  width: 80%;
                  max-width: 500px;
                  border-radius: 5px;
              }
              .close-button {
                  color: #aaa;
                  float: right;
                  font-size: 28px;
                  font-weight: bold;
                  cursor: pointer;
              }
              .close-button:hover {
                  color: black;
              }
              .modal-body {
                  margin-top: 20px;
              }
              .modal-body input, .modal-body select {
                  width: 100%;
                  padding: 8px;
                  margin: 5px 0;
                  box-sizing: border-box;
              }
              .modal-body button {
                  background-color: #4CAF50;
                  color: white;
                  padding: 10px 15px;
                  margin: 10px 0;
                  border: none;
                  cursor: pointer;
                  width: 100%;
              }
              .modal-body table {
                  width: 100%;
                  border-collapse: collapse;
              }
              .modal-body th, .modal-body td {
                  border: 1px solid #ddd;
                  padding: 8px;
                  text-align: left;
              }
              .modal-body th {
                  background-color: #f2f2f2;
              }
          `;
          document.head.appendChild(style);

          document.querySelector('.close-button').addEventListener('click', closeModal);
      }

      document.querySelector('.modal-body').innerHTML = content;
      document.getElementById('pet-modal').style.display = 'block';
  }

  function closeModal() {
      const modal = document.getElementById('pet-modal');
      if (modal) {
          modal.style.display = 'none';
      }
  }

  window.addEventListener('click', function(e) {
      const modal = document.getElementById('pet-modal');
      if (e.target === modal) {
          closeModal();
      }
  });
});