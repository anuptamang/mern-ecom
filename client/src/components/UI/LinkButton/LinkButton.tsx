'use client';

import { Button } from 'antd';
import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  children: ReactNode | ReactNode[];
  to: string;
  type: 'primary' | 'link' | 'text' | 'dashed';
};

export const LinkButton = (props: Props) => {
  const router = useRouter();

  return (
    <Button type={props.type} onClick={() => router.push(props.to)}>
      {props.children}
    </Button>
  );
};
