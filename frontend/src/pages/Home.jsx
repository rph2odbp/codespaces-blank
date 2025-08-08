import React from 'react';
import SessionList from '../components/SessionList'; // 1. Import the component

export default function Home() {
  return (
    <div>
      <h1>Welcome to Camp Abbey!</h1>
      <p>The best camp in the world.</p>
      <hr />
      <SessionList /> {/* 2. Add the component here */}
    </div>
  );
}