"use client";

import React, { useState, ChangeEvent, FormEvent, DragEvent } from 'react';
import styles from './UploadForm.module.css';

function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setErrorMessage('');
      setSuccessMessage('');
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      setErrorMessage('');
      setSuccessMessage('');
      //e.dataTransfer.clearData();
    }
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!file) {
      setErrorMessage('Por favor, selecione um arquivo.');
      return;
    }

    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    if (!allowedTypes.includes(file.type)) {
      setErrorMessage('Tipo de arquivo não suportado. Por favor, envie um arquivo Excel (.xls ou .xlsx).');
      return;
    }

    setIsUploading(true);
    setErrorMessage('');
    setSuccessMessage('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        // Tenta obter a mensagem de erro do JSON, se disponível
        let errorMessage = 'Erro ao enviar o arquivo.';
        try {
          const errorData = await response.json();
          if (errorData?.error) {
            errorMessage = errorData.error;
          }
        } catch (err) {
          // Se não puder parsear JSON, mantém a mensagem genérica
        }
        throw new Error(errorMessage);
      }

      // Se a resposta for válida, tenta obter o JSON
      let successMessage = 'Arquivo enviado e processado com sucesso!';
      try {
        const data = await response.json();
        if (data?.data) {
          successMessage = data.data;
        }
      } catch (err) {
        // Se não puder parsear JSON, mantém a mensagem de sucesso padrão
      }

      setSuccessMessage(successMessage);
      setFile(null);
    } catch (error) {
      // Garantimos que `error` é do tipo Error para poder acessar a mensagem
      console.error('Erro:', error);
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Erro ao enviar o arquivo. Por favor, tente novamente.');
      }
    } finally {
      setIsUploading(false);
    }
  };



  return (
    <div className={styles.hero}>
      <h1>Tudo o que você precisa saber sobre os dados dos processos em um só lugar</h1>
      <h3>Carregue sua planilha para análise</h3>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div
          className={`${styles.uploadArea} ${dragActive ? styles.dragActive : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleButtonClick}
        >
          <input
            type="file"
            id="file"
            accept=".xlsx, .xls"
            onChange={handleFileChange}
            className={styles.input}
            ref={inputRef}
          />
          {file ? (
            <p>{file.name}</p>
          ) : (
            <p>Arraste e solte o arquivo aqui ou clique para selecionar</p>
          )}
        </div>
        {errorMessage && <p className={styles.error}>{errorMessage}</p>}
        {successMessage && <p className={styles.success}>{successMessage}</p>}
        <button type="submit" className={styles.button} disabled={isUploading}>
          {isUploading ? 'Enviando...' : 'Enviar'}
        </button>
      </form>
    </div>
  );
}

export default UploadForm;
