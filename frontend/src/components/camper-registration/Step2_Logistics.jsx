import React from 'react';

export default function Step2_Logistics({ formData, handleNestedChange, handleArrayChange, handleNestedArrayChange, nextStep, prevStep }) {
  return (
    <div>
      <h3>Address & Logistics</h3>
      <input type="text" placeholder="Street Address" value={formData.address.street} onChange={handleNestedChange('address', 'street')} />
      <input type="text" placeholder="City" value={formData.address.city} onChange={handleNestedChange('address', 'city')} />
      <input type="text" placeholder="State" value={formData.address.state} onChange={handleNestedChange('address', 'state')} />
      <input type="text" placeholder="ZIP Code" value={formData.address.zip} onChange={handleNestedChange('address', 'zip')} />
      
      <h4>Roommate Requests (optional)</h4>
      <input type="text" placeholder="Roommate 1" value={formData.roommateRequests[0]} onChange={handleArrayChange('roommateRequests', 0)} />
      <input type="text" placeholder="Roommate 2" value={formData.roommateRequests[1]} onChange={handleArrayChange('roommateRequests', 1)} />

      <h4>Departure Information</h4>
      <input type="text" placeholder="Authorized Pickup Person" value={formData.departureInfo.authorizedPickups[0]} onChange={handleNestedArrayChange('departureInfo', 'authorizedPickups', 0)} />
      <input type="text" placeholder="Person NOT allowed to pickup" value={formData.departureInfo.unauthorizedPickups[0]} onChange={handleNestedArrayChange('departureInfo', 'unauthorizedPickups', 0)} />

      <button onClick={prevStep}>Back</button>
      <button onClick={nextStep}>Next</button>
    </div>
  );
}