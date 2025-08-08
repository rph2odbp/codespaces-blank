require('dotenv').config();
const mongoose = require('mongoose');
const Parents = require('./models/Parents');

const ADMIN_EMAIL = 'ryanhallford.br@gmail.com';

async function setSuperAdmin() {
  // ... (connection logic is the same) ...
  try {
    // ...
    const user = await Parents.findOneAndUpdate(
      { email: ADMIN_EMAIL },
      { $set: { role: 'superadmin' } }, // Set role to superadmin
      { new: true }
    );

    if (user) {
      console.log('✅ Success! User has been promoted to SUPER admin:');
      console.log(user);
    } else {
      // ... (error handling is the same) ...
    }
  } catch (err) {
    // ...
  } finally {
    // ...
  }
}

setSuperAdmin();