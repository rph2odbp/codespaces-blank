import React from 'react';

export default function Step3_Review({ formData, prevStep, handleSubmit }) {
  return (
    <div>
      <h3>Review Your Registration</h3>
      <p><strong>Name:</strong> {formData.firstName} {formData.lastName}</p>
      <p><strong>Date of Birth:</strong> {formData.dateOfBirth}</p>
      <p><strong>T-Shirt Size:</strong> {formData.tShirtSize}</p>
      <p>Please review all information on previous steps carefully.</p>
      <button onClick={prevStep}>Back</button>
      <button onClick={handleSubmit}>Submit Registration & Proceed to Payment</button>
    </div>
  );
}