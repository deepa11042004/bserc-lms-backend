const { lmsDB } = require('../config/db');

async function findByUserId(userId) {
  const [rows] = await lmsDB.query(
    `
      SELECT
        id,
        user_id,
        display_name,
        primary_email,
        designation,
        alternative_email,
        bio,
        profile_description,
        created_at,
        updated_at
      FROM instructor_profiles
      WHERE user_id = ?
      LIMIT 1
    `,
    [userId]
  );

  return rows[0] || null;
}

async function upsertByUserId(userId, payload) {
  await lmsDB.query(
    `
      INSERT INTO instructor_profiles (
        user_id,
        display_name,
        primary_email,
        designation,
        alternative_email,
        bio,
        profile_description
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        display_name = VALUES(display_name),
        primary_email = VALUES(primary_email),
        designation = VALUES(designation),
        alternative_email = VALUES(alternative_email),
        bio = VALUES(bio),
        profile_description = VALUES(profile_description),
        updated_at = CURRENT_TIMESTAMP
    `,
    [
      userId,
      payload.display_name,
      payload.primary_email,
      payload.designation,
      payload.alternative_email,
      payload.bio,
      payload.profile_description,
    ]
  );

  return findByUserId(userId);
}

module.exports = {
  findByUserId,
  upsertByUserId,
};
