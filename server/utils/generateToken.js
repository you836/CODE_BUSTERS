import jwt from 'jsonwebtoken';

export function generateToken(id) {
  const secret = process.env.JWT_SECRET || 'super_secret_life_rpg_hero_key_1337';
  return jwt.sign({ id }, secret, {
    expiresIn: '30d',
  });
}
