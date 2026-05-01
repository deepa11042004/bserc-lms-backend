const { comparePassword } = require('../utils/hashPassword');
const { signToken } = require('../utils/jwt');
const roles = require('../constants/roles');
const userModel = require('../models/userModel');
const instructorProfileModel = require('../models/instructorProfileModel');

const ALLOWED_ROLES = new Set(Object.values(roles));

const normalizeEmail = (email) => (email || '').trim().toLowerCase();
const cleanText = (value) => (value || '').trim();
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanText(email));

const toNullableText = (value) => {
  const cleaned = cleanText(value);
  return cleaned || null;
};

function toRoleFallbackDesignation(role) {
  if (role === roles.INSTRUCTOR) return 'Instructor';
  if (role === roles.SUPER_ADMIN) return 'Super Admin';
  return 'Admin';
}

function mapInstructorProfile(user, profileRow) {
  const primaryEmail = cleanText(profileRow?.primary_email || user?.email || '');

  return {
    userId: user?.id || null,
    displayName: cleanText(profileRow?.display_name || user?.full_name || ''),
    email: primaryEmail,
    designation: cleanText(profileRow?.designation || toRoleFallbackDesignation(user?.role)),
    alternativeEmail: cleanText(profileRow?.alternative_email || primaryEmail),
    bio: cleanText(profileRow?.bio || ''),
    description: cleanText(profileRow?.profile_description || ''),
    updatedAt: profileRow?.updated_at || null,
  };
}

async function login({ email, password, requiredRole }) {
  const normalizedEmail = normalizeEmail(email);
  const cleanPassword = cleanText(password);
  const cleanRequiredRole = cleanText(requiredRole).toLowerCase();

  if (!normalizedEmail || !cleanPassword) {
    return { status: 400, body: { message: 'Email and password are required' } };
  }

  if (cleanRequiredRole && !ALLOWED_ROLES.has(cleanRequiredRole)) {
    return { status: 400, body: { message: 'Invalid role provided' } };
  }

  const user = await userModel.findByEmail(normalizedEmail);
  if (!user) {
    return { status: 404, body: { message: 'User not found' } };
  }

  if (user.is_active === 0 || user.is_active === false) {
    return { status: 403, body: { message: 'Account disabled' } };
  }

  if (cleanRequiredRole && user.role !== cleanRequiredRole) {
    return { status: 403, body: { message: 'Role is not authorized for this login' } };
  }

  const matches = await comparePassword(cleanPassword, user.password);
  if (!matches) {
    return { status: 401, body: { message: 'Invalid password' } };
  }

  await userModel.updateLastLogin(user.id);

  const token = signToken({ userId: user.id, email: user.email, role: user.role });

  return {
    status: 200,
    body: {
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
    },
  };
}

async function getProfile(userId) {
  const user = await userModel.findById(userId);
  if (!user) {
    return { status: 404, body: { message: 'User not found' } };
  }

  return {
    status: 200,
    body: {
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        is_active: user.is_active,
        created_at: user.created_at,
        updated_at: user.updated_at,
        last_login: user.last_login,
      },
    },
  };
}

async function getInstructorProfile(userId) {
  const user = await userModel.findById(userId);
  if (!user) {
    return { status: 404, body: { message: 'User not found' } };
  }

  const profileRow = await instructorProfileModel.findByUserId(user.id);

  return {
    status: 200,
    body: {
      profile: mapInstructorProfile(user, profileRow),
    },
  };
}

async function updateInstructorProfile(userId, payload = {}) {
  const user = await userModel.findById(userId);
  if (!user) {
    return { status: 404, body: { message: 'User not found' } };
  }

  const displayName = cleanText(payload.displayName);
  const email = normalizeEmail(payload.email);
  const designation = cleanText(payload.designation);
  const alternativeEmail = normalizeEmail(payload.alternativeEmail);
  const bio = cleanText(payload.bio);
  const description = cleanText(payload.description);

  if (!displayName) {
    return { status: 400, body: { message: 'Display Name is required.' } };
  }

  if (!email) {
    return { status: 400, body: { message: 'Primary Email is required.' } };
  }

  if (!isValidEmail(email)) {
    return { status: 400, body: { message: 'Primary Email must be a valid email address.' } };
  }

  if (!designation) {
    return { status: 400, body: { message: 'Designation is required.' } };
  }

  if (!alternativeEmail) {
    return { status: 400, body: { message: 'Alternative Email is required.' } };
  }

  if (!isValidEmail(alternativeEmail)) {
    return { status: 400, body: { message: 'Alternative Email must be a valid email address.' } };
  }

  if (bio.length > 500) {
    return { status: 400, body: { message: 'Bio cannot exceed 500 characters.' } };
  }

  if (description.length > 5000) {
    return { status: 400, body: { message: 'Description cannot exceed 5000 characters.' } };
  }

  const savedRow = await instructorProfileModel.upsertByUserId(user.id, {
    display_name: displayName,
    primary_email: email,
    designation,
    alternative_email: alternativeEmail,
    bio: toNullableText(bio),
    profile_description: toNullableText(description),
  });

  return {
    status: 200,
    body: {
      message: 'Instructor profile updated successfully.',
      profile: mapInstructorProfile(user, savedRow),
    },
  };
}

async function listAssignableInstructors() {
  const rows = await userModel.listActiveInstructors();

  return {
    status: 200,
    body: {
      instructors: rows.map((row) => ({
        id: Number(row.id),
        full_name: row.full_name,
        email: row.email,
        role: row.role,
      })),
    },
  };
}

module.exports = {
  login,
  getProfile,
  getInstructorProfile,
  updateInstructorProfile,
  listAssignableInstructors,
};