'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { deleteUser } from '@/app/api/users/users-api';
import { useRouter } from 'next/navigation';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  userId?: string;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  loading,
  userId
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await deleteUser(userId!);
      onConfirm();
      router.refresh();
    } catch (error) {
      console.error('Erro ao deletar usuário2:', error);
      alert(`Erro ao deletar usuário2: ${(error as Error).message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      title="Are you sure?"
      description="This action cannot be undone."
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="flex w-full items-center justify-end space-x-2 pt-6">
        <Button disabled={loading || isDeleting} variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button disabled={loading || isDeleting} variant="destructive" onClick={handleConfirm}>
          {isDeleting ? 'Deleting...' : 'Continue'}
        </Button>
      </div>
    </Modal>
  );
};
