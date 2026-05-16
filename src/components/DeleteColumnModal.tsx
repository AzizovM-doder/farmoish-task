import { useState } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  columnName: string;
}

const DeleteColumnModal = ({ isOpen, onClose, onConfirm, columnName }: Props) => {
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmText === columnName) {
      setIsDeleting(true);
      try {
        await onConfirm();
        onClose();
        setConfirmText("");
      } catch (e) {
        console.error(e);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 animate-in fade-in zoom-in duration-200">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Delete Column</h3>
        <p className="text-gray-500 mb-6 text-sm leading-relaxed">
          This action will permanently delete the <span className="font-bold text-red-500">{columnName}</span> column and all tasks inside it.
          To confirm, please type <span className="font-bold text-gray-800 select-none">"{columnName}"</span> below.
        </p>

        <form onSubmit={handleConfirm} className="space-y-4">
          <input
            autoFocus
            placeholder={`Type "${columnName}" to confirm`}
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            disabled={isDeleting}
            className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl outline-none focus:border-red-500 focus:bg-white transition-all font-bold text-gray-700"
          />

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-xl font-bold hover:bg-gray-200 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isDeleting || confirmText !== columnName}
              className="flex-1 py-4 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:bg-gray-300 disabled:shadow-none"
            >
              {isDeleting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
              {isDeleting ? "Deleting..." : "Confirm Delete"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeleteColumnModal;
