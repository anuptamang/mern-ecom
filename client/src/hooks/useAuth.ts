import { authSelector } from 'redux/slice';
import { useAppSelector } from 'redux/store';
import { isTokenValid } from 'utils';

function useAuth() {
  const auth = useAppSelector(authSelector);
  // const auth = { token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFudXBAZ21haWwuY29tIiwiaWQiOiI2M2Y2NGNkOTE5NjRmYmE4MmJkODY2NjciLCJpYXQiOjE2Nzc0MjY5NTMsImV4cCI6MTY3NzUxMzM1M30._TxOlLcmpph_kjXwTsplzhjYF4rx2jM3GKAr2NB4sB0' };



  let validAuth = {
    ...auth,
  };

  if (auth?.token) {
    if (!isTokenValid(auth.token)) {
      validAuth.token = '';
    }
  }


  return validAuth;
}

export { useAuth };
