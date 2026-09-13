/**
 * Authentication Middleware & Security Gatekeeper
 * 
 * Beginner Guide to MERN Authentication:
 * In Express, "middleware" is a function that runs BEFORE your route controller.
 * Think of this as the realm's gatekeeper:
 * 1. Extracts the token via `extractToken(req)`.
 * 2. Cryptographically verifies the signature using `jwt.verify()`.
 * 3. Fetches the verified adventurer from the database and attaches them to `req.user`.
 * 4. Calls `next()` to allow the controller to proceed.
 * 
 * Security & Token Storage Tradeoff (Hackathon vs Production):
 * - Currently, the client stores JWT in `localStorage` and transmits via `Authorization: Bearer <token>`.
 * - Tradeoff: `localStorage` is convenient for hackathon development and cross-port testing (Vite on :5173, Express on :5000),
 *   but is NOT 100% immune to Cross-Site Scripting (XSS) if malicious scripts run on the client.
 * - Alternative: `HttpOnly` cookies protect against XSS (JavaScript cannot access `document.cookie`), but require
 *   strict CORS origin whitelisting, credentials configuration, and Cross-Site Request Forgery (CSRF) protection.
 * - Design Decision: To keep this architecture modular and future-proof, `extractToken()` decouples token extraction.
 *   If upgrading to HttpOnly cookies later, only `extractToken()` needs to read `req.cookies?.token`.
 */

import jwt from 'jsonwebtoken';
import { findUserById } from '../services/dbAdapter.js';

/**
 * Modular token extractor
 * Supports Authorization: Bearer <token>, and is easily extensible to read from cookies.
 */
export function extractToken(req) {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    return req.headers.authorization.split(' ')[1];
  }
  // Future upgrade path: if cookie-parser is installed:
  // if (req.cookies && req.cookies.token) {
  //   return req.cookies.token;
  // }
  return null;
}

export async function protect(req, res, next) {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({ message: 'Access denied: No authentication token provided.' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'super_secret_life_rpg_hero_key_1337';
    const decoded = jwt.verify(token, secret);

    // Fetch user from DB (password excluded)
    const user = await findUserById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'Adventurer not found in realm records.' });
    }

    // Attach user to request object for downstream controllers
    req.user = user;
    return next();
  } catch (error) {
    console.error('Auth verification failed:', error.message);
    return res.status(401).json({ message: 'Invalid or expired authentication token.' });
  }
}

