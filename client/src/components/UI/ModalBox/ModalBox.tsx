import { Modal } from 'antd';
import { ReactNode } from 'react';

type TModalBox = {
  title: string;
  open: boolean;
  closable: boolean;
  onOk: () => void;
  onCancel?: () => void;
  children?: ReactNode;
  footer?: ReactNode[];
};

export const ModalBox = ({
  title,
  open,
  closable,
  onOk,
  onCancel,
  children,
  footer,
}: TModalBox) => {
  return (
    <Modal
      closable={closable}
      footer={footer}
      title={title}
      open={open}
      onOk={onOk}
      onCancel={onCancel}
    >
      {children}
    </Modal>
  );
};
