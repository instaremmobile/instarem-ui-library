import React, { FC, ReactNode } from 'react';

interface Props {
  children: ReactNode | ReactNode[];
}
export const Button: FC<Props> = ({ children }) => {
  return <div>{children}</div>;
};
