import { Modal, Tabs, message } from 'antd';
import { LoginForm } from '@/features/LoginForm';
import { RegisterForm } from '@/features/RegisterForm';
import { useEffect, useState, useRef } from 'react';
import { useAppSelector } from '@/redux/store';
import { authSelector } from '@/redux/slice';
import { MESSAGES } from '../../constants';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal = ({ open, onClose, onSuccess }: AuthModalProps) => {
  const [activeTab, setActiveTab] = useState('login');
  const { result, tokenStatus, status } = useAppSelector(authSelector);
  const previousTokenStatus = useRef(tokenStatus);
  const previousResult = useRef(result);

  // If user successfully logs in or registers, close modal and call onSuccess
  useEffect(() => {
    // Only trigger if status changed from invalid/not set to valid AND modal is open
    const justLoggedIn = open && 
                         previousTokenStatus.current !== 'valid' && 
                         tokenStatus === 'valid' && 
                         result;
    
    if (justLoggedIn) {
      message.success(MESSAGES.SUCCESS.WELCOME_BACK);
      onClose();
      if (onSuccess) {
        // Small delay to ensure auth state is fully updated
        setTimeout(() => {
          onSuccess();
        }, 200);
      }
    }
    
    // Update refs
    previousTokenStatus.current = tokenStatus;
    previousResult.current = result;
  }, [tokenStatus, result, open, onClose, onSuccess]);

  // Also watch for login/register success status
  useEffect(() => {
    if (open && status?.success && tokenStatus === 'valid' && result) {
      // Login or register was successful
      const timer = setTimeout(() => {
        onClose();
        if (onSuccess) {
          onSuccess();
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [status?.success, tokenStatus, result, open, onClose, onSuccess]);

  return (
    <Modal
      title="Login or Register"
      open={open}
      onCancel={onClose}
      footer={null}
      width={500}
      destroyOnClose
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'login',
            label: 'Login',
            children: <LoginForm />,
          },
          {
            key: 'register',
            label: 'Register',
            children: <RegisterForm />,
          },
        ]}
      />
    </Modal>
  );
};
