import crypto from 'crypto';
import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const writeFileAsync = promisify(fs.writeFile);

// Génère une image de signature à partir des données de dessin
export const generateSignatureImage = async (signatureData) => {
  const canvas = createCanvas(400, 200);
  const ctx = canvas.getContext('2d');

  // Fond blanc
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Dessin de la signature
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 2;
  ctx.beginPath();

  signatureData.forEach((point, index) => {
    if (index === 0) {
      ctx.moveTo(point.x, point.y);
    } else {
      ctx.lineTo(point.x, point.y);
    }
  });

  ctx.stroke();

  // Génération d'un nom de fichier unique
  const signatureId = crypto.randomBytes(8).toString('hex');
  const filePath = path.join(
    process.cwd(), 
    'public', 
    'uploads', 
    'signatures', 
    `${signatureId}.png`
  );

  // Sauvegarde de l'image
  const buffer = canvas.toBuffer('image/png');
  await writeFileAsync(filePath, buffer);

  return `/uploads/signatures/${signatureId}.png`;
};

// Vérifie l'authenticité cryptographique
export const verifyDigitalSignature = (signature) => {
  // Implémentation basique - à remplacer par une solution PKI réelle
  return crypto
    .createHash('sha256')
    .update(signature.signataire.toString() + signature.document.toString())
    .digest('hex') === signature.certificatNumerique;
};