import { createFileRoute } from '@tanstack/react-router';
import ConfirmDialog from '~/components/ConfirmDialog';
import { useLogout } from '~/hooks/auth/useLogout';

export const Route = createFileRoute('/logout')({
  component: RouteComponent,
});

function RouteComponent() {
  const {
    // ✅ Event Handlers
    handleClose,
    handleConfirm,
  } = useLogout();

  return (
    <>
      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={true}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title='confirm_logout'
        message='are_you_sure_want_logout'
      />
    </>
  );
}
