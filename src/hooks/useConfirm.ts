import { toast } from 'sonner';

/**
 * Reemplaza window.confirm — usa Sonner toast con botones Sí/No.
 * No depende de window.confirm (bloqueado en iframes/Vercel).
 */
export function useConfirm() {
  const confirm = (message: string): Promise<boolean> =>
    new Promise((resolve) => {
      toast(message, {
        duration: 10000,
        action: {
          label: 'Eliminar',
          onClick: () => resolve(true),
        },
        cancel: {
          label: 'Cancelar',
          onClick: () => resolve(false),
        },
        onDismiss: () => resolve(false),
        onAutoClose: () => resolve(false),
      });
    });

  return { confirm };
}
