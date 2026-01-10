import React from 'react';
import { Modal } from '../common';
import RequestForm from './RequestForm';

function RequestModal({ isOpen, onClose }) {
  const handleSuccess = () => {
    onClose?.();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Solicitar Dinero de Casa"
      size="md"
      closeOnOverlayClick={false}
    >
      <RequestForm onSuccess={handleSuccess} onCancel={onClose} />
    </Modal>
  );
}

export default RequestModal;
