'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { useRouter } from 'next/navigation';
import { deleteTag } from '@/app/api/tags/tags';
import { useToast } from '@/components/ui/use-toast';

interface AlertModalTagProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  tagId?: string;
}

export const AlertModalTag: React.FC<AlertModalTagProps> = ({
    isOpen,
    onClose,
    onConfirm,
    loading,
    tagId
  }) => {
    const [isMounted, setIsMounted] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();
    const { toast } = useToast();
  
    useEffect(() => {
      setIsMounted(true);
    }, []);
  
    if (!isMounted) {
      return null;
    }
  
    const handleConfirm = async (e: React.MouseEvent) => {
        e.preventDefault();
        
        if (!tagId) {
          console.error('TagId não fornecido');
          return;
        }
        
        setIsDeleting(true);
        
        try {
          await deleteTag(tagId);
          toast({
            title: 'Tag deletada',
            description: 'Tag removida com sucesso',
          });
          
          onClose();
          onConfirm();
          
        } catch (error) {
          console.error('Erro na deleção:', error);
          toast({
            variant: 'destructive',
            title: 'Erro',
            description: error instanceof Error ? error.message : 'Erro ao deletar tag',
          });
        } finally {
          setIsDeleting(false);
        }
      };
    return (
      <Modal
        title="Tem certeza?"
        description="Essa ação não pode ser desfeita."
        isOpen={isOpen}
        onClose={onClose}
      >
        <div className="flex w-full items-center justify-end space-x-2 pt-6">
          <Button 
            disabled={loading || isDeleting} 
            variant="outline" 
            onClick={onClose}
            type="button"
          >
            Cancelar
          </Button>
          <Button 
            disabled={loading || isDeleting} 
            variant="destructive" 
            onClick={handleConfirm}
            type="button"
          >
            {isDeleting ? 'Deletando...' : 'Continuar'}
          </Button>
        </div>
      </Modal>
    );
  };
