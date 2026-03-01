
import React from 'react';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import { Reservation } from '../../../types';

interface DeleteModalProps {
  showConfirmDelete: boolean;
  setShowConfirmDelete: (val: boolean) => void;
  selectedForAction: Reservation | null;
  handleDeleteReservation: () => void;
  actionLoading: boolean;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({
  showConfirmDelete, setShowConfirmDelete, selectedForAction, handleDeleteReservation, actionLoading
}) => {
  if (!showConfirmDelete || !selectedForAction) return null;

  return (
    <div className="fixed inset-0 z-[130] bg-red-900/40 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-white max-w-sm w-full max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl animate-in zoom-in duration-300">
        <div className="p-10 text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">确认永久删除？</h3>
          <p className="text-gray-500 text-sm leading-relaxed mb-8 font-medium">
            您正在删除 <b>{selectedForAction.contactName}</b> 的预约记录。
          </p>
          <div className="flex flex-col gap-3">
            <button onClick={handleDeleteReservation} disabled={actionLoading} className="w-full py-4 bg-red-600 text-white rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-red-700 transition flex items-center justify-center gap-2">
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              确认删除 Confirm
            </button>
            <button onClick={() => setShowConfirmDelete(false)} className="w-full py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-gray-200 transition">
              取消 Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
