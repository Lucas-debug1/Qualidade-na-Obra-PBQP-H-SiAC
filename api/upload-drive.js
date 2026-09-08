// Vercel Serverless Function
// Recebe um PDF em base64 e envia para uma pasta fixa do Google Drive,
// usando uma "conta de serviço" do Google (credenciais ficam só no servidor,
// nunca chegam ao navegador do usuário).

import { google } from 'googleapis';
import { Readable } from 'node:stream';

export const config = {
  api: {
    bodyParser: { sizeLimit: '15mb' },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  try {
    const { filename, base64 } = req.body ?? {};
    if (!filename || !base64) {
      return res.status(400).json({ error: 'Faltam os campos filename e base64.' });
    }

    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const key = (process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '').replace(/\\n/g, '\n');
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    if (!email || !key || !folderId) {
      return res.status(500).json({
        error:
          'Configuração do Google Drive ausente. Verifique GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_SERVICE_ACCOUNT_KEY e GOOGLE_DRIVE_FOLDER_ID nas variáveis de ambiente.',
      });
    }

    const auth = new google.auth.GoogleAuth({
      credentials: { client_email: email, private_key: key },
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });
    const drive = google.drive({ version: 'v3', auth });

    const buffer = Buffer.from(base64, 'base64');
    const stream = Readable.from(buffer);

    const file = await drive.files.create({
      requestBody: { name: filename, parents: [folderId] },
      media: { mimeType: 'application/pdf', body: stream },
      fields: 'id, webViewLink',
    });

    return res.status(200).json({ ok: true, id: file.data.id, link: file.data.webViewLink });
  } catch (err) {
    console.error('Erro ao enviar para o Drive:', err);
    const message = err instanceof Error ? err.message : 'Falha ao enviar para o Drive.';
    return res.status(500).json({ error: message });
  }
}
