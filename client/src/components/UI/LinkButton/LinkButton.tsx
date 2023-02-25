import { Button } from 'antd';
import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

type Props = {
  children: ReactNode | ReactNode[];
  to: string;
  type: 'primary' | 'link' | 'text' | 'dashed';
};

export const LinkButton = (props: Props) => {
  const navigate = useNavigate();

  return (
    <Button type={props.type} onClick={() => navigate(props.to)}>
      {props.children}
    </Button>
  );
};
