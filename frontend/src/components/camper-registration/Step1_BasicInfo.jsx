import React from 'react';

export default function Step1_BasicInfo({ formData, sessions, handleChange, nextStep }) {
  return (
    <div>
      <h3>Basic Information</h3>
      <input type="text" placeholder="First Name" value={formData.firstName} onChange={handleChange('firstName')} required />
      <input type="text" placeholder="Last Name" value={formData.lastName} onChange={handleChange('lastName')} required />
      <input type="date" value={formData.dateOfBirth} onChange={handleChange('dateOfBirth')} required />
      <select value={formData.gender} onChange={handleChange('gender')}>
        <option value="">Select Gender</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Non-binary">Non-binary</option>
        <option value="Prefer not to say">Prefer not to say</option>
      </select>
      <input type="text" placeholder="Grade (entering in fall)" value={formData.grade} onChange={handleChange('grade')} />
      <input type="text" placeholder="School" value={formData.school} onChange={handleChange('school')} />
      <select value={formData.tShirtSize} onChange={handleChange('tShirtSize')}>
        <option value="Youth S">Youth S</option>
        <option value="Youth M">Youth M</option>
        <option value="Youth L">Youth L</option>
        <option value="Adult S">Adult S</option>
        <option value="Adult M">Adult M</option>
        <option value="Adult L">Adult L</option>
        <option value="Adult XL">Adult XL</option>
      </select>
      <select value={formData.sessionId} onChange={handleChange('sessionId')} required>
        <option value="">Select a Session</option>
        {sessions.map(s => <option key={s._id} value={s._id}>{s.name} (${s.cost})</option>)}
      </select>
      <button onClick={nextStep}>Next</button>
    </div>
  );
}