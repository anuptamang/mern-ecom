import styled from 'styled-components';

export const S = {
  Loading: styled.div`
    width: 50px;
    height: 50px;
    border-radius: 100%;
    margin: 100px auto;
    border: 3px solid #7facee;
    border-top: 0;
    border-radius: 100%;
    animation: spin 0.7s infinite;

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
  `,
};
