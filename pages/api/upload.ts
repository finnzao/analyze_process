import type { NextApiRequest, NextApiResponse } from 'next';
import multer from 'multer';
import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

interface NextApiRequestWithFile extends NextApiRequest {
  file?: Express.Multer.File;
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = '/tmp/uploads';
      // Certifique-se de que o diretório exista
      fs.mkdirSync(uploadDir, { recursive: true });
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // Limite de tamanho do arquivo: 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não suportado.'));
    }
  },
});

// Função para integrar o multer ao Next.js
function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: Function) {
  return new Promise<void>((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve();
    });
  });
}

  export const config = {
  api: {
    bodyParser: false, // Desabilita o body parser padrão para usar o multer
  },
};

export default async function handler(req: NextApiRequestWithFile, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      await runMiddleware(req, res, upload.single('file'));

      if (!req.file) {
        res.status(400).json({ error: 'Nenhum arquivo foi enviado.' });
        return;
      }

      const filePath = req.file.path;

      // Processamento do arquivo
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

      if (jsonData.length === 0) {
        throw new Error('A planilha está vazia.');
      }

      // Exclui o arquivo temporário
      fs.unlinkSync(filePath);

      res.status(200).json({ data: 'Arquivo processado com sucesso!', resultado: jsonData });
    } catch (error) {
      console.error('Erro ao processar o arquivo:', error);
      let errorMessage = 'Erro ao processar o arquivo.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      res.status(400).json({ error: errorMessage });
    }
  } else {
    res.status(405).json({ error: `Método ${req.method} não permitido.` });
  }
}
