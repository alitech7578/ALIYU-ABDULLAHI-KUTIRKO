import React from 'react';
import { XMarkIcon, TrashIcon } from './IconComponents';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-modal-title"
    >
      <div className="bg-brand-secondary/90 rounded-2xl shadow-2xl w-full max-w-md p-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <h2 id="confirmation-modal-title" className="text-2xl font-bold text-brand-light">{title}</h2>
          <button onClick={onClose} className="p-2 text-brand-muted hover:text-brand-light rounded-full transition-colors" aria-label="Close dialog">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <p className="text-brand-muted mb-6">{message}</p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-brand-muted/20 hover:bg-brand-muted/40 rounded-lg text-white font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-white font-semibold transition-colors"
          >
            <TrashIcon className="w-5 h-5" />
            <span>Confirm Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
